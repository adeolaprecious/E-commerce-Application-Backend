// 📁 src/routes/order.route.js (Updated)

const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/auth.middleware");
// Import the new controller
const orderController = require("../controllers/order.controller"); 

// Place order
router.post("/", authMiddleware, orderController.placeOrder);

// Get user orders
router.get("/", authMiddleware, orderController.getUserOrders);

module.exports = router;