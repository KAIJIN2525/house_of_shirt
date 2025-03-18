import express from "express";
import {
  createCheckout,
  createGuestCheckout,
  finalizeCheckout,
  updateCheckout,
} from "../controllers/checkout.controller.js";
import { protectRoute } from "../middleware/protectRoute.js";
import Checkout from "../models/checkout.model.js";

const router = express.Router();

router.post("/", protectRoute, createCheckout);
router.post("/guest", createGuestCheckout);
// Backend route to update checkout with payment method
router.put("/:id", async (req, res) => {
  const { paymentMethod } = req.body;

  console.log("Request Body:", req.body); // Debug: Check the request payload

  try {
    const checkout = await Checkout.findById(req.params.id);

    if (!checkout) {
      return res.status(404).json({ error: "Checkout not found" });
    }

    checkout.paymentMethod = paymentMethod; // Ensure this line is present
    await checkout.save();

    res.status(200).json(checkout);
  } catch (error) {
    console.error("Error updating checkout:", error);
    res.status(500).json({ error: error.message });
  }
});
router.put("/:id/pay", protectRoute, updateCheckout);
router.post("/:id/finalize", protectRoute, finalizeCheckout);

export default router;
