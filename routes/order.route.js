const express = require("express");
const router = express.Router();
const Order = require("../models/order.model");
const Cart = require("../models/cart.model");
const authMiddleware = require("../middlewares/auth.middleware");

// Place order
router.post("/", authMiddleware, async (req, res) => {
  const cart = await Cart.findOne({ user: req.user.id }).populate("items.product");
  if (!cart || cart.items.length === 0) return res.status(400).json({ message: "Cart is empty" });

  const total = cart.items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  const order = new Order({
    user: req.user.id,
    items: cart.items,
    total
  });

  await order.save();
  cart.items = [];
  await cart.save();

  res.json(order);
});

// Get user orders
router.get("/", authMiddleware, async (req, res) => {
  const orders = await Order.find({ user: req.user.id }).populate("items.product");
  res.json(orders);
});

module.exports = router;
