const { createCategory, listCategories, getCategoriesWithServiceCount } = require('../services/categories.service');

async function create(req, res, next) {
  try {
    const item = await createCategory(req.body);
    res.status(201).json(item);
  } catch (err) {
    next(err);
  }
}

async function list(req, res, next) {
  try {
    const items = await listCategories();
    res.json(items);
  } catch (err) {
    next(err);
  }
}

async function getWithServiceCount(req, res, next) {
  try {
    const items = await getCategoriesWithServiceCount();
    res.json(items);
  } catch (err) {
    next(err);
  }
}

module.exports = { create, list, getWithServiceCount };


