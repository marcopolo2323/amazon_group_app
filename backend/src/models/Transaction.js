const { Schema, model, Types } = require('mongoose');

const transactionSchema = new Schema(
  {
    orderId: { type: Types.ObjectId, ref: 'Order', required: true, index: true },
    affiliateAmount: { type: Number, required: true, min: 0 }, // 95%
    platformAmount: { type: Number, required: true, min: 0 }, // 5%
    paymentGatewayId: { type: String },
    status: { type: String, enum: ['pending', 'completed', 'refunded'], default: 'pending' },
  },
  { timestamps: true }
);

transactionSchema.virtual('transactionId').get(function id() {
  return this._id.toString();
});

transactionSchema.set('toJSON', {
  virtuals: true,
  transform: (_, ret) => {
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

module.exports = model('Transaction', transactionSchema);


