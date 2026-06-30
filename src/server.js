const app = require('./app');
const { connectDB, sequelize } = require('./config/database');

const PORT = process.env.PORT || 5000;

// Import rute
const userRoutes = require('./routes/userRoutes');
const orderRoutes = require('./routes/orderRoutes');
const foodRoutes = require('./routes/foodRoutes'); // Pastikan ini ada

// Daftarkan rute
app.use('/api/users', userRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/foods', foodRoutes);

const startServer = async () => {
    try {
        await connectDB();
        // HANYA UNTUK DEBUGGING: Jika tabel belum ada, uncomment baris bawah ini sekali saja
        // await sequelize.sync({ alter: true }); 
        
        app.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT}`);
        });
    } catch (error) {
        console.error('❌ Failed to start server:', error.message);
    }
};

startServer();