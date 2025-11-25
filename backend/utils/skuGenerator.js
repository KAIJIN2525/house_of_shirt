/**
 * Generate a unique SKU based on product details
 * Format: PREFIX-GENDER-NUMBER
 * Example: TW-M-001, BW-W-012, SH-U-045
 */

import Product from "../models/product.model.js";

/**
 * Get SKU prefix based on category or product type
 */
const getSkuPrefix = (categoryName, productName) => {
  // Common prefixes based on category or product type
  const prefixMap = {
    // Tops/Shirts
    tops: "TW",
    shirts: "SH",
    blouses: "BL",
    "t-shirts": "TS",

    // Bottoms
    bottoms: "BW",
    pants: "PT",
    jeans: "JN",
    shorts: "SH",
    skirts: "SK",

    // Footwear
    footwear: "FW",
    shoes: "SH",
    sneakers: "SN",

    // Accessories
    accessories: "AC",

    // Default
    default: "PR",
  };

  // Check category name first
  if (categoryName) {
    const category = categoryName.toLowerCase();
    for (const [key, prefix] of Object.entries(prefixMap)) {
      if (category.includes(key)) {
        return prefix;
      }
    }
  }

  // Check product name
  if (productName) {
    const name = productName.toLowerCase();
    if (
      name.includes("shirt") ||
      name.includes("blouse") ||
      name.includes("top")
    ) {
      return "TW";
    }
    if (
      name.includes("pant") ||
      name.includes("jean") ||
      name.includes("trouser") ||
      name.includes("short")
    ) {
      return "BW";
    }
    if (
      name.includes("shoe") ||
      name.includes("sneaker") ||
      name.includes("boot")
    ) {
      return "FW";
    }
  }

  return "PR"; // Default prefix for "Product"
};

/**
 * Get gender code
 */
const getGenderCode = (gender) => {
  const genderMap = {
    Men: "M",
    Women: "W",
    Unisex: "U",
  };

  return genderMap[gender] || "U";
};

/**
 * Generate a unique SKU
 * @param {Object} productData - Product data containing name, gender, category
 * @returns {Promise<string>} - Generated unique SKU
 */
export const generateSKU = async (productData) => {
  try {
    const { name, gender, category } = productData;

    // Get category name if it's an ObjectId
    let categoryName = "";
    if (category) {
      const Category = (await import("../models/category.model.js")).default;
      const categoryDoc = await Category.findById(category);
      categoryName = categoryDoc?.name || "";
    }

    // Get prefix and gender code
    const prefix = getSkuPrefix(categoryName, name);
    const genderCode = getGenderCode(gender);

    // Find the last SKU with this prefix and gender
    const lastProduct = await Product.findOne({
      sku: new RegExp(`^${prefix}-${genderCode}-`, "i"),
    }).sort({ sku: -1 });

    let number = 1;
    if (lastProduct && lastProduct.sku) {
      // Extract the number from the last SKU
      const match = lastProduct.sku.match(/-(\d+)$/);
      if (match) {
        number = parseInt(match[1], 10) + 1;
      }
    }

    // Generate SKU with zero-padded number (3 digits)
    const sku = `${prefix}-${genderCode}-${String(number).padStart(3, "0")}`;

    return sku;
  } catch (error) {
    console.error("Error generating SKU:", error);
    // Return a fallback SKU with timestamp
    return `PR-U-${Date.now()}`;
  }
};

/**
 * Generate variant SKUs based on parent product SKU
 * Format: PARENT-SKU-SIZE-COLOR
 * Example: TW-M-001-S-RED, TW-M-001-M-BLUE
 */
export const generateVariantSKU = (productSku, size, color) => {
  const sizeCode = size.toUpperCase();
  const colorCode = color.toUpperCase().replace(/\s+/g, "-");

  return `${productSku}-${sizeCode}-${colorCode}`;
};

export default {
  generateSKU,
  generateVariantSKU,
};
