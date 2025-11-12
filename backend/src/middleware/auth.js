const createError = require('http-errors');
const { verifyToken } = require('../utils/auth');

function requireAuth(req, _res, next) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) throw createError(401, 'Missing token');
    const payload = verifyToken(token);
    req.user = payload;
    next();
  } catch (err) {
    next(createError(401, 'Invalid token'));
  }
}

function requireRole(...roles) {
  return (req, _res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(createError(403, 'Forbidden'));
    }
    return next();
  };
}

module.exports = { requireAuth, requireRole };


