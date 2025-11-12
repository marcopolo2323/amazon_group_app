const { z } = require('zod');

const createReviewSchema = z.object({
  body: z.object({
    serviceId: z.string().min(1),
    rating: z.number().int().min(1).max(5),
    comment: z.string().max(2000).optional(),
  }),
});

module.exports = { createReviewSchema };