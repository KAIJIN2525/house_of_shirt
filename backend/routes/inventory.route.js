import express from "express";
import {
  getAllInventory,
  getLowStockProducts,
  getInventorySummary,
  updateVariantStock,
  bulkUpdateStock,
  checkAndSendStockAlerts,
  getInventoryByCategory,
  getStockMovementHistory,
} from "../controllers/inventory.controller.js";
import { protectRoute } from "../middleware/protectRoute.js";

const router = express.Router();

// All inventory routes require authentication and admin role
// Add admin check middleware if you have one

// Get all inventory products
router.get("/all", protectRoute, getAllInventory);

// Get low stock products
router.get("/low-stock", protectRoute, getLowStockProducts);

// Get inventory summary
router.get("/summary", protectRoute, getInventorySummary);

// Get inventory by category
router.get("/by-category", protectRoute, getInventoryByCategory);

// Update single variant stock
router.put("/update-stock", protectRoute, updateVariantStock);

// Bulk update stock
router.put("/bulk-update", protectRoute, bulkUpdateStock);

// Check and send stock alerts (manual trigger)
router.post("/check-alerts", protectRoute, checkAndSendStockAlerts);

// Get stock movement history for a product
router.get("/history/:productId", protectRoute, getStockMovementHistory);

export default router;
