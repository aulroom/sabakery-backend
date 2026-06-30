const { User } = require('../models');
const { generateToken } = require('../utils/jwt');
const bcrypt = require('bcryptjs');

class AuthService {
    async register(userData) {
        const { email, username, password, full_name, phone } = userData;
        
        const existingUser = await User.findOne({
            where: {
                [require('sequelize').Op.or]: [{ email }, { username }]
            }
        });

        if (existingUser) {
            throw new Error('Email or username already registered');
        }

        const user = await User.create({
            email,
            username,
            password_hash: password,
            full_name,
            phone
        });

        const token = generateToken({ id: user.id, role: user.role });
        
        return {
            user: user.toPublicJSON(),
            token
        };
    }

    async login(email, password) {
        const user = await User.findOne({ where: { email } });
        
        if (!user) {
            throw new Error('Invalid email or password');
        }

        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            throw new Error('Invalid email or password');
        }

        if (!user.is_active) {
            throw new Error('Account is deactivated');
        }

        await user.update({ last_login: new Date() });
        
        const token = generateToken({ id: user.id, role: user.role });

        return {
            user: user.toPublicJSON(),
            token
        };
    }
}

module.exports = new AuthService();