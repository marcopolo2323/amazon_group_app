const { z } = require('zod');

const createAffiliateSchema = z.object({
  body: z.object({
    affiliateId: z.string(),
    dni: z.string().min(6),
    dniDocument: z.string().url().optional(),
    additionalDocuments: z.array(z.string().url()).optional(),
    bankAccount: z
      .object({ bank: z.string(), number: z.string() })
      .partial()
      .optional(),
    yapePhone: z.string().optional(),
    status: z.enum(['pending', 'approved', 'rejected']).optional(),
    termsAccepted: z.boolean().optional(),
    termsDocument: z.string().url().optional(),
  }),
});

module.exports = { createAffiliateSchema };


