const { Schema, model, Types } = require('mongoose');

const affiliateSchema = new Schema(
  {
    affiliateId: { type: Types.ObjectId, ref: 'User', required: true, index: true },
    dni: { type: String, required: true },
    dniDocument: { type: String },
    additionalDocuments: [{ type: String }],
    bankAccount: {
      bank: { type: String },
      number: { type: String },
    },
    yapePhone: { type: String },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    termsAccepted: { type: Boolean, default: false },
    termsDocument: { type: String },
    // Campos para el proceso de verificación
    verificationNotes: { type: String }, // Comentarios del admin
    reviewedBy: { type: Types.ObjectId, ref: 'User' }, // Admin que revisó
    reviewedAt: { type: Date }, // Fecha de revisión
    documentsComplete: { type: Boolean, default: false }, // Si todos los documentos están subidos
  },
  { timestamps: true }
);

module.exports = model('Affiliate', affiliateSchema);


