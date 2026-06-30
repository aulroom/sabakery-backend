const express = require('express');
const router = express.Router();
const { body, param } = require('express-validator');
const { validate } = require('../middleware/validation');
const { auth } = require('../middleware/auth');
const {
    getCart,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart
} = require('../controllers/cartController');

// ==========================================
// @route   /api/cart
// ==========================================

// Get cart
router.get('/', auth, getCart);

// Add to cart
router.post(
    '/',
    auth,
    [
        body('foodId').isUUID().withMessage('Valid food ID is required'),
        body('quantity').optional().isInt({ min: 1 }).withMessage('Quantity must be at least 1')
    ],
    validate,
    addToCart
);

// Update cart item
router.put(
    '/:itemId',
    auth,
    [
        param('itemId').isUUID().withMessage('Invalid item ID'),
        body('quantity').optional().isInt({ min: 1 }).withMessage('Quantity must be at least 1')
    ],
    validate,
    updateCartItem
);

// Remove from cart
router.delete(
    '/:itemId',
    auth,
    [
        param('itemId').isUUID().withMessage('Invalid item ID')
    ],
    validate,
    removeFromCart
);

// Clear cart
router.delete('/', auth, clearCart);

module.exports = router;