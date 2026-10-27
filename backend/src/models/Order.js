const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    items: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true
        },
        nameSnapshot: String,
        priceSnapshot: Number,
        qty: Number
      }
    ],

    total: Number,

    status: {
      type: String,
      enum: ["pending", "paid", "shipped"],
      default: "pending"
    }
  },
  { timestamps: true }
);

orderSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model("Order", orderSchema);

