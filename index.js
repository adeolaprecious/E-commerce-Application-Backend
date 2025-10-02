const express = require("express");
const app = express();
const ejs = require("ejs");
const dotenv = require("dotenv");
const mongoose = require("mongoose");

dotenv.config();
const cors = require("cors")
app.use(cors())

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// EJS setup
app.set("view engine", "ejs");
app.set("views", __dirname + "/views"); // 👈 Make sure you have a "views" folder in backend/

// MongoDB connection
const URI = process.env.URI;
const port = process.env.PORT || 4950;

mongoose
  .connect(URI)
  .then(() => {
    console.log("✅ Mongoose connected successfully");
  })
  .catch((error) => {
    console.error("❌ Mongoose connection error:", error);
  });

// Routes
const customerRouter = require("./routes/user.route");
app.use("/user", customerRouter);

// Default route
app.get("/", (req, res) => {
  res.send("🚀 Server is up and running. Go to /user/signup or /user/signin");
});

// Start server
app.listen(port, () => {
  console.log(`Server has started on http://localhost:${port}`);
});
