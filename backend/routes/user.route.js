import express from "express";
import User from "../models/user.model.js";
import jwt from "jsonwebtoken"
import { login, profile, signup } from "../controllers/user.controller.js";
import { protectRoute } from "../middleware/protectRoute.js";

const router  = express.Router();

router.post("/signup", signup)
router.post("/login", login)
router.get("/profile", protectRoute, profile)

export default router