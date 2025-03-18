import Checkout from "../models/checkout.model.js";
import Cart from "../models/cart.model.js";
import Product from "../models/product.model.js";
import Order from "../models/order.model.js";

// Checkout for logged in users
export const createCheckout = async (req, res) => {
  const { checkoutItems, shippingAddress, paymentMethod, totalPrice } =
    req.body;

    console.log("checkout", req.body)

  if (!checkoutItems || checkoutItems.length === 0) {
    return res.status(400).json({ error: "No checkout items provided" });
  }

  try {
    // Create a new checkout session for logged-in users
    const newCheckout = await Checkout.create({
      user: req.user._id, // Logged-in user's ID
      checkoutItems,
      shippingAddress,
      paymentMethod,
      totalPrice,
      paymentStatus: "pending",
      isPaid: false,
    });

    console.log(`Checkout created with ID: ${req.user._id}`);
    res.status(201).json({ checkout: newCheckout });
  } catch (error) {
    console.error("Error in createCheckout controller:", error.message);
    res.status(500).json({ error: error.message });
  }
};


// Checkout for guest users
export const createGuestCheckout = async (req, res) => {
  const { checkoutItems, shippingAddress, paymentMethod, totalPrice, guestId } =
    req.body;

  if (!checkoutItems || checkoutItems.length === 0) {
    return res.status(400).json({ error: "No checkout items provided" });
  }

  try {
    // Generate a new guestId if one isn't provided
    const guestUserId = guestId || "guest_" + new Date().getTime();

    // Create a new checkout session for guest users
    const newCheckout = await Checkout.create({
      guestId: guestUserId, // Guest user's ID
      checkoutItems,
      shippingAddress,
      paymentMethod,
      totalPrice,
      paymentStatus: "pending",
      isPaid: false,
    });

    console.log(`Guest checkout created with ID: ${guestUserId}`);
    res.status(201).json({
      checkout: newCheckout,
      guestId: guestUserId, // Send the guestId back to the client
    });
  } catch (error) {
    console.error("Error in createGuestCheckout controller:", error.message);
    res.status(500).json({ error: error.message });
  }
};

export const confirmBankTransfer = async (req, res) => {
  const {} =  req.params;
}

export const updateCheckout = async (req, res) => {
  const { paymentStatus, paymentDetails } = req.body;

  try {
    const checkout = await Checkout.findById(req.params.id);

    if (!checkout) {
      return res.status(404).json({ error: "Checkout not found" });
    }

    // Validate payment status
    if (!["pending", "success", "failed"].includes(paymentStatus)) {
      return res.status(400).json({ error: "Invalid payment status" });
    }

    // Update payment status and details
    checkout.paymentStatus = paymentStatus;
    checkout.paymentDetails = paymentDetails;

    if (paymentStatus === "success") {
      checkout.isPaid = true;
      checkout.paidAt = new Date();
    } else {
      checkout.isPaid = false;
      checkout.paidAt = null;
    }

    await checkout.save();

    res.status(200).json(checkout);
  } catch (error) {
    console.error("Error in updateCheckout controller:", error.message);
    res.status(500).json({ error: error.message });
  }
};

// Finalize route
export const finalizeCheckout = async (req, res) => {
  try {
    const checkout = await Checkout.findById(req.params.id);

    if (!checkout) {
      return res.status(404).json({ message: "Checkout not found" });
    }

    // Ensure the checkout is paid and not already finalized
    if (!checkout.isPaid) {
      return res.status(400).json({ message: "Checkout not paid" });
    }

    if (checkout.isFinalized) {
      return res.status(400).json({ message: "Checkout already finalized" });
    }

    // Create final order based on the checkout details
    const finalOrder = await Order.create({
      user: checkout.user, // Will be null for guest users
      guestId: checkout.guestId, // Will be null for logged-in users
      orderItems: checkout.checkoutItems, // Use checkoutItems from the checkout
      shippingAddress: checkout.shippingAddress,
      paymentMethod: checkout.paymentMethod,
      totalPrice: checkout.totalPrice,
      paymentStatus: checkout.paymentStatus,
      isPaid: checkout.isPaid,
      paidAt: checkout.paidAt,
      isDelivered: false, // Default value
      paymentDetails: checkout.paymentDetails,
    });

    // Mark checkout as finalized
    checkout.isFinalized = true;
    checkout.finalizedAt = new Date();
    await checkout.save();

    // Delete the cart associated with the checkout (if applicable)
    if (checkout.user) {
      await Cart.deleteOne({ user: checkout.user });
    } else if (checkout.guestId) {
      await Cart.deleteOne({ guestId: checkout.guestId });
    }

    console.log("Final Order Created:", finalOrder); // Debug: Check the final order
    res.status(201).json(finalOrder);
  } catch (error) {
    console.error("Error in finalizeCheckout controller:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
