const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },

    category: {
      type: String,
      required: true,
      enum: ["dombra", "guitar", "drums", "piano", "violin", "accessories"]
    },

    brand: { type: String, required: true, trim: true },

    price: { type: Number, required: true, min: 0 },

    stock: { type: Number, required: true, min: 0, default: 0 },

    description: { type: String, default: "" },

    tags: { type: [String], default: [] },

    ratingAvg: { type: Number, default: 0, min: 0, max: 5 },

    ratingCount: { type: Number, default: 0, min: 0 }
  },
  { timestamps: true }
);

productSchema.index({ category: 1, price: 1 });
productSchema.index({ brand: 1 });
productSchema.index({ name: "text", brand: "text", description: "text" });

module.exports = mongoose.model("Product", productSchema);

