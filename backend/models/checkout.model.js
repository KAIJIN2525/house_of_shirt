import mongoose from "mongoose";

const checkoutItemSchema = new mongoose.Schema(
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
    quantity: {
      type: Number,
      required: true,
    },
    size: String,
    color: String,
  },
  { _id: false }
);

const paymentDetailsSchema = new mongoose.Schema(
  {
    transactionId: { type: String }, // Transaction ID from the payment gateway
    paymentGateway: { type: String }, // e.g., "Paystack", "PayPal", "Bank Transfer"
    amount: { type: Number }, // Amount paid
    currency: { type: String }, // Currency of the payment
    paymentResponse: { type: mongoose.Schema.Types.Mixed }, // Raw response from the payment gateway
  },
  { _id: false }
);

const checkoutSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    }, // For logged-in users (optional)
    guestId: {
      type: String,
    }, // For guest users
    checkoutItems: [checkoutItemSchema],
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
    paymentStatus: {
      type: String,
      enum: ["pending","unconfirmed", "success", "failed"], // Payment statuses
      default: "pending",
    },
    paymentDetails: paymentDetailsSchema, // Store payment-specific details
    isFinalized: {
      type: Boolean,
      default: false,
    },
    finalizedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

const Checkout = mongoose.model("Checkout", checkoutSchema);

export default Checkout;
