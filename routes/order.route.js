const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../middlewares/auth.middleware");
const orderController = require("../controllers/order.controller");

// 🛒 Place a new order
router.post("/", authMiddleware, orderController.placeOrder);

// 📦 Get all orders for the logged-in user
router.get("/", authMiddleware, orderController.getUserOrders);

module.exports = router;
