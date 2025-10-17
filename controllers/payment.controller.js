const axios = require("axios");
const Order = require("../models/order.model");

exports.initializePayment = async (req, res) => {
  try {
    const { email, amount } = req.body;

    const response = await axios.post(
      "https://api.paystack.co/transaction/initialize",
      { email, amount: amount * 100 }, // kobo
      { headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` } }
    );

    res.json(response.data);
  } catch (error) {
    res.status(500).json({ message: "Paystack initialization failed", error: error.message });
  }
};

exports.verifyPayment = async (req, res) => {
  try {
    const { reference } = req.query;
    const response = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      { headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` } }
    );

    if (response.data.data.status === "success") {
      await Order.create({
        user: req.user.id,
        total: response.data.data.amount / 100,
        paymentReference: reference,
        status: "paid",
      });
    }

    res.json(response.data);
  } catch (error) {
    res.status(500).json({ message: "Payment verification failed", error: error.message });
  }
};
