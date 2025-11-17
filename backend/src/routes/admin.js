const { Router } = require('express');
const {
  getDashboardStats,
  getAllUsers,
  getAllAffiliates,
  updateAffiliateStatus,
  getAllServices,
  getAllOrders,
  getAllTransactions,
} = require('../controllers/admin.controller');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = Router();

// Todas las rutas requieren rol de admin
router.use(requireAuth, requireRole('admin'));

router.get('/stats', getDashboardStats);
router.get('/users', getAllUsers);
router.get('/affiliates', getAllAffiliates);
router.patch('/affiliates/:id/status', updateAffiliateStatus);
router.get('/services', getAllServices);
router.get('/orders', getAllOrders);
router.get('/transactions', getAllTransactions);
router.get('/pending-payments', require('../controllers/admin.controller').getPendingPayments);

module.exports = router;
