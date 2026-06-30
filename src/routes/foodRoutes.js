// src/routes/foodRoutes.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');

// --- PENGATURAN MULTER (Kurir Gambar) ---
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // Menyimpan file di folder public/uploads di backend
        cb(null, path.join(__dirname, '../../public/uploads/')); 
    },
    filename: function (req, file, cb) {
        // Memberi nama unik agar foto tidak tertimpa
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ storage: storage });
// ----------------------------------------

const {
    getAllFoods,
    getFoodById,
    searchFoods,
    createFood,
    updateFood,
    deleteFood // <-- Ini yang kemarin hilang!
} = require('../controllers/foodController');

// Rute Get (Ambil data)
router.get('/', getAllFoods);
router.get('/search', searchFoods);
router.get('/:id', getFoodById);

// Rute Modifikasi (Admin)
// upload.single('image') artinya kita siap menerima 1 file dengan nama field 'image'
router.post('/', upload.single('image'), createFood); 
router.put('/:id', upload.single('image'), updateFood);
router.delete('/:id', deleteFood); // <-- Tombol remotenya sudah aktif

module.exports = router;