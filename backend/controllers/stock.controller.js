import Product from "../models/product.model.js";

export const checkStock = async (req, res) => {
    try {
        const { productId, size, color } = req.query;
        const product = await Product.findById(productId);

        if (!product) return res.status(404).json({ message: "Product not found" });

        const inStock = product.isVariantInStock(size, color);
        const stockQuantity = product.getVariantStock(size, color);

        res.status(200).json({ inStock, stockQuantity });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}

export const updateStock = async (req, res) => {
    try {
        const { productId, size, color, quantity } = req.query;
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}