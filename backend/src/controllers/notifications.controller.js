const {
  getUserNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} = require('../services/notifications.service');

// Obtener notificaciones del usuario
async function getNotifications(req, res, next) {
  try {
    const userId = req.user.userId;
    const filters = {
      read: req.query.read === 'true' ? true : req.query.read === 'false' ? false : undefined,
      limit: parseInt(req.query.limit) || 50,
      page: parseInt(req.query.page) || 1,
    };
    
    const result = await getUserNotifications(userId, filters);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

// Marcar como leída
async function markRead(req, res, next) {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    
    const notification = await markAsRead(id, userId);
    res.json(notification);
  } catch (err) {
    next(err);
  }
}

// Marcar todas como leídas
async function markAllRead(req, res, next) {
  try {
    const userId = req.user.userId;
    const result = await markAllAsRead(userId);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

// Eliminar notificación
async function deleteNotif(req, res, next) {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    
    const result = await deleteNotification(id, userId);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getNotifications,
  markRead,
  markAllRead,
  deleteNotif,
};
