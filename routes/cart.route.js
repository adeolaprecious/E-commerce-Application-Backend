const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../middlewares/auth.middleware"); // ✅ FIXED
const cartController = require("../controllers/cart.controller");

router.get("/", authMiddleware, cartController.getUserCart);

router.post("/", authMiddleware, cartController.addToCart);

router.delete("/:productId", authMiddleware, cartController.removeFromCart);

module.exports = router;
