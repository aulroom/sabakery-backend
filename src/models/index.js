const { sequelize } = require('../config/database');
const User = require('./User');
const Food = require('./Food');
const CartItem = require('./CartItem');
const Order = require('./Order');
const OrderItem = require('./OrderItem');
const Review = require('./Review');

// ========== User Relations ==========
User.hasMany(CartItem, { foreignKey: 'user_id', as: 'cartItems' });
User.hasMany(Order, { foreignKey: 'user_id', as: 'orders' });
User.hasMany(Review, { foreignKey: 'user_id', as: 'reviews' });
User.belongsToMany(Food, { 
    through: 'Favorites', 
    foreignKey: 'user_id', 
    as: 'favorites' 
});

// ========== Food Relations ==========
Food.hasMany(CartItem, { foreignKey: 'food_id', as: 'cartItems' });
Food.hasMany(OrderItem, { foreignKey: 'food_id', as: 'orderItems' });
Food.hasMany(Review, { foreignKey: 'food_id', as: 'reviews' });
Food.belongsToMany(User, { 
    through: 'Favorites', 
    foreignKey: 'food_id', 
    as: 'favoritedBy' 
});

// ========== CartItem Relations ==========
CartItem.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
CartItem.belongsTo(Food, { foreignKey: 'food_id', as: 'food' });

// ========== Order Relations ==========
Order.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
Order.hasMany(OrderItem, { foreignKey: 'order_id', as: 'items' });

// ========== OrderItem Relations ==========
OrderItem.belongsTo(Order, { foreignKey: 'order_id', as: 'order' });
OrderItem.belongsTo(Food, { foreignKey: 'food_id', as: 'food' });

// ========== Review Relations ==========
Review.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
Review.belongsTo(Food, { foreignKey: 'food_id', as: 'food' });

module.exports = {
    sequelize,
    User,
    Food,
    CartItem,
    Order,
    OrderItem,
    Review
};