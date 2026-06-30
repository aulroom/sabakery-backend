const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');
const foodRoutes = require('./foodRoutes');
const cartRoutes = require('./cartRoutes');
const orderRoutes = require('./orderRoutes');

router.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

router.use('/auth', authRoutes);
router.use('/foods', foodRoutes);
router.use('/cart', cartRoutes);
router.use('/orders', orderRoutes);

module.exports = router;