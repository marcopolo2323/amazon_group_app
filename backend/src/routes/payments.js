const { Router } = require('express');
const { requireAuth } = require('../middleware/auth');
const ctrl = require('../controllers/payments.controller');

const router = Router();

// Crear preferencia (Checkout Pro) y orden pendiente
router.post('/mercadopago/preference', requireAuth, ctrl.createMercadoPagoPreference);

// Webhook para confirmar pago aprobado
router.post('/mercadopago/webhook', ctrl.mercadopagoWebhook);
router.get('/mercadopago/webhook', ctrl.mercadopagoWebhook);

module.exports = router;