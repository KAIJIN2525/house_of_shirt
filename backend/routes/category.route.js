import express from "express";
import { getAllCategories, createCategory, deleteCategory } from "../controllers/category.controller.js";
import { protectRoute } from "../middleware/protectRoute.js";

const router = express.Router();

router.post("/", protectRoute,createCategory)
router.get("/",getAllCategories);
router.delete("/:id", protectRoute,deleteCategory);

export default router;