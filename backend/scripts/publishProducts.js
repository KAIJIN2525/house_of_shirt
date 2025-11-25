import mongoose from "mongoose";
import dotenv from "dotenv";
import Product from "../models/product.model.js";

dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI);

const publishAllProducts = async () => {
  try {
    console.log("📦 Updating all products...");

    // Update all products to set isPublished to true
    const result = await Product.updateMany(
      { isPublished: false },
      { $set: { isPublished: true } }
    );

    console.log(`✅ Successfully published ${result.modifiedCount} products`);

    // Get total count
    const totalProducts = await Product.countDocuments();
    const publishedProducts = await Product.countDocuments({
      isPublished: true,
    });

    console.log(`📊 Total products: ${totalProducts}`);
    console.log(`✅ Published products: ${publishedProducts}`);

    process.exit(0);
  } catch (error) {
    console.error("❌ Error publishing products:", error);
    process.exit(1);
  }
};

publishAllProducts();
