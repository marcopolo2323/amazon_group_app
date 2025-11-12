const { Schema, model } = require('mongoose');

const categorySchema = new Schema(
  {
    name: { type: String, required: true, unique: true },
    icon: { type: String },
    order: { type: Number, default: 0 },
  },
  { timestamps: false }
);

categorySchema.virtual('categoryId').get(function id() {
  return this._id.toString();
});

categorySchema.set('toJSON', {
  virtuals: true,
  transform: (_, ret) => {
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

module.exports = model('Category', categorySchema);


