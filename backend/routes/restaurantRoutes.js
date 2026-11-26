import express from 'express';
import Restaurant from '../models/Restaurant.js';
import FoodItem from '../models/FoodItem.js';
import { escapeRegex, isValidObjectId } from '../utils/validation.js';

const router = express.Router();

// @desc    Fetch all restaurants
// @route   GET /api/restaurants
// @access  Public
router.get('/', async (req, res, next) => {
  try {
    const rawKeyword = typeof req.query.keyword === 'string' ? req.query.keyword.trim() : '';
    const filter = rawKeyword
      ? {
          $or: [
            { name: { $regex: escapeRegex(rawKeyword), $options: 'i' } },
            { categories: { $regex: escapeRegex(rawKeyword), $options: 'i' } },
          ],
        }
      : {};

    const restaurants = await Restaurant.find(filter);
    res.json(restaurants);
  } catch (error) {
    next(error);
  }
});

// @desc    Fetch single restaurant with its menu
// @route   GET /api/restaurants/:id
// @access  Public
router.get('/:id', async (req, res, next) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      res.status(400);
      throw new Error('Invalid restaurant ID');
    }

    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) {
      res.status(404);
      throw new Error('Restaurant not found');
    }

    const menu = await FoodItem.find({ restaurant: restaurant._id });
    res.json({ restaurant, menu });
  } catch (error) {
    next(error);
  }
});

export default router;
