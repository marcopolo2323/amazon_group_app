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

// Endpoint de desarrollo para obtener el token de reset
if (process.env.NODE_ENV === 'development') {
  router.get('/dev/reset-token/:email', async (req, res) => {
    try {
      const { email } = req.params;
      const user = await require('../models/User').findOne({ email });
      if (!user || !user.resetToken) {
        return res.status(404).json({ error: 'No reset token found' });
      }
      res.json({ 
        email, 
        token: user.resetToken, 
        expires: user.resetTokenExp 
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
}
router.get('/', requireAuth, requireRole('affiliate', 'admin'), list);
router.get('/me', requireAuth, me);
router.patch('/me', requireAuth, validate(updateMeSchema), updateMe);

module.exports = router;


