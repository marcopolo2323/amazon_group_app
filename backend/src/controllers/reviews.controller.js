const { createReview, listServiceReviews } = require('../services/reviews.service');

async function create(req, res, next) {
  try {
    const review = await createReview(req.user, req.body);
    res.status(201).json(review);
  } catch (err) {
    next(err);
  }
}

async function listByService(req, res, next) {
  try {
    const { serviceId } = req.params;
    const items = await listServiceReviews(serviceId);
    res.json(items);
  } catch (err) {
    next(err);
  }
}

module.exports = { create, listByService };