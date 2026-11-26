import path from 'node:path';
import { fileURLToPath } from 'node:url';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import Restaurant from './models/Restaurant.js';
import FoodItem from './models/FoodItem.js';
import Order from './models/Order.js';
import restaurants from './data/restaurants.js';
import { buildFoodItems } from './data/foodItems.js';
import { isInMemoryMode } from './utils/store.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '.env') });
dotenv.config();

const importData = async () => {
  await Order.deleteMany();
  await FoodItem.deleteMany();
  await Restaurant.deleteMany();

  const createdRestaurants = await Restaurant.insertMany(restaurants);
  const restaurantsByName = Object.fromEntries(
    createdRestaurants.map((rest) => [rest.name, rest._id])
  );

  await FoodItem.insertMany(buildFoodItems(restaurantsByName));
  console.log('Data Imported!');
};

const destroyData = async () => {
  await Order.deleteMany();
  await FoodItem.deleteMany();
  await Restaurant.deleteMany();
  console.log('Data Destroyed!');
};

const run = async () => {
  try {
    process.env.REQUIRE_DB = 'true';
    await connectDB();
    if (isInMemoryMode()) {
      throw new Error('Cannot run seeder without a live MongoDB connection.');
    }
    if (process.argv[2] === '-d') {
      await destroyData();
    } else {
      await importData();
    }
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    await mongoose.connection.close().catch(() => {});
    process.exit(1);
  }
};

run();
