import express from "express";
import { admin, protectRoute } from "../middleware/protectRoute.js";
import { createTag, deleteTag, getAllTags } from "../controllers/tag.controller.js";

const router = express.Router();

router.get("/", protectRoute, admin, getAllTags)
router.post("/", protectRoute, admin, createTag);
router.get("/:id", protectRoute, admin, deleteTag);


export default router