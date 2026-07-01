const express = require('express');
const router = express.Router();
const foodController = require('../controllers/foodController');
const upload = require('../middleware/upload'); // Pastikan path ini benar (1 folder naik ke middleware)

// --- Rute Get (Ambil data) ---
router.get('/', foodController.getAllFoods);
router.get('/search', foodController.searchFoods);
router.get('/:id', foodController.getFoodById);

// --- Rute Modifikasi (Admin) ---
// Middleware upload akan menangani file ke Cloudinary
router.post('/', upload.single('image'), foodController.createFood);
router.put('/:id', upload.single('image'), foodController.updateFood);
router.delete('/:id', foodController.deleteFood);

module.exports = router;