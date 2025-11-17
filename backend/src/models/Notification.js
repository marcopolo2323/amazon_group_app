const { Schema, model, Types } = require('mongoose');

const notificationSchema = new Schema(
  {
    userId: { type: Types.ObjectId, ref: 'User', required: true, index: true },
    
    type: {
      type: String,
      enum: [
        'order_new',
        'order_confirmed',
        'order_completed',
        'order_cancelled',
        'payment_received',
        'payment_pending',
        'affiliate_approved',
        'affiliate_rejected',
        'service_approved',
        'service_rejected',
        'review_new',
        'dispute_new',
        'dispute_resolved',
        'system',
      ],
      required: true,
    },
    
    title: { type: String, required: true },
    message: { type: String, required: true },
    
    // Datos adicionales según el tipo
    data: {
      orderId: { type: Types.ObjectId, ref: 'Order' },
      serviceId: { type: Types.ObjectId, ref: 'Service' },
      paymentId: { type: Types.ObjectId, ref: 'AffiliatePayment' },
      disputeId: { type: Types.ObjectId, ref: 'Dispute' },
      amount: { type: Number },
    },
    
    // Estado
    read: { type: Boolean, default: false },
    readAt: { type: Date },
    
    // Prioridad
    priority: {
      type: String,
      enum: ['low', 'normal', 'high', 'urgent'],
      default: 'normal',
    },
  },
  { timestamps: true }
);

notificationSchema.index({ userId: 1, read: 1, createdAt: -1 });

notificationSchema.virtual('notificationId').get(function id() {
  return this._id.toString();
});

notificationSchema.set('toJSON', {
  virtuals: true,
  transform: (_, ret) => {
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

module.exports = model('Notification', notificationSchema);
