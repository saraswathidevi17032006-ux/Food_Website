export const buildFoodItems = (restaurantsByName) => [
  {
    name: 'Whopper Burger',
    description:
      'A 1/4 lb of savory flame-grilled beef topped with juicy tomatoes, fresh lettuce, creamy mayonnaise, ketchup, crunchy pickles, and sliced white onions on a soft sesame seed bun.',
    price: 199,
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&q=80',
    category: 'Burger',
    restaurant: restaurantsByName['Burger King'],
    isVegetarian: false,
  },
  {
    name: 'Veggie Burger',
    description:
      'A delicious plant-based patty topped with fresh lettuce, tomatoes, and our special sauce.',
    price: 149,
    image: 'https://images.unsplash.com/photo-1520072959219-c595dc870360?w=600&q=80',
    category: 'Burger',
    restaurant: restaurantsByName['Burger King'],
    isVegetarian: true,
  },
  {
    name: 'Pepperoni Pizza',
    description:
      'Classic pizza topped with our signature tomato sauce, mozzarella cheese, and loads of pepperoni.',
    price: 399,
    image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=600&q=80',
    category: 'Pizza',
    restaurant: restaurantsByName['Pizza Hut'],
    isVegetarian: false,
  },
  {
    name: 'Margherita Pizza',
    description: 'Traditional Italian pizza with fresh tomatoes, mozzarella, and basil.',
    price: 299,
    image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=600&q=80',
    category: 'Pizza',
    restaurant: restaurantsByName['Pizza Hut'],
    isVegetarian: true,
  },
  {
    name: 'Hyderabadi Chicken Biryani',
    description:
      'Aromatic basmati rice layered with marinated chicken, cooked perfectly with secret spices.',
    price: 349,
    image: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=600&q=80',
    category: 'Biryani',
    restaurant: restaurantsByName['Biryani House'],
    isVegetarian: false,
  },
  {
    name: 'Masala Dosa',
    description:
      'Crispy rice crepe filled with spiced potato curry, served with sambar and chutneys.',
    price: 129,
    image: 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=600&q=80',
    category: 'Dosa',
    restaurant: restaurantsByName['Dosa Plaza'],
    isVegetarian: true,
  },
  {
    name: 'Hakka Noodles',
    description: 'Stir-fried noodles with crunchy vegetables and soy sauce.',
    price: 179,
    image: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=600&q=80',
    category: 'Noodles',
    restaurant: restaurantsByName['Wok Noodle'],
    isVegetarian: true,
  },
];
