import express from "express";
import {handleSubscription} from "../controllers/subscribe.controller.js"

const router = express.Router()

router.post("/", handleSubscription)


export default router;