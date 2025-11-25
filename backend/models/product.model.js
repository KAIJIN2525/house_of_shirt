import mongoose from "mongoose";

const variantSchema = new mongoose.Schema(
  {
    size: {
      type: String,
      required: true,
    },
    color: {
      type: String,
      required: true,
    },
    stock: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    sku: {
      type: String,
      unique: true,
    },
    lowStockThreshold: {
      type: Number,
      default: 5,
    },
  },
  { _id: false }
);

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      min: 0,
      required: true,
    },
    discountPrice: {
      type: Number,
      min: 0,
    },
    sku: {
      type: String,
      unique: true,
      required: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    brand: {
      type: String,
    },
    variants: [variantSchema],
    collections: {
      type: String,
      required: true,
    },
    material: {
      type: String,
    },
    gender: {
      type: String,
      enum: ["Men", "Women", "Unisex"],
    },
    images: [
      {
        url: {
          type: String,
          required: true,
        },
        altText: {
          type: String,
          required: true,
        },
      },
    ],
    isFeatured: {
      type: Boolean,
      default: false,
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
    tags: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Tag",
      },
    ],
    rating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
    },
    numReviews: {
      type: Number,
      default: 0,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    metaTitle: {
      type: String,
    },
    metaDescription: {
      type: String,
    },
    metaKeywords: {
      type: String,
    },
    dimensions: {
      length: Number,
      width: Number,
      height: Number,
    },
    weight: Number,
  },
  { timestamps: true }
);

// Generate SKU for variants before saving
productSchema.pre("save", function (next) {
  if (this.isModified("variants")) {
    this.variants.forEach((variant) => {
      if (!variant.sku) {
        variant.sku = `${this.sku}-${variant.size}-${variant.color}`
          .toUpperCase()
          .replace(/\s+/g, "-");
      }
    });
  }
  next();
});

// Low stock notification hook
productSchema.post("save", async function (doc) {
  const lowStockVariants = doc.variants.filter(
    (v) => v.stock <= v.lowStockThreshold
  );

  if (lowStockVariants.length > 0) {
    console.log(`Low stock alert for product ${doc.name}:`, lowStockVariants);
    // Implement your notification logic here
  }
});

// Stock management methods
productSchema.methods = {
  isVariantInStock: function (size, color) {
    const variant = this.variants.find(
      (v) => v.size === size && v.color === color
    );
    return variant ? variant.stock > 0 : false;
  },

  getVariantStock: function (size, color) {
    const variant = this.variants.find(
      (v) => v.size === size && v.color === color
    );
    return variant ? variant.stock : 0;
  },

  updateVariantStock: function (size, color, quantity) {
    const variant = this.variants.find(
      (v) => v.size === size && v.color === color
    );
    if (!variant) throw new Error("Variant not found");
    if (variant.stock + quantity < 0) throw new Error("Insufficient stock");

    variant.stock += quantity;
    return this.save();
  },

  getLowStockVariants() {
    return this.variants.filter((v) => v.stock <= v.lowStockThreshold);
  },
};

// Pre-save hook to auto-generate SKU if not provided
productSchema.pre("save", async function (next) {
  // Only generate SKU if it's a new product and no SKU is provided
  if (this.isNew && !this.sku) {
    try {
      const { generateSKU } = await import("../utils/skuGenerator.js");
      this.sku = await generateSKU({
        name: this.name,
        gender: this.gender,
        category: this.category,
      });
      console.log(`🔖 Pre-save: Auto-generated SKU: ${this.sku}`);
    } catch (error) {
      console.error("Error generating SKU in pre-save hook:", error);
      // Set a fallback SKU
      this.sku = `PR-U-${Date.now()}`;
    }
  }
  next();
});

const Product = mongoose.model("Product", productSchema);
export default Product;
