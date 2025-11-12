const { createAffiliate, listAffiliates, affiliateStats } = require('../services/affiliates.service');

async function create(req, res, next) {
  try {
    const affiliate = await createAffiliate(req.body);
    res.status(201).json(affiliate);
  } catch (err) {
    next(err);
  }
}

async function list(req, res, next) {
  try {
    const items = await listAffiliates();
    res.json(items);
  } catch (err) {
    next(err);
  }
}

async function stats(req, res, next) {
  try {
    const { userId } = req.user || {};
    const data = await affiliateStats(userId);
    res.json(data);
  } catch (err) {
    next(err);
  }
}

module.exports = { create, list, stats };


