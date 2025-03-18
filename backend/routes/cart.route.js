import express from "express";
import { protectRoute } from "../middleware/protectRoute.js";
import {
  addToCart,
  deleteFromCart,
  getCartData,
  mergeCart,
  updateQuantityInCart,
} from "../controllers/cart.controller.js";

const router = express.Router();

router.post("/", addToCart);
router.put("/", updateQuantityInCart);
router.delete("/", deleteFromCart);
router.get("/", getCartData);
router.post("/merge",protectRoute, mergeCart)

export default router;
