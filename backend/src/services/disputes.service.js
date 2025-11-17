const Dispute = require('../models/Dispute');
const Order = require('../models/Order');
const { Types } = require('mongoose');
const createError = require('http-errors');
const { notifyDisputeCreated, notifyDisputeResolved } = require('./notifications.service');

// Crear disputa
async function createDispute(data) {
  const { orderId, reportedBy, type, title, description, evidence } = data;

  // Verificar que la orden existe
  const order = await Order.findById(orderId);
  if (!order) {
    throw createError(404, 'Orden no encontrada');
  }

  // Determinar contra quién es la disputa
  let reportedAgainst;
  if (order.clientId.toString() === reportedBy) {
    reportedAgainst = order.affiliateId;
  } else if (order.affiliateId.toString() === reportedBy) {
    reportedAgainst = order.clientId;
  } else {
    throw createError(403, 'No tienes permiso para crear una disputa sobre esta orden');
  }

  const dispute = await Dispute.create({
    orderId: Types.ObjectId.createFromHexString(orderId),
    reportedBy: Types.ObjectId.createFromHexString(reportedBy),
    reportedAgainst,
    type,
    title,
    description,
    evidence: evidence || [],
  });

  // Notificar a la otra parte
  await notifyDisputeCreated(dispute._id.toString(), reportedAgainst.toString(), title);

  return dispute;
}

// Listar disputas
async function listDisputes(filters = {}) {
  const { status, userId, page = 1, limit = 20 } = filters;
  const skip = (page - 1) * limit;

  const query = {};
  if (status) query.status = status;
  if (userId) {
    query.$or = [
      { reportedBy: Types.ObjectId.createFromHexString(userId) },
      { reportedAgainst: Types.ObjectId.createFromHexString(userId) },
    ];
  }

  const disputes = await Dispute.aggregate([
    { $match: query },
    { $sort: { createdAt: -1 } },
    { $skip: skip },
    { $limit: limit },
    {
      $lookup: {
        from: 'orders',
        localField: 'orderId',
        foreignField: '_id',
        as: 'order',
      },
    },
    { $unwind: { path: '$order', preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: 'users',
        localField: 'reportedBy',
        foreignField: '_id',
        as: 'reporter',
      },
    },
    { $unwind: { path: '$reporter', preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: 'users',
        localField: 'reportedAgainst',
        foreignField: '_id',
        as: 'reported',
      },
    },
    { $unwind: { path: '$reported', preserveNullAndEmptyArrays: true } },
    {
      $project: {
        disputeId: { $toString: '$_id' },
        orderId: { $toString: '$orderId' },
        type: 1,
        title: 1,
        description: 1,
        status: 1,
        priority: 1,
        reporterName: '$reporter.name',
        reportedName: '$reported.name',
        evidenceCount: { $size: '$evidence' },
        messageCount: { $size: '$messages' },
        createdAt: 1,
        resolution: 1,
      },
    },
  ]);

  const total = await Dispute.countDocuments(query);

  return {
    disputes,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
}

// Obtener disputa por ID
async function getDispute(disputeId, userId) {
  const dispute = await Dispute.findById(disputeId)
    .populate('reportedBy', 'name email')
    .populate('reportedAgainst', 'name email')
    .populate('orderId')
    .populate('messages.userId', 'name');

  if (!dispute) {
    throw createError(404, 'Disputa no encontrada');
  }

  // Verificar que el usuario tenga permiso para ver la disputa
  if (userId) {
    const isInvolved =
      dispute.reportedBy._id.toString() === userId ||
      dispute.reportedAgainst._id.toString() === userId;

    if (!isInvolved) {
      throw createError(403, 'No tienes permiso para ver esta disputa');
    }
  }

  return dispute;
}

// Agregar mensaje a disputa
async function addDisputeMessage(disputeId, userId, message) {
  const dispute = await Dispute.findById(disputeId);
  if (!dispute) {
    throw createError(404, 'Disputa no encontrada');
  }

  dispute.messages.push({
    userId: Types.ObjectId.createFromHexString(userId),
    message,
    createdAt: new Date(),
  });

  await dispute.save();
  return dispute;
}

// Resolver disputa (solo admin)
async function resolveDispute(disputeId, resolution, resolvedBy) {
  const { decision, action, notes } = resolution;

  const dispute = await Dispute.findById(disputeId);
  if (!dispute) {
    throw createError(404, 'Disputa no encontrada');
  }

  dispute.status = 'resolved';
  dispute.resolution = {
    decision,
    action,
    notes,
    resolvedBy: Types.ObjectId.createFromHexString(resolvedBy),
    resolvedAt: new Date(),
  };

  await dispute.save();

  // Notificar a ambas partes
  await notifyDisputeResolved(
    disputeId,
    dispute.reportedBy.toString(),
    decision
  );
  await notifyDisputeResolved(
    disputeId,
    dispute.reportedAgainst.toString(),
    decision
  );

  return dispute;
}

// Actualizar estado de disputa
async function updateDisputeStatus(disputeId, status) {
  const dispute = await Dispute.findByIdAndUpdate(
    disputeId,
    { status },
    { new: true }
  );

  if (!dispute) {
    throw createError(404, 'Disputa no encontrada');
  }

  return dispute;
}

module.exports = {
  createDispute,
  listDisputes,
  getDispute,
  addDisputeMessage,
  resolveDispute,
  updateDisputeStatus,
};
