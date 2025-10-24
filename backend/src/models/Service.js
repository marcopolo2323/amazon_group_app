const { Schema, model, Types } = require("mongoose");

const serviceSchema = new Schema(
  {
    affiliateId: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    category: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String },
    price: { type: Number, required: true, min: 0 },
    currency: { type: String, default: "USD" },
    images: [{ type: String }],
    features: [{ type: String }],
    tags: [{ type: String }],

    // Location information
    location: {
      lat: { type: Number },
      lng: { type: Number },
      address: { type: String },
      city: { type: String },
    },

    // Availability schedule
    availability: {
      days: [
        {
          type: String,
          enum: [
            "monday",
            "tuesday",
            "wednesday",
            "thursday",
            "friday",
            "saturday",
            "sunday",
          ],
        },
      ],
      startTime: { type: String }, // formato HH:MM
      endTime: { type: String }, // formato HH:MM
    },

    // Legacy fields for backwards compatibility
    locationText: { type: String }, // dirección o referencia textual
    subType: { type: String }, // ej: 'normal' | 'campo' para casas
    transaction: { type: String }, // ej: 'alquiler' | 'venta'
    type: { type: String }, // ej: para Agua: 'buyon' | 'paquete'
    brand: { type: String }, // marca (agua u otros)
    peopleCount: { type: Number, min: 0 }, // paquetes turísticos
    contactEmail: { type: String },

    status: {
      type: String,
      enum: ["active", "inactive", "sold"],
      default: "active",
    },
  },
  { timestamps: true },
);

serviceSchema.virtual("serviceId").get(function id() {
  return this._id.toString();
});

serviceSchema.set("toJSON", {
  virtuals: true,
  transform: (_, ret) => {
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

module.exports = model("Service", serviceSchema);
