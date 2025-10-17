const axios = require("axios");

exports.initializePayment = async (req, res) => {
  try {
    const { email, amount } = req.body;

    const response = await axios.post(
      "https://api.paystack.co/transaction/initialize",
      { email, amount: amount * 100 }, // Paystack uses kobo
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json"
        },
      }
    );

    res.status(200).json(response.data);
  } catch (err) {
    console.error("Payment init error:", err.response ? err.response.data : err);
    res.status(500).json({ error: "Payment initialization failed" });
  }
};
