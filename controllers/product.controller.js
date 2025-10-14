const Product = require("../models/product.model");

// GET /api/products - Get all products
exports.getAllProducts = async (req, res) => {
    try {
        const products = await Product.find();
        res.json(products);
    } catch (err) {
        console.error("Error fetching products:", err);
        res.status(500).json({ message: "Server error while fetching products" });
    }
};

// POST /api/products - Create a new product (Admin function)
exports.createProduct = async (req, res) => {
    try {
        const newProduct = new Product(req.body);
        const savedProduct = await newProduct.save();
        res.status(201).json(savedProduct);
    } catch (err) {
        console.error("Error creating product:", err);
        res.status(400).json({ message: err.message });
    }
};

// GET /api/products/:id - Get a single product
exports.getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }
        res.json(product);
    } catch (err) {
        console.error("Error fetching single product:", err);
        res.status(500).json({ message: err.message });
    }
};