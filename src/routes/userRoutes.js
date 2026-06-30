const express = require('express');
const router = express.Router();

// Kita import objek utuhnya agar mesin tidak bingung!
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');

// Kita panggil fungsinya dengan nama lengkapnya
router.get('/profile', authMiddleware.verifyToken, userController.getProfile);
router.put('/profile', authMiddleware.verifyToken, userController.updateProfile);

module.exports = router;