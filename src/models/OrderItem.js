const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const OrderItem = sequelize.define('OrderItem', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    order_id: {
        type: DataTypes.UUID,
        allowNull: false
    },
    food_id: {
        type: DataTypes.UUID,
        allowNull: false
    },
    food_name: {
        type: DataTypes.STRING(200),
        allowNull: false
    },
    quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: { min: 1 }
    },
    price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    subtotal: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    special_instructions: {
        type: DataTypes.TEXT
    }
}, {
    tableName: 'order_items',
    timestamps: true,
    underscored: true
});

module.exports = OrderItem;