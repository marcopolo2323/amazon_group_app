const { Router } = require('express');
const { create, list } = require('../controllers/categories.controller');
const validate = require('../middleware/validate');
const { createCategorySchema } = require('../schemas/categories.schema');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = Router();

router.post('/', requireAuth, requireRole('affiliate', 'admin'), validate(createCategorySchema), create);
router.get('/', list);

module.exports = router;


