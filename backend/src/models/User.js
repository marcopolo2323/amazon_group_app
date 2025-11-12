const { Schema, model } = require('mongoose');

const userSchema = new Schema(
  {
    role: { type: String, enum: ['client', 'affiliate', 'admin'], required: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, index: true },
    phone: { type: String },
    avatar: { type: String },
    bio: { type: String },
    password: { type: String }, // hash
    googleId: { type: String },
    resetCode: { type: String },
    resetCodeExp: { type: Date },
    // Token de restablecimiento vía enlace
    resetToken: { type: String },
    resetTokenExp: { type: Date },
  },
  { timestamps: true }
);

userSchema.virtual('userId').get(function id() {
  return this._id.toString();
});

userSchema.set('toJSON', {
  virtuals: true,
  transform: (_, ret) => {
    delete ret._id;
    delete ret.__v;
    delete ret.password;
    return ret;
  },
});

module.exports = model('User', userSchema);


