import express from "express";
import { protectRoute, admin } from "../middleware/protectRoute.js";
import { deleteOrder, getAllOrders, updateOrder } from "../controllers/admin.order.controller.js";

const router = express.Router();

router.get("/", protectRoute, admin, getAllOrders);
router.put("/:id", protectRoute, admin, updateOrder);
router.delete("/:id", protectRoute, admin, deleteOrder);



export default router   