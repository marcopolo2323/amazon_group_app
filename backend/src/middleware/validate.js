const createError = require('http-errors');

function validate(schema) {
  return (req, _res, next) => {
    try {
      const data = schema.parse({
        params: req.params,
        query: req.query,
        body: req.body,
      });
      req.validated = data;
      next();
    } catch (err) {
      if (err && (err.name === 'ZodError' || Array.isArray(err.errors) || Array.isArray(err.issues))) {
        const issues = err.issues || err.errors || [];
        const message = issues.map((i) => i.message).join(', ') || 'Datos inválidos';
        return next(createError(400, message));
      }
      next(err);
    }
  };
}

module.exports = validate;


