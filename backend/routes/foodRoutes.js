import express from 'express';
import { isValidObjectId } from '../utils/validation.js';
import { listFoodItems, getFoodItemById } from '../utils/store.js';

const router = express.Router();

// @desc    Fetch all food items (useful for search & category filtering)
// @route   GET /api/food
// @access  Public
router.get('/', async (req, res, next) => {
  try {
    const keyword = typeof req.query.keyword === 'string' ? req.query.keyword.trim() : '';
    const category = typeof req.query.category === 'string' ? req.query.category.trim() : '';

    const foodItems = await listFoodItems({ keyword, category });
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

    const foodItem = await getFoodItemById(req.params.id);
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
