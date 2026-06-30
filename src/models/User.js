const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const bcrypt = require('bcryptjs');

const User = sequelize.define('User', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    email: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
        validate: { isEmail: true }
    },
    username: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true
    },
    password_hash: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    full_name: {
        type: DataTypes.STRING(100)
    },
    phone: {
        type: DataTypes.STRING(20)
    },
    avatar_url: {
        type: DataTypes.STRING(500)
    },
    // =======================================================
    // 👇 JURUS BYPASS: GANTI ENUM JADI STRING BIASA 👇
    // =======================================================
    role: {
        type: DataTypes.STRING, 
        defaultValue: 'pembeli' 
    },
    is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    last_login: {
        type: DataTypes.DATE
    }
}, {
    tableName: 'users',
    timestamps: true,
    underscored: true
});

User.beforeCreate(async (user) => {
    if (user.password_hash) {
        const salt = await bcrypt.genSalt(10);
        user.password_hash = await bcrypt.hash(user.password_hash, salt);
    }
});

User.beforeUpdate(async (user) => {
    if (user.changed('password_hash')) {
        const salt = await bcrypt.genSalt(10);
        user.password_hash = await bcrypt.hash(user.password_hash, salt);
    }
});

User.prototype.comparePassword = async function(password) {
    return await bcrypt.compare(password, this.password_hash);
};

User.prototype.toPublicJSON = function() {
    return {
        id: this.id,
        email: this.email,
        username: this.username,
        full_name: this.full_name,
        phone: this.phone,
        avatar_url: this.avatar_url,
        role: this.role,
        created_at: this.created_at
    };
};

module.exports = User;