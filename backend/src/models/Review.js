const { Schema, model, Types } = require('mongoose');

const reviewSchema = new Schema(
  {
    serviceId: { type: Types.ObjectId, ref: 'Service', required: true, index: true },
    userId: { type: Types.ObjectId, ref: 'User', required: true, index: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String },
  },
  { timestamps: true }
);

reviewSchema.virtual('id').get(function () {
  return this._id.toString();
});

reviewSchema.set('toJSON', {
  virtuals: true,
  transform: (_, ret) => {
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

module.exports = model('Review', reviewSchema);