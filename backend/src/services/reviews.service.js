const Review = require('../models/Review');
const Service = require('../models/Service');
const createError = require('http-errors');
const { Types } = require('mongoose');

async function createReview(userContext, input) {
  const { serviceId, rating, comment } = input || {};
  if (!serviceId) throw createError(400, 'serviceId es requerido');
  // Validar ObjectId para evitar errores por IDs inválidos
  if (!Types.ObjectId.isValid(serviceId)) throw createError(400, 'serviceId inválido');
  if (!rating || rating < 1 || rating > 5) throw createError(400, 'rating debe estar entre 1 y 5');
  const service = await Service.findById(serviceId);
  if (!service) throw createError(404, 'Servicio no encontrado');

  const doc = await Review.create({
    serviceId: new Types.ObjectId(serviceId),
    userId: new Types.ObjectId(userContext.userId),
    rating,
    comment: (comment || '').trim(),
  });
  return doc;
}

async function listServiceReviews(serviceId) {
  // Si el ID no es válido, devolver lista vacía en lugar de lanzar error
  if (!Types.ObjectId.isValid(serviceId)) {
    return [];
  }
  return Review.find({ serviceId: new Types.ObjectId(serviceId) })
    .limit(200)
    .sort({ createdAt: -1 });
}

async function aggregateServiceRating(serviceId) {
  if (!Types.ObjectId.isValid(serviceId)) {
    return { rating: 0, reviews: 0 };
  }
  const [agg] = await Review.aggregate([
    { $match: { serviceId: new Types.ObjectId(serviceId) } },
    { $group: { _id: '$serviceId', rating: { $avg: '$rating' }, reviews: { $sum: 1 } } },
  ]);
  return { rating: Number(agg?.rating || 0), reviews: Number(agg?.reviews || 0) };
}

async function aggregateAffiliateRating(affiliateId) {
  if (!Types.ObjectId.isValid(affiliateId)) {
    return { rating: 0, reviews: 0 };
  }
  const services = await Service.find({ affiliateId: new Types.ObjectId(affiliateId) }).select('_id');
  const ids = services.map((s) => s._id);
  if (ids.length === 0) return { rating: 0, reviews: 0 };
  const [agg] = await Review.aggregate([
    { $match: { serviceId: { $in: ids } } },
    { $group: { _id: null, rating: { $avg: '$rating' }, reviews: { $sum: 1 } } },
  ]);
  return { rating: Number(agg?.rating || 0), reviews: Number(agg?.reviews || 0) };
}

module.exports = {
  createReview,
  listServiceReviews,
  aggregateServiceRating,
  aggregateAffiliateRating,
};