const { createService, listServices, updateService, deleteService } = require('../services/services.service');

async function create(req, res, next) {
  try {
    const service = await createService(req.body);
    res.status(201).json(service);
  } catch (err) {
    next(err);
  }
}

async function list(req, res, next) {
  try {
    const items = await listServices();
    res.json(items);
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const { id } = req.params;
    const service = await updateService(id, req.body);
    res.json(service);
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    const { id } = req.params;
    const result = await deleteService(id, req.user);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

module.exports = { create, list, update, remove };


