const { Router } = require('express');
const {
  getMonthlyReports,
  getMonthlyReportDetail,
  getGrowthStats,
} = require('../controllers/reports.controller');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = Router();

// Todas las rutas requieren rol de admin
router.use(requireAuth, requireRole('admin'));

// Obtener reportes mensuales por año
router.get('/monthly', getMonthlyReports);

// Obtener detalle de un mes específico
router.get('/monthly/:year/:month', getMonthlyReportDetail);

// Obtener estadísticas de crecimiento
router.get('/growth', getGrowthStats);

module.exports = router;
