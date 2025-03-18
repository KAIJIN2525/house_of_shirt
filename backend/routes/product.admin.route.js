import express from "express";
import { admin, protectRoute } from "../middleware/protectRoute.js";
import { getAllProducts } from "../controllers/product.admin.controller.js";

const router  = express.Router();

router.get("/", protectRoute, admin, getAllProducts)


export default router;