const { Order, OrderItem, CartItem, Food } = require('../models');
const { cacheService } = require('../config/redis');
const { generateOrderNumber, calculateTotal } = require('../utils/helpers');

class OrderService {
    async createOrder(userId, orderData) {
        const { deliveryAddress, deliveryLat, deliveryLng, paymentMethod, notes } = orderData;

        // Get cart items
        const cartItems = await CartItem.findAll({
            where: { user_id: userId },
            include: [{
                model: Food,
                as: 'food',
                attributes: ['id', 'name', 'price']
            }]
        });

        if (!cartItems || cartItems.length === 0) {
            throw new Error('Cart is empty');
        }

        // Calculate totals
        let subtotal = 0;
        const items = cartItems.map(item => {
            const itemSubtotal = item.quantity * item.food.price;
            subtotal += itemSubtotal;
            return {
                food_id: item.food_id,
                food_name: item.food.name,
                quantity: item.quantity,
                price: item.food.price,
                subtotal: itemSubtotal,
                special_instructions: item.special_instructions
            };
        });

        const totals = calculateTotal(items);
        const orderNumber = generateOrderNumber();

        // Create order
        const order = await Order.create({
            user_id: userId,
            order_number: orderNumber,
            status: 'pending',
            subtotal: totals.subtotal,
            tax: totals.tax,
            delivery_fee: totals.deliveryFee,
            total: totals.total,
            delivery_address: deliveryAddress,
            delivery_lat: deliveryLat,
            delivery_lng: deliveryLng,
            payment_method: paymentMethod || 'cash',
            payment_status: 'pending',
            notes: notes || ''
        });

        // Create order items
        for (const item of items) {
            await OrderItem.create({
                order_id: order.id,
                food_id: item.food_id,
                food_name: item.food_name,
                quantity: item.quantity,
                price: item.price,
                subtotal: item.subtotal,
                special_instructions: item.special_instructions
            });
        }

        // Clear cart
        await CartItem.destroy({
            where: { user_id: userId }
        });

        // Clear cache
        await cacheService.del(`cart:${userId}`);
        await cacheService.del(`orders:${userId}`);

        return order;
    }

    async getOrders(userId, page = 1, limit = 10, status = null) {
        const offset = (page - 1) * limit;
        const where = { user_id: userId };
        if (status) where.status = status;

        const cacheKey = `orders:${userId}:${page}:${limit}:${status || 'all'}`;
        const cached = await cacheService.get(cacheKey);

        if (cached) {
            return cached;
        }

        const { count, rows } = await Order.findAndCountAll({
            where,
            include: [{
                model: OrderItem,
                as: 'items'
            }],
            order: [['created_at', 'DESC']],
            limit,
            offset
        });

        const result = {
            orders: rows,
            pagination: {
                page,
                limit,
                total: count,
                totalPages: Math.ceil(count / limit)
            }
        };

        await cacheService.set(cacheKey, result, 300);
        return result;
    }
}

module.exports = new OrderService();