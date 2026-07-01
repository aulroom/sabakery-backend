// src/controllers/foodController.js
const Food = require('../../models');
const { Op } = require('sequelize');

// ==========================================
// GET ALL FOODS (dengan pagination & filter)
// ==========================================
exports.getAllFoods = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const offset = (page - 1) * limit;
        const { category, restaurant, minPrice, maxPrice, search } = req.query;

        // Build where clause
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

        // Query database
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
// SEARCH FOODS
// ==========================================
exports.searchFoods = async (req, res) => {
    try {
        const { query } = req.query;
        
        if (!query || query.length < 2) {
            return res.status(400).json({
                success: false,
                message: 'Kata kunci minimal 2 karakter'
            });
        }

        const foods = await Food.findAll({
            where: {
                [Op.or]: [
                    { name: { [Op.iLike]: `%${query}%` } },
                    { description: { [Op.iLike]: `%${query}%` } },
                    { category: { [Op.iLike]: `%${query}%` } },
                    { restaurant: { [Op.iLike]: `%${query}%` } }
                ],
                is_available: true
            },
            limit: 50
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
// CREATE FOOD (Dengan Upload File Komputer)
// ==========================================
exports.createFood = async (req, res) => {
    try {
        const { name, description, category, price, restaurant, is_available } = req.body;
        
        // Logika Multer: Jika ada file dari komputer, buatkan link lokalnya. 
        // Jika tidak ada, pakai link URL yang diketik (opsional)
        let finalImageUrl = req.body.image_url; 
        
        if (req.file) {
            // Karena server backend-mu jalan di port 5000, kita buatkan link lengkapnya
            finalImageUrl = `http://127.0.0.1:5000/uploads/${req.file.filename}`;
        }

        // Validasi
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
            image_url: finalImageUrl, // Masukkan link gambar final ke database
            is_available: is_available !== undefined ? is_available : true
        });

        res.status(201).json({
            success: true,
            message: 'Makanan dan foto berhasil ditambahkan',
            data: newFood
        });
    } catch (error) {
        console.error('Create food error:', error);
        res.status(500).json({
            success: false,
            message: 'Gagal menambah makanan',
            error: error.message
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