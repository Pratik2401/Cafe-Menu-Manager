const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Import essential models
const Category = require('./src/models/CategoryModel');
const SubCategory = require('./src/models/SubCategoryModel');
const Item = require('./src/models/ItemModel');
const FoodCategory = require('./src/models/FoodCategoryModel');
const Size = require('./src/models/SizeModel');
const Variation = require('./src/models/VariationModel');

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/topchioutpost');
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Clear all collections
const clearCollections = async () => {
  const collections = [
    Category, SubCategory, Item, FoodCategory, Size, Variation
  ];
  
  for (const collection of collections) {
    await collection.deleteMany({});
  }
  console.log('All collections cleared');
};

// Seed data
const seedData = async () => {
  try {
    await connectDB();
    await clearCollections();

    // 1. Create Food Categories
    const foodCategories = await FoodCategory.create([
      { name: 'Vegetarian', icon: '/uploads/food-categories/veg.png', isActive: true },
      { name: 'Non-Vegetarian', icon: '/uploads/food-categories/non-veg.png', isActive: true },
      { name: 'Vegan', icon: '/uploads/food-categories/vegan.png', isActive: true },
      { name: 'Gluten-Free', icon: '/uploads/food-categories/gluten-free.png', isActive: true }
    ]);
    console.log('Food categories created');

    // 2. Create Sizes
    const sizes = await Size.create([
      { name: 'Small', abbreviation: 'S' },
      { name: 'Medium', abbreviation: 'M' },
      { name: 'Large', abbreviation: 'L' },
      { name: 'Extra Large', abbreviation: 'XL' },
      { name: 'Regular', abbreviation: 'R' },
      { name: 'Half', abbreviation: 'H' },
      { name: 'Full', abbreviation: 'F' }
    ]);
    console.log('Sizes created');

    // 3. Create Variations
    const variations = await Variation.create([
      { name: 'Extra Cheese', isActive: true },
      { name: 'No Onions', isActive: true },
      { name: 'Extra Spicy', isActive: true },
      { name: 'Less Salt', isActive: true },
      { name: 'Extra Sauce', isActive: true },
      { name: 'Grilled', isActive: true },
      { name: 'Fried', isActive: true },
      { name: 'Steamed', isActive: true }
    ]);
    console.log('Variations created');

    // 4. Create Categories
    const categories = await Category.create([
      { name: 'Beverages', image: '/uploads/categories/beverages.jpg', serialId: 1, isVisible: true },
      { name: 'Appetizers', image: '/uploads/categories/appetizers.jpg', serialId: 2, isVisible: true },
      { name: 'Main Course', image: '/uploads/categories/main-course.jpg', serialId: 3, isVisible: true },
      { name: 'Desserts', image: '/uploads/categories/desserts.jpg', serialId: 4, isVisible: true },
      { name: 'Snacks', image: '/uploads/categories/snacks.jpg', serialId: 5, isVisible: true }
    ]);
    console.log('Categories created');

    // 5. Create SubCategories
    const subCategories = await SubCategory.create([
      // Beverages subcategories
      { name: 'Hot Drinks', categoryId: categories[0]._id, serialId: 1, isVisible: true },
      { name: 'Cold Drinks', categoryId: categories[0]._id, serialId: 2, isVisible: true },
      { name: 'Fresh Juices', categoryId: categories[0]._id, serialId: 3, isVisible: true },
      
      // Appetizers subcategories
      { name: 'Starters', categoryId: categories[1]._id, serialId: 1, isVisible: true },
      { name: 'Salads', categoryId: categories[1]._id, serialId: 2, isVisible: true },
      
      // Main Course subcategories
      { name: 'Indian Cuisine', categoryId: categories[2]._id, serialId: 1, isVisible: true },
      { name: 'Continental', categoryId: categories[2]._id, serialId: 2, isVisible: true },
      { name: 'Chinese', categoryId: categories[2]._id, serialId: 3, isVisible: true },
      
      // Desserts subcategories
      { name: 'Ice Cream', categoryId: categories[3]._id, serialId: 1, isVisible: true },
      { name: 'Cakes', categoryId: categories[3]._id, serialId: 2, isVisible: true },
      
      // Snacks subcategories
      { name: 'Fast Food', categoryId: categories[4]._id, serialId: 1, isVisible: true },
      { name: 'Healthy Snacks', categoryId: categories[4]._id, serialId: 2, isVisible: true }
    ]);
    console.log('SubCategories created');

    // 6. Create Items with various combinations
    const items = await Item.create([
      // Item 1: Basic item with no image, no sizes, no variations
      {
        name: 'Green Tea',
        description: 'Fresh green tea leaves',
        price: 50,
        subCategory: subCategories[0]._id,
        foodCategory: foodCategories[2]._id,
        show: true,
        serialId: 1
      },

      // Item 2: Item with image and sizes
      {
        name: 'Coffee',
        description: 'Premium coffee beans',
        price: 80,
        image: '/uploads/items/coffee.jpg',
        subCategory: subCategories[0]._id,
        foodCategory: foodCategories[2]._id,
        sizePrices: [
          { sizeId: sizes[0]._id, price: 60 },
          { sizeId: sizes[1]._id, price: 80 },
          { sizeId: sizes[2]._id, price: 100 }
        ],
        show: true,
        serialId: 2
      },

      // Item 3: Item with variations and allergens
      {
        name: 'Margherita Pizza',
        description: 'Classic pizza with tomato sauce and mozzarella',
        price: 250,
        image: '/uploads/items/pizza.jpg',
        subCategory: subCategories[5]._id,
        foodCategory: foodCategories[0]._id,
        variations: [
          { variationId: variations[0]._id, price: 30 },
          { variationId: variations[2]._id, price: 0 }
        ],
        show: true,
        serialId: 3
      },

      // Item 4: Item with sizes, variations, and add-ons
      {
        name: 'Chicken Burger',
        description: 'Grilled chicken burger with fresh vegetables',
        price: 180,
        image: '/uploads/items/burger.jpg',
        subCategory: subCategories[10]._id,
        foodCategory: foodCategories[1]._id,
        sizePrices: [
          { sizeId: sizes[4]._id, price: 180 },
          { sizeId: sizes[2]._id, price: 220 }
        ],
        variations: [
          { variationId: variations[0]._id, price: 25 },
          { variationId: variations[4]._id, price: 15 }
        ],
        addOns: [
          { name: 'Extra Patty', price: 50 },
          { name: 'French Fries', price: 40 },
          { name: 'Cheese Slice', price: 20 }
        ],
        show: true,
        serialId: 4
      },

      // Item 5: Hidden item with minimal data
      {
        name: 'Special Dish',
        description: 'Coming soon',
        price: 300,
        subCategory: subCategories[5]._id,
        foodCategory: foodCategories[0]._id,
        show: false,
        serialId: 5
      },

      // Item 6: Premium item with all features
      {
        name: 'Lobster Thermidor',
        description: 'Premium lobster dish with rich cream sauce',
        price: 1200,
        image: '/uploads/items/lobster.jpg',
        subCategory: subCategories[6]._id,
        foodCategory: foodCategories[1]._id,
        sizePrices: [
          { sizeId: sizes[5]._id, price: 800 },
          { sizeId: sizes[6]._id, price: 1200 }
        ],
        variations: [
          { variationId: variations[5]._id, price: 0 },
          { variationId: variations[7]._id, price: 50 }
        ],
        addOns: [
          { name: 'Garlic Bread', price: 80 },
          { name: 'Wine Pairing', price: 300 }
        ],
        show: true,
        serialId: 6
      }
    ]);
    console.log('Items created');

    console.log('\n=== SEED DATA SUMMARY ===');
    console.log(`Food Categories: ${foodCategories.length}`);
    console.log(`Sizes: ${sizes.length}`);
    console.log(`Variations: ${variations.length}`);
    console.log(`Categories: ${categories.length}`);
    console.log(`SubCategories: ${subCategories.length}`);
    console.log(`Items: ${items.length}`);
    console.log('========================\n');

    console.log('Seed data created successfully!');
    process.exit(0);

  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

// Run the seed script
seedData();