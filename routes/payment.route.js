const express = require("express");
const router = express.Router();
const { initializePayment, verifyPayment } = require("../controllers/payment.controller");
const { authMiddleware } = require("../middlewares/auth.middleware"); // ✅ fixed file path

router.post("/initialize", authMiddleware, initializePayment);
router.get("/verify", authMiddleware, verifyPayment);

module.exports = router;

