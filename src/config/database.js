// src/config/database.js
const { Sequelize } = require('sequelize');
require('dotenv').config();

let sequelize;

// JURUS ULTIMATE: Kalau di Render (Cloud), kita pakai 1 Link Full (DATABASE_URL)
if (process.env.DATABASE_URL) {
    sequelize = new Sequelize(process.env.DATABASE_URL, {
        dialect: 'postgres',
        logging: console.log,
        dialectOptions: {
            ssl: {
                require: true,
                rejectUnauthorized: false
            }
        },
        pool: {
            max: 10,
            min: 0,
            acquire: 30000,
            idle: 10000
        }
    });
} else {
    // Kalau di laptop (lokal), tetap pakai yang lama
    sequelize = new Sequelize(
        process.env.DB_NAME,
        process.env.DB_USER,
        process.env.DB_PASSWORD,
        {
            host: process.env.DB_HOST || 'localhost',
            port: process.env.DB_PORT || 5432,
            dialect: 'postgres',
            logging: console.log,
            pool: {
                max: 10,
                min: 0,
                acquire: 30000,
                idle: 10000
            }
        }
    );
}

const connectDB = async () => {
    try {
        await sequelize.authenticate();
        console.log('✅ PostgreSQL connected successfully');
        
        // Sync database - create tables if not exist
        await sequelize.sync({ force: false });
        console.log('✅ Database synchronized');
    } catch (error) {
        console.error('❌ Database connection error:', error.message);
        process.exit(1);
    }
};

module.exports = { sequelize, connectDB };