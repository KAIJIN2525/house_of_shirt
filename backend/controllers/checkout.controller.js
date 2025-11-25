import Checkout from "../models/checkout.model.js";
import Cart from "../models/cart.model.js";
import Product from "../models/product.model.js";
import Order from "../models/order.model.js";
import User from "../models/user.model.js";
import mongoose from "mongoose";
import axios from "axios";
import deliveryService from "../services/delivery.service.js";
import { sendOrderStatusEmail } from "../config/email.js";

/* ========== HELPER FUNCTIONS ========== */
const updateStockForItems = async (items) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    for (const item of items) {
      const productId = item.productId || item.product;

      // Debug logging
      console.log("\n🔍 Checking stock for item:");
      console.log("  Product ID:", productId);
      console.log("  Name:", item.name);
      console.log("  Size:", item.size, "(type:", typeof item.size, ")");
      console.log("  Color:", item.color, "(type:", typeof item.color, ")");
      console.log("  Quantity:", item.quantity);

      // First check if product exists
      const product = await Product.findById(productId);
      if (!product) {
        throw new Error(`Product not found: ${item.name}`);
      }

      // Check if variant exists
      const variant = product.variants.find(
        (v) =>
          String(v.size) === String(item.size) &&
          String(v.color) === String(item.color)
      );

      if (!variant) {
        console.log("  ❌ Variant not found!");
        console.log(
          "  Available variants:",
          product.variants.map(
            (v) => `Size: ${v.size}, Color: ${v.color}, Stock: ${v.stock}`
          )
        );
        throw new Error(
          `Variant not found for ${item.name} (Size: ${item.size}, Color: ${item.color})`
        );
      }

      console.log("  ✅ Variant found - Current stock:", variant.stock);

      if (variant.stock < item.quantity) {
        throw new Error(
          `Insufficient stock for ${item.name} (${item.size}, ${item.color}). Available: ${variant.stock}, Requested: ${item.quantity}`
        );
      }

      const result = await Product.findOneAndUpdate(
        {
          _id: productId,
          "variants.size": String(item.size),
          "variants.color": String(item.color),
          "variants.stock": { $gte: item.quantity },
        },
        {
          $inc: { "variants.$.stock": -item.quantity },
        },
        { session, new: true }
      );

      if (!result) {
        throw new Error(
          `Failed to update stock for ${item.name || "item"} (${item.size}, ${
            item.color
          })`
        );
      }

      console.log("  ✅ Stock updated successfully");
    }

    await session.commitTransaction();
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

const restoreStockForItems = async (items) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    for (const item of items) {
      const productId = item.productId || item.product;
      await Product.findOneAndUpdate(
        {
          _id: productId,
          "variants.size": item.size,
          "variants.color": item.color,
        },
        {
          $inc: { "variants.$.stock": item.quantity },
        },
        { session }
      );
    }

    await session.commitTransaction();
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

/* ========== CONTROLLER FUNCTIONS ========== */
export const createCheckout = async (req, res) => {
  try {
    const { checkoutItems, shippingAddress, paymentMethod, totalPrice } =
      req.body;

    if (!checkoutItems?.length) {
      return res.status(400).json({ error: "No items in checkout" });
    }

    if (paymentMethod !== "bank-transfer") {
      await updateStockForItems(checkoutItems);
    }

    const newCheckout = await Checkout.create({
      user: req.user?._id,
      guestId: !req.user ? `guest_${Date.now()}` : null,
      checkoutItems,
      shippingAddress,
      paymentMethod,
      totalPrice,
      paymentStatus: paymentMethod === "bank-transfer" ? "pending" : "success",
      isPaid: paymentMethod !== "bank-transfer",
    });

    res.status(201).json({
      checkout: newCheckout,
      guestId: newCheckout.guestId,
    });
  } catch (error) {
    if (req.body.paymentMethod !== "bank-transfer") {
      await restoreStockForItems(req.body.checkoutItems).catch(console.error);
    }
    res.status(400).json({ error: error.message });
  }
};

export const createGuestCheckout = async (req, res) => {
  return createCheckout(req, res);
};

