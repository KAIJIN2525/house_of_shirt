import mongoose from "mongoose";
import dotenv from "dotenv";
import Product from "../models/product.model.js";

dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI);

const productId = "691af6087da55aad84ca07eb"; // Your product ID

const publishProduct = async () => {
  try {
    console.log(`📦 Updating product ${productId}...`);

    const result = await Product.updateOne(
      { _id: productId },
      { $set: { isPublished: true } }
    );

    if (result.modifiedCount > 0) {
      console.log(`✅ Product successfully published!`);

      // Fetch and display the updated product
      const product = await Product.findById(productId);
      console.log(`\n📋 Product Details:`);
      console.log(`   Name: ${product.name}`);
      console.log(`   SKU: ${product.sku}`);
      console.log(`   Published: ${product.isPublished}`);
      console.log(`   Featured: ${product.isFeatured}`);
    } else {
      console.log(`⚠️  No changes made. Product might already be published.`);
    }

    process.exit(0);
  } catch (error) {
    console.error("❌ Error publishing product:", error);
    process.exit(1);
  }
};

publishProduct();
