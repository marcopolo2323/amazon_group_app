const { createService, listServices, updateService, deleteService, findNearbyServices } = require('../services/services.service');

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

async function nearby(req, res, next) {
  try {
    console.log('=== NEARBY SERVICES REQUEST ===');
    console.log('Query params:', req.query);
    console.log('User:', req.user);

    const { latitude, longitude, radius = 10, category } = req.query;

    if (!latitude || !longitude) {
      return res.status(400).json({ 
        error: 'Latitud y longitud son requeridas' 
      });
    }

    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);
    const radiusKm = parseFloat(radius);

    if (isNaN(lat) || isNaN(lng) || isNaN(radiusKm)) {
      return res.status(400).json({ 
        error: 'Coordenadas y radio deben ser números válidos' 
      });
    }

    console.log('Parsed params:', { lat, lng, radiusKm, category });

    const services = await findNearbyServices(lat, lng, radiusKm, category);
    
    console.log(`Found ${services.length} nearby services`);
    res.json(services);
  } catch (err) {
    console.error('Error in nearby controller:', err);
    next(err);
  }
}

module.exports = { create, list, update, remove, nearby };


