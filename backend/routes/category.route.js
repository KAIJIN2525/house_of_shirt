import express from "express";
import {
  getAllCategories,
  createCategory,
  deleteCategory,
  updateCategory,
} from "../controllers/category.controller.js";
import { admin, protectRoute } from "../middleware/protectRoute.js";

const router = express.Router();

router.get("/", getAllCategories);
router.post("/",  protectRoute, admin, createCategory);
router.delete("/:id", protectRoute, deleteCategory);
router.put("/:id", protectRoute, admin, updateCategory);

export default router;
