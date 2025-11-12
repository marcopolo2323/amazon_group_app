const { z } = require('zod');

const createCategorySchema = z.object({
  body: z.object({
    name: z.string().min(1),
    icon: z.string().url().optional(),
    order: z.number().int().nonnegative().optional(),
  }),
});

module.exports = { createCategorySchema };


