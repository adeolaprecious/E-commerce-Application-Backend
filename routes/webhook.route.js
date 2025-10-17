const express = require("express");
const router = express.Router();

router.post("/paystack", (req, res) => {
  const event = req.body;
  if (event.event === "charge.success") {
    console.log("Payment successful:", event.data);
    // update your order database here
  }
  res.sendStatus(200);
});

module.exports = router;
