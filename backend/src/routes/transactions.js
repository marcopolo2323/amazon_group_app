const { Router } = require('express');
const { create, list } = require('../controllers/transactions.controller');
const validate = require('../middleware/validate');
const { createTransactionSchema } = require('../schemas/transactions.schema');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = Router();

router.post('/', requireAuth, requireRole('affiliate', 'admin'), validate(createTransactionSchema), create);
router.get('/', requireAuth, requireRole('affiliate', 'admin'), list);

module.exports = router;


