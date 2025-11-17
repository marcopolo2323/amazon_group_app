const { Schema, model, Types } = require('mongoose');

// Modelo para registrar pagos realizados a afiliados
const affiliatePaymentSchema = new Schema(
  {
    affiliateId: { type: Types.ObjectId, ref: 'User', required: true, index: true },
    amount: { type: Number, required: true, min: 0 },
    currency: { type: String, default: 'PEN' },
    
    // Transacciones incluidas en este pago
    transactionIds: [{ type: Types.ObjectId, ref: 'Transaction' }],
    
    // Método de pago utilizado
    paymentMethod: {
      type: String,
      enum: ['bank_transfer', 'yape', 'plin', 'cash', 'other'],
      required: true,
    },
    
    // Detalles del pago
    paymentDetails: {
      referenceNumber: { type: String }, // Número de operación
      accountNumber: { type: String }, // Cuenta destino
      bank: { type: String }, // Banco
      phone: { type: String }, // Teléfono (Yape/Plin)
    },
    
    // Comprobante
    receiptImage: { type: String }, // URL de la imagen del comprobante
    
    // Estado del pago
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'cancelled'],
      default: 'pending',
    },
    
    // Notas
    notes: { type: String },
    
    // Admin que procesó el pago
    processedBy: { type: Types.ObjectId, ref: 'User' },
    processedAt: { type: Date },
    
    // Fechas
    scheduledDate: { type: Date }, // Fecha programada para el pago
    completedDate: { type: Date }, // Fecha en que se completó
  },
  { timestamps: true }
);

affiliatePaymentSchema.virtual('paymentId').get(function id() {
  return this._id.toString();
});

affiliatePaymentSchema.set('toJSON', {
  virtuals: true,
  transform: (_, ret) => {
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

module.exports = model('AffiliatePayment', affiliatePaymentSchema);
