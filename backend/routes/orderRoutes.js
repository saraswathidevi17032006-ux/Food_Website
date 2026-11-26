import express from 'express';
import { isValidEmail, isValidObjectId } from '../utils/validation.js';
import { getOptionalAuthUserId } from '../utils/auth.js';
import { createOrder, findFoodItemsByIds, getOrderById } from '../utils/store.js';

const router = express.Router();

const DELIVERY_FEE = 40;

const roundCurrency = (amount) => Math.round(amount * 100) / 100;

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
router.post('/', async (req, res, next) => {
  try {
    const userId = getOptionalAuthUserId(req);
    if (!userId) {
      res.status(401);
      throw new Error('Please login or register to place an order');
    }

    const { orderItems, customer } = req.body ?? {};

    if (!Array.isArray(orderItems) || orderItems.length === 0) {
      res.status(400);
      throw new Error('No order items provided');
    }

    const name = typeof customer?.name === 'string' ? customer.name.trim() : '';
    const email = typeof customer?.email === 'string' ? customer.email.trim() : '';
    const phone = typeof customer?.phone === 'string' ? customer.phone.trim() : '';
    const address = typeof customer?.address === 'string' ? customer.address.trim() : '';

    if (!name || !email || !phone || !address) {
      res.status(400);
      throw new Error('Please fill in all customer delivery details');
    }

    if (!isValidEmail(email)) {
      res.status(400);
      throw new Error('Please provide a valid email address');
    }

    const qtyById = new Map();
    for (const item of orderItems) {
      const id = String(item?.foodItem ?? '');
      const qty = Number(item?.qty);
      if (!isValidObjectId(id)) {
        res.status(400);
        throw new Error('Invalid food item ID in order');
      }
      if (!Number.isInteger(qty) || qty < 1 || qty > 100) {
        res.status(400);
        throw new Error('Item quantity must be a whole number between 1 and 100');
      }
      qtyById.set(id, (qtyById.get(id) ?? 0) + qty);
    }

    const foodDocs = await findFoodItemsByIds([...qtyById.keys()]);
    const foodMap = new Map(foodDocs.map((doc) => [doc._id.toString(), doc]));

    const verifiedItems = [];
    let itemsPrice = 0;

    for (const [id, qty] of qtyById.entries()) {
      const doc = foodMap.get(id);
      if (!doc) {
        res.status(404);
        throw new Error(`Food item ${id} not found`);
      }
      itemsPrice += doc.price * qty;
      verifiedItems.push({
        name: doc.name,
        qty,
        image: doc.image,
        price: doc.price,
        foodItem: doc._id,
      });
    }

    const roundedItemsPrice = roundCurrency(itemsPrice);
    const totalPrice = roundCurrency(roundedItemsPrice + DELIVERY_FEE);

    const createdOrder = await createOrder({
      user: userId,
      orderItems: verifiedItems,
      customer: { name, email, phone, address },
      itemsPrice: roundedItemsPrice,
      deliveryFee: DELIVERY_FEE,
      totalPrice,
    });

    res.status(201).json(createdOrder);
  } catch (error) {
    next(error);
  }
});

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
router.get('/:id', async (req, res, next) => {
  try {
    const userId = getOptionalAuthUserId(req);
    if (!userId) {
      res.status(401);
      throw new Error('Please login to view order details');
    }

    if (!isValidObjectId(req.params.id)) {
      res.status(400);
      throw new Error('Invalid order ID');
    }

    const order = await getOrderById(req.params.id);
    if (!order) {
      res.status(404);
      throw new Error('Order not found');
    }

    if (order.user && order.user.toString() !== userId) {
      res.status(403);
      throw new Error('Not authorized to view this order');
    }

    res.json(order);
  } catch (error) {
    next(error);
  }
});

export default router;
