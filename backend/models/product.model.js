import mongoose from "mongoose";

const variantSchema = new mongoose.Schema({
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
    },
}, { _id: false });

const productSchema = new mongoose.Schema({
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
    variants: [variantSchema], // Array of variants (size, color, stock)
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
}, { timestamps: true });

const Product = mongoose.model("Product", productSchema);

export default Product;