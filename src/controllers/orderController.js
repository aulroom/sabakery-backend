const { Order, OrderItem, CartItem, Food, User } = require('../models'); // 👈 INI YANG BENAR, ADA USER-NYA!
const { cacheService } = require('../config/redis');
const { generateOrderNumber, calculateTotal } = require('../utils/helpers');
const { Op } = require('sequelize');

// ==========================================
// 1. BUAT PESANAN (DENGAN PENGAMAN DATABASE)
// ==========================================
const createOrder = async (req, res) => {
    try {
        const userId = req.user?.id || req.userId;
        const { orderMethod, deliveryAddress, items, notes } = req.body;

        if (!items || items.length === 0) {
            return res.status(400).json({ success: false, message: 'Keranjang belanja kosong' });
        }

        const finalAddress = orderMethod === 'pickup' ? 'Ambil di Toko' : (deliveryAddress || 'Alamat tidak diisi');

        let subtotal = 0;
        const orderItemsData = items.map(item => {
            const itemPrice = parseFloat(item.price || 0);
            const quantity = item.quantity || 1;
            const itemSubtotal = itemPrice * quantity;
            subtotal += itemSubtotal;
            
            return {
                food_id: item.id || item.food_id,
                food_name: item.name || item.food_name,
                quantity: quantity,
                price: itemPrice,
                subtotal: itemSubtotal,
                special_instructions: item.notes || ''
            };
        });

        let orderNumber;
        try {
            if (typeof generateOrderNumber === 'function') {
                orderNumber = generateOrderNumber();
            } else {
                throw new Error('Gunakan manual');
            }
        } catch (e) {
            const date = new Date();
            const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
            orderNumber = `ORD-${date.getFullYear().toString().slice(-2)}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}-${random}`;
        }

        const order = await Order.create({
            user_id: userId,
            order_number: orderNumber,
            status: 'pending',
            subtotal: subtotal,
            tax: 0,                   
            delivery_fee: 0,          
            total: subtotal,
            delivery_address: finalAddress,
            delivery_lat: '0',        
            delivery_lng: '0',        
            payment_method: 'cash',
            payment_status: 'pending',
            notes: notes || ''
        });

        for (const item of orderItemsData) {
            await OrderItem.create({
                order_id: order.id,
                ...item
            });
        }

        try {
            if (cacheService && typeof cacheService.del === 'function') {
                await cacheService.del(`orders:${userId}`);
            }
        } catch (err) { console.log('Info: Cache Redis diabaikan.'); }

        const orderWithItems = await Order.findByPk(order.id, {
            include: [{ model: OrderItem, as: 'items' }]
        });

        res.status(201).json({
            success: true,
            data: orderWithItems,
            message: 'Pesanan berhasil dibuat!'
        });

    } catch (error) {
        console.error('Create order error:', error);
        res.status(500).json({ success: false, message: 'Gagal membuat pesanan', error: error.message });
    }
};

// ==========================================
// 2. GET SEMUA PESANAN (DENGAN NAMA PEMBELI)
// ==========================================
const getOrders = async (req, res) => {
    try {
        const userId = req.user?.id || req.userId;
        const userRole = req.user?.role || 'pembeli';
        
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50; 
        const offset = (page - 1) * limit;
        const status = req.query.status;

        const where = {};
        if (userRole === 'pembeli') where.user_id = userId;
        if (status) where.status = status;

        const { count, rows } = await Order.findAndCountAll({
            where,
            include: [{ model: OrderItem, as: 'items' }],
            order: [['created_at', 'ASC']], 
            limit,
            offset
        });

        // 👇 INI DIA KUNCI RAHASIA AGAR NAMA PEMBELI MUNCUL DI KASIR 👇
        let finalRows = rows;
        if (User) {
            const userIds = [...new Set(rows.map(r => r.user_id))]; 
            const users = await User.findAll({
                where: { id: userIds },
                attributes: ['id', 'username', 'full_name', 'phone'] 
            });
            
            finalRows = rows.map(row => {
                const rowData = row.toJSON();
                const buyer = users.find(u => u.id === row.user_id);
                rowData.buyer = buyer || { full_name: 'Pelanggan', username: 'Pelanggan', phone: '-' }; 
                return rowData;
            });
        }

        res.json({
            success: true,
            data: { orders: finalRows, pagination: { page, limit, total: count, totalPages: Math.ceil(count / limit) } }
        });
    } catch (error) {
        console.error('Get orders error:', error);
        res.status(500).json({ success: false, message: 'Gagal mengambil pesanan' });
    }
};

// ==========================================
// 3. GET PESANAN BY ID
// ==========================================
const getOrderById = async (req, res) => {
    try {
        const userId = req.user?.id || req.userId;
        const userRole = req.user?.role || 'pembeli';
        const { id } = req.params;

        const where = { id };
        if (userRole === 'pembeli') where.user_id = userId;

        const order = await Order.findOne({
            where,
            include: [{ model: OrderItem, as: 'items' }]
        });

        if (!order) return res.status(404).json({ success: false, message: 'Pesanan tidak ditemukan' });
        res.json({ success: true, data: order });
    } catch (error) {
        console.error('Get order error:', error);
        res.status(500).json({ success: false, message: 'Gagal mengambil pesanan' });
    }
};

// ==========================================
// 4. BATALKAN PESANAN
// ==========================================
const cancelOrder = async (req, res) => {
    try {
        const userId = req.user?.id || req.userId;
        const { id } = req.params;

        const order = await Order.findOne({ where: { id, user_id: userId } });
        if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

        const allowedStatuses = ['pending', 'confirmed'];
        if (!allowedStatuses.includes(order.status)) {
            return res.status(400).json({ success: false, message: `Cannot cancel order with status: ${order.status}` });
        }

        await order.update({ status: 'cancelled' });
        res.json({ success: true, data: order, message: 'Order cancelled successfully' });
    } catch (error) {
        console.error('Cancel order error:', error);
        res.status(500).json({ success: false, message: 'Failed to cancel order' });
    }
};

// ==========================================
// 5. UPDATE STATUS PESANAN (KASIR)
// ==========================================
const updateOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const validStatuses = ['pending', 'confirmed', 'preparing', 'delivering', 'delivered', 'cancelled'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ success: false, message: 'Invalid status' });
        }

        const order = await Order.findByPk(id);
        if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

        if (status === 'delivered') order.delivered_at = new Date();
        await order.update({ status });

        res.json({ success: true, data: order, message: 'Order status updated' });
    } catch (error) {
        console.error('Update order status error:', error);
        res.status(500).json({ success: false, message: 'Failed to update order status' });
    }
};

// ==========================================
// 6. RINGKASAN ADMIN
// ==========================================
const getOrderSummary = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        const where = {};
        if (startDate && endDate) {
            where.created_at = { [Op.between]: [new Date(startDate), new Date(endDate)] };
        }

        const summary = await Order.findAll({
            where,
            attributes: [
                [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'totalOrders'],
                [require('sequelize').fn('SUM', require('sequelize').col('total')), 'totalRevenue'],
                [require('sequelize').literal("COUNT(CASE WHEN status = 'delivered' THEN 1 END)"), 'completedOrders']
            ]
        });

        res.json({
            success: true,
            data: summary[0] || { totalOrders: 0, totalRevenue: 0, completedOrders: 0 }
        });
    } catch (error) {
        console.error('Get order summary error:', error);
        res.status(500).json({ success: false, message: 'Failed to get order summary' });
    }
};

module.exports = {
    createOrder,
    getOrders,
    getOrderById,
    cancelOrder,
    updateOrderStatus,
    getOrderSummary
};