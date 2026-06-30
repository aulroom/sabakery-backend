const { CartItem, Food } = require('../models');
const { cacheService } = require('../config/redis');

class CartService {
    async getCart(userId) {
        const cacheKey = `cart:${userId}`;
        const cached = await cacheService.get(cacheKey);

        if (cached) {
            return cached;
        }

        const cartItems = await CartItem.findAll({
            where: { user_id: userId },
            include: [{
                model: Food,
                as: 'food',
                attributes: ['id', 'name', 'price', 'image_url', 'restaurant']
            }]
        });

        let subtotal = 0;
        const items = cartItems.map(item => {
            const itemSubtotal = item.quantity * item.food.price;
            subtotal += itemSubtotal;
            return {
                id: item.id,
                food_id: item.food_id,
                food: item.food,
                quantity: item.quantity,
                special_instructions: item.special_instructions,
                subtotal: itemSubtotal
            };
        });

        const result = {
            items,
            subtotal,
            total_items: items.reduce((sum, item) => sum + item.quantity, 0)
        };

        await cacheService.set(cacheKey, result, 300);
        return result;
    }

    async addToCart(userId, foodId, quantity = 1, instructions = '') {
        const food = await Food.findByPk(foodId);
        if (!food) {
            throw new Error('Food not found');
        }

        if (!food.is_available) {
            throw new Error('Food is not available');
        }

        let cartItem = await CartItem.findOne({
            where: { user_id: userId, food_id: foodId }
        });

        if (cartItem) {
            cartItem.quantity += quantity;
            if (instructions) {
                cartItem.special_instructions = instructions;
            }
            await cartItem.save();
        } else {
            cartItem = await CartItem.create({
                user_id: userId,
                food_id: foodId,
                quantity,
                special_instructions: instructions
            });
        }

        await cacheService.del(`cart:${userId}`);
        return cartItem;
    }
}

module.exports = new CartService();