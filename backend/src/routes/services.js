const { Router } = require('express');
const { create, list, update, remove } = require('../controllers/services.controller');
const validate = require('../middleware/validate');
const { createServiceSchema, updateServiceSchema } = require('../schemas/services.schema');
const { requireAuth } = require('../middleware/auth');

const router = Router();

router.post('/', requireAuth, validate(createServiceSchema), create);
router.get('/', list);
router.patch('/:id', requireAuth, validate(updateServiceSchema), update);
router.delete('/:id', requireAuth, remove);

module.exports = router;


