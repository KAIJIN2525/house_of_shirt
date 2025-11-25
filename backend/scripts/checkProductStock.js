import mongoose from "mongoose";
import Product from "../models/product.model.js";
import dotenv from "dotenv";

dotenv.config();

const checkStock = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // Find the Nike shoe product
    const product = await Product.findOne({
      name: /Nike Running Pegasus/i,
    });

    if (!product) {
      console.log("❌ Product not found");
      process.exit(1);
    }

    console.log("\n📦 Product:", product.name);
    console.log("🆔 Product ID:", product._id);
    console.log("\n📊 All Variants:");
    product.variants.forEach((variant, index) => {
      console.log(
        `  ${index + 1}. Size: ${variant.size}, Color: ${
          variant.color
        }, Stock: ${variant.stock}`
      );
    });

    // Test the exact query that fails
    const testSize = "9";
    const testColor = "Orange";
    const testQuantity = 1;

    console.log(
      `\n🔍 Testing query for: Size=${testSize}, Color=${testColor}, Quantity=${testQuantity}`
    );

    const result = await Product.findOne({
      _id: product._id,
      "variants.size": testSize,
      "variants.color": testColor,
      "variants.stock": { $gte: testQuantity },
    });

    if (result) {
      console.log("✅ Query found matching product");

      // Find the specific variant
      const matchingVariant = result.variants.find(
        (v) => v.size === testSize && v.color === testColor
      );

      if (matchingVariant) {
        console.log(
          `✅ Matching variant: Size=${matchingVariant.size}, Color=${matchingVariant.color}, Stock=${matchingVariant.stock}`
        );
      } else {
        console.log("❌ No variant matches BOTH size AND color");
        console.log("   This is the problem!");
      }
    } else {
      console.log("❌ Query returned null - no matching product");
      console.log("\nDebugging:");

      // Check each condition separately
      const sizeMatch = await Product.findOne({
        _id: product._id,
        "variants.size": testSize,
      });
      console.log(`  - Size '${testSize}' exists:`, sizeMatch ? "YES" : "NO");

      const colorMatch = await Product.findOne({
        _id: product._id,
        "variants.color": testColor,
      });
      console.log(
        `  - Color '${testColor}' exists:`,
        colorMatch ? "YES" : "NO"
      );

      const stockMatch = await Product.findOne({
        _id: product._id,
        "variants.stock": { $gte: testQuantity },
      });
      console.log(
        `  - Stock >= ${testQuantity} exists:`,
        stockMatch ? "YES" : "NO"
      );

      // Check if size and color exist on SAME variant
      const bothMatch = product.variants.find(
        (v) => v.size === testSize && v.color === testColor
      );

      if (bothMatch) {
        console.log(
          `\n  ⚠️ Variant exists with Size=${testSize} AND Color=${testColor}`
        );
        console.log(`     Stock: ${bothMatch.stock}`);
        if (bothMatch.stock < testQuantity) {
          console.log(
            `     ❌ But stock (${bothMatch.stock}) is less than quantity (${testQuantity})`
          );
        }
      } else {
        console.log(
          `\n  ❌ No variant has BOTH Size='${testSize}' AND Color='${testColor}'`
        );
        console.log(`     Available Size/Color combinations:`);
        product.variants.forEach((v) => {
          console.log(`       - Size: '${v.size}', Color: '${v.color}'`);
        });
      }
    }

    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
};

checkStock();
