const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Food = sequelize.define('Food', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING(200),
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT
    },
    category: {
        type: DataTypes.STRING(100)
    },
    price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: { min: 0 }
    },
    image_url: {
        type: DataTypes.STRING(500)
    },
    restaurant: {
        type: DataTypes.STRING(200)
    },
    restaurant_location: {
        type: DataTypes.STRING(300)
    },
    average_rating: {
        type: DataTypes.DECIMAL(3, 2),
        defaultValue: 0
    },
    preparation_time: {
        type: DataTypes.INTEGER,
        comment: 'Waktu persiapan dalam menit'
    },
    is_available: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    external_id: {
        type: DataTypes.STRING(100),
        comment: 'ID dari TheMealDB'
    },
    tags: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        defaultValue: []
    }
}, {
    tableName: 'foods',
    timestamps: true,
    underscored: true
});

module.exports = Food;