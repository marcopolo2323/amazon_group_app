const { Router } = require('express');
const { register, login, list, me, updateMe, googleLogin, forgotPassword, resetPassword } = require('../controllers/users.controller');
const validate = require('../middleware/validate');
const { registerSchema, loginSchema, updateMeSchema, googleLoginSchema, forgotPasswordSchema, resetPasswordSchema } = require('../schemas/users.schema');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = Router();

router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.post('/oauth/google', validate(googleLoginSchema), googleLogin);
router.post('/forgot-password', validate(forgotPasswordSchema), forgotPassword);
router.post('/reset-password', validate(resetPasswordSchema), resetPassword);
router.get('/', requireAuth, requireRole('affiliate', 'admin'), list);
router.get('/me', requireAuth, me);
router.patch('/me', requireAuth, validate(updateMeSchema), updateMe);

module.exports = router;