export const confirmBankPayment = async (req, res) => {
  try {
    const checkout = await Checkout.findById(req.params.id);
    if (!checkout) {
      return res.status(404).json({ error: "Checkout not found" });
    }

    if (checkout.paymentMethod !== "bank-transfer") {
      return res.status(400).json({ error: "Not a bank transfer checkout" });
    }

    await updateStockForItems(checkout.checkoutItems);

    checkout.paymentStatus = "success";
    checkout.isPaid = true;
    checkout.paidAt = new Date();
    await checkout.save();

    res.json({
      success: true,
      message: "Bank payment confirmed and stock updated",
      checkout,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const finalizeCheckout = async (req, res) => {
  try {
    const checkout = await Checkout.findById(req.params.id).populate("user");
    if (!checkout) return res.status(404).json({ error: "Checkout not found" });

    // Verify payment is successful before finalizing
    if (
      checkout.paymentStatus !== "success" &&
      checkout.paymentMethod !== "bank-transfer"
    ) {
      return res
        .status(400)
        .json({ error: "Payment must be completed before finalizing order" });
    }

    // Check if already finalized
    if (checkout.isFinalized) {
      return res.status(400).json({ error: "Checkout already finalized" });
    }

    // Update stock for bank transfer if not already done
    if (checkout.paymentMethod === "bank-transfer" && !checkout.isFinalized) {
      await updateStockForItems(checkout.checkoutItems);
    }

    // Calculate delivery cost and time
    const { state, city } = checkout.shippingAddress;
    const deliveryResult = deliveryService.calculateDelivery(
      state,
      city,
      "standard",
      checkout.totalPrice
    );

    let deliveryCost = 0;
    let isFreeShipping = false;
    let deliveryTime = "3-5 days";
    let estimatedDeliveryDate = null;
    let customerLocation = null;

    if (deliveryResult.success) {
      deliveryCost = deliveryResult.data.deliveryCost;
      isFreeShipping = deliveryResult.data.isFreeShipping || false;
      deliveryTime = deliveryResult.data.deliveryTime;
      estimatedDeliveryDate = deliveryResult.data.estimatedDeliveryDate;
      customerLocation = {
        state: deliveryResult.data.state,
        city: deliveryResult.data.city,
        distance: deliveryResult.data.distance,
      };
    }

    // Calculate total amount including delivery
    const totalAmount = checkout.totalPrice + deliveryCost;

    // Generate unique order number
    const orderNumber = `HS${Date.now().toString().slice(-8)}`;

    // Get user email
    let userEmail = null;
    if (checkout.user) {
      const user = await User.findById(checkout.user);
      userEmail = user?.email;
    }

    // Create order from checkout
    const order = await Order.create({
      user: checkout.user,
      guestId: checkout.guestId,
      guestEmail: checkout.guestEmail || userEmail,
      orderNumber,
      orderItems: checkout.checkoutItems.map((item) => ({
        productId: item.productId,
        name: item.name,
        image: item.image,
        price: item.price,
        quantity: item.quantity,
        size: item.size,
        color: item.color,
      })),
      shippingAddress: checkout.shippingAddress,
      paymentMethod: checkout.paymentMethod,
      totalPrice: checkout.totalPrice,
      totalAmount,
      deliveryCost,
      isFreeShipping,
      deliveryTime,
      estimatedDeliveryDate,
      customerLocation,
      paymentStatus: checkout.paymentStatus,
      isPaid: checkout.isPaid,
      paidAt: checkout.paidAt,
      paymentDetails: checkout.paymentDetails,
    });

    // Mark checkout as finalized
    checkout.isFinalized = true;
    checkout.finalizedAt = new Date();
    await checkout.save();

    // Clear the user's cart
    const cartFilter = checkout.user
      ? { user: checkout.user }
      : { guestId: checkout.guestId };
    await Cart.deleteOne(cartFilter);

    // Send order created email
    try {
      await sendOrderStatusEmail(order, "created");
    } catch (emailError) {
      console.error("Failed to send order created email:", emailError);
      // Don't fail the order if email fails
    }

    res.status(201).json(order);
  } catch (error) {
    console.error("Finalize checkout error:", error);
    res.status(400).json({ error: error.message });
  }
};

export const handlePaymentUpdate = async (req, res) => {
  try {
    const checkout = await Checkout.findById(req.params.id);
    if (!checkout) return res.status(404).json({ error: "Checkout not found" });

    const { status, paymentDetails } = req.body;

    // Update payment details if provided
    if (paymentDetails) {
      checkout.paymentDetails = {
        ...checkout.paymentDetails,
        ...paymentDetails,
      };
      checkout.paymentMethod =
        paymentDetails.paymentMethod || checkout.paymentMethod;
    }

    if (status === "success") {
      await updateStockForItems(checkout.checkoutItems);
      checkout.paymentStatus = "success";
      checkout.isPaid = true;
      checkout.paidAt = new Date();
    } else if (status === "failed" && checkout.isPaid) {
      await restoreStockForItems(checkout.checkoutItems);
      checkout.paymentStatus = "failed";
      checkout.isPaid = false;
      checkout.paidAt = null;
    } else if (status === "pending") {
      checkout.paymentStatus = "pending";
    }

    await checkout.save();
    res.json({ checkout });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

/* ========== PAYSTACK PAYMENT VERIFICATION ========== */
export const verifyPaystackPayment = async (req, res) => {
  try {
    const { reference, checkoutId } = req.body;

    if (!reference) {
      return res.status(400).json({ error: "Payment reference is required" });
    }

    // Verify payment with Paystack
    const response = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        },
      }
    );

    const paymentData = response.data.data;

    if (paymentData.status !== "success") {
      return res.status(400).json({
        error: "Payment verification failed",
        status: paymentData.status,
      });
    }

    // Find and update checkout
    const checkout = await Checkout.findById(checkoutId);
    if (!checkout) {
      return res.status(404).json({ error: "Checkout not found" });
    }

    // Verify amount matches
    const amountInKobo = checkout.totalPrice * 100;
    if (paymentData.amount !== amountInKobo) {
      return res.status(400).json({
        error: "Payment amount mismatch",
        expected: amountInKobo,
        received: paymentData.amount,
      });
    }

    // Update stock for items
    await updateStockForItems(checkout.checkoutItems);

    // Update checkout with payment details
    checkout.paymentStatus = "success";
    checkout.isPaid = true;
    checkout.paidAt = new Date();
    checkout.paymentDetails = {
      transactionId: paymentData.reference,
      paymentGateway: "paystack",
      amount: paymentData.amount / 100, // Convert back to Naira
      currency: paymentData.currency,
      paymentResponse: {
        reference: paymentData.reference,
        status: paymentData.status,
        channel: paymentData.channel,
        paid_at: paymentData.paid_at,
        customer: {
          email: paymentData.customer.email,
        },
      },
    };

    await checkout.save();

    res.json({
      success: true,
      message: "Payment verified successfully",
      checkout,
      paymentData: {
        reference: paymentData.reference,
        amount: paymentData.amount / 100,
        currency: paymentData.currency,
        status: paymentData.status,
      },
    });
  } catch (error) {
    console.error(
      "Paystack verification error:",
      error.response?.data || error.message
    );
    res.status(400).json({
      error: error.response?.data?.message || error.message,
      details: error.response?.data,
    });
  }
};
