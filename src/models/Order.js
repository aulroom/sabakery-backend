const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Order = sequelize.define('Order', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    user_id: {
        type: DataTypes.UUID,
        allowNull: false
    },
    order_number: {
        type: DataTypes.STRING(20),
        allowNull: false,
        unique: true
    },
    status: {
        type: DataTypes.ENUM('pending', 'confirmed', 'preparing', 'delivering', 'delivered', 'cancelled'),
        defaultValue: 'pending'
    },
    subtotal: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    tax: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0
    },
    delivery_fee: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0
    },
    total: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    delivery_address: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    delivery_lat: {
        type: DataTypes.DECIMAL(10, 8)
    },
    delivery_lng: {
        type: DataTypes.DECIMAL(11, 8)
    },
    payment_method: {
        type: DataTypes.STRING(50)
    },
    payment_status: {
        type: DataTypes.ENUM('pending', 'paid', 'failed', 'refunded'),
        defaultValue: 'pending'
    },
    notes: {
        type: DataTypes.TEXT
    },
    delivered_at: {
        type: DataTypes.DATE
    }
}, {
    tableName: 'orders',
    timestamps: true,
    underscored: true
});

// Generate order number before create
Order.beforeCreate((order) => {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    order.order_number = `ORD-${year}${month}${day}-${random}`;
});

module.exports = Order;