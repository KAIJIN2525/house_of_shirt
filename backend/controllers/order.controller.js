import Order from "../models/order.model.js";

export const getAllOrders = async (req, res) => {
  try {
    let orders;

    // Check if the user is logged in
    if (req.user) {
      // Fetch orders for logged-in users
      orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    } else {
      // Fetch orders for guest users using guestId from localStorage or cookies
      const guestId = req.headers["guest-id"]; // Pass guestId in the request headers
      if (!guestId) {
        return res.status(400).json({ message: "Guest ID is required" });
      }

      orders = await Order.find({ guestId }).sort({ createdAt: -1 });
    }

    res.json(orders);
  } catch (error) {
    console.error("Error in getAllOrders controller:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getSingleOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Check if the order belongs to the logged-in user or guest
    if (req.user) {
      // Logged-in user: Check if the order belongs to them
      if (order.user && order.user.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: "Not authorized" });
      }
    } else {
      // Guest user: Check if the order belongs to them using guestId
      const guestId = req.headers["guest-id"]; // Pass guestId in the request headers
      if (!guestId || order.guestId !== guestId) {
        return res.status(403).json({ message: "Not authorized" });
      }
    }

    // Populate user details if the order belongs to a logged-in user
    if (order.user) {
      await order.populate("user", "name email");
    }

    res.json(order);
  } catch (error) {
    console.error("Error in getSingleOrder controller:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const confirmBankTransfer = async (req, res) => {
  const { orderId } = req.params;

  try {
    // Find the order by ID
    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Check if the order is a bank transfer order
    if (order.paymentMethod !== "bank-transfer") {
      return res.status(400).json({ message: "This order is not a bank transfer order" });
    }

    // Update the payment status to "unconfirmed"
    order.paymentStatus = "unconfirmed";
    await order.save();

    res.status(200).json({ message: "Bank transfer confirmed. Awaiting admin approval.", order });
  } catch (error) {
    console.error("Error in confirmBankTransfer controller:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const associateGuestOrders = async (req, res) => {
  const { userId, guestId } = req.body;

  try {
    // Find all orders with the guestId
    const orders = await Order.find({ guestId });

    // Update the orders with the new userId
    for (const order of orders) {
      order.user = userId;
      order.guestId = null; // Remove the guestId
      await order.save();
    }

    res.status(200).json({ message: "Orders associated successfully" });
  } catch (error) {
    console.error("Error in associateGuestOrders controller:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const adminConfirmPayment = async (req, res) => {
  const { orderId } = req.params;

  try {
    // Find the order by ID
    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Check if the payment status is "unconfirmed"
    if (order.paymentStatus !== "unconfirmed") {
      return res.status(400).json({ message: "This order is not awaiting confirmation" });
    }

    // Update the payment status to "success"
    order.paymentStatus = "success";
    order.isPaid = true;
    order.paidAt = new Date();
    await order.save();

    res.status(200).json({ message: "Payment confirmed successfully", order });
  } catch (error) {
    console.error("Error in adminConfirmPayment controller:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


