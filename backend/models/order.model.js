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
    guestEmail: {
      type: String,
    }, // For sending order emails to guests
    orderNumber: {
      type: String,
      unique: true,
    }, // Unique order number for tracking
    orderItems: [orderItemSchema],
    shippingAddress: {
      fullName: { type: String, required: true },
      address: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      postalCode: { type: String, required: true },
      country: { type: String, required: true },
      phoneNumber: { type: String, required: true },
    },
    paymentMethod: {
      type: String,
      enum: ["bank-transfer", "paystack", "paypal"], // Supported payment methods
    },
    totalPrice: {
      type: Number,
      required: true,
    },
    totalAmount: {
      type: Number,
      required: true,
    }, // Total including delivery
    deliveryCost: {
      type: Number,
      default: 0,
    }, // Calculated delivery cost from Dijkstra
    deliveryTime: {
      type: String,
    }, // Estimated delivery time (e.g., "2-3 days")
    estimatedDeliveryDate: {
      type: Date,
    }, // Calculated delivery date
    isFreeShipping: {
      type: Boolean,
      default: false,
    },
    customerLocation: {
      state: { type: String },
      city: { type: String },
      distance: { type: Number }, // Distance from Lagos in km
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
    confirmedAt: {
      type: Date,
    },
    shippedAt: {
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
