import mongoose from "mongoose";
import dotenv from "dotenv";
import Product from "./models/product.model.js";
import User from "./models/user.model.js";
import Cart from "./models/cart.model.js";
import products from "./data/products.js";

dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI);

// Function to seed data

const seedData = async () => {
  try {
    // Clear existing data
    await Product.deleteMany({}, { maxTimeMS: 30000 });
    await User.deleteMany();
    await Cart.deleteMany();

    // Create a default admin user
    const adminUser = await User.create({
      name: "Admin User",
      email: "admin@example.com",
      password: "12345678",
      role: "admin",
    });

    // Assign the default user ID to each product
    const userID = adminUser._id;

    const sampleProducts = products.map((product) => {
      // Convert USD prices to Naira (multiply by ~1000-1500 for realistic Nigerian pricing)
      const priceInNaira = Math.round(product.price * 1000);
      const discountPriceInNaira = product.discountPrice
        ? Math.round(product.discountPrice * 1000)
        : undefined;

      return {
        ...product,
        user: userID,
        price: priceInNaira,
        discountPrice: discountPriceInNaira,
        isPublished: true, // Make products visible by default
      };
    });

    // Insert the products into the database
    await Product.insertMany(sampleProducts);

    console.log("Product data seeded successfully!");
    console.log(`✅ Created ${sampleProducts.length} products`);
    console.log(`✅ All products are now published and visible`);
    console.log(`✅ Prices converted to Naira (₦)`);
    process.exit();
  } catch (error) {
    console.error("Error seeding the data", error);
    process.exit(1);
  }
};

seedData();
