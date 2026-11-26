import mongoose from 'mongoose';
import Restaurant from '../models/Restaurant.js';
import FoodItem from '../models/FoodItem.js';
import Order from '../models/Order.js';
import User from '../models/User.js';
import seedRestaurants from '../data/restaurants.js';
import { buildFoodItems } from '../data/foodItems.js';
import { seedUsers } from '../data/users.js';
import { hashPassword } from './auth.js';
import { escapeRegex } from './validation.js';

let inMemoryMode = false;
let memRestaurants = [];
let memFoodItems = [];
const memOrders = new Map();
const memUsers = new Map();

const ensureMemorySeeded = () => {
  if (memRestaurants.length > 0) return;

  memRestaurants = seedRestaurants.map((rest) => ({
    _id: new mongoose.Types.ObjectId().toString(),
    ...rest,
  }));

  const restaurantsByName = Object.fromEntries(
    memRestaurants.map((rest) => [rest.name, rest._id])
  );

  memFoodItems = buildFoodItems(restaurantsByName).map((item) => ({
    _id: new mongoose.Types.ObjectId().toString(),
    ...item,
  }));

  for (const seedUser of seedUsers) {
    const id = new mongoose.Types.ObjectId().toString();
    const now = new Date().toISOString();
    memUsers.set(id, {
      _id: id,
      name: seedUser.name,
      email: seedUser.email.trim().toLowerCase(),
      password: hashPassword(seedUser.password),
      createdAt: now,
      updatedAt: now,
    });
  }
};

export const enableInMemoryMode = () => {
  inMemoryMode = true;
  ensureMemorySeeded();
};

export const isInMemoryMode = () => inMemoryMode;

export const listRestaurants = async (keyword = '') => {
  if (!inMemoryMode) {
    const filter = keyword
      ? {
          $or: [
            { name: { $regex: escapeRegex(keyword), $options: 'i' } },
            { categories: { $regex: escapeRegex(keyword), $options: 'i' } },
          ],
        }
      : {};
    return Restaurant.find(filter);
  }

  if (!keyword) return memRestaurants;
  const regex = new RegExp(escapeRegex(keyword), 'i');
  return memRestaurants.filter(
    (rest) => regex.test(rest.name) || rest.categories.some((cat) => regex.test(cat))
  );
};

export const getRestaurantWithMenu = async (id) => {
  if (!inMemoryMode) {
    const restaurant = await Restaurant.findById(id);
    if (!restaurant) return null;
    const menu = await FoodItem.find({ restaurant: restaurant._id });
    return { restaurant, menu };
  }

  const restaurant = memRestaurants.find((rest) => rest._id === id);
  if (!restaurant) return null;
  const menu = memFoodItems.filter((item) => item.restaurant === id);
  return { restaurant, menu };
};

export const listFoodItems = async ({ keyword = '', category = '' } = {}) => {
  if (!inMemoryMode) {
    const filter = {};
    if (keyword) {
      filter.name = { $regex: escapeRegex(keyword), $options: 'i' };
    }
    if (category) {
      filter.category = { $regex: `^${escapeRegex(category)}$`, $options: 'i' };
    }
    return FoodItem.find(filter).populate('restaurant', 'name');
  }

  const keywordRegex = keyword ? new RegExp(escapeRegex(keyword), 'i') : null;
  const categoryRegex = category ? new RegExp(`^${escapeRegex(category)}$`, 'i') : null;
  const restMap = new Map(memRestaurants.map((rest) => [rest._id, rest]));

  return memFoodItems
    .filter((item) => {
      if (keywordRegex && !keywordRegex.test(item.name)) return false;
      if (categoryRegex && !categoryRegex.test(item.category)) return false;
      return true;
    })
    .map((item) => {
      const rest = restMap.get(item.restaurant);
      return {
        ...item,
        restaurant: rest ? { _id: rest._id, name: rest.name } : null,
      };
    });
};

export const getFoodItemById = async (id) => {
  if (!inMemoryMode) {
    return FoodItem.findById(id).populate('restaurant', 'name location');
  }

  const item = memFoodItems.find((food) => food._id === id);
  if (!item) return null;
  const rest = memRestaurants.find((r) => r._id === item.restaurant);
  return {
    ...item,
    restaurant: rest
      ? { _id: rest._id, name: rest.name, location: rest.location }
      : null,
  };
};

export const findFoodItemsByIds = async (ids) => {
  if (!inMemoryMode) {
    return FoodItem.find({ _id: { $in: ids } });
  }
  const idSet = new Set(ids);
  return memFoodItems.filter((item) => idSet.has(item._id));
};

export const createOrder = async (orderData) => {
  if (!inMemoryMode) {
    const order = new Order(orderData);
    return order.save();
  }

  const now = new Date().toISOString();
  const order = {
    _id: new mongoose.Types.ObjectId().toString(),
    ...orderData,
    status: 'Placed',
    createdAt: now,
    updatedAt: now,
  };
  memOrders.set(order._id, order);
  return order;
};

export const getOrderById = async (id) => {
  if (!inMemoryMode) {
    return Order.findById(id);
  }
  return memOrders.get(id) || null;
};

export const findUserByEmail = async (email) => {
  const normalized = String(email || '').trim().toLowerCase();
  if (!inMemoryMode) {
    return User.findOne({ email: normalized });
  }
  for (const user of memUsers.values()) {
    if (user.email === normalized) return user;
  }
  return null;
};

export const findUserById = async (id) => {
  if (!inMemoryMode) {
    return User.findById(id).select('-password');
  }
  return memUsers.get(id) || null;
};

export const createUser = async ({ name, email, password }) => {
  const normalizedEmail = email.trim().toLowerCase();
  if (!inMemoryMode) {
    const user = new User({ name: name.trim(), email: normalizedEmail, password });
    return user.save();
  }

  const now = new Date().toISOString();
  const user = {
    _id: new mongoose.Types.ObjectId().toString(),
    name: name.trim(),
    email: normalizedEmail,
    password,
    createdAt: now,
    updatedAt: now,
  };
  memUsers.set(user._id, user);
  return user;
};
