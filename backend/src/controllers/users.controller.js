const createError = require('http-errors');
const { comparePassword, signToken, hashPassword } = require('../utils/auth');
const { createUser, listUsers, updateUser } = require('../services/users.service');
const User = require('../models/User');
const { verifyGoogleIdToken } = require('../utils/google');
const { sendEmail } = require('../utils/email');
const crypto = require('crypto');

function getFrontendUrl() {
  // Usa FRONTEND_URL si está configurado; en dev es recomendable apuntar al servidor web del frontend
  // por ejemplo: http://localhost:8082 (Expo web) o la URL de producción
  return process.env.FRONTEND_URL || `http://localhost:${process.env.PORT || 5000}`;
}

async function register(req, res, next) {
   try {
     const { role, name, email, phone, password, googleId } = req.body;
     const user = await createUser({ role, name, email, phone, password, googleId });
     res.status(201).json(user);
   } catch (err) {
     next(err);
   }
 }

 async function login(req, res, next) {
   try {
     const { email, password } = req.body;
     const user = await User.findOne({ email });
     if (!user) throw createError(401, 'Invalid credentials');
     const ok = await comparePassword(password, user.password);
     if (!ok) throw createError(401, 'Invalid credentials');
     const token = signToken({ userId: user.id, role: user.role });
     res.json({ token, user });
   } catch (err) {
     next(err);
   }
 }

 async function list(req, res, next) {
   try {
     const users = await listUsers();
     res.json(users);
   } catch (err) {
     next(err);
   }
 }

 // exports moved to bottom

 async function me(req, res, next) {
   try {
     const user = await User.findById(req.user.userId);
     if (!user) throw createError(404, 'User not found');
     res.json(user);
   } catch (err) {
     next(err);
   }
 }

 async function updateMe(req, res, next) {
   try {
     const user = await updateUser(req.user.userId, req.body);
     res.json(user);
   } catch (err) {
     next(err);
   }
 }

 // exports moved to bottom

 // Google OAuth (Sign-in / Sign-up implícito)
 async function googleLogin(req, res, next) {
   try {
     const { idToken } = req.body;
     
     if (!idToken) {
       throw createError(400, 'idToken is required');
     }

     // Verificar que las credenciales de Google estén configuradas
     if (!process.env.GOOGLE_CLIENT_ID && !process.env.GOOGLE_CLIENT_IDS) {
       throw createError(500, 'Google OAuth not configured on server');
     }

     const payload = await verifyGoogleIdToken(idToken);
     if (!payload || !payload.email) {
       throw createError(401, 'Invalid Google token');
     }

     const { email, name, picture, sub } = payload;
     let user = await User.findOne({ email });
     
     if (!user) {
       // Crear nuevo usuario
       user = await User.create({ 
         role: 'client', 
         name: name || email.split('@')[0], 
         email, 
         avatar: picture, 
         googleId: sub 
       });
     } else if (!user.googleId) {
       // Vincular cuenta existente con Google
       user.googleId = sub;
       if (!user.avatar && picture) user.avatar = picture;
       await user.save();
     }
     
     const token = signToken({ userId: user.id, role: user.role });
     res.json({ token, user });
   } catch (err) {
     console.error('Google login error:', err.message);
     next(err);
   }
 }

 // Forgot password -> envía enlace con token
async function forgotPassword(req, res, next) {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.json({ ok: true }); // no filtra si existe o no

    // Genera token seguro y expiración
    const token = crypto.randomBytes(32).toString('hex');
    const exp = new Date(Date.now() + 15 * 60 * 1000); // 15 minutos
    user.resetToken = token;
    user.resetTokenExp = exp;
    // Limpia flujo por código por compatibilidad
    user.resetCode = undefined;
    user.resetCodeExp = undefined;
    await user.save();

    // Enlace al frontend para restablecer
    const base = getFrontendUrl();
    const url = `${base.replace(/\/$/, '')}/reset-password?token=${token}&email=${encodeURIComponent(email)}`;

    const sent = await sendEmail({
      to: email,
      subject: 'Restablecer contraseña',
      text: `Haz clic en el siguiente enlace para restablecer tu contraseña (expira en 15 minutos): ${url}`,
      html: `<p>Haz clic en el siguiente enlace para restablecer tu contraseña. Este enlace expira en 15 minutos.</p><p><a href="${url}">Restablecer contraseña</a></p>`
    });
    res.json({ ok: true, delivered: sent });
  } catch (err) {
    next(err);
  }
}

 // Reset password usando token o código (compatibilidad)
async function resetPassword(req, res, next) {
  try {
    const { email, code, token, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) throw createError(400, 'Solicitud inválida');

    if (token) {
      if (!user.resetToken || !user.resetTokenExp) throw createError(400, 'Token inválido');
      if (user.resetToken !== token) throw createError(400, 'Token inválido');
      if (new Date() > user.resetTokenExp) throw createError(400, 'Token expirado');
    } else if (code) {
      if (!user.resetCode || !user.resetCodeExp) throw createError(400, 'Código inválido');
      if (user.resetCode !== code) throw createError(400, 'Código inválido');
      if (new Date() > user.resetCodeExp) throw createError(400, 'Código expirado');
    } else {
      throw createError(400, 'Falta token o código');
    }

    user.password = await hashPassword(password);
    user.resetCode = undefined;
    user.resetCodeExp = undefined;
    user.resetToken = undefined;
    user.resetTokenExp = undefined;
    await user.save();
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
}

 module.exports = { register, login, list, me, updateMe, googleLogin, forgotPassword, resetPassword };


