const { createTransaction, listTransactions, listTransactionsForAffiliate } = require('../services/transactions.service');

async function create(req, res, next) {
  try {
    const tx = await createTransaction(req.body);
    res.status(201).json(tx);
  } catch (err) {
    next(err);
  }
}

async function list(req, res, next) {
  try {
    const { role, userId } = req.user || {};
    let items;
    if (role === 'admin') {
      items = await listTransactions();
    } else {
      items = await listTransactionsForAffiliate(userId);
    }
    res.json(items);
  } catch (err) {
    next(err);
  }
}

module.exports = { create, list };


