const { Router } = require('express');
const { create, listByService } = require('../controllers/reviews.controller');
const validate = require('../middleware/validate');
const { requireAuth } = require('../middleware/auth');
const { createReviewSchema } = require('../schemas/reviews.schema');

const router = Router();

router.post('/', requireAuth, validate(createReviewSchema), create);
router.get('/:serviceId', listByService);

module.exports = router;