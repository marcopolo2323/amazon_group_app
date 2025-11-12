const { Router } = require('express');
const { create, list, getOne, invoice } = require('../controllers/orders.controller');
const validate = require('../middleware/validate');
const { createOrderSchema, getOrderSchema, invoiceOrderSchema } = require('../schemas/orders.schema');
const { requireAuth } = require('../middleware/auth');

const router = Router();

router.post('/', requireAuth, validate(createOrderSchema), create);
router.get('/', requireAuth, list);
router.get('/:id', requireAuth, validate(getOrderSchema), getOne);
router.get('/:id/invoice', requireAuth, validate(invoiceOrderSchema), invoice);

module.exports = router;


