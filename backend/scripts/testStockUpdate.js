import mongoose from "mongoose";
import Product from "../models/product.model.js";
import dotenv from "dotenv";

dotenv.config();

const testStockUpdate = async () => {
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

    console.log("📦 Testing stock update simulation...\n");

    // Test with STRING size (what database has)
    console.log("Test 1: Size as STRING '9'");
    const session1 = await mongoose.startSession();
    session1.startTransaction();

    const result1 = await Product.findOneAndUpdate(
      {
        _id: product._id,
        "variants.size": "9",
        "variants.color": "Orange",
        "variants.stock": { $gte: 1 },
      },
      {
        $inc: { "variants.$.stock": -1 },
      },
      { session: session1, new: true }
    );

    await session1.abortTransaction();
    session1.endSession();

    console.log("  Result:", result1 ? "✅ SUCCESS" : "❌ FAILED");
    if (result1) {
      const variant = result1.variants.find(
        (v) => v.size === "9" && v.color === "Orange"
      );
      console.log(`  Stock would be: ${variant.stock + 1} → ${variant.stock}`);
    }

    // Test with NUMBER size (potential frontend issue)
    console.log("\nTest 2: Size as NUMBER 9");
    const session2 = await mongoose.startSession();
    session2.startTransaction();

    const result2 = await Product.findOneAndUpdate(
      {
        _id: product._id,
        "variants.size": 9,
        "variants.color": "Orange",
        "variants.stock": { $gte: 1 },
      },
      {
        $inc: { "variants.$.stock": -1 },
      },
      { session: session2, new: true }
    );

    await session2.abortTransaction();
    session2.endSession();

    console.log(
      "  Result:",
      result2 ? "✅ SUCCESS" : "❌ FAILED (Type mismatch!)"
    );

    // Test exact data format from checkout
    console.log("\nTest 3: Simulating checkout data");
    const checkoutItem = {
      productId: product._id,
      name: product.name,
      size: "9", // From cart
      color: "Orange", // From cart
      quantity: 1,
    };

    console.log("  Item data:", JSON.stringify(checkoutItem, null, 2));

    const session3 = await mongoose.startSession();
    session3.startTransaction();

    const result3 = await Product.findOneAndUpdate(
      {
        _id: checkoutItem.productId,
        "variants.size": checkoutItem.size,
        "variants.color": checkoutItem.color,
        "variants.stock": { $gte: checkoutItem.quantity },
      },
      {
        $inc: { "variants.$.stock": -checkoutItem.quantity },
      },
      { session: session3, new: true }
    );

    await session3.abortTransaction();
    session3.endSession();

    console.log("  Result:", result3 ? "✅ SUCCESS" : "❌ FAILED");

    console.log("\n📋 Current variants in database:");
    product.variants.forEach((v) => {
      console.log(
        `  Size: '${v.size}' (type: ${typeof v.size}), Color: '${
          v.color
        }', Stock: ${v.stock}`
      );
    });

    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
};

testStockUpdate();
