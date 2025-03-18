import express from "express"
import { admin, protectRoute } from "../middleware/protectRoute.js";
import { bestSeller, createProduct, deleteProduct, getAllProducts, getNewArrivals, similarProducts, singleProduct, updateProduct } from "../controllers/product.controller.js";

const router = express.Router();
router.get("/", getAllProducts)
router.get("/best-seller", bestSeller)
router.get("/new-arrivals", getNewArrivals)
router.get("/:id", singleProduct)
router.get("/similar/:id", similarProducts)
router.post("/", protectRoute, admin, createProduct);
router.put("/:id", protectRoute, admin, updateProduct);
router.delete("/:id", protectRoute, admin, deleteProduct);


export default router