const Notification = require('../models/Notification');
const { Types } = require('mongoose');

// Crear notificación
async function createNotification(data) {
  const { userId, type, title, message, data: notifData, priority = 'normal' } = data;

  const notification = await Notification.create({
    userId: Types.ObjectId.createFromHexString(userId),
    type,
    title,
    message,
    data: notifData,
    priority,
  });

  return notification;
}

// Crear notificaciones en masa
async function createBulkNotifications(notifications) {
  const formattedNotifications = notifications.map(n => ({
    ...n,
    userId: Types.ObjectId.createFromHexString(n.userId),
  }));

  return Notification.insertMany(formattedNotifications);
}

// Obtener notificaciones de un usuario
async function getUserNotifications(userId, filters = {}) {
  const { read, limit = 50, page = 1 } = filters;
  const skip = (page - 1) * limit;

  const query = { userId: Types.ObjectId.createFromHexString(userId) };
  if (read !== undefined) query.read = read;

  const notifications = await Notification.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Notification.countDocuments(query);
  const unreadCount = await Notification.countDocuments({
    userId: Types.ObjectId.createFromHexString(userId),
    read: false,
  });

  return {
    notifications,
    unreadCount,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
}

// Marcar notificación como leída
async function markAsRead(notificationId, userId) {
  const notification = await Notification.findOneAndUpdate(
    {
      _id: Types.ObjectId.createFromHexString(notificationId),
      userId: Types.ObjectId.createFromHexString(userId),
    },
    {
      read: true,
      readAt: new Date(),
    },
    { new: true }
  );

  return notification;
}

// Marcar todas como leídas
async function markAllAsRead(userId) {
  await Notification.updateMany(
    {
      userId: Types.ObjectId.createFromHexString(userId),
      read: false,
    },
    {
      read: true,
      readAt: new Date(),
    }
  );

  return { success: true };
}

// Eliminar notificación
async function deleteNotification(notificationId, userId) {
  await Notification.deleteOne({
    _id: Types.ObjectId.createFromHexString(notificationId),
    userId: Types.ObjectId.createFromHexString(userId),
  });

  return { success: true };
}

// Notificaciones específicas por tipo de evento

async function notifyOrderCreated(orderId, clientId, affiliateId, serviceTitle) {
  const notifications = [
    {
      userId: clientId,
      type: 'order_new',
      title: 'Pedido creado',
      message: `Tu pedido de "${serviceTitle}" ha sido creado exitosamente`,
      data: { orderId },
      priority: 'normal',
    },
    {
      userId: affiliateId,
      type: 'order_new',
      title: 'Nuevo pedido',
      message: `Tienes un nuevo pedido para "${serviceTitle}"`,
      data: { orderId },
      priority: 'high',
    },
  ];

  return createBulkNotifications(notifications);
}

async function notifyPaymentReceived(affiliateId, amount, paymentId) {
  return createNotification({
    userId: affiliateId,
    type: 'payment_received',
    title: 'Pago recibido',
    message: `Has recibido un pago de S/ ${amount.toFixed(2)}`,
    data: { paymentId, amount },
    priority: 'high',
  });
}

async function notifyAffiliateApproved(affiliateId) {
  return createNotification({
    userId: affiliateId,
    type: 'affiliate_approved',
    title: '¡Felicitaciones!',
    message: 'Tu solicitud de afiliado ha sido aprobada. Ya puedes publicar servicios.',
    priority: 'high',
  });
}

async function notifyAffiliateRejected(affiliateId, reason) {
  return createNotification({
    userId: affiliateId,
    type: 'affiliate_rejected',
    title: 'Solicitud rechazada',
    message: reason || 'Tu solicitud de afiliado ha sido rechazada. Contacta con soporte para más información.',
    priority: 'high',
  });
}

async function notifyDisputeCreated(disputeId, reportedAgainstId, title) {
  return createNotification({
    userId: reportedAgainstId,
    type: 'dispute_new',
    title: 'Nueva disputa',
    message: `Se ha abierto una disputa: ${title}`,
    data: { disputeId },
    priority: 'urgent',
  });
}

async function notifyDisputeResolved(disputeId, userId, resolution) {
  return createNotification({
    userId,
    type: 'dispute_resolved',
    title: 'Disputa resuelta',
    message: `La disputa ha sido resuelta: ${resolution}`,
    data: { disputeId },
    priority: 'high',
  });
}

module.exports = {
  createNotification,
  createBulkNotifications,
  getUserNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  // Helpers específicos
  notifyOrderCreated,
  notifyPaymentReceived,
  notifyAffiliateApproved,
  notifyAffiliateRejected,
  notifyDisputeCreated,
  notifyDisputeResolved,
};
