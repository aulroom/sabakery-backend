const redis = require('redis');
require('dotenv').config();

const redisClient = redis.createClient({
    url: process.env.REDIS_URL || `redis://${process.env.REDIS_HOST || 'localhost'}:${process.env.REDIS_PORT || 6379}`,
    password: process.env.REDIS_PASSWORD || undefined,
    socket: {
        reconnectStrategy: false // Jangan retry kalau Redis tidak ada
    }
});

redisClient.on('connect', () => {
    console.log('✅ Redis connected successfully');
});

redisClient.on('error', (err) => {
    console.log('❌ Redis connection error:', err.message);
});

const connectRedis = async () => {
    try {
        await redisClient.connect();
    } catch (error) {
        console.error('⚠️  Redis tidak tersedia, server tetap berjalan tanpa cache:', error.message);
        // Tidak process.exit() - Redis opsional
    }
};

module.exports = { redisClient, connectRedis };