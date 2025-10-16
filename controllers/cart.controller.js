const Cart = require("../models/cart.model");
const Product = require("../models/product.model");

const getAuthHeader = (req) => {
    if (!req.user || !req.user.id) {
        throw new Error("User ID is missing from request. Authentication failed.");
    }
    return req.user.id;
};

exports.getUserCart = async (req, res) => {
    try {
        const userId = getAuthHeader(req);
        const cart = await Cart.findOne({ user: userId }).populate("items.product");

        res.json(cart || { user: userId, items: [] });
    } catch (err) {
        console.error("Error fetching cart:", err.message);
        res.status(500).json({ message: "Server error while fetching cart." });
    }
};

exports.addToCart = async (req, res) => {
    try {
        const userId = getAuthHeader(req);
        const { productId, quantity } = req.body;
        
        if (!productId || typeof quantity !== 'number' || quantity < 1) {
            return res.status(400).json({ message: "Invalid product or quantity." });
        }

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: "Product not found." });
        }

        let cart = await Cart.findOne({ user: userId });
        if (!cart) {
            cart = new Cart({ user: userId, items: [] });
        }

        const itemIndex = cart.items.findIndex(i => i.product.toString() === productId);

        if (itemIndex > -1) {
            cart.items[itemIndex].quantity += quantity;
        } else {
            cart.items.push({ product: productId, quantity });
        }

        await cart.save();
        
        const updatedCart = await cart.populate('items.product');
        res.status(200).json(updatedCart);

    } catch (err) {
        console.error("Error adding to cart:", err.message);
        res.status(500).json({ message: "Server error adding product to cart." });
    }
};

exports.removeFromCart = async (req, res) => {
    try {
        const userId = getAuthHeader(req);
        const { productId } = req.params;

        let cart = await Cart.findOne({ user: userId });
        if (!cart) {
            return res.status(200).json({ user: userId, items: [] });
        }

        const initialLength = cart.items.length;
        cart.items = cart.items.filter(item => item.product.toString() !== productId);
        
        if (cart.items.length === initialLength) {
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