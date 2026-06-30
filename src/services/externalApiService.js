const axios = require('axios');
const { cacheService } = require('../config/redis');

const MEALDB_API_URL = process.env.MEALDB_API_URL || 'https://www.themealdb.com/api/json/v1/1';

const fetchFromMealDB = async (query) => {
    try {
        const cacheKey = `mealdb:${query}`;
        const cached = await cacheService.get(cacheKey);

        if (cached) {
            return cached;
        }

        const response = await axios.get(`${MEALDB_API_URL}/search.php`, {
            params: { s: query }
        });

        const meals = response.data.meals || [];
        
        // Transform data
        const transformed = meals.map(meal => ({
            external_id: meal.idMeal,
            name: meal.strMeal,
            category: meal.strCategory || 'Uncategorized',
            description: meal.strInstructions?.substring(0, 200) || '',
            image_url: meal.strMealThumb,
            restaurant: meal.strArea || 'Unknown',
            price: Math.floor(Math.random() * 150) + 20,
            tags: [meal.strCategory, meal.strArea].filter(Boolean)
        }));

        await cacheService.set(cacheKey, transformed, 3600);
        return transformed;

    } catch (error) {
        console.error('MealDB API error:', error.message);
        return [];
    }
};

const fetchMealById = async (id) => {
    try {
        const response = await axios.get(`${MEALDB_API_URL}/lookup.php`, {
            params: { i: id }
        });

        return response.data.meals?.[0] || null;
    } catch (error) {
        console.error('MealDB API error:', error.message);
        return null;
    }
};

module.exports = { fetchFromMealDB, fetchMealById };