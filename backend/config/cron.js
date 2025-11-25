import cron from "node-cron";
import Product from "../models/product.model.js";
import { sendLowStockAlert } from "../config/email.js";

// Check stock levels and send alerts
const checkStockLevels = async () => {
  try {
    console.log("Running scheduled stock level check...");

    const products = await Product.find({ isPublished: true });
    const lowStockItems = [];

    products.forEach((product) => {
      product.variants.forEach((variant) => {
        // Alert if stock is at or below threshold but not completely out
        if (variant.stock <= variant.lowStockThreshold && variant.stock > 0) {
          lowStockItems.push({
            name: product.name,
            variant: `${variant.size} - ${variant.color}`,
            stock: variant.stock,
            threshold: variant.lowStockThreshold,
          });
        }
      });
    });

    if (lowStockItems.length > 0) {
      console.log(
        `Found ${lowStockItems.length} low stock items. Sending alert...`
      );
      const result = await sendLowStockAlert(lowStockItems);

      if (result.success) {
        console.log("Low stock alert email sent successfully");
      } else {
        console.error("Failed to send low stock alert:", result.error);
      }
    } else {
      console.log("All products are adequately stocked");
    }
  } catch (error) {
    console.error("Error in scheduled stock check:", error.message);
  }
};

// Initialize cron jobs
export const initializeCronJobs = () => {
  // Run stock check every day at 9 AM
  cron.schedule("0 9 * * *", () => {
    console.log("Daily stock check triggered at 9 AM");
    checkStockLevels();
  });

  // Optional: Run stock check every Monday at 2 PM as well
  cron.schedule("0 14 * * 1", () => {
    console.log("Weekly stock check triggered on Monday at 2 PM");
    checkStockLevels();
  });

  console.log("✅ Cron jobs initialized:");
  console.log("  - Daily stock check: Every day at 9:00 AM");
  console.log("  - Weekly stock check: Every Monday at 2:00 PM");
};

// Manual trigger for testing
export const manualStockCheck = checkStockLevels;

export default {
  initializeCronJobs,
  manualStockCheck,
};
