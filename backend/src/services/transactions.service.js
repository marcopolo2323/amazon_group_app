const Transaction = require('../models/Transaction');
const { Types } = require('mongoose');

async function createTransaction(input) {
  return Transaction.create(input);
}

async function listTransactions() {
  return Transaction.find().limit(100).sort({ createdAt: -1 });
}

// List transactions only for a given affiliate (by authenticated userId)
async function listTransactionsForAffiliate(affiliateId) {
  const affObjectId = Types.ObjectId.createFromHexString(String(affiliateId));

  // Join with orders to filter by affiliateId
  return Transaction.aggregate([
    { $lookup: { from: 'orders', localField: 'orderId', foreignField: '_id', as: 'order' } },
    { $unwind: '$order' },
    { $match: { 'order.affiliateId': affObjectId } },
    { $sort: { createdAt: -1 } },
    { $limit: 100 },
    {
      $project: {
        transactionId: { $toString: '$_id' },
        orderId: { $toString: '$order._id' },
        affiliateAmount: 1,
        platformAmount: 1,
        status: 1,
        createdAt: 1,
      },
    },
  ]);
}

module.exports = { createTransaction, listTransactions, listTransactionsForAffiliate };


