// const express = require("express");
// const router = express.Router();
// const { initializePayment } = require("../controllers/payment.controller");

// router.post("/initialize", initializePayment);

// module.exports = router;


const express = require("express");
const router = express.Router();
const { initializePayment, verifyPayment } = require("../controllers/payment.controller");
const { authMiddleware } = require("../middlewares/authMiddleware");

router.post("/initialize", authMiddleware, initializePayment);
router.get("/verify", authMiddleware, verifyPayment);

module.exports = router;
