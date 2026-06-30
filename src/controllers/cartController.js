const { CartItem, Food } = require('../models');
const { cacheService } = require('../config/redis');

exports.getCart = async (req, res) => {
    try {
        const userId = req.userId;

        const cacheKey = `cart:${userId}`;
        const cached = await cacheService.get(cacheKey);

        if (cached) {
            return res.json({
                success: true,
                data: cached,
                fromCache: true
            });
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

        res.json({
            success: true,
            data: result
        });
    } catch (error) {
        console.error('Get cart error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get cart',
            error: error.message
        });
    }
};

exports.addToCart = async (req, res) => {
    try {
        const userId = req.userId;
        const { foodId, quantity = 1, specialInstructions = '' } = req.body;

        const food = await Food.findByPk(foodId);
        if (!food) {
            return res.status(404).json({
                success: false,
                message: 'Food not found'
            });
        }

        if (!food.is_available) {
            return res.status(400).json({
                success: false,
                message: 'Food is not available'
            });
        }

        let cartItem = await CartItem.findOne({
            where: { user_id: userId, food_id: foodId }
        });

        if (cartItem) {
            cartItem.quantity += quantity;
            if (specialInstructions) {
                cartItem.special_instructions = specialInstructions;
            }
            await cartItem.save();
        } else {
            cartItem = await CartItem.create({
                user_id: userId,
                food_id: foodId,
                quantity,
                special_instructions: specialInstructions
            });
        }

        await cacheService.del(`cart:${userId}`);

        res.json({
            success: true,
            data: cartItem,
            message: 'Item added to cart'
        });
    } catch (error) {
        console.error('Add to cart error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to add to cart',
            error: error.message
        });
    }
};

exports.updateCartItem = async (req, res) => {
    try {
        const userId = req.userId;
        const { itemId } = req.params;
        const { quantity, specialInstructions } = req.body;

        const cartItem = await CartItem.findOne({
            where: { id: itemId, user_id: userId }
        });

        if (!cartItem) {
            return res.status(404).json({
                success: false,
                message: 'Cart item not found'
            });
        }

        if (quantity !== undefined) {
            if (quantity < 1) {
                return res.status(400).json({
                    success: false,
                    message: 'Quantity must be at least 1'
                });
            }
            cartItem.quantity = quantity;
        }

        if (specialInstructions !== undefined) {
            cartItem.special_instructions = specialInstructions;
        }

        await cartItem.save();
        await cacheService.del(`cart:${userId}`);

        res.json({
            success: true,
            data: cartItem,
            message: 'Cart item updated'
        });
    } catch (error) {
        console.error('Update cart error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update cart',
            error: error.message
        });
    }
};

exports.removeFromCart = async (req, res) => {
    try {
        const userId = req.userId;
        const { itemId } = req.params;

        const cartItem = await CartItem.findOne({
            where: { id: itemId, user_id: userId }
        });

        if (!cartItem) {
            return res.status(404).json({
                success: false,
                message: 'Cart item not found'
            });
        }

        await cartItem.destroy();
        await cacheService.del(`cart:${userId}`);

        res.json({
            success: true,
            message: 'Item removed from cart'
        });
    } catch (error) {
        console.error('Remove from cart error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to remove item',
            error: error.message
        });
    }
};

exports.clearCart = async (req, res) => {
    try {
        const userId = req.userId;

        await CartItem.destroy({
            where: { user_id: userId }
        });

        await cacheService.del(`cart:${userId}`);

        res.json({
            success: true,
            message: 'Cart cleared'
        });
    } catch (error) {
        console.error('Clear cart error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to clear cart',
            error: error.message
        });
    }
};