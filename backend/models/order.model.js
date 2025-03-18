import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    size: String,
    color: String,
    quantity: {
      type: Number,
      required: true,
    },
  },
  { _id: false }
);

const paymentDetailsSchema = new mongoose.Schema(
  {
    transactionId: { type: String }, // Transaction ID from the payment gateway
    paymentGateway: { type: String }, // e.g., "Paystack", "PayPal", "Bank Transfer"
    paymentResponse: { type: mongoose.Schema.Types.Mixed }, // Raw response from the payment gateway
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    }, // For logged-in users (optional)
    guestId: {
      type: String,
    }, // For guest users
    orderItems: [orderItemSchema],
    shippingAddress: {
      address: { type: String, required: true },
      city: { type: String, required: true },
      postalCode: { type: String, required: true },
      country: { type: String, required: true },
    },
    paymentMethod: {
      type: String,
      enum: ["bank-transfer", "paystack", "paypal"], // Supported payment methods
    },
    totalPrice: {
      type: Number,
      required: true,
    },
    isPaid: {
      type: Boolean,
      default: false,
    },
    paidAt: {
      type: Date,
    },
    isDelivered: {
      type: Boolean,
      default: false,
    },
    deliveredAt: {
      type: Date,
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "unconfirmed", "success", "failed"], // Add "unconfirmed" status
      default: "pending",
    },
    paymentDetails: paymentDetailsSchema, // Store payment-specific details
    status: {
      type: String,
      enum: ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"], // Order statuses
      default: "Pending",
    },
  },
  { timestamps: true }
);

const Order = mongoose.model("Order", orderSchema);

export default Order;
