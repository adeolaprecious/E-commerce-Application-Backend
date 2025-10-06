const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "customer" },
  items: [
    {
      product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
      quantity: { type: Number, default: 1 }
    }
  ],
  total: { type: Number, required: true },
  status: { type: String, default: "pending", enum: ["pending", "paid", "shipped", "delivered", "cancelled"] }
}, { timestamps: true });

module.exports = mongoose.model("Order", orderSchema);
