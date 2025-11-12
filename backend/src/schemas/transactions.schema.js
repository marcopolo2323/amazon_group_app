const { z } = require('zod');

const createTransactionSchema = z.object({
  body: z.object({
    orderId: z.string(),
    affiliateAmount: z.number().nonnegative(),
    platformAmount: z.number().nonnegative(),
    paymentGatewayId: z.string().optional(),
    status: z.enum(['pending', 'completed', 'refunded']).optional(),
  }),
});

module.exports = { createTransactionSchema };


