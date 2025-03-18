import express from "express";
import { protectRoute } from "../middleware/protectRoute.js";
import { adminConfirmPayment, associateGuestOrders, confirmBankTransfer, getAllOrders, getSingleOrder } from "../controllers/order.controller.js";

const router = express.Router();

router.get("/my-orders", protectRoute, getAllOrders);
router.get("/my-orders/guest", getAllOrders);
// Route for fetching a single order (protected for logged-in users, public for guests)
router.get("/:id", (req, res, next) => {
    if (req.headers.authorization) {
      // If authorization header is present, use protectRoute middleware
      protectRoute(req, res, next);
    } else {
      // If no authorization header, proceed without protection (guest user)
      next();
    }
  }, getSingleOrder);

  router.post("/:orderId/confirm-bank-transfer", confirmBankTransfer);
  router.put("/:orderId/admin-confirm-payment", protectRoute, adminConfirmPayment);

router.post("/associate", protectRoute, associateGuestOrders);


export default router