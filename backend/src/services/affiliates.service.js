const Affiliate = require('../models/Affiliate');
const Service = require('../models/Service');
const Order = require('../models/Order');
const Transaction = require('../models/Transaction');
const { aggregateAffiliateRating } = require('./reviews.service');
const { Types } = require('mongoose');

async function createAffiliate(input) {
  return Affiliate.create(input);
}

async function listAffiliates() {
  return Affiliate.find().limit(100).sort({ createdAt: -1 });
}

async function affiliateStats(affiliateId) {
  const affObjectId = Types.ObjectId.createFromHexString(affiliateId);

  const [totalServices, activeServices, totalOrders, pendingOrders] = await Promise.all([
    Service.countDocuments({ affiliateId: affObjectId }),
    Service.countDocuments({ affiliateId: affObjectId, status: 'active' }),
    Order.countDocuments({ affiliateId: affObjectId }),
    Order.countDocuments({ affiliateId: affObjectId, status: { $in: ['pending', 'in_progress'] } }),
  ]);

  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  // Total earnings and monthly earnings based on completed transactions joined with orders for this affiliate
  const [totalAgg, monthlyAgg, ratingData] = await Promise.all([
    Transaction.aggregate([
      { $lookup: { from: 'orders', localField: 'orderId', foreignField: '_id', as: 'order' } },
      { $unwind: '$order' },
      { $match: { 'order.affiliateId': affObjectId, status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$affiliateAmount' } } },
    ]).then(result => result[0]),
    Transaction.aggregate([
      { $match: { createdAt: { $gte: startOfMonth }, status: 'completed' } },
      { $lookup: { from: 'orders', localField: 'orderId', foreignField: '_id', as: 'order' } },
      { $unwind: '$order' },
      { $match: { 'order.affiliateId': affObjectId } },
      { $group: { _id: null, total: { $sum: '$affiliateAmount' } } },
    ]).then(result => result[0]),
    aggregateAffiliateRating(affiliateId),
  ]);

  return {
    totalServices,
    activeServices,
    totalOrders,
    pendingOrders,
    totalEarnings: Number(totalAgg?.total || 0),
    monthlyEarnings: Number(monthlyAgg?.total || 0),
    rating: ratingData.rating,
    totalReviews: ratingData.reviews,
  };
}

module.exports = { createAffiliate, listAffiliates, affiliateStats };


