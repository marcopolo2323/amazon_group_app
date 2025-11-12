const { z } = require('zod');

// En modelo marketplace, el backend calcula commission y amount
// Permitimos campos extra en el body (Zod por defecto los ignora) pero no los requerimos.
const createOrderSchema = z.object({
  body: z
    .object({
      serviceId: z.string(),
      paymentMethod: z.enum(['yape', 'plin', 'mercado_pago', 'bank']),
      paymentStatus: z.enum(['pending', 'completed', 'failed']).optional(),
    })
    .passthrough(),
});

const getOrderSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'orderId es requerido'),
  }),
});

const invoiceOrderSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'orderId es requerido'),
  }),
});

module.exports = { createOrderSchema, getOrderSchema, invoiceOrderSchema };


