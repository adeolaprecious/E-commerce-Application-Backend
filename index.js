const express = require("express");
const app = express();
const cors = require("cors")
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const path = require('path');

dotenv.config(); 

const allowedOrigins = [
    'http://localhost:5173',
    'https://e-commerce-application-frontend-git-master-adeola-s-projects.vercel.app'
];

app.use(cors({
  origin: allowedOrigins,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/cart", require("./routes/cart.route"));
app.use("/api/orders", require("./routes/order.route"));

const URI = process.env.URI;
const port = process.env.PORT || 4950;

mongoose
  .connect(URI)
  .then(() => {
    console.log("Mongoose connected successfully");
  })
  .catch((error) => {
    console.error("Mongoose connection error:", error);
  });

const customerRouter = require("./routes/user.route");
app.use("/user", customerRouter);

const productRouter = require("./routes/product.route");
app.use("/api/products", productRouter);
  
app.get("/", (req, res) => {
  res.send("Welcome to the E-commerce API");
});

app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(500).json({
    message: "Something went wrong on the server",
    error: err.message,
  });
});


app.listen(port, () => {
  console.log(`Server has started on http://localhost:${port}`);
});





