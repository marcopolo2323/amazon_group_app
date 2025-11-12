import { apiConfig, debugLog, networkConfig } from "./config";
import { Platform } from "react-native";

const API_URL = apiConfig.apiUrl;

import Constants from "expo-constants";

const isWeb = typeof window !== "undefined" && typeof document !== "undefined";

const getApiUrl = () => {
  const env = Constants.expoConfig?.extra || (Constants as any).expoConfig?.extra || {};
  const envUrl = process.env.EXPO_PUBLIC_API_URL || env?.apiUrl;
  if (envUrl) return envUrl;
  if (isWeb) return "http://localhost:5000/api";
  // Android emulator
  return "http://10.0.2.2:5000/api";
};

function buildHeaders(
  token?: string,
  extraHeaders: Record<string, string> = {},
) {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...extraHeaders,
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
}

interface ApiOptions {
  method?: string;
  body?: any;
  token?: string;
  headers?: Record<string, string>;
}

export async function api(path: string, options: ApiOptions = {}) {
  const { method = "GET", body, token, headers } = options;
  const fullUrl = `${API_URL}${path}`;

  debugLog(`API Request: ${method} ${fullUrl}`, { body, token: !!token });

  let retries = networkConfig.retries;

  while (retries > 0) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(
        () => controller.abort(),
        networkConfig.timeout,
      );

      const response = await fetch(fullUrl, {
        method,
        headers: buildHeaders(token, headers),
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const contentType = response.headers.get("content-type");
      const isJson = contentType?.includes("application/json");
      const data = isJson ? await response.json() : await response.text();

      debugLog(`API Response: ${response.status}`, { data });

      if (!response.ok) {
        let message = "";
        if (isJson) {
          const d: any = data;
          message = d?.message || d?.error?.message || "";
        }
        if (!message) {
          message = response.statusText;
        }
        // Mensaje más claro para errores de autenticación
        if (response.status === 401 || response.status === 403) {
          // Mensaje claro cuando las credenciales no son válidas
          message = message && message.trim().length > 0 ? message : "Tu contraseña es incorrecta. Inténtalo de nuevo.";
        }
        // Si el servidor no tiene el endpoint de reseñas en producción
        if (response.status === 404 && path.startsWith("/reviews")) {
          message = "La funcionalidad de reseñas no está disponible en el servidor actual.";
        }
        throw new Error(message || "Error en la solicitud");
      }

      return data;
    } catch (error: any) {
      retries--;

      // If it's an abort error (timeout)
      if (error.name === "AbortError") {
        debugLog(`API Timeout: ${fullUrl}`);
        if (retries === 0) {
          throw new Error("Tiempo de espera agotado. Verifica tu conexión.");
        }
      }
      // Network request failed
      else if (error.message.includes("Network request failed")) {
        debugLog(`Network Error: ${fullUrl}`, error.message);
        if (retries === 0) {
          throw new Error(
            "Error de conexión. Verifica que el servidor esté ejecutándose.",
          );
        }
      }
      // Other errors
      else {
        debugLog(`API Error: ${fullUrl}`, error.message);
        if (retries === 0) {
          throw error instanceof Error ? error : new Error("Error desconocido");
        }
      }

      // Wait before retrying
      if (retries > 0) {
        await new Promise((resolve) =>
          setTimeout(resolve, networkConfig.retryDelay),
        );
      }
    }
  }
}

