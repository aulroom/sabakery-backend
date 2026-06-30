const express = require('express');
const router = express.Router();
const { 
    createOrder, 
    getOrders, 
    getOrderById, 
    cancelOrder, 
    updateOrderStatus, 
    getOrderSummary 
} = require('../controllers/orderController');

// 👇 INI YANG KITA PERBAIKI: Mengambil fungsi verifyToken dengan benar
const { verifyToken } = require('../middleware/authMiddleware');

// Pasang verifyToken di setiap rute agar terbaca sebagai fungsi
router.post('/', verifyToken, createOrder);
router.get('/', verifyToken, getOrders);
router.get('/summary', verifyToken, getOrderSummary);
router.get('/:id', verifyToken, getOrderById);
router.put('/:id/cancel', verifyToken, cancelOrder);
router.put('/:id/status', verifyToken, updateOrderStatus);

module.exports = router;