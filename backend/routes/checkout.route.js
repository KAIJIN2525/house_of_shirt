import express from "express";
import {
  createCheckout,
  createGuestCheckout,
  finalizeCheckout,
  handlePaymentUpdate,
  confirmBankPayment,
  verifyPaystackPayment,
} from "../controllers/checkout.controller.js";
import { protectRoute } from "../middleware/protectRoute.js";

const router = express.Router();

// 1. Checkout Creation
router.post("/", protectRoute, createCheckout); // For logged-in users
router.post("/guest", createGuestCheckout); // For guest users

// 2. Payment Handling Routes
router.put("/:id/payment", protectRoute, handlePaymentUpdate); // Generic payment status updates

// Paystack
router.post("/verify-paystack", protectRoute, verifyPaystackPayment); // Paystack payment verification

// Bank Transfer
router.put("/:id/confirm-bank", protectRoute, confirmBankPayment); // Specific bank transfer confirmation

// 3. Order Finalization
router.post("/:id/finalize", protectRoute, finalizeCheckout);

export default router;
