const { Schema, model, Types } = require("mongoose");

const orderSchema = new Schema(
  {
    clientId: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    serviceId: { type: Types.ObjectId, ref: "Service", required: true },
    affiliateId: { type: Types.ObjectId, ref: "User", required: true },
    amount: { type: Number, required: true, min: 0 },
    commission: { type: Number, required: true, min: 0 }, // 5%
    currency: { type: String, default: "USD" },
    paymentMethod: {
      type: String,
      enum: [
        "cash",
        "card",
        "transfer",
        "yape",
        "plin",
        "mercado_pago",
        "bank",
      ],
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "completed", "failed"],
      default: "pending",
    },
    transactionId: { type: String },

    // Order status
    status: {
      type: String,
      enum: ["pending", "confirmed", "in_progress", "completed", "cancelled"],
      default: "pending",
    },

    // Booking details
    scheduledDate: { type: Date },
    scheduledTime: { type: String },
    address: { type: String, required: true },
    notes: { type: String },

    // Contact information
    contactInfo: {
      name: { type: String, required: true },
      phone: { type: String, required: true },
      email: { type: String, required: true },
    },

    // Booking details
    bookingDetails: {
      date: { type: String },
      time: { type: String },
      quantity: { type: Number, default: 1 },
    },
  },
  { timestamps: true },
);

orderSchema.virtual("orderId").get(function id() {
  return this._id.toString();
});

orderSchema.set("toJSON", {
  virtuals: true,
  transform: (_, ret) => {
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

module.exports = model("Order", orderSchema);
