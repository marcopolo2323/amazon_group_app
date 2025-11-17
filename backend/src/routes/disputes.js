const { Router } = require('express');
const {
  create,
  list,
  getOne,
  addMessage,
  resolve,
  updateStatus,
} = require('../controllers/disputes.controller');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = Router();

router.post('/', requireAuth, create);
router.get('/', requireAuth, list);
router.get('/:id', requireAuth, getOne);
router.post('/:id/messages', requireAuth, addMessage);

// Solo admin
router.patch('/:id/resolve', requireAuth, requireRole('admin'), resolve);
router.patch('/:id/status', requireAuth, requireRole('admin'), updateStatus);

module.exports = router;
