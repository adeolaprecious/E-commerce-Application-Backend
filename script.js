const express = require('express');
const app = express();
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const userRoutes = require('./routes/userRoutes');
const { errorHandler } = require('./middleware/errorMiddleware');

dotenv.config();
connectDB();

const allowedOrigins = [
    'https://ecommerce-frontend-eight-blue.vercel.app'
];

app.use(cors({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
}));

app.use(express.json());

app.use('/users', userRoutes);
app.get('/', (req, res) => {
    res.send('API is running...');
});

const productRoutes = require('./routes/productRoutes');
app.use('/products', productRoutes);

const orderRoutes = require('./routes/orderRoutes');
app.use('/orders', orderRoutes);

const cartRoutes = require('./routes/cartRoutes');
app.use('/cart', cartRoutes);

const adminRoutes = require('./routes/adminRoutes');
app.use('/admin', adminRoutes);

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