export const Api = {
  // Auth
  login: (email: string, password: string) =>
    api("/users/login", { method: "POST", body: { email: email.trim().toLowerCase(), password } }),

  register: (payload: any) =>
    api("/users/register", { method: "POST", body: { ...payload, email: String(payload?.email || "").trim().toLowerCase() } }),

  getMe: (token: string) => api("/users/me", { token }),

  updateMe: (token: string, payload: any) =>
    api("/users/me", { method: "PATCH", token, body: payload }),

  googleLogin: (idToken: string) =>
    api("/users/oauth/google", { method: "POST", body: { idToken } }),

  requestPasswordReset: (email: string) =>
    api("/users/forgot-password", { method: "POST", body: { email: email.trim().toLowerCase() } }),

  resetPassword: (email: string, code: string, password: string) =>
    api("/users/reset-password", {
      method: "POST",
      body: { email: email.trim().toLowerCase(), code, password },
    }),

  // Nuevo: reset por token (enlace)
  resetPasswordWithToken: (email: string, token: string, password: string) =>
    api("/users/reset-password", {
      method: "POST",
      body: { email: email.trim().toLowerCase(), token, password },
    }),

  // Categories
  listCategories: (token?: string) => api("/categories", { token }),

  // Services
  listServices: (token?: string) => api("/services", { token }),

  createService: (token: string, payload: any) =>
    api("/services", { method: "POST", token, body: payload }),

  updateService: (token: string, id: string, payload: any) =>
    api(`/services/${id}`, { method: "PATCH", token, body: payload }),

  deleteService: (token: string, id: string) =>
    api(`/services/${id}`, { method: "DELETE", token }),

  // Reviews
  createReview: (token: string, payload: { serviceId: string; rating: number; comment?: string }) =>
    api("/reviews", { method: "POST", token, body: payload }),

  listServiceReviews: (serviceId: string, token?: string) =>
    api(`/reviews/${serviceId}`, { token }),

  // Image upload - Cloudinary Integration
  uploadImage: async (
    token: string,
    uri: string,
    fileName: string = "image.jpg",
  ) => {
    const formData = new FormData();

    // Get file extension from URI or filename
    const fileExtension = uri.split(".").pop()?.toLowerCase() || "jpg";
    const mimeType =
      fileExtension === "png"
        ? "image/png"
        : fileExtension === "webp"
          ? "image/webp"
          : "image/jpeg";

    if (Platform.OS === "web") {
      const blob = await (await fetch(uri)).blob();
      formData.append("image", blob, fileName);
    } else {
      formData.append("image", {
        uri,
        type: mimeType,
        name: fileName,
      } as any);
    }

    // Add additional metadata for Cloudinary (server may ignore)
    formData.append("upload_preset", "amazon_group_preset");
    formData.append("folder", "amazon_group/images");

    try {
      // Backend expects POST /api/uploads with field 'image'
      const response = await fetch(`${API_URL}/uploads`, {
        method: "POST",
        headers: {
          // Let fetch set multipart boundary; only add auth
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: formData,
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error((data as any)?.message || "Error al subir imagen");
      }

      // Return Cloudinary response format: { url, public_id }
      return data;
    } catch (error) {
      throw error;
    }
  },

  // Multiple image upload
  uploadMultipleImages: async (
    token: string,
    images: Array<{ uri: string; fileName?: string }>,
  ) => {
    const uploadPromises = images.map((image, index) =>
      Api.uploadImage(token, image.uri, image.fileName || `image_${index}.jpg`),
    );

    try {
      const results = await Promise.all(uploadPromises);
      return results;
    } catch (error) {
      throw new Error("Error al subir múltiples imágenes");
    }
  },

  // Affiliate Documents - Cloudinary Integration
  uploadAffiliateDocument: async (
    token: string,
    uri: string,
    documentType: string,
    fileName: string = "document.pdf",
  ) => {
    const formData = new FormData();

    // Detect file type
    const fileExtension = uri.split(".").pop()?.toLowerCase() || "pdf";
    const mimeType =
      fileExtension === "pdf"
        ? "application/pdf"
        : fileExtension === "doc" || fileExtension === "docx"
          ? "application/msword"
          : fileExtension === "jpg" || fileExtension === "jpeg"
            ? "image/jpeg"
            : fileExtension === "png"
              ? "image/png"
              : "application/octet-stream";

    if (Platform.OS === "web") {
      const blob = await (await fetch(uri)).blob();
      formData.append("document", blob, fileName);
    } else {
      formData.append("document", {
        uri,
        type: mimeType,
        name: fileName,
      } as any);
    }

    formData.append("documentType", documentType);
    formData.append("upload_preset", "amazon_group_documents");
    formData.append(
      "folder",
      `amazon_group/documents/${documentType.toLowerCase()}`,
    );

    try {
      // Backend expects POST /api/affiliate-documents/upload with field 'document'
      const response = await fetch(`${API_URL}/affiliate-documents/upload`, {
        method: "POST",
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: formData,
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error((data as any)?.message || "Error al subir documento");
      }
      return data; // { url, publicId, documentType }
    } catch (error) {
      throw error;
    }
  },

  // Delete image from Cloudinary
  deleteImage: async (token: string, publicId: string) => {
    try {
      const response = await fetch(`${API_URL}/uploads/delete`, {
        method: "DELETE",
        headers: buildHeaders(token),
        body: JSON.stringify({ public_id: publicId }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error((data as any)?.message || "Error al eliminar imagen");
      }
      return data;
    } catch (error) {
      throw error;
    }
  },

  // Orders
  listOrders: (token: string) => api("/orders", { token }),

  createOrder: (token: string, payload: any) =>
    api("/orders", { method: "POST", token, body: payload }),

  getOrder: (token: string, id: string) => api(`/orders/${id}`, { token }),

  getOrderInvoice: (token: string, id: string) =>
    api(`/orders/${id}/invoice`, { token }),

  // Payments - Mercado Pago
  createMercadoPagoPreference: (token: string, payload: any) => {
    const sid = payload?.serviceId;
    const qs = sid ? `?serviceId=${encodeURIComponent(sid)}` : "";
    return api(`/payments/mercadopago/preference${qs}`, {
      method: "POST",
      token,
      body: payload,
    });
  },

  // Affiliates
  listAffiliates: (token: string) => api("/affiliates", { token }),

  createAffiliate: (token: string, payload: any) =>
    api("/affiliates", { method: "POST", token, body: payload }),
  getAffiliateStats: (token: string) => api("/affiliates/me/stats", { token }),

  // Transactions (earnings movements)
  listTransactions: (token: string) => api("/transactions", { token }),
};

export default Api;
