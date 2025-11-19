const User = require('../models/User');
const Affiliate = require('../models/Affiliate');
const Service = require('../models/Service');
const Order = require('../models/Order');
const Transaction = require('../models/Transaction');
const { Types } = require('mongoose');
const { notifyAffiliateApproved, notifyAffiliateRejected } = require('../services/notifications.service');

// Dashboard stats para admin
async function getDashboardStats(req, res, next) {
  try {
    console.log('=== ADMIN DASHBOARD STATS REQUEST ===');
    console.log('User:', req.user);
    console.log('User role:', req.user?.role);
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const [
      totalUsers,
      totalAffiliates,
      pendingAffiliates,
      totalServices,
      totalOrders,
      monthlyOrders,
      totalRevenue,
      monthlyRevenue,
    ] = await Promise.all([
      User.countDocuments({ role: 'client' }),
      Affiliate.countDocuments({ status: 'approved' }),
      Affiliate.countDocuments({ status: 'pending' }),
      Service.countDocuments(),
      Order.countDocuments(),
      Order.countDocuments({ createdAt: { $gte: startOfMonth } }),
      Transaction.aggregate([
        { $match: { status: 'completed' } },
        { $group: { _id: null, total: { $sum: '$platformAmount' } } },
      ]).then(result => result[0]?.total || 0),
      Transaction.aggregate([
        { $match: { status: 'completed', createdAt: { $gte: startOfMonth } } },
        { $group: { _id: null, total: { $sum: '$platformAmount' } } },
      ]).then(result => result[0]?.total || 0),
    ]);

    res.json({
      totalUsers,
      totalAffiliates,
      pendingAffiliates,
      totalServices,
      totalOrders,
      monthlyOrders,
      totalRevenue: Number(totalRevenue.toFixed(2)),
      monthlyRevenue: Number(monthlyRevenue.toFixed(2)),
    });
  } catch (err) {
    next(err);
  }
}

// Listar todos los usuarios con paginación
async function getAllUsers(req, res, next) {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const search = req.query.search || '';

    const filter = search ? {
      $or: [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ]
    } : {};

    const [users, total] = await Promise.all([
      User.find(filter)
        .select('-password -resetToken -resetTokenExp -resetCode -resetCodeExp')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      User.countDocuments(filter),
    ]);

    res.json({
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    next(err);
  }
}

// Listar todos los afiliados con información adicional
async function getAllAffiliates(req, res, next) {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const status = req.query.status; // pending, approved, rejected

    const filter = status ? { status } : {};

    const affiliates = await Affiliate.aggregate([
      { $match: filter },
      { $sort: { createdAt: -1 } },
      { $skip: skip },
      { $limit: limit },
      {
        $lookup: {
          from: 'users',
          localField: 'affiliateId',
          foreignField: '_id',
          as: 'user',
        },
      },
      { $unwind: '$user' },
      {
        $project: {
          id: { $toString: '$_id' },
          affiliateId: { $toString: '$affiliateId' },
          name: '$user.name',
          email: '$user.email',
          phone: '$user.phone',
          dni: 1,
          status: 1,
          bankAccount: 1,
          yapePhone: 1,
          documentsComplete: 1,
          verificationNotes: 1,
          createdAt: 1,
          reviewedAt: 1,
        },
      },
    ]);

    const total = await Affiliate.countDocuments(filter);

    res.json({
      affiliates,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    next(err);
  }
}

// Aprobar o rechazar afiliado
async function updateAffiliateStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { status, verificationNotes } = req.body;
    const adminId = req.user.userId;

    const affiliate = await Affiliate.findById(id);
    if (!affiliate) {
      return res.status(404).json({ error: 'Afiliado no encontrado' });
    }

    affiliate.status = status;
    affiliate.verificationNotes = verificationNotes || affiliate.verificationNotes;
    affiliate.reviewedBy = adminId;
    affiliate.reviewedAt = new Date();
    await affiliate.save();

    // Si se aprueba, actualizar el rol del usuario a affiliate
    if (status === 'approved') {
      await User.findByIdAndUpdate(affiliate.affiliateId, { role: 'affiliate' });
      // Notificar aprobación
      await notifyAffiliateApproved(affiliate.affiliateId.toString());
    } else if (status === 'rejected') {
      // Notificar rechazo
      await notifyAffiliateRejected(affiliate.affiliateId.toString(), verificationNotes);
    }

    res.json(affiliate);
  } catch (err) {
    next(err);
  }
}

