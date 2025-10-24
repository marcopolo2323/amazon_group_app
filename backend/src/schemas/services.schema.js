const { z } = require('zod');

const createServiceSchema = z.object({
  body: z.object({
    affiliateId: z.string(),
    category: z.string().min(1),
    title: z.string().min(1),
    description: z.string().optional(),
    price: z.number().nonnegative(),
    images: z.array(z.string().url()).optional(),
    locationText: z.string().optional(),
    subType: z.string().optional(),
    transaction: z.string().optional(),
    type: z.string().optional(),
    brand: z.string().optional(),
    peopleCount: z.number().int().nonnegative().optional(),
    contactEmail: z.string().email().optional(),
    location: z
      .object({ lat: z.number(), lng: z.number() })
      .partial()
      .optional(),
    status: z.enum(['active', 'inactive', 'sold']).optional(),
  }),
});

const updateServiceSchema = z.object({
  params: z.object({ id: z.string().min(1) }),
  body: z
    .object({
      category: z.string().min(1).optional(),
      title: z.string().min(1).optional(),
      description: z.string().optional(),
      price: z.number().nonnegative().optional(),
      images: z.array(z.string().url()).optional(),
      locationText: z.string().optional(),
      subType: z.string().optional(),
      transaction: z.string().optional(),
      type: z.string().optional(),
      brand: z.string().optional(),
      peopleCount: z.number().int().nonnegative().optional(),
      contactEmail: z.string().email().optional(),
      location: z.object({ lat: z.number(), lng: z.number() }).partial().optional(),
      status: z.enum(['active', 'inactive', 'sold']).optional(),
    })
    .partial(),
});

module.exports = { createServiceSchema, updateServiceSchema };


