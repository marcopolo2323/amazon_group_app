const Category = require('../models/Category');
const Service = require('../models/Service');

async function createCategory(input) {
  return Category.create(input);
}

async function listCategories() {
  return Category.find().sort({ order: 1, name: 1 });
}

async function getCategoriesWithServiceCount() {
  try {
    const categories = await Category.find().sort({ order: 1, name: 1 }).lean();
    
    const categoriesWithCount = await Promise.all(
      categories.map(async (category) => {
        const serviceCount = await Service.countDocuments({ 
          category: category.name,
          status: 'active'
        });
        
        return {
          ...category,
          serviceCount
        };
      })
    );
    
    return categoriesWithCount;
  } catch (error) {
    console.error('Error getting categories with service count:', error);
    throw error;
  }
}

module.exports = { createCategory, listCategories, getCategoriesWithServiceCount };


