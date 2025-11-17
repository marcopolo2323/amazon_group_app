const { Router } = require('express');
const {
  getNotifications,
  markRead,
  markAllRead,
  deleteNotif,
} = require('../controllers/notifications.controller');
const { requireAuth } = require('../middleware/auth');

const router = Router();

router.get('/', requireAuth, getNotifications);
router.patch('/:id/read', requireAuth, markRead);
router.patch('/read-all', requireAuth, markAllRead);
router.delete('/:id', requireAuth, deleteNotif);

module.exports = router;
