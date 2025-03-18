import express from "express";
import { protectRoute, admin } from "../middleware/protectRoute.js";
import {
  addNewUser,
  deleteUser,
  getAllUsers,
  updateUser,
} from "../controllers/admin.controller.js";

const router = express.Router();

router.get("/", protectRoute, admin, getAllUsers);
router.post("/", protectRoute, admin, addNewUser);
router.put("/:id", protectRoute, admin, updateUser);
router.delete("/:id", protectRoute, admin, deleteUser);

export default router;
