const Service = require('../models/Service');
const createError = require('http-errors');

async function createService(input) {
  return Service.create(input);
}

async function listServices() {
  return Service.find().limit(100).sort({ createdAt: -1 });
}

async function updateService(id, update) {
  const allowed = [
    'category','title','description','price','images','locationText','subType','transaction','type','brand','peopleCount','contactEmail','contactPhone','contactWhatsApp','providerName','location','status','features','includesInfo','excludesInfo','cancellationPolicy','availability'
  ];
  const payload = {};
  for (const k of allowed) {
    if (update[k] !== undefined) payload[k] = update[k];
  }
  return Service.findByIdAndUpdate(id, payload, { new: true, runValidators: true });
}

async function deleteService(id, requester) {
  const service = await Service.findById(id);
  if (!service) throw createError(404, 'Servicio no encontrado');
  if (requester) {
    const isOwner = service.affiliateId?.toString() === requester.userId;
    const isAdmin = (requester.role || '').toLowerCase() === 'admin';
    if (!isOwner && !isAdmin) {
      throw createError(403, 'No autorizado para eliminar este servicio');
    }
  }
  await Service.deleteOne({ _id: id });
  return { ok: true };
}

module.exports = { createService, listServices, updateService, deleteService };


