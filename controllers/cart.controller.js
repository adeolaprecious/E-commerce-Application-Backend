const Cart = require("../models/cart.model");
const Product = require("../models/product.model"); // Need product model for price/stock checks

// Helper to get authorization header setup
const getAuthHeader = (req) => {
    // The authMiddleware should attach user info to req.user
    if (!req.user || !req.user.id) {
        throw new Error("User ID is missing from request. Authentication failed.");
    }
    return req.user.id;
};

// GET /api/cart
exports.getUserCart = async (req, res) => {
    try {
        const userId = getAuthHeader(req);
        // Find cart and populate the 'product' field to get details (name, price, etc.)
        const cart = await Cart.findOne({ user: userId }).populate("items.product");
        
        // Return existing cart or an empty one
        res.json(cart || { user: userId, items: [] });
    } catch (err) {
        console.error("Error fetching cart:", err.message);
        res.status(500).json({ message: "Server error while fetching cart." });
    }
};

// POST /api/cart - Add or update product in cart
exports.addToCart = async (req, res) => {
    try {
        const userId = getAuthHeader(req);
        const { productId, quantity } = req.body;
        
        // Input validation
        if (!productId || typeof quantity !== 'number' || quantity < 1) {
            return res.status(400).json({ message: "Invalid product or quantity." });
        }

        // 1. Check if product exists and is in stock
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: "Product not found." });
        }
        
        // 2. Find or create the user's cart
        let cart = await Cart.findOne({ user: userId });
        if (!cart) {
            cart = new Cart({ user: userId, items: [] });
        }

        // 3. Check if item already exists in cart
        const itemIndex = cart.items.findIndex(i => i.product.toString() === productId);

        if (itemIndex > -1) {
            // Item exists: Update quantity
            cart.items[itemIndex].quantity += quantity;
            // You might want to add a check here against product.stock
        } else {
            // Item does not exist: Add new item
            cart.items.push({ product: productId, quantity });
        }

        await cart.save();
        
        // Re-populate the cart before sending back to include product details
        const updatedCart = await cart.populate('items.product');
        res.status(200).json(updatedCart);

    } catch (err) {
        console.error("❌ Error adding to cart:", err.message);
        res.status(500).json({ message: "Server error adding product to cart." });
    }
};

// DELETE /api/cart/:productId - Remove a product from cart
exports.removeFromCart = async (req, res) => {
    try {
        const userId = getAuthHeader(req);
        const { productId } = req.params;

        let cart = await Cart.findOne({ user: userId });
        if (!cart) {
             // If cart doesn't exist, we treat it as successfully removed
             return res.status(200).json({ user: userId, items: [] });
        }

        // Filter out the product to be removed
        const initialLength = cart.items.length;
        cart.items = cart.items.filter(item => item.product.toString() !== productId);
        
        if (cart.items.length === initialLength) {
            // Product ID not found in cart
            return res.status(404).json({ message: "Product not in cart." });
        }
        
        await cart.save();
        
        const updatedCart = await cart.populate('items.product');
        res.status(200).json(updatedCart);

    } catch (err) {
        console.error("Error removing from cart:", err.message);
        res.status(500).json({ message: "Server error removing product from cart." });
    }
};