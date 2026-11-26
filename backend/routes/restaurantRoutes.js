import express from 'express';
import { isValidObjectId } from '../utils/validation.js';
import { listRestaurants, getRestaurantWithMenu } from '../utils/store.js';

const router = express.Router();

// @desc    Fetch all restaurants
// @route   GET /api/restaurants
// @access  Public
router.get('/', async (req, res, next) => {
  try {
    const keyword = typeof req.query.keyword === 'string' ? req.query.keyword.trim() : '';
    const restaurants = await listRestaurants(keyword);
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

    const result = await getRestaurantWithMenu(req.params.id);
    if (!result) {
      res.status(404);
      throw new Error('Restaurant not found');
    }

    res.json(result);
  } catch (error) {
    next(error);
  }
});

export default router;
