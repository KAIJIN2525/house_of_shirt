import Order from "../models/order.model.js";
import { sendOrderStatusEmail } from "../config/email.js";

export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find({}).populate("user", "name email");
    res.json(orders);
  } catch (error) {
    console.error("Error in getAllOrders controller:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const updateOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate(
      "user",
      "name email"
    );
    if (order) {
      const oldStatus = order.status;
      const newStatus = req.body.status || order.status;

      order.status = newStatus;
      order.isDelivered = newStatus === "Delivered" ? true : order.isDelivered;
      order.deliveredAt =
        newStatus === "Delivered" ? Date.now() : order.deliveredAt;

      // Add timestamps for status changes
      if (newStatus === "Processing" && oldStatus !== "Processing") {
        order.confirmedAt = Date.now();
      }
      if (newStatus === "Shipped" && oldStatus !== "Shipped") {
        order.shippedAt = Date.now();
      }

      const updatedOrder = await order.save();

      // Send email based on status change
      try {
        if (oldStatus !== newStatus) {
          // Map order status to email status
          const emailStatusMap = {
            Processing: "confirmed",
            Shipped: "shipped",
            Delivered: "delivered",
          };

          const emailStatus = emailStatusMap[newStatus];
          if (emailStatus) {
            await sendOrderStatusEmail(updatedOrder, emailStatus);
          }
        }
      } catch (emailError) {
        console.error("Failed to send order status email:", emailError);
        // Don't fail the update if email fails
      }

      res.json(updatedOrder);
    } else {
      return res.status(404).json({ message: "Order not found" });
    }
  } catch (error) {
    console.error("Error in updateOrder controller:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const deleteOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (order) {
      await order.deleteOne();
      res.json({ message: "Order Removed" });
    }
  } catch (error) {
    console.error("Error in deleteOrder controller:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
