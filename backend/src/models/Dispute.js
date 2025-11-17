const { Schema, model, Types } = require('mongoose');

const disputeSchema = new Schema(
  {
    orderId: { type: Types.ObjectId, ref: 'Order', required: true, index: true },
    reportedBy: { type: Types.ObjectId, ref: 'User', required: true },
    reportedAgainst: { type: Types.ObjectId, ref: 'User', required: true },
    
    type: {
      type: String,
      enum: [
        'service_not_delivered',
        'poor_quality',
        'payment_issue',
        'communication_issue',
        'fraud',
        'other',
      ],
      required: true,
    },
    
    title: { type: String, required: true },
    description: { type: String, required: true },
    
    // Evidencia
    evidence: [{ type: String }], // URLs de imágenes/documentos
    
    // Estado
    status: {
      type: String,
      enum: ['open', 'in_review', 'resolved', 'closed', 'escalated'],
      default: 'open',
    },
    
    // Resolución
    resolution: {
      decision: { type: String }, // Decisión tomada
      action: { type: String }, // Acción realizada (reembolso, advertencia, etc.)
      notes: { type: String },
      resolvedBy: { type: Types.ObjectId, ref: 'User' },
      resolvedAt: { type: Date },
    },
    
    // Mensajes/comentarios
    messages: [
      {
        userId: { type: Types.ObjectId, ref: 'User' },
        message: { type: String },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    
    // Prioridad
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium',
    },
  },
  { timestamps: true }
);

disputeSchema.virtual('disputeId').get(function id() {
  return this._id.toString();
});

disputeSchema.set('toJSON', {
  virtuals: true,
  transform: (_, ret) => {
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

module.exports = model('Dispute', disputeSchema);
