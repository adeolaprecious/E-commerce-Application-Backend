const express = require("express");
const app = express();
const cors = require("cors")
const dotenv = require("dotenv");
const mongoose = require("mongoose");

// const ejs = require("ejs");

dotenv.config(); 
app.use(cors())

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/cart", require("./routes/cart.route"));
app.use("/api/orders", require("./routes/order.route"));

// EJS setup
// app.set("view engine", "ejs");
// app.set("views", __dirname + "/views");

// MongoDB connection
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

// Routes
const customerRouter = require("./routes/user.route");
app.use("/user", customerRouter);

const productRouter = require("./routes/product.route");
app.use("/api/products", productRouter);   // 👈 this is what frontend expects
  


// Default route
app.get("/", (req, res) => {
  res.send("API is running...");
});

// Start server
app.listen(port, () => {
  console.log(`Server has started on http://localhost:${port}`);
});





