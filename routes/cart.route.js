const express = require("express");
const router = express.Router();
const Cart = require("../models/cart.model");
const authMiddleware = require("../middlewares/auth.middleware");

// Get user cart
router.get("/", authMiddleware, async (req, res) => {
  const cart = await Cart.findOne({ user: req.user.id }).populate("items.product");
  res.json(cart || { user: req.user.id, items: [] });
});

// Add product to cart
router.post("/", authMiddleware, async (req, res) => {
  const { productId, quantity } = req.body;
  let cart = await Cart.findOne({ user: req.user.id });

  if (!cart) {
    cart = new Cart({ user: req.user.id, items: [] });
  }

  const itemIndex = cart.items.findIndex(i => i.product.toString() === productId);

  if (itemIndex > -1) {
    cart.items[itemIndex].quantity += quantity;
  } else {
    cart.items.push({ product: productId, quantity });
  }

  await cart.save();
  res.json(cart);
});

// Remove product from cart
router.delete("/:productId", authMiddleware, async (req, res) => {
  let cart = await Cart.findOne({ user: req.user.id });
  if (!cart) return res.status(404).json({ message: "Cart not found" });

  cart.items = cart.items.filter(i => i.product.toString() !== req.params.productId);
  await cart.save();
  res.json(cart);
});

module.exports = router;
