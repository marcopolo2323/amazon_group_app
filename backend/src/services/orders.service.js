const createError = require('http-errors');
const Order = require('../models/Order');
const Service = require('../models/Service');
const Transaction = require('../models/Transaction');
const { Types } = require('mongoose');

async function createOrder(input) {
  // clientId viene del token (controlador)
  const { clientId, serviceId, paymentMethod } = input;

  // Encontramos el servicio para derivar precio y afiliado
  const service = await Service.findById(serviceId);
  if (!service) throw createError(404, 'Servicio no encontrado');

  const feePercent = Number(process.env.PLATFORM_FEE_PERCENT || '0.05');
  const amount = Number(service.price || 0);
  const commission = Math.round(amount * feePercent * 100) / 100;
  const affiliateId = service.affiliateId;

  // Estado de pago: por defecto pending para pasarela, completed para métodos offline
  let paymentStatus = input.paymentStatus;
  if (!paymentStatus) {
    paymentStatus = paymentMethod === 'mercado_pago' ? 'pending' : 'completed';
  }

  // Incluir campos requeridos por el modelo
  const address = input.address;
  const notes = input.notes;
  const contactInfo = input.contactInfo;
  const bookingDetails = input.bookingDetails;
  const currency = input.currency || 'USD';

  const order = await Order.create({
    clientId,
    serviceId,
    affiliateId,
    amount,
    commission,
    paymentMethod,
    paymentStatus,
    address,
    notes,
    contactInfo,
    bookingDetails,
    currency,
  });

  // Si el pago está completado, registramos transacción (split afiliado/plataforma)
  if (paymentStatus === 'completed') {
    const affiliateAmount = Math.max(amount - commission, 0);
    await Transaction.create({ orderId: order._id, affiliateAmount, platformAmount: commission, status: 'completed' });
  }

  return order;
}

async function listOrders(clientId) {
  const filter = clientId ? { clientId: Types.ObjectId.createFromHexString(String(clientId)) } : {};

  // Join con Service y User (afiliado) para enriquecer el listado
  return Order.aggregate([
    { $match: filter },
    { $sort: { createdAt: -1 } },
    { $limit: 100 },
    { $lookup: { from: 'services', localField: 'serviceId', foreignField: '_id', as: 'service' } },
    { $unwind: { path: '$service', preserveNullAndEmptyArrays: true } },
    { $lookup: { from: 'users', localField: 'service.affiliateId', foreignField: '_id', as: 'affiliate' } },
    { $unwind: { path: '$affiliate', preserveNullAndEmptyArrays: true } },
    {
      $project: {
        id: { $toString: '$_id' },
        serviceId: { $toString: '$serviceId' },
        serviceTitle: '$service.title',
        serviceName: '$service.title',
        providerName: '$affiliate.name',
        providerId: { $toString: '$service.affiliateId' },
        status: 1,
        total: '$amount',
        currency: '$currency',
        paymentMethod: '$paymentMethod',
        transactionId: 1,
        createdAt: 1,
        scheduledDate: {
          $cond: [
            { $ifNull: ['$scheduledDate', false] },
            { $dateToString: { date: '$scheduledDate', format: '%Y-%m-%d' } },
            null,
          ],
        },
        scheduledTime: '$scheduledTime',
        address: 1,
        description: '$notes',
        notes: '$notes',
        contactInfo: 1,
        bookingDetails: 1,
      },
    },
  ]);
}

async function completeOrderPayment(orderId, paymentGatewayId) {
  const order = await Order.findById(orderId);
  if (!order) throw createError(404, 'Orden no encontrada');

  if (order.paymentStatus !== 'completed') {
    order.paymentStatus = 'completed';
    await order.save();

    const affiliateAmount = Math.max(order.amount - order.commission, 0);
    await Transaction.create({ orderId: order._id, affiliateAmount, platformAmount: order.commission, paymentGatewayId, status: 'completed' });
  }

  return order;
}

module.exports = { createOrder, listOrders, completeOrderPayment };

async function getOrder(orderId, clientId) {
  const order = await Order.findById(orderId);
  if (!order) throw createError(404, 'Orden no encontrada');
  if (clientId && order.clientId.toString() !== clientId.toString()) {
    throw createError(403, 'No autorizado');
  }
  return order;
}

async function getOrderInvoice(orderId, clientId) {
  const order = await getOrder(orderId, clientId);
  const service = await Service.findById(order.serviceId).select('title price images affiliateId');
  const subtotal = Number(order.amount || 0);
  const commission = Number(order.commission || 0);
  const total = subtotal; // Al cliente se le cobra el subtotal; comisión es fee interno
  return {
    order: order.toJSON(),
    service: service ? service.toJSON() : null,
    totals: { subtotal, commission, total },
    meta: {
      createdAt: order.createdAt,
      paymentMethod: order.paymentMethod,
      paymentStatus: order.paymentStatus,
    },
  };
}

module.exports.getOrder = getOrder;
module.exports.getOrderInvoice = getOrderInvoice;


