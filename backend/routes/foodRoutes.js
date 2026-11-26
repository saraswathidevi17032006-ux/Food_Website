import express from 'express';
import FoodItem from '../models/FoodItem.js';
import { escapeRegex, isValidObjectId } from '../utils/validation.js';

const router = express.Router();

// @desc    Fetch all food items (useful for search)
// @route   GET /api/food
// @access  Public
router.get('/', async (req, res, next) => {
  try {
    const rawKeyword = typeof req.query.keyword === 'string' ? req.query.keyword.trim() : '';
    const rawCategory = typeof req.query.category === 'string' ? req.query.category.trim() : '';

    const filter = {};
    if (rawKeyword) {
      filter.name = { $regex: escapeRegex(rawKeyword), $options: 'i' };
    }
    if (rawCategory) {
      filter.category = { $regex: `^${escapeRegex(rawCategory)}$`, $options: 'i' };
    }

    const foodItems = await FoodItem.find(filter).populate('restaurant', 'name');
    res.json(foodItems);
  } catch (error) {
    next(error);
  }
});

// @desc    Fetch single food item
// @route   GET /api/food/:id
// @access  Public
router.get('/:id', async (req, res, next) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      res.status(400);
      throw new Error('Invalid food item ID');
    }

    const foodItem = await FoodItem.findById(req.params.id).populate('restaurant', 'name location');
    if (!foodItem) {
      res.status(404);
      throw new Error('Food item not found');
    }

    res.json(foodItem);
  } catch (error) {
    next(error);
  }
});

export default router;
