const express = require("express");
const router = express.Router();
const { initializePayment } = require("../controllers/payment.controller");

router.post("/initialize", initializePayment);

module.exports = router;