// Listar todos los servicios
async function getAllServices(req, res, next) {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const status = req.query.status;

    const filter = status ? { status } : {};

    const services = await Service.aggregate([
      { $match: filter },
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
          from: 'categories',
          localField: 'categoryId',
          foreignField: '_id',
          as: 'category',
        },
      },
      { $unwind: { path: '$category', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          id: { $toString: '$_id' },
          title: 1,
          description: 1,
          price: 1,
          status: 1,
          images: 1,
          affiliateName: '$affiliate.name',
          categoryName: '$category.name',
          createdAt: 1,
        },
      },
    ]);

    const total = await Service.countDocuments(filter);

    res.json({
      services,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    next(err);
  }
}

// Listar todas las órdenes
async function getAllOrders(req, res, next) {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const status = req.query.status;

    const filter = status ? { status } : {};

    const orders = await Order.aggregate([
      { $match: filter },
      { $sort: { createdAt: -1 } },
      { $skip: skip },
      { $limit: limit },
      {
        $lookup: {
          from: 'users',
          localField: 'clientId',
          foreignField: '_id',
          as: 'client',
        },
      },
      { $unwind: { path: '$client', preserveNullAndEmptyArrays: true } },
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
          from: 'services',
          localField: 'serviceId',
          foreignField: '_id',
          as: 'service',
        },
      },
      { $unwind: { path: '$service', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          id: { $toString: '$_id' },
          clientName: '$client.name',
          affiliateName: '$affiliate.name',
          serviceTitle: '$service.title',
          amount: 1,
          commission: 1,
          status: 1,
          paymentStatus: 1,
          paymentMethod: 1,
          createdAt: 1,
        },
      },
    ]);

    const total = await Order.countDocuments(filter);

    res.json({
      orders,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    next(err);
  }
}

// Listar todas las transacciones
async function getAllTransactions(req, res, next) {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const transactions = await Transaction.aggregate([
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
          localField: 'order.affiliateId',
          foreignField: '_id',
          as: 'affiliate',
        },
      },
      { $unwind: { path: '$affiliate', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          orderId: { $toString: '$orderId' },
          affiliateId: {
            _id: { $toString: '$affiliate._id' },
            name: '$affiliate.name',
            email: '$affiliate.email',
          },
          amount: '$affiliateAmount',
          commission: '$platformAmount',
          status: {
            $cond: {
              if: { $eq: ['$status', 'completed'] },
              then: 'paid',
              else: 'pending'
            }
          },
          createdAt: 1,
        },
      },
    ]);

    const total = await Transaction.countDocuments();

    res.json({
      transactions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    next(err);
  }
}

// Obtener pagos pendientes por afiliado
async function getPendingPayments(req, res, next) {
  try {
    // Primero obtener los IDs de transacciones que ya fueron pagadas
    const AffiliatePayment = require('../models/AffiliatePayment');
    const paidTransactions = await AffiliatePayment.aggregate([
      { $match: { status: { $in: ['pending', 'completed'] } } },
      { $unwind: '$transactionIds' },
      { $group: { _id: null, ids: { $addToSet: '$transactionIds' } } },
    ]);

    const paidTransactionIds = paidTransactions.length > 0 ? paidTransactions[0].ids : [];

    // Agrupa transacciones completadas por afiliado que no han sido pagadas
    const pendingPayments = await Transaction.aggregate([
      { 
        $match: { 
          status: 'completed',
          _id: { $nin: paidTransactionIds }
        } 
      },
      {
        $lookup: {
          from: 'orders',
          localField: 'orderId',
          foreignField: '_id',
          as: 'order',
        },
      },
      { $unwind: '$order' },
      {
        $lookup: {
          from: 'users',
          localField: 'order.affiliateId',
          foreignField: '_id',
          as: 'affiliate',
        },
      },
      { $unwind: '$affiliate' },
      {
        $lookup: {
          from: 'affiliates',
          localField: 'order.affiliateId',
          foreignField: 'affiliateId',
          as: 'affiliateInfo',
        },
      },
      { $unwind: { path: '$affiliateInfo', preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: '$order.affiliateId',
          affiliateName: { $first: '$affiliate.name' },
          affiliateEmail: { $first: '$affiliate.email' },
          totalAmount: { $sum: '$affiliateAmount' },
          transactionCount: { $sum: 1 },
          transactionIds: { $push: '$_id' },
          bankAccount: { $first: '$affiliateInfo.bankAccount' },
          yapePhone: { $first: '$affiliateInfo.yapePhone' },
        },
      },
      { $sort: { totalAmount: -1 } },
    ]);

    res.json({ pendingPayments });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getDashboardStats,
  getAllUsers,
  getAllAffiliates,
  updateAffiliateStatus,
  getAllServices,
  getAllOrders,
  getAllTransactions,
  getPendingPayments,
};
