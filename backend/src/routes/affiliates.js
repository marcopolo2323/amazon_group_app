const { Router } = require('express');
const { create, list, stats } = require('../controllers/affiliates.controller');
const validate = require('../middleware/validate');
const { createAffiliateSchema } = require('../schemas/affiliates.schema');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = Router();

router.post('/', requireAuth, requireRole('affiliate', 'admin'), validate(createAffiliateSchema), create);
router.get('/', requireAuth, requireRole('affiliate', 'admin'), list);
router.get('/me/stats', requireAuth, requireRole('affiliate', 'admin'), stats);

module.exports = router;


