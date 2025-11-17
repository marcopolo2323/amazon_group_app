const { Schema, model, Types } = require('mongoose');

const affiliateSchema = new Schema(
  {
    affiliateId: { type: Types.ObjectId, ref: 'User', required: true, index: true, unique: true },
    
    // Información personal
    dni: { type: String, required: true },
    dniDocument: { type: String }, // URL de la foto del DNI
    
    // Documentos adicionales (certificados, licencias, etc.)
    additionalDocuments: [
      {
        url: { type: String },
        name: { type: String },
        type: { type: String }, // 'certificate', 'license', 'portfolio', 'other'
        uploadedAt: { type: Date, default: Date.now },
      }
    ],
    
    // Información de pago
    bankAccount: {
      bank: { type: String },
      number: { type: String },
      accountType: { type: String, enum: ['savings', 'checking'], default: 'savings' },
    },
    yapePhone: { type: String },
    plinPhone: { type: String },
    
    // Estado de la solicitud
    status: { 
      type: String, 
      enum: ['pending', 'approved', 'rejected', 'suspended'], 
      default: 'pending',
      index: true,
    },
    
    // Términos y condiciones
    termsAccepted: { type: Boolean, default: false, required: true },
    termsAcceptedAt: { type: Date },
    termsDocument: { type: String },
    
    // Proceso de verificación
    verificationNotes: { type: String }, // Comentarios del admin
    reviewedBy: { type: Types.ObjectId, ref: 'User' }, // Admin que revisó
    reviewedAt: { type: Date }, // Fecha de revisión
    documentsComplete: { type: Boolean, default: false }, // Si todos los documentos están subidos
    
    // Información adicional
    experience: { type: String }, // Años de experiencia
    specialties: [{ type: String }], // Especialidades
    description: { type: String }, // Descripción del afiliado
    
    // Estadísticas
    totalEarnings: { type: Number, default: 0 },
    totalServices: { type: Number, default: 0 },
    rating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = model('Affiliate', affiliateSchema);


