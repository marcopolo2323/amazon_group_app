const {
  getPendingPaymentsByAffiliate,
  createAffiliatePayment,
  completeAffiliatePayment,
  listAffiliatePayments,
  getAffiliatePaymentHistory,
} = require('../services/affiliate-payments.service');
const { notifyPaymentReceived } = require('../services/notifications.service');

// Obtener pagos pendientes
async function getPendingPayments(req, res, next) {
  try {
    const pendingPayments = await getPendingPaymentsByAffiliate();
    res.json({ pendingPayments });
  } catch (err) {
    next(err);
  }
}

// Crear pago a afiliado
async function createPayment(req, res, next) {
  try {
    const adminId = req.user.userId;
    const data = { ...req.body, processedBy: adminId };
    
    const payment = await createAffiliatePayment(data);
    res.status(201).json(payment);
  } catch (err) {
    next(err);
  }
}

// Completar pago
async function completePayment(req, res, next) {
  try {
    const { id } = req.params;
    const payment = await completeAffiliatePayment(id, req.body);
    
    // Notificar al afiliado
    await notifyPaymentReceived(
      payment.affiliateId.toString(),
      payment.amount,
      payment._id.toString()
    );
    
    res.json(payment);
  } catch (err) {
    next(err);
  }
}

// Listar pagos
async function listPayments(req, res, next) {
  try {
    const filters = {
      affiliateId: req.query.affiliateId,
      status: req.query.status,
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 20,
    };
    
    const result = await listAffiliatePayments(filters);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

// Historial de pagos de un afiliado
async function getPaymentHistory(req, res, next) {
  try {
    const { affiliateId } = req.params;
    const payments = await getAffiliatePaymentHistory(affiliateId);
    res.json({ payments });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getPendingPayments,
  createPayment,
  completePayment,
  listPayments,
  getPaymentHistory,
};
