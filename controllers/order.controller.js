const Order = require("../models/order.model");
const Cart = require("../models/cart.model");
const Product = require("../models/product.model");

// Helper to get user ID
const getUserId = (req) => {
    if (!req.user || !req.user.id) {
        throw new Error("User ID is missing from request. Authentication failed.");
    }
    return req.user.id;
};

// POST /api/orders - Place a new order from the cart
exports.placeOrder = async (req, res) => {
    try {
        const userId = getUserId(req);
        const cart = await Cart.findOne({ user: userId }).populate("items.product");

        if (!cart || cart.items.length === 0) {
            return res.status(400).json({ message: "Cart is empty. Cannot place order." });
        }

        let total = 0;
        const outOfStockItems = [];

        for (const item of cart.items) {
            const product = item.product;
            if (product.stock < item.quantity) {
                outOfStockItems.push({ name: product.name, available: product.stock });
            }
            total += product.price * item.quantity;
        }

        if (outOfStockItems.length > 0) {
            return res.status(400).json({
                message: "One or more items are out of stock or quantity exceeds available stock.",
                details: outOfStockItems
            });
        }

        const order = new Order({
            user: userId,
            items: cart.items,
            total: total,
            status: "pending"
        });

        await order.save();

        cart.items = [];
        await cart.save();

        res.status(201).json({ message: "Order placed successfully.", order });

    } catch (err) {
        console.error("Error placing order:", err.message);
        res.status(500).json({ message: "Server error while placing order." });
    }
};

exports.getUserOrders = async (req, res) => {
    try {
        const userId = getUserId(req);
        const orders = await Order.find({ user: userId })
            .populate("items.product")
            .sort({ createdAt: -1 }); 

        res.status(200).json(orders);
    } catch (err) {
        console.error("Error fetching orders:", err.message);
        res.status(500).json({ message: "Server error while fetching orders." });
    }
};