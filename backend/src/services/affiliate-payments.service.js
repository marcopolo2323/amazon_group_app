const AffiliatePayment = require('../models/AffiliatePayment');
const Transaction = require('../models/Transaction');
const Order = require('../models/Order');
const { Types } = require('mongoose');
const createError = require('http-errors');

// Obtener pagos pendientes agrupados por afiliado
async function getPendingPaymentsByAffiliate() {
  const pendingPayments = await Transaction.aggregate([
    // Solo transacciones completadas que no han sido pagadas
    { $match: { status: 'completed' } },
    
    // Buscar si ya existe un pago para esta transacción
    {
      $lookup: {
        from: 'affiliatepayments',
        let: { transactionId: '$_id' },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $in: ['$$transactionId', '$transactionIds'] },
                  { $in: ['$status', ['pending', 'completed']] },
                ],
              },
            },
          },
        ],
        as: 'payment',
      },
    },
    
    // Filtrar solo las que no tienen pago
    { $match: { payment: { $size: 0 } } },
    
    // Join con orders para obtener affiliateId
    {
      $lookup: {
        from: 'orders',
        localField: 'orderId',
        foreignField: '_id',
        as: 'order',
      },
    },
    { $unwind: '$order' },
    
    // Join con users para obtener info del afiliado
    {
      $lookup: {
        from: 'users',
        localField: 'order.affiliateId',
        foreignField: '_id',
        as: 'affiliate',
      },
    },
    { $unwind: '$affiliate' },
    
    // Join con affiliates para obtener info de pago
    {
      $lookup: {
        from: 'affiliates',
        localField: 'order.affiliateId',
        foreignField: 'affiliateId',
        as: 'affiliateInfo',
      },
    },
    { $unwind: { path: '$affiliateInfo', preserveNullAndEmptyArrays: true } },
    
    // Agrupar por afiliado
    {
      $group: {
        _id: '$order.affiliateId',
        affiliateName: { $first: '$affiliate.name' },
        affiliateEmail: { $first: '$affiliate.email' },
        affiliatePhone: { $first: '$affiliate.phone' },
        totalAmount: { $sum: '$affiliateAmount' },
        transactionCount: { $sum: 1 },
        transactionIds: { $push: '$_id' },
        bankAccount: { $first: '$affiliateInfo.bankAccount' },
        yapePhone: { $first: '$affiliateInfo.yapePhone' },
        oldestTransaction: { $min: '$createdAt' },
      },
    },
    { $sort: { totalAmount: -1 } },
  ]);

  return pendingPayments;
}

// Crear un nuevo pago a afiliado
async function createAffiliatePayment(data) {
  const { affiliateId, transactionIds, paymentMethod, paymentDetails, notes, processedBy } = data;

  // Verificar que las transacciones existan y no estén pagadas
  const transactions = await Transaction.find({
    _id: { $in: transactionIds.map(id => Types.ObjectId.createFromHexString(id)) },
    status: 'completed',
  });

  if (transactions.length !== transactionIds.length) {
    throw createError(400, 'Algunas transacciones no son válidas');
  }

  // Verificar que no estén ya pagadas
  const existingPayments = await AffiliatePayment.find({
    transactionIds: { $in: transactionIds.map(id => Types.ObjectId.createFromHexString(id)) },
    status: { $in: ['pending', 'completed'] },
  });

  if (existingPayments.length > 0) {
    throw createError(400, 'Algunas transacciones ya tienen un pago asociado');
  }

  // Calcular monto total
  const amount = transactions.reduce((sum, t) => sum + t.affiliateAmount, 0);

  // Crear el pago
  const payment = await AffiliatePayment.create({
    affiliateId: Types.ObjectId.createFromHexString(affiliateId),
    amount,
    transactionIds: transactionIds.map(id => Types.ObjectId.createFromHexString(id)),
    paymentMethod,
    paymentDetails,
    notes,
    processedBy: Types.ObjectId.createFromHexString(processedBy),
    status: 'pending',
  });

  return payment;
}

// Completar un pago
async function completeAffiliatePayment(paymentId, data) {
  const { receiptImage, notes } = data;

  const payment = await AffiliatePayment.findById(paymentId);
  if (!payment) {
    throw createError(404, 'Pago no encontrado');
  }

  if (payment.status === 'completed') {
    throw createError(400, 'El pago ya está completado');
  }

  payment.status = 'completed';
  payment.completedDate = new Date();
  if (receiptImage) payment.receiptImage = receiptImage;
  if (notes) payment.notes = notes;

  await payment.save();

  return payment;
}

// Listar pagos realizados
async function listAffiliatePayments(filters = {}) {
  const { affiliateId, status, page = 1, limit = 20 } = filters;
  const skip = (page - 1) * limit;

  const query = {};
  if (affiliateId) query.affiliateId = Types.ObjectId.createFromHexString(affiliateId);
  if (status) query.status = status;

  const payments = await AffiliatePayment.aggregate([
    { $match: query },
    { $sort: { createdAt: -1 } },
    { $skip: skip },
    { $limit: limit },
    {
      $lookup: {
        from: 'users',
        localField: 'affiliateId',
        foreignField: '_id',
        as: 'affiliate',
      },
    },
    { $unwind: { path: '$affiliate', preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: 'users',
        localField: 'processedBy',
        foreignField: '_id',
        as: 'processor',
      },
    },
    { $unwind: { path: '$processor', preserveNullAndEmptyArrays: true } },
    {
      $project: {
        paymentId: { $toString: '$_id' },
        affiliateId: { $toString: '$affiliateId' },
        affiliateName: '$affiliate.name',
        affiliateEmail: '$affiliate.email',
        amount: 1,
        currency: 1,
        paymentMethod: 1,
        paymentDetails: 1,
        receiptImage: 1,
        status: 1,
        notes: 1,
        processedBy: '$processor.name',
        transactionCount: { $size: '$transactionIds' },
        createdAt: 1,
        completedDate: 1,
      },
    },
  ]);

  const total = await AffiliatePayment.countDocuments(query);

  return {
    payments,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
}

// Obtener historial de pagos de un afiliado
async function getAffiliatePaymentHistory(affiliateId) {
  return AffiliatePayment.find({
    affiliateId: Types.ObjectId.createFromHexString(affiliateId),
  })
    .sort({ createdAt: -1 })
    .limit(50);
}

module.exports = {
  getPendingPaymentsByAffiliate,
  createAffiliatePayment,
  completeAffiliatePayment,
  listAffiliatePayments,
  getAffiliatePaymentHistory,
};
