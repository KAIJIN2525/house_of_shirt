import express from "express";
import { admin, protectRoute } from "../middleware/protectRoute.js";
import { createTag, deleteTag, getAllTags, updateTag } from "../controllers/tag.controller.js";

const router = express.Router();

router.get("/", getAllTags)
router.post("/", protectRoute, admin, createTag);
router.delete("/:id", protectRoute, admin, deleteTag);
router.put("/:id", protectRoute, admin, updateTag);


export default router