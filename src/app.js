const express = require('express');
const path = require('path');
const cors = require('cors');
// const helmet = require('helmet'); // <-- SATPAM KITA ISTIRAHATKAN DULU
const compression = require('compression');
const morgan = require('morgan');
const { corsOptions } = require('./config/cors');
const { errorHandler } = require('./middleware/errorHandler');
const { generalLimiter } = require('./middleware/rateLimiater');
require('dotenv').config();

const app = express();

// app.use(helmet()); <-- DIMATIKAN AGAR GAMBAR BISA MUNCUL
app.use(compression());
app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(morgan('dev'));
app.use(generalLimiter);

const routes = require('./routes/index.js');

// Membuka gembok folder uploads agar gambar Multer bisa dibaca oleh Frontend React
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));
app.use('/api', routes);

// Health check
app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

app.use(errorHandler);

module.exports = app;