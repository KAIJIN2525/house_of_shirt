import Product from "../models/product.model.js";
import { sendLowStockAlert } from "../config/email.js";

// Get ALL inventory products
export const getAllInventory = async (req, res) => {
  try {
    const products = await Product.find({ isPublished: true })
      .populate("category", "name")
      .populate("tags", "name");

    const inventoryItems = [];

    products.forEach((product) => {
      product.variants.forEach((variant) => {
        inventoryItems.push({
          productId: product._id,
          productName: product.name,
          sku: product.sku,
          variantSku: variant.sku,
          size: variant.size,
          color: variant.color,
          currentStock: variant.stock,
          threshold: variant.lowStockThreshold,
          category: product.category?.name,
          image: product.images[0]?.url,
          price: product.price,
          discountPrice: product.discountPrice,
        });
      });
    });

    // Sort by stock level (lowest first)
    inventoryItems.sort((a, b) => a.currentStock - b.currentStock);

    res.json({
      success: true,
      count: inventoryItems.length,
      data: inventoryItems,
    });
  } catch (error) {
    console.error("Error fetching inventory:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all low stock products
export const getLowStockProducts = async (req, res) => {
  try {
    const products = await Product.find({ isPublished: true })
      .populate("category", "name")
      .populate("tags", "name");

    const lowStockItems = [];

    products.forEach((product) => {
      product.variants.forEach((variant) => {
        if (variant.stock <= variant.lowStockThreshold) {
          lowStockItems.push({
            productId: product._id,
            productName: product.name,
            sku: product.sku,
            variantSku: variant.sku,
            size: variant.size,
            color: variant.color,
            currentStock: variant.stock,
            threshold: variant.lowStockThreshold,
            category: product.category?.name,
            image: product.images[0]?.url,
            price: product.price,
            discountPrice: product.discountPrice,
          });
        }
      });
    });

    // Sort by stock level (lowest first)
    lowStockItems.sort((a, b) => a.currentStock - b.currentStock);

    res.json({
      success: true,
      count: lowStockItems.length,
      data: lowStockItems,
    });
  } catch (error) {
    console.error("Error fetching low stock products:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get inventory summary
export const getInventorySummary = async (req, res) => {
  try {
    const products = await Product.find({ isPublished: true });

    let totalProducts = products.length; // Count actual products, not variants
    let totalVariants = 0;
    let totalStock = 0;
    let lowStockCount = 0;
    let outOfStockCount = 0;

    products.forEach((product) => {
      product.variants.forEach((variant) => {
        totalVariants++;
        totalStock += variant.stock;

        if (variant.stock === 0) {
          outOfStockCount++;
        } else if (variant.stock <= variant.lowStockThreshold) {
          lowStockCount++;
        }
      });
    });

    res.json({
      success: true,
      summary: {
        totalProducts, // Actual number of products
        totalVariants, // Total number of variants
        totalStock,
        lowStockCount,
        outOfStockCount,
        healthyStockCount: totalVariants - lowStockCount - outOfStockCount,
      },
    });
  } catch (error) {
    console.error("Error fetching inventory summary:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update variant stock
export const updateVariantStock = async (req, res) => {
  try {
    const { productId, size, color, stock, lowStockThreshold } = req.body;

    const product = await Product.findById(productId);
    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    const variant = product.variants.find(
      (v) => v.size === size && v.color === color
    );

    if (!variant) {
      return res
        .status(404)
        .json({ success: false, message: "Variant not found" });
    }

    // Update stock if provided
    if (stock !== undefined) {
      variant.stock = stock;
    }

    // Update threshold if provided
    if (lowStockThreshold !== undefined) {
      variant.lowStockThreshold = lowStockThreshold;
    }

    await product.save();

    res.json({
      success: true,
      message: "Stock updated successfully",
      data: {
        productId: product._id,
        variantSku: variant.sku,
        stock: variant.stock,
        lowStockThreshold: variant.lowStockThreshold,
      },
    });
  } catch (error) {
    console.error("Error updating variant stock:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Bulk update stock
export const bulkUpdateStock = async (req, res) => {
  try {
    const { updates } = req.body; // Array of { productId, size, color, stock }

    if (!Array.isArray(updates)) {
      return res.status(400).json({
        success: false,
        message: "Updates must be an array",
      });
    }

    const results = [];
    const errors = [];

    for (const update of updates) {
      try {
        const { productId, size, color, stock, lowStockThreshold } = update;

        const product = await Product.findById(productId);
        if (!product) {
          errors.push({ productId, error: "Product not found" });
          continue;
        }

        const variant = product.variants.find(
          (v) => v.size === size && v.color === color
        );

        if (!variant) {
          errors.push({ productId, size, color, error: "Variant not found" });
          continue;
        }

        if (stock !== undefined) variant.stock = stock;
        if (lowStockThreshold !== undefined)
          variant.lowStockThreshold = lowStockThreshold;

        await product.save();
        results.push({ productId, size, color, stock: variant.stock });
      } catch (error) {
        errors.push({ ...update, error: error.message });
      }
    }

    res.json({
      success: true,
      message: `Updated ${results.length} variants`,
      results,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error("Error in bulk stock update:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Check and send low stock alerts
export const checkAndSendStockAlerts = async (req, res) => {
  try {
    const products = await Product.find({ isPublished: true });

    const lowStockItems = [];

    products.forEach((product) => {
      product.variants.forEach((variant) => {
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
      await sendLowStockAlert(lowStockItems);

      res.json({
        success: true,
        message: `Low stock alert sent for ${lowStockItems.length} variants`,
        count: lowStockItems.length,
      });
    } else {
      res.json({
        success: true,
        message: "All products are adequately stocked",
        count: 0,
      });
    }
  } catch (error) {
    console.error("Error checking stock alerts:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get inventory by category
export const getInventoryByCategory = async (req, res) => {
  try {
    const products = await Product.find({ isPublished: true }).populate(
      "category",
      "name"
    );

    const categoryInventory = {};

    products.forEach((product) => {
      const categoryName = product.category?.name || "Uncategorized";

      if (!categoryInventory[categoryName]) {
        categoryInventory[categoryName] = {
          totalVariants: 0,
          totalStock: 0,
          lowStockCount: 0,
          outOfStockCount: 0,
        };
      }

      product.variants.forEach((variant) => {
        categoryInventory[categoryName].totalVariants++;
        categoryInventory[categoryName].totalStock += variant.stock;

        if (variant.stock === 0) {
          categoryInventory[categoryName].outOfStockCount++;
        } else if (variant.stock <= variant.lowStockThreshold) {
          categoryInventory[categoryName].lowStockCount++;
        }
      });
    });

    res.json({
      success: true,
      data: categoryInventory,
    });
  } catch (error) {
    console.error("Error fetching inventory by category:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get product stock history (for future implementation with stock movement tracking)
export const getStockMovementHistory = async (req, res) => {
  try {
    const { productId } = req.params;

    // This is a placeholder for future implementation
    // You would need to create a StockMovement model to track changes

    res.json({
      success: true,
      message: "Stock movement history feature coming soon",
      data: [],
    });
  } catch (error) {
    console.error("Error fetching stock movement history:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

export default {
  getAllInventory,
  getLowStockProducts,
  getInventorySummary,
  updateVariantStock,
  bulkUpdateStock,
  checkAndSendStockAlerts,
  getInventoryByCategory,
  getStockMovementHistory,
};
