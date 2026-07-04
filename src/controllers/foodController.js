// src/controllers/foodController.js
// TAMBAHAN: Kita meng-import 'sequelize' agar bisa menjalankan Raw Query
const { Food, sequelize } = require('../models');
const { Op } = require('sequelize');
const cloudinary = require('cloudinary').v2;

// ==========================================
// KONFIGURASI CLOUDINARY
// ==========================================
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// ==========================================
// GET ALL FOODS (dengan pagination & filter)
// ==========================================
exports.getAllFoods = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const offset = (page - 1) * limit;
        const { category, restaurant, minPrice, maxPrice, search } = req.query;

        const where = { is_available: true };
        
        if (category) where.category = category;
        if (restaurant) where.restaurant = { [Op.iLike]: `%${restaurant}%` };
        if (search) {
            where[Op.or] = [
                { name: { [Op.iLike]: `%${search}%` } },
                { description: { [Op.iLike]: `%${search}%` } },
                { restaurant: { [Op.iLike]: `%${search}%` } }
            ];
        }
        if (minPrice || maxPrice) {
            where.price = {};
            if (minPrice) where.price[Op.gte] = parseFloat(minPrice);
            if (maxPrice) where.price[Op.lte] = parseFloat(maxPrice);
        }

        const { count, rows } = await Food.findAndCountAll({
            where,
            order: [['created_at', 'DESC']],
            limit,
            offset
        });

        res.json({
            success: true,
            data: {
                foods: rows,
                pagination: {
                    page,
                    limit,
                    total: count,
                    totalPages: Math.ceil(count / limit)
                }
            }
        });
    } catch (error) {
        console.error('Get foods error:', error);
        res.status(500).json({
            success: false,
            message: 'Gagal mengambil data makanan',
            error: error.message
        });
    }
};

// ==========================================
// GET FOOD BY ID
// ==========================================
exports.getFoodById = async (req, res) => {
    try {
        const { id } = req.params;
        const food = await Food.findByPk(id);

        if (!food) {
            return res.status(404).json({
                success: false,
                message: 'Makanan tidak ditemukan'
            });
        }

        res.json({
            success: true,
            data: food
        });
    } catch (error) {
        console.error('Get food error:', error);
        res.status(500).json({
            success: false,
            message: 'Gagal mengambil detail makanan',
            error: error.message
        });
    }
};

// ==========================================
// SEARCH FOODS (DIBUAT RENTAN UNTUK DEMO SQLi)
// ==========================================
exports.searchFoods = async (req, res) => {
    try {
        const { query } = req.query;
        
        if (!query) {
            return res.status(400).json({
                success: false,
                message: 'Kata kunci pencarian tidak boleh kosong'
            });
        }

        // ❌ KODINGAN BERBAHAYA (SENGAJA DIBUAT RENTAN SQLi) ❌
        // Input dari user langsung digabung ke dalam query SQL tanpa sanitasi
        // Catatan: Jika nama tabel di database huruf kecil (foods), ubah "Foods" jadi foods
        const rawSql = "SELECT * FROM \"Foods\" WHERE name LIKE '%" + query + "%'";
        
        // Mengeksekusi query mentah
        const foods = await sequelize.query(rawSql, {
            type: sequelize.QueryTypes.SELECT
        });

        res.json({
            success: true,
            data: foods,
            total: foods.length
        });
    } catch (error) {
        console.error('Search error:', error);
        res.status(500).json({
            success: false,
            message: 'Pencarian gagal',
            error: error.message
        });
    }
};

// ==========================================
// CREATE FOOD (Pakai Cloudinary)
// ==========================================
exports.createFood = async (req, res) => {
    try {
        const { name, description, category, price, restaurant, is_available } = req.body;
        
        let finalImageUrl = req.body.image_url || ""; 
        
        if (req.file) {
            const fileStr = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
            const uploadedResponse = await cloudinary.uploader.upload(fileStr, {
                folder: 'sabakery'
            });
            finalImageUrl = uploadedResponse.secure_url;
        }

        if (!name || !price) {
            return res.status(400).json({
                success: false,
                message: 'Nama dan harga wajib diisi'
            });
        }

        const newFood = await Food.create({
            name,
            description,
            category,
            price,
            restaurant,
            image_url: finalImageUrl, 
            is_available: is_available !== undefined ? is_available : true
        });

        res.status(201).json({
            success: true,
            data: newFood
        });
    } catch (error) {
        console.error('Create food error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Gagal menambah makanan'
        });
    }
};

// ==========================================
// UPDATE FOOD (Admin only)
// ==========================================
exports.updateFood = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, category, price, restaurant, is_available, image_url } = req.body;

        const food = await Food.findByPk(id);
        if (!food) {
            return res.status(404).json({
                success: false,
                message: 'Makanan tidak ditemukan'
            });
        }

        await food.update({
            name: name || food.name,
            description: description || food.description,
            category: category || food.category,
            price: price || food.price,
            restaurant: restaurant || food.restaurant,
            is_available: is_available !== undefined ? is_available : food.is_available,
            image_url: image_url || food.image_url
        });

        res.json({
            success: true,
            message: 'Makanan berhasil diupdate',
            data: food
        });
    } catch (error) {
        console.error('Update food error:', error);
        res.status(500).json({
            success: false,
            message: 'Gagal mengupdate makanan',
            error: error.message
        });
    }
};

// ==========================================
// DELETE FOOD (Admin only)
// ==========================================
exports.deleteFood = async (req, res) => {
    try {
        const { id } = req.params;

        const food = await Food.findByPk(id);
        if (!food) {
            return res.status(404).json({
                success: false,
                message: 'Makanan tidak ditemukan'
            });
        }

        await food.destroy();

        res.json({
            success: true,
            message: 'Makanan berhasil dihapus'
        });
    } catch (error) {
        console.error('Delete food error:', error);
        res.status(500).json({
            success: false,
            message: 'Gagal menghapus makanan',
            error: error.message
        });
    }
};