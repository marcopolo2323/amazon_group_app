const { Router } = require('express');
const {
  getPendingPayments,
  createPayment,
  completePayment,
  listPayments,
  getPaymentHistory,
} = require('../controllers/affiliate-payments.controller');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = Router();

// Rutas de admin
router.get('/pending', requireAuth, requireRole('admin'), getPendingPayments);
router.post('/', requireAuth, requireRole('admin'), createPayment);
router.patch('/:id/complete', requireAuth, requireRole('admin'), completePayment);
router.get('/', requireAuth, requireRole('admin'), listPayments);

// Rutas de afiliado
router.get('/affiliate/:affiliateId/history', requireAuth, getPaymentHistory);

module.exports = router;
