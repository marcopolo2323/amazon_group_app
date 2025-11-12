# Amazon Group - React Native App 📱

Una aplicación móvil completa para el marketplace de servicios Amazon Group, desarrollada con React Native y Expo.

## 🌟 Características

- **Autenticación completa**: Login, registro y recuperación de contraseña
- **Roles de usuario**: Cliente, Afiliado y Administrador
- **Navegación intuitiva**: Tab navigation con Expo Router
- **Gestión de estado**: Zustand con persistencia en AsyncStorage
- **UI moderna**: Componentes reutilizables con diseño responsive
- **Integración con API**: Comunicación completa con el backend
- **Notificaciones**: Toast messages para feedback del usuario
- **Manejo de imágenes**: Upload y visualización de imágenes
- **Gestión de servicios**: Para afiliados (crear, editar, gestionar)
- **Historial de pedidos**: Para clientes
- **Dashboard personalizado**: Diferentes vistas según el rol del usuario

## 🚀 Inicio Rápido

### Prerrequisitos

- Node.js (versión 16 o superior)
- npm o yarn
- Expo CLI: `npm install -g @expo/cli`
- Un dispositivo móvil con Expo Go o un emulador

### Instalación

1. **Clonar el repositorio**
   ```bash
   git clone <repository-url>
   cd amazon_group/amazon_group_app
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Configurar variables de entorno**
   ```bash
   cp .env.example .env
   ```
   Edita el archivo `.env` con tus configuraciones:
   ```
   EXPO_PUBLIC_API_URL=http://localhost:5000/api
   # IDs de OAuth de Google por plataforma
   EXPO_PUBLIC_GOOGLE_EXPO_CLIENT_ID=tu_web_client_id_para_expo_proxy
   EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID=tu_android_client_id
   EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=tu_ios_client_id
   EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=tu_web_client_id_para_web
   # ... otras configuraciones
   ```

4. **Iniciar la aplicación**
   ```bash
   npm start
   ```

5. **Ejecutar en dispositivo/emulador**
   - Escanea el código QR con Expo Go (Android) o la cámara (iOS)
   - O presiona `a` para Android emulator, `i` para iOS simulator

## 📱 Pantallas y Funcionalidades

### 🔐 Autenticación
- **Splash Screen**: Pantalla de carga con navegación automática
- **Onboarding**: Introducción a la app con slides informativos
- **Login**: Autenticación con email/contraseña y Google OAuth
- **Registro**: Creación de cuenta con selección de rol
- **Recuperar Contraseña**: Envío de email para reseteo

### 👤 Cliente
- **Home**: Categorías de servicios y banner promocional
- **Categorías**: Lista completa de servicios disponibles
- **Pedidos**: Historial de servicios contratados
- **Perfil**: Información personal y configuración

### 🤝 Afiliado
- **Dashboard**: Estadísticas y actividad reciente
- **Mis Servicios**: Gestión de servicios ofrecidos
- **Ganancias**: Seguimiento de ingresos
- **Perfil**: Información de afiliado

### ⚙️ Admin
- **Dashboard**: Panel administrativo
- **Gestión de Afiliados**: Aprobación y supervisión

## 🛠️ Arquitectura Técnica

### Estructura de Carpetas
```
app/
├── (tabs)/              # Navegación principal con tabs
├── affiliate/           # Pantallas específicas de afiliados
├── admin/              # Pantallas de administrador
├── _layout.tsx         # Layout raíz con configuración global
└── ...                 # Pantallas individuales

components/
├── Screen.tsx          # Componente base de pantalla
├── Button.tsx          # Botón reutilizable
├── Input.tsx           # Campo de entrada
├── Card.tsx           # Tarjeta de contenido
└── ...

stores/
└── auth.ts            # Store de autenticación con Zustand

lib/
└── api.ts             # Cliente de API
```

### Tecnologías Principales

- **Framework**: React Native con Expo
- **Navegación**: Expo Router (file-based routing)
- **Estado Global**: Zustand
- **Persistencia**: AsyncStorage
- **HTTP Client**: Fetch API nativo
- **Notificaciones**: react-native-toast-message
- **Iconos**: @expo/vector-icons (Ionicons)
- **Tipos**: TypeScript

## 🎨 Guía de Estilo

### Colores Principales
- **Primario**: #2563EB (Azul)
- **Secundario**: #10B981 (Verde)
- **Advertencia**: #F59E0B (Ámbar)
- **Error**: #EF4444 (Rojo)
- **Texto**: #111827 (Gris oscuro)
- **Texto secundario**: #6B7280 (Gris medio)

### Componentes Reutilizables

#### Screen
```tsx
<Screen title="Título" subtitle="Subtítulo" maxWidth={400}>
  <Content />
</Screen>
```

#### Button
```tsx
<Button 
  variant="primary" 
  loading={isLoading} 
  onPress={handlePress}
>
  Texto del botón
</Button>
```

#### Input
```tsx
<Input
  label="Email"
  placeholder="tu@email.com"
  leftIcon="mail-outline"
  error={error}
  required
/>
```

## 🔧 Configuración Avanzada

### Variables de Entorno

| Variable | Descripción | Requerida |
|----------|-------------|-----------|
| `EXPO_PUBLIC_API_URL` | URL del backend API | ✅ |
| `EXPO_PUBLIC_GOOGLE_EXPO_CLIENT_ID` | Client ID Web para Expo Go (Proxy) | ❌ |
| `EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID` | Client ID Android OAuth | ❌ |
| `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID` | Client ID iOS OAuth | ❌ |
| `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` | Client ID Web para login en navegador | ❌ |
| `EXPO_PUBLIC_MERCADOPAGO_PUBLIC_KEY` | Clave pública de MercadoPago | ❌ |

### Configuración de API

La aplicación se comunica con el backend a través de la clase `Api` en `lib/api.ts`. Todas las llamadas incluyen:

- Manejo automático de headers de autenticación
- Gestión de errores centralizada
- Soporte para FormData (uploads)
- Validación de respuestas JSON

### Gestión de Estado

El store de autenticación (`stores/auth.ts`) maneja:

- Login/logout de usuarios
- Persistencia de sesión
- Información del usuario actual
- Estados de carga y error

## 📊 Testing y Debugging

### Comandos Útiles

```bash
# Limpiar caché de Metro
npm start -- --clear

# Ejecutar en modo de desarrollo
npm run dev

# Verificar tipos de TypeScript
npx tsc --noEmit

# Linting
npm run lint
```

### Debugging

- Usa Flipper o React Native Debugger para depuración avanzada
- Console.log aparece en los logs de Metro
- Errores de red se muestran en las herramientas de desarrollo

## 🚢 Deployment

### Build de Desarrollo
```bash
# Android
expo build:android

# iOS
expo build:ios
```

### Build de Producción
```bash
# Android AAB para Play Store
eas build --platform android --profile production

# iOS para App Store
eas build --platform ios --profile production
```

## 🤝 Contribución

1. Fork el repositorio
2. Crea una rama para tu feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -am 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

## 📝 Licencia

Este proyecto está bajo la licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 📞 Soporte

- **Email**: support@amazongroup.com
- **Documentación**: [docs.amazongroup.com](https://docs.amazongroup.com)
- **Issues**: [GitHub Issues](https://github.com/amazongroup/app/issues)

---

Desarrollado con ❤️ por el equipo de Amazon Group