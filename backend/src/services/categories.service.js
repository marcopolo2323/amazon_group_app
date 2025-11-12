const Category = require('../models/Category');

async function createCategory(input) {
  return Category.create(input);
}

async function listCategories() {
  return Category.find().sort({ order: 1, name: 1 });
}

module.exports = { createCategory, listCategories };


