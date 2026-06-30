const rateLimit = require('express-rate-limit');

// General rate limiter (Batas dinaikkan drastis untuk testing)
const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 menit
    max: 10000, // <-- DARI 100 JADI 10.000 BIAR BEBAS NGAPAIN AJA
    message: {
        success: false,
        message: 'Too many requests, please try again later'
    },
    standardHeaders: true,
    legacyHeaders: false
});

// Auth rate limiter (stricter tapi dilonggarkan untuk testing)
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 menit
    max: 1000, // <-- DARI 5 JADI 1.000 BIAR BISA BEBAS LOGIN/LOGOUT
    message: {
        success: false,
        message: 'Too many login attempts, please try again later'
    },
    standardHeaders: true,
    legacyHeaders: false
});

module.exports = { generalLimiter, authLimiter };