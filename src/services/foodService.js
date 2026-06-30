const { Food, Review } = require('../models');
const { Op } = require('sequelize');
const { cacheService } = require('../config/redis');

class FoodService {
    async getAllFoods(page = 1, limit = 20, filters = {}) {
        const offset = (page - 1) * limit;
        const where = { is_available: true };

        if (filters.category) where.category = filters.category;
        if (filters.restaurant) where.restaurant = { [Op.iLike]: `%${filters.restaurant}%` };
        if (filters.search) {
            where[Op.or] = [
                { name: { [Op.iLike]: `%${filters.search}%` } },
                { description: { [Op.iLike]: `%${filters.search}%` } }
            ];
        }
        if (filters.minPrice || filters.maxPrice) {
            where.price = {};
            if (filters.minPrice) where.price[Op.gte] = parseFloat(filters.minPrice);
            if (filters.maxPrice) where.price[Op.lte] = parseFloat(filters.maxPrice);
        }

        const cacheKey = `foods:${JSON.stringify(where)}:${page}:${limit}`;
        const cached = await cacheService.get(cacheKey);

        if (cached) {
            return cached;
        }

        const { count, rows } = await Food.findAndCountAll({
            where,
            order: [['created_at', 'DESC']],
            limit,
            offset
        });

        const result = {
            foods: rows,
            pagination: {
                page,
                limit,
                total: count,
                totalPages: Math.ceil(count / limit)
            }
        };

        await cacheService.set(cacheKey, result, 300);
        return result;
    }

    async getFoodById(id) {
        const cacheKey = `food:${id}`;
        const cached = await cacheService.get(cacheKey);

        if (cached) {
            return cached;
        }

        const food = await Food.findByPk(id);
        if (!food) {
            throw new Error('Food not found');
        }

        const reviews = await Review.findAll({
            where: { food_id: id },
            include: [{
                model: require('../models').User,
                as: 'user',
                attributes: ['id', 'username', 'full_name', 'avatar_url']
            }],
            order: [['created_at', 'DESC']],
            limit: 10
        });

        const ratingResult = await Review.findOne({
            where: { food_id: id },
            attributes: [
                [require('sequelize').fn('AVG', require('sequelize').col('rating')), 'averageRating'],
                [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'reviewCount']
            ]
        });

        const result = {
            food,
            reviews,
            average_rating: parseFloat(ratingResult?.dataValues?.averageRating) || 0,
            review_count: parseInt(ratingResult?.dataValues?.reviewCount) || 0
        };

        await cacheService.set(cacheKey, result, 3600);
        return result;
    }
}

module.exports = new FoodService();