import path from 'node:path';
import { fileURLToPath } from 'node:url';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import Restaurant from './models/Restaurant.js';
import FoodItem from './models/FoodItem.js';
import Order from './models/Order.js';
import restaurants from './data/restaurants.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '.env') });
dotenv.config();

const importData = async () => {
  await Order.deleteMany();
  await FoodItem.deleteMany();
  await Restaurant.deleteMany();

  const createdRestaurants = await Restaurant.insertMany(restaurants);

  const [burgerKing, pizzaHut, biryaniHouse, dosaPlaza, wokNoodle] = createdRestaurants.map(
    (r) => r._id
  );

  const foodItems = [
    {
      name: 'Whopper Burger',
      description:
        'A 1/4 lb of savory flame-grilled beef topped with juicy tomatoes, fresh lettuce, creamy mayonnaise, ketchup, crunchy pickles, and sliced white onions on a soft sesame seed bun.',
      price: 5.99,
      image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&q=80',
      category: 'Burger',
      restaurant: burgerKing,
      isVegetarian: false,
    },
    {
      name: 'Veggie Burger',
      description:
        'A delicious plant-based patty topped with fresh lettuce, tomatoes, and our special sauce.',
      price: 4.99,
      image: 'https://images.unsplash.com/photo-1520072959219-c595dc870360?w=600&q=80',
      category: 'Burger',
      restaurant: burgerKing,
      isVegetarian: true,
    },
    {
      name: 'Pepperoni Pizza',
      description:
        'Classic pizza topped with our signature tomato sauce, mozzarella cheese, and loads of pepperoni.',
      price: 12.99,
      image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=600&q=80',
      category: 'Pizza',
      restaurant: pizzaHut,
      isVegetarian: false,
    },
    {
      name: 'Margherita Pizza',
      description: 'Traditional Italian pizza with fresh tomatoes, mozzarella, and basil.',
      price: 10.99,
      image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=600&q=80',
      category: 'Pizza',
      restaurant: pizzaHut,
      isVegetarian: true,
    },
    {
      name: 'Hyderabadi Chicken Biryani',
      description:
        'Aromatic basmati rice layered with marinated chicken, cooked perfectly with secret spices.',
      price: 14.99,
      image: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=600&q=80',
      category: 'Biryani',
      restaurant: biryaniHouse,
      isVegetarian: false,
    },
    {
      name: 'Masala Dosa',
      description:
        'Crispy rice crepe filled with spiced potato curry, served with sambar and chutneys.',
      price: 7.99,
      image: 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=600&q=80',
      category: 'Dosa',
      restaurant: dosaPlaza,
      isVegetarian: true,
    },
    {
      name: 'Hakka Noodles',
      description: 'Stir-fried noodles with crunchy vegetables and soy sauce.',
      price: 8.99,
      image: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=600&q=80',
      category: 'Noodles',
      restaurant: wokNoodle,
      isVegetarian: true,
    },
  ];

  await FoodItem.insertMany(foodItems);
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
    await connectDB();
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
