const Order = require('../models/Order');
const Transaction = require('../models/Transaction');
const User = require('../models/User');
const Affiliate = require('../models/Affiliate');
const Service = require('../models/Service');

// Obtener reportes mensuales
async function getMonthlyReports(req, res, next) {
  try {
    const year = parseInt(req.query.year) || new Date().getFullYear();
    
    const reports = [];
    
    // Generar reporte para cada mes del año
    for (let month = 1; month <= 12; month++) {
      const monthStr = month.toString().padStart(2, '0');
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0, 23, 59, 59);
      
      // Órdenes del mes
      const orders = await Order.find({
        createdAt: { $gte: startDate, $lte: endDate },
        paymentStatus: 'completed',
      });
      
      const totalOrders = orders.length;
      const totalRevenue = orders.reduce((sum, order) => sum + order.amount, 0);
      
      // Transacciones del mes
      const transactions = await Transaction.find({
        createdAt: { $gte: startDate, $lte: endDate },
        status: 'completed',
      });
      
      const platformRevenue = transactions.reduce((sum, t) => sum + t.platformAmount, 0);
      const affiliatePayments = transactions.reduce((sum, t) => sum + t.affiliateAmount, 0);
      
      // Nuevos usuarios del mes
      const newUsers = await User.countDocuments({
        createdAt: { $gte: startDate, $lte: endDate },
        role: 'client',
      });
      
      // Nuevos afiliados aprobados del mes
      const newAffiliates = await Affiliate.countDocuments({
        reviewedAt: { $gte: startDate, $lte: endDate },
        status: 'approved',
      });
      
      // Nuevos servicios del mes
      const newServices = await Service.countDocuments({
        createdAt: { $gte: startDate, $lte: endDate },
        status: 'active',
      });
      
      reports.push({
        month: monthStr,
        year,
        totalOrders,
        totalRevenue: Number(totalRevenue.toFixed(2)),
        platformRevenue: Number(platformRevenue.toFixed(2)),
        affiliatePayments: Number(affiliatePayments.toFixed(2)),
        newUsers,
        newAffiliates,
        newServices,
      });
    }
    
    // Filtrar solo meses con datos
    const reportsWithData = reports.filter(r => 
      r.totalOrders > 0 || r.newUsers > 0 || r.newAffiliates > 0 || r.newServices > 0
    );
    
    res.json({ reports: reportsWithData });
  } catch (err) {
    next(err);
  }
}

// Obtener reporte detallado de un mes específico
async function getMonthlyReportDetail(req, res, next) {
  try {
    const { year, month } = req.params;
    const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
    const endDate = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59);
    
    // Órdenes del mes con detalles
    const orders = await Order.find({
      createdAt: { $gte: startDate, $lte: endDate },
    })
      .populate('clientId', 'name email')
      .populate('affiliateId', 'name email')
      .populate('serviceId', 'title')
      .sort({ createdAt: -1 });
    
    // Transacciones del mes
    const transactions = await Transaction.find({
      createdAt: { $gte: startDate, $lte: endDate },
    })
      .populate({
        path: 'orderId',
        populate: [
          { path: 'clientId', select: 'name email' },
          { path: 'affiliateId', select: 'name email' },
          { path: 'serviceId', select: 'title' },
        ],
      })
      .sort({ createdAt: -1 });
    
    // Top afiliados del mes
    const topAffiliates = await Transaction.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
          status: 'completed',
        },
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
        $group: {
          _id: '$order.affiliateId',
          name: { $first: '$affiliate.name' },
          email: { $first: '$affiliate.email' },
          totalOrders: { $sum: 1 },
          totalEarnings: { $sum: '$affiliateAmount' },
        },
      },
      { $sort: { totalEarnings: -1 } },
      { $limit: 10 },
    ]);
    
    // Top servicios del mes
    const topServices = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
          paymentStatus: 'completed',
        },
      },
      {
        $lookup: {
          from: 'services',
          localField: 'serviceId',
          foreignField: '_id',
          as: 'service',
        },
      },
      { $unwind: '$service' },
      {
        $group: {
          _id: '$serviceId',
          title: { $first: '$service.title' },
          category: { $first: '$service.category' },
          totalOrders: { $sum: 1 },
          totalRevenue: { $sum: '$amount' },
        },
      },
      { $sort: { totalOrders: -1 } },
      { $limit: 10 },
    ]);
    
    // Estadísticas generales
    const stats = {
      totalOrders: orders.length,
      completedOrders: orders.filter(o => o.status === 'completed').length,
      totalRevenue: orders.reduce((sum, o) => sum + o.amount, 0),
      platformRevenue: transactions.reduce((sum, t) => sum + t.platformAmount, 0),
      averageOrderValue: orders.length > 0 
        ? orders.reduce((sum, o) => sum + o.amount, 0) / orders.length 
        : 0,
    };
    
    res.json({
      period: {
        year: parseInt(year),
        month: parseInt(month),
        startDate,
        endDate,
      },
      stats,
      orders,
      transactions,
      topAffiliates,
      topServices,
    });
  } catch (err) {
    next(err);
  }
}

// Obtener estadísticas de crecimiento
async function getGrowthStats(req, res, next) {
  try {
    const now = new Date();
    const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
    
    // Órdenes este mes vs mes pasado
    const [currentOrders, lastMonthOrders] = await Promise.all([
      Order.countDocuments({ 
        createdAt: { $gte: currentMonth },
        paymentStatus: 'completed',
      }),
      Order.countDocuments({ 
        createdAt: { $gte: lastMonth, $lte: lastMonthEnd },
        paymentStatus: 'completed',
      }),
    ]);
    
    // Usuarios este mes vs mes pasado
    const [currentUsers, lastMonthUsers] = await Promise.all([
      User.countDocuments({ 
        createdAt: { $gte: currentMonth },
        role: 'client',
      }),
      User.countDocuments({ 
        createdAt: { $gte: lastMonth, $lte: lastMonthEnd },
        role: 'client',
      }),
    ]);
    
    // Calcular porcentajes de crecimiento
    const ordersGrowth = lastMonthOrders > 0 
      ? ((currentOrders - lastMonthOrders) / lastMonthOrders) * 100 
      : 0;
    
    const usersGrowth = lastMonthUsers > 0 
      ? ((currentUsers - lastMonthUsers) / lastMonthUsers) * 100 
      : 0;
    
    res.json({
      currentMonth: {
        orders: currentOrders,
        users: currentUsers,
      },
      lastMonth: {
        orders: lastMonthOrders,
        users: lastMonthUsers,
      },
      growth: {
        orders: Number(ordersGrowth.toFixed(2)),
        users: Number(usersGrowth.toFixed(2)),
      },
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getMonthlyReports,
  getMonthlyReportDetail,
  getGrowthStats,
};
