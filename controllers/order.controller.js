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

        // 1. Get the current cart, populated with product details
        const cart = await Cart.findOne({ user: userId }).populate("items.product");

        if (!cart || cart.items.length === 0) {
            return res.status(400).json({ message: "Cart is empty. Cannot place order." });
        }

        // 2. Calculate total and perform stock check (Critical step)
        let total = 0;
        const outOfStockItems = [];

        for (const item of cart.items) {
            const product = item.product;
            if (product.stock < item.quantity) {
                outOfStockItems.push({ name: product.name, available: product.stock });
            }
            // if (product.stock < item.quantity) {
            //     throw new Error(`Not enough stock for ${product.name}`);
            // }

            total += product.price * item.quantity;

        }

        if (outOfStockItems.length > 0) {
            return res.status(400).json({
                message: "One or more items are out of stock or quantity exceeds available stock.",
                details: outOfStockItems
            });
        }

        // 3. Create the Order
        const order = new Order({
            user: userId,
            items: cart.items, // Items are already populated from cart query
            total: total,
            status: "pending" // Status is set to pending payment
        });

        await order.save();

        // 4. Clear the Cart (and optionally decrement stock)
        cart.items = [];
        await cart.save();

        // 5. Decrement Stock (IMPORTANT E-commerce step)
        // You would typically loop through the order items and update Product.stock

        res.status(201).json({ message: "Order placed successfully.", order });

    } catch (err) {
        console.error("Error placing order:", err.message);
        res.status(500).json({ message: "Server error while placing order." });
    }
};

// GET /api/orders - Get user's order history
exports.getUserOrders = async (req, res) => {
    try {
        const userId = getUserId(req);
        // Find all orders for the user and populate product details
        const orders = await Order.find({ user: userId })
            .populate("items.product")
            .sort({ createdAt: -1 }); // Show newest first

        res.status(200).json(orders);
    } catch (err) {
        console.error("Error fetching orders:", err.message);
        res.status(500).json({ message: "Server error while fetching orders." });
    }
};