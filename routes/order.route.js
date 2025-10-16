const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/auth.middleware");

const orderController = require("../controllers/order.controller"); 

router.post("/", authMiddleware, orderController.placeOrder);

router.get("/", authMiddleware, orderController.getUserOrders);

module.exports = router;