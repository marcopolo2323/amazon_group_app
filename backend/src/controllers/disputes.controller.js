const {
  createDispute,
  listDisputes,
  getDispute,
  addDisputeMessage,
  resolveDispute,
  updateDisputeStatus,
} = require('../services/disputes.service');

// Crear disputa
async function create(req, res, next) {
  try {
    const userId = req.user.userId;
    const data = { ...req.body, reportedBy: userId };
    
    const dispute = await createDispute(data);
    res.status(201).json(dispute);
  } catch (err) {
    next(err);
  }
}

// Listar disputas
async function list(req, res, next) {
  try {
    const userId = req.user.userId;
    const role = req.user.role;
    
    const filters = {
      status: req.query.status,
      // Solo admin puede ver todas las disputas
      userId: role === 'admin' ? undefined : userId,
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 20,
    };
    
    const result = await listDisputes(filters);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

// Obtener disputa
async function getOne(req, res, next) {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    const role = req.user.role;
    
    // Admin puede ver todas, usuarios solo las suyas
    const dispute = await getDispute(id, role === 'admin' ? undefined : userId);
    res.json(dispute);
  } catch (err) {
    next(err);
  }
}

// Agregar mensaje
async function addMessage(req, res, next) {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    const { message } = req.body;
    
    const dispute = await addDisputeMessage(id, userId, message);
    res.json(dispute);
  } catch (err) {
    next(err);
  }
}

// Resolver disputa (solo admin)
async function resolve(req, res, next) {
  try {
    const { id } = req.params;
    const adminId = req.user.userId;
    const resolution = req.body;
    
    const dispute = await resolveDispute(id, resolution, adminId);
    res.json(dispute);
  } catch (err) {
    next(err);
  }
}

// Actualizar estado
async function updateStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const dispute = await updateDisputeStatus(id, status);
    res.json(dispute);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  create,
  list,
  getOne,
  addMessage,
  resolve,
  updateStatus,
};
