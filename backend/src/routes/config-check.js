const { Router } = require('express');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = Router();

/**
 * Endpoint para verificar la configuración del servidor
 * Solo accesible para administradores
 */
router.get('/check', requireAuth, requireRole('admin'), (req, res) => {
  const config = {
    environment: process.env.NODE_ENV || 'development',
    port: process.env.PORT || 5000,
    database: {
      configured: !!process.env.MONGODB_URI,
      connected: require('mongoose').connection.readyState === 1,
    },
    jwt: {
      configured: !!process.env.JWT_SECRET,
      isDefault: process.env.JWT_SECRET === 'change_me',
    },
    google: {
      configured: !!(process.env.GOOGLE_CLIENT_ID || process.env.GOOGLE_CLIENT_IDS),
      clientId: process.env.GOOGLE_CLIENT_ID ? 
        process.env.GOOGLE_CLIENT_ID.substring(0, 20) + '...' : 
        'Not configured',
    },
    mercadopago: {
      configured: !!process.env.MP_ACCESS_TOKEN,
      token: process.env.MP_ACCESS_TOKEN ? 
        process.env.MP_ACCESS_TOKEN.substring(0, 20) + '...' : 
        'Not configured',
      currency: process.env.MP_CURRENCY_ID || 'PEN',
    },
    email: {
      configured: !!(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS),
      host: process.env.SMTP_HOST || 'Not configured',
    },
    cors: {
      origins: process.env.CORS_ORIGIN || 'Default',
    },
  };

  res.json({
    status: 'ok',
    config,
    warnings: [
      config.jwt.isDefault && 'JWT_SECRET is using default value',
      !config.google.configured && 'Google OAuth not configured',
      !config.mercadopago.configured && 'MercadoPago not configured',
      !config.email.configured && 'Email not configured',
    ].filter(Boolean),
  });
});

module.exports = router;
