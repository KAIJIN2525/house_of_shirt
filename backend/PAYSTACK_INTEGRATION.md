# Paystack Payment Integration Guide

## Overview

This guide explains how Paystack payment integration works in the House of Shirt e-commerce application.

## Backend Setup

### 1. Environment Variables

Add these to your `.env` file:

```env
PAYSTACK_SECRET_KEY=sk_test_xxxxxxxxxxxxxxxxxxxxx
PAYSTACK_PUBLIC_KEY=pk_test_xxxxxxxxxxxxxxxxxxxxx
```

Get your API keys from: https://dashboard.paystack.com/#/settings/developers

### 2. API Endpoints

#### Verify Paystack Payment

**POST** `/api/checkout/verify-paystack`

Verifies a Paystack payment transaction and updates checkout status.

**Headers:**

```
Authorization: Bearer <JWT_TOKEN>
```

**Request Body:**

```json
{
  "reference": "paystack_transaction_reference",
  "checkoutId": "checkout_mongodb_id"
}
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "Payment verified successfully",
  "checkout": {
    "_id": "...",
    "paymentStatus": "success",
    "isPaid": true,
    "paidAt": "2025-11-15T10:30:00.000Z",
    "paymentDetails": {
      "transactionId": "paystack_reference",
      "paymentGateway": "paystack",
      "amount": 25000,
      "currency": "NGN",
      "paymentResponse": {
        "reference": "...",
        "status": "success",
        "channel": "card",
        "paid_at": "...",
        "customer": {
          "email": "user@example.com"
        }
      }
    }
  },
  "paymentData": {
    "reference": "...",
    "amount": 25000,
    "currency": "NGN",
    "status": "success"
  }
}
```

**Error Response (400):**

```json
{
  "error": "Payment verification failed",
  "status": "failed"
}
```

## Payment Flow

### 1. User Initiates Checkout

```
Frontend → POST /api/checkout
Backend creates checkout record with paymentStatus: "pending"
```

### 2. User Selects Paystack Payment

```
Frontend → PUT /api/checkout/:id/payment
Backend updates checkout.paymentMethod = "paystack"
```

### 3. Frontend Initiates Paystack Payment

```javascript
// Frontend uses @paystack/inline-js
const paystack = new PaystackPop();
paystack.newTransaction({
  key: VITE_PAYSTACK_PUBLIC_KEY,
  email: user.email,
  amount: totalPrice * 100, // Convert to kobo
  ref: new Date().getTime().toString(),
  onSuccess: (response) => {
    // Call backend verification
    verifyPayment(response.reference);
  },
});
```

### 4. Backend Verifies Payment

```
Frontend → POST /api/checkout/verify-paystack
Backend:
  1. Calls Paystack API to verify transaction
  2. Validates amount matches checkout total
  3. Updates stock quantities
  4. Updates checkout status to "success"
  5. Records payment details
```

### 5. Finalize Order

```
Frontend → POST /api/checkout/:id/finalize
Backend:
  1. Creates Order from Checkout
  2. Marks checkout as finalized
  3. Clears user's cart
  4. Returns order details
```

### 6. Show Order Confirmation

```
Frontend navigates to /order-confirmation
Displays order details and confirmation
```

## Stock Management

### Automatic Stock Updates

The backend automatically handles stock management:

1. **Paystack/PayPal Payments**: Stock is reduced immediately after payment verification
2. **Bank Transfer**: Stock is reduced when admin confirms payment
3. **Failed Payments**: Stock is restored if payment fails after being deducted

### Stock Update Logic

```javascript
// When payment succeeds
await updateStockForItems(checkout.checkoutItems);
// Reduces stock: Product.variants[].stock -= quantity

// When payment fails
await restoreStockForItems(checkout.checkoutItems);
// Restores stock: Product.variants[].stock += quantity
```

## Frontend Integration

### Redux Slice Action

```javascript
// frontend/src/redux/slices/checkoutSlice.js
export const verifyPaystackPayment = createAsyncThunk(
  "checkout/verifyPaystack",
  async ({ reference, checkoutId }, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${BACKEND_URL}/api/checkout/verify-paystack`,
        { reference, checkoutId },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("userToken")}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);
```

### Component Usage

```javascript
// In your PaystackButton component
const handlePaymentSuccess = async (response) => {
  try {
    // Verify payment with backend
    const result = await dispatch(
      verifyPaystackPayment({
        reference: response.reference,
        checkoutId: checkout._id,
      })
    ).unwrap();

    // Finalize checkout and create order
    const order = await dispatch(finalizeCheckout(checkout._id)).unwrap();

    // Navigate to confirmation page
    navigate("/order-confirmation");
    toast.success("Payment successful!");
  } catch (error) {
    toast.error(error.message || "Payment verification failed");
  }
};
```

## Error Handling

### Common Errors

1. **Payment Amount Mismatch**

```json
{
  "error": "Payment amount mismatch",
  "expected": 2500000,
  "received": 2400000
}
```

Solution: Ensure amount in kobo matches checkout total

2. **Payment Verification Failed**

```json
{
  "error": "Payment verification failed",
  "status": "failed"
}
```

Solution: Check Paystack transaction status on dashboard

3. **Insufficient Stock**

```json
{
  "error": "Insufficient stock for item 673d5e..."
}
```

Solution: Stock was sold out between checkout creation and payment

## Testing

### Test Cards (Paystack Test Mode)

- **Success**: 4084084084084081
- **Insufficient Funds**: 4084080000000408
- **Declined**: 4084084084084081 (with PIN 0000)

### Test Flow

1. Use test API keys (sk*test*... and pk*test*...)
2. Create checkout
3. Pay with test card
4. Verify payment on backend
5. Check order created successfully
6. Verify stock reduced in database

## Security Considerations

1. **Never expose secret key**: Use environment variables
2. **Verify on backend**: Always verify payments server-side
3. **Validate amounts**: Check transaction amount matches order total
4. **Check transaction status**: Ensure status is "success"
5. **Prevent double-spending**: Check if checkout is already finalized

## Production Checklist

- [ ] Replace test keys with live keys
- [ ] Update callback URLs to production domain
- [ ] Test with real (small amount) transactions
- [ ] Set up webhook for payment notifications
- [ ] Monitor Paystack dashboard for issues
- [ ] Enable 3D Secure for card payments
- [ ] Set up proper error logging
- [ ] Test refund process

## Webhook Setup (Optional but Recommended)

For production, set up webhooks to handle:

- Payment success notifications
- Payment failures
- Refund events
- Dispute notifications

Webhook URL: `https://yourdomain.com/api/webhooks/paystack`

## Support

- Paystack Documentation: https://paystack.com/docs
- Paystack Support: support@paystack.com
- Dashboard: https://dashboard.paystack.com
