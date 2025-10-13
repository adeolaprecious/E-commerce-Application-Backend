const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/auth.middleware");
// Import the new controller
const cartController = require("../controllers/cart.controller"); 

// Get user cart
router.get("/", authMiddleware, cartController.getUserCart);

// Add product to cart
router.post("/", authMiddleware, cartController.addToCart);

// Remove product from cart (Note: You may want a PUT/PATCH for quantity updates later)
router.delete("/:productId", authMiddleware, cartController.removeFromCart);

module.exports = router;