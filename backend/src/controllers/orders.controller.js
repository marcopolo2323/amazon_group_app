const { createOrder, listOrders, getOrder, getOrderInvoice } = require('../services/orders.service');

async function create(req, res, next) {
  try {
    const userId = req.user?.userId || req.user?.id; // viene de requireAuth
    const data = req.validated?.body || req.body;
    const payload = { ...data, clientId: userId };
    const order = await createOrder(payload);
    res.status(201).json(order);
  } catch (err) {
    next(err);
  }
}

async function list(req, res, next) {
  try {
    const userId = req.user?.userId || req.user?.id;
    const items = await listOrders(userId);
    res.json(items);
  } catch (err) {
    next(err);
  }
}

module.exports = { create, list };

async function getOne(req, res, next) {
  try {
    const userId = req.user?.userId || req.user?.id;
    const { id } = req.validated?.params || req.params;
    const order = await getOrder(id, userId);
    res.json(order);
  } catch (err) {
    next(err);
  }
}

async function invoice(req, res, next) {
  try {
    const userId = req.user?.userId || req.user?.id;
    const { id } = req.validated?.params || req.params;
    const data = await getOrderInvoice(id, userId);
    res.json(data);
  } catch (err) {
    next(err);
  }
}

module.exports.getOne = getOne;
module.exports.invoice = invoice;


