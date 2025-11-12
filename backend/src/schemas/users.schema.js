const { z } = require('zod');

const registerSchema = z.object({
  body: z.object({
    role: z.enum(['client', 'affiliate', 'admin']),
    name: z.string().min(1),
    email: z.string().email(),
    phone: z.string().optional(),
    password: z.string().min(6),
    googleId: z.string().optional(),
  }),
});

const loginSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(6),
  }),
});

const updateMeSchema = z.object({
  body: z.object({
    name: z.string().min(1).optional(),
    email: z.string().email().optional(),
    phone: z.string().optional(),
    bio: z.string().optional(),
    avatar: z.string().url().optional(),
  }),
});
const googleLoginSchema = z.object({
  body: z.object({
    idToken: z.string().min(10),
  }),
});

const forgotPasswordSchema = z.object({
  body: z.object({
    email: z.string().email(),
  }),
});

const resetPasswordSchema = z.object({
  body: z
    .object({
      email: z.string().email(),
      code: z.string().min(4).max(8).optional(),
      token: z.string().min(20).optional(),
      password: z.string().min(6),
    })
    .refine((data) => !!(data.code || data.token), {
      message: 'Debe proporcionar código o token',
      path: ['code'],
    }),
});

module.exports = { registerSchema, loginSchema, updateMeSchema, googleLoginSchema, forgotPasswordSchema, resetPasswordSchema };


