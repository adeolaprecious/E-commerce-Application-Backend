const express = require("express");
const router = express.Router();
const productController = require("../controllers/product.controller"); 

// Get all products
router.get("/", productController.getAllProducts);

// Add product
router.post("/", productController.createProduct);

// Get single product by ID
router.get("/:id", productController.getProductById);


module.exports = router;
