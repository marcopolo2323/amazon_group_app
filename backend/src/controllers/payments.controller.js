const createError = require('http-errors');
const { MercadoPagoConfig, Preference, Payment } = require('mercadopago');
const Service = require('../models/Service');
const OrderService = require('../services/orders.service');

// Configuración del SDK (se ejecuta una sola vez por proceso)
let mpClient = null;
let mpPreference = null;
let mpPayment = null;
if (process.env.MP_ACCESS_TOKEN) {
  mpClient = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN });
  mpPreference = new Preference(mpClient);
  mpPayment = new Payment(mpClient);
}

function getFrontendUrl(req) {
  const envUrl = process.env.FRONTEND_URL || `http://localhost:${process.env.PORT || 5000}`;
  return envUrl;
}

function getWebhookUrl(req) {
  const base = `${req.protocol}://${req.get('host')}`;
  return `${base}/api/payments/mercadopago/webhook`;
}

// Crea preferencia para Mercado Pago.
// Si viene orderId, usa esa orden existente.
// Si no, crea una nueva orden pendiente con los datos recibidos.
async function createMercadoPagoPreference(req, res, next) {
  try {
    if (!process.env.MP_ACCESS_TOKEN) throw createError(500, 'MP_ACCESS_TOKEN no configurado');
    const clientId = req.user?.userId;
    const bodyOrderId = req.body?.orderId || req.query?.orderId;
    let order = null;
    let service = null;
    let price = 0;

    if (bodyOrderId) {
      // Usar orden existente
      order = await OrderService.getOrder(String(bodyOrderId), clientId);
      service = await Service.findById(order.serviceId);
      price = Number(order.amount || 0);
    } else {
      // Crear una nueva orden, validando campos requeridos por el modelo
      const bodySid = req.body?.serviceId || req.query?.serviceId;
      const serviceId = bodySid;
      if (!serviceId) throw createError(400, 'serviceId es requerido');

      service = await Service.findById(serviceId);
      if (!service) throw createError(404, 'Servicio no encontrado');

      // Validar campos requeridos para Order
      const address = req.body?.address;
      const notes = req.body?.notes;
      const contactInfo = req.body?.contactInfo || {};
      const bookingDetails = req.body?.bookingDetails || {};
      const currency = req.body?.currency;

      if (!address) throw createError(400, 'address es requerido');
      if (!contactInfo?.name || !contactInfo?.phone || !contactInfo?.email) {
        throw createError(400, 'contactInfo.name, contactInfo.phone y contactInfo.email son requeridos');
      }

      // Crea la orden en estado pending (split se hará al aprobar pago)
      order = await OrderService.createOrder({
        clientId,
        serviceId,
        paymentMethod: 'mercado_pago',
        paymentStatus: 'pending',
        address,
        notes,
        contactInfo,
        bookingDetails,
        currency,
      });

      price = Number(order.amount || service.price || 0);
    }

    if (!Number.isFinite(price) || price <= 0) {
      throw createError(400, 'El servicio debe tener un precio mayor a 0');
    }

    const currencyId = process.env.MP_CURRENCY_ID || 'PEN';
    const preference = {
      items: [
        {
          title: (service && service.title) || 'Servicio',
          quantity: 1,
          currency_id: currencyId,
          unit_price: price,
        },
      ],
      external_reference: order._id.toString(),
      notification_url: getWebhookUrl(req),
      back_urls: {
        success: `${getFrontendUrl(req)}/order-confirmation?orderId=${order._id.toString()}&success=true`,
        pending: `${getFrontendUrl(req)}/order-confirmation?orderId=${order._id.toString()}`,
        failure: `${getFrontendUrl(req)}/payment-failure?orderId=${order._id.toString()}`,
      },
      // auto_return es opcional; lo omitimos para evitar 400 cuando MP valida back_urls
    };

    const { body } = await mpPreference.create({ body: preference });
    // Fallback: algunos entornos no devuelven init_point; construimos URL con preference id
    const checkoutBase = process.env.MP_CHECKOUT_BASE || 'https://www.mercadopago.com/checkout/v1/redirect?pref_id=';
    const url = body?.init_point || body?.sandbox_init_point || (body?.id ? `${checkoutBase}${encodeURIComponent(body.id)}` : undefined);
    return res.json({ init_point: body?.init_point, sandbox_init_point: body?.sandbox_init_point, preference_id: body?.id, external_reference: preference.external_reference, url });
  } catch (err) {
    // Propaga errores propios (createError) tal cual
    if (err?.status) return next(err);

    // Intenta extraer información detallada del SDK de MP
    const status = err?.statusCode || err?.status || 400;
    let message = err?.message || err?.error?.message;
    const causeMsg = Array.isArray(err?.error?.cause)
      ? err.error.cause[0]?.description
      : (Array.isArray(err?.cause) ? err.cause[0]?.description : undefined);
    if (!message && causeMsg) message = causeMsg;
    console.error('MercadoPago Preference Error:', { status, message, raw: err });
    next(createError(status, message || 'No se pudo crear la preferencia'));
  }
}

// Webhook: confirma pagos y completa la orden generando la transacción
async function mercadopagoWebhook(req, res, next) {
  try {
    // MP envía tanto GET como POST; soportamos ambos
    const query = req.query || {};
    const body = req.body || {};

    const topic = query.topic || query.type || body?.type;
    let paymentId = query[topic === 'payment' ? 'id' : 'resource'] || body?.data?.id || body?.id;

    // Algunos envíos vienen como /v1/payments/{id}
    if (typeof paymentId === 'string' && paymentId.includes('/')) {
      const parts = paymentId.split('/');
      paymentId = parts[parts.length - 1];
    }

    if (!paymentId) {
      // Aceptamos 200 para evitar reintentos infinitos, pero registramos
      return res.status(200).json({ received: true });
    }

    // Obtenemos el pago desde MP y verificamos estado
    const { body: payment } = await mpPayment.get({ id: paymentId });
    const status = payment?.status;
    const orderId = payment?.external_reference;

    if (status === 'approved' && orderId) {
      await OrderService.completeOrderPayment(orderId, String(paymentId));
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    // MP reintenta si no hay 200; evitamos loops devolviendo 200
    console.error('Webhook MP error:', err?.message);
    try { return res.status(200).json({ ok: true }); } catch (_) { /* noop */ }
  }
}

module.exports = { createMercadoPagoPreference, mercadopagoWebhook };