# Paystack Payment Flow - Visual Guide

## Complete Payment Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                          USER JOURNEY                                │
└─────────────────────────────────────────────────────────────────────┘

1. ADD TO CART
   User: Selects products → Adds to cart
   Frontend: Updates Redux cart state

   ↓

2. CHECKOUT PAGE
   User: Clicks "Checkout"
   Frontend: Shows Checkout.jsx form
   User: Fills shipping address

   ↓

3. CREATE CHECKOUT
   User: Clicks "Continue to Payment"
   Frontend: dispatch(createCheckout(data))
   Backend: POST /api/checkout
   ┌──────────────────────────────┐
   │ Creates Checkout Document:   │
   │ - checkoutItems              │
   │ - shippingAddress            │
   │ - totalPrice                 │
   │ - paymentStatus: "pending"   │
   │ - isPaid: false              │
   └──────────────────────────────┘

   ↓

4. SELECT PAYMENT METHOD
   User: Selects "Paystack"
   Frontend: dispatch(updatePaymentStatus({
               checkoutId,
               status: "pending",
               paymentDetails: { paymentMethod: "paystack" }
             }))
   Backend: PUT /api/checkout/:id/payment

   ↓

5. INITIATE PAYMENT
   User: Clicks "Pay with Paystack"
   Frontend: PaystackButton.jsx
   ┌──────────────────────────────┐
   │ Opens Paystack Popup:        │
   │ - Email: user.email          │
   │ - Amount: total * 100 (kobo) │
   │ - Ref: timestamp             │
   └──────────────────────────────┘

   ↓

6. USER COMPLETES PAYMENT
   User: Enters card details on Paystack
   Paystack: Processes payment
   Paystack: Returns response {
     reference: "ref_abc123",
     status: "success",
     transaction: "12345"
   }

   ↓

7. VERIFY PAYMENT (BACKEND)
   Frontend: dispatch(verifyPaystackPayment({
               reference: "ref_abc123",
               checkoutId: checkout._id
             }))
   Backend: POST /api/checkout/verify-paystack

   ┌──────────────────────────────────────────────────┐
   │ Backend Verification Process:                     │
   │                                                   │
   │ 1. Receive reference from frontend               │
   │ 2. Call Paystack API:                            │
   │    GET https://api.paystack.co/transaction/      │
   │        verify/{reference}                        │
   │    Authorization: Bearer sk_test_...             │
   │                                                   │
   │ 3. Paystack Returns:                             │
   │    {                                             │
   │      status: "success",                          │
   │      amount: 2500000, // kobo                    │
   │      currency: "NGN",                            │
   │      customer: { email: "..." }                  │
   │    }                                             │
   │                                                   │
   │ 4. Validate:                                     │
   │    ✓ Status is "success"                         │
   │    ✓ Amount matches checkout total               │
   │    ✓ Transaction is legitimate                   │
   │                                                   │
   │ 5. Update Stock (Atomic Transaction):            │
   │    For each item in checkout:                    │
   │      Product.variants[size][color].stock -= qty  │
   │                                                   │
   │ 6. Update Checkout:                              │
   │    - paymentStatus: "success"                    │
   │    - isPaid: true                                │
   │    - paidAt: now                                 │
   │    - paymentDetails: {                           │
   │        transactionId: reference,                 │
   │        paymentGateway: "paystack",               │
   │        amount: amount / 100,                     │
   │        currency: "NGN",                          │
   │        paymentResponse: {...}                    │
   │      }                                            │
   │                                                   │
   │ 7. Return Success ✅                             │
   └──────────────────────────────────────────────────┘

   ↓

8. FINALIZE CHECKOUT
   Frontend: dispatch(finalizeCheckout(checkout._id))
   Backend: POST /api/checkout/:id/finalize

   ┌──────────────────────────────────────────────────┐
   │ Create Order from Checkout:                      │
   │                                                   │
   │ 1. Verify checkout.isPaid = true                 │
   │ 2. Create Order document:                        │
   │    {                                             │
   │      user: checkout.user,                        │
   │      orderItems: checkout.checkoutItems,         │
   │      shippingAddress: checkout.shippingAddress,  │
   │      paymentMethod: "paystack",                  │
   │      paymentStatus: "success",                   │
   │      isPaid: true,                               │
   │      paidAt: "2025-11-15...",                    │
   │      paymentDetails: {...},                      │
   │      totalPrice: 25000,                          │
   │      status: "Pending"                           │
   │    }                                             │
   │                                                   │
   │ 3. Mark checkout.isFinalized = true              │
   │ 4. Delete user's cart                            │
   │ 5. Return order ✅                               │
   └──────────────────────────────────────────────────┘

   ↓

9. SHOW ORDER CONFIRMATION
   Frontend: navigate("/order-confirmation")
   Shows: OrderConfirmation.jsx
   ┌──────────────────────────────┐
   │ Order Confirmation Page:     │
   │ - Order ID                   │
   │ - Order date                 │
   │ - Estimated delivery         │
   │ - Items ordered              │
   │ - Payment method: Paystack   │
   │ - Delivery address           │
   │ - Total amount               │
   └──────────────────────────────┘

   ↓

✅ COMPLETE!


┌─────────────────────────────────────────────────────────────────────┐
│                     DATABASE STATE CHANGES                           │
└─────────────────────────────────────────────────────────────────────┘

BEFORE PAYMENT:
├─ Checkout: { paymentStatus: "pending", isPaid: false }
├─ Product Stock: { variants[0].stock: 100 }
└─ Cart: { products: [3 items] }

AFTER PAYMENT VERIFICATION:
├─ Checkout: { paymentStatus: "success", isPaid: true, paymentDetails: {...} }
├─ Product Stock: { variants[0].stock: 97 } ⬅ Reduced by 3
└─ Cart: [unchanged]

AFTER FINALIZATION:
├─ Checkout: { isFinalized: true, finalizedAt: "..." }
├─ Order: [NEW] { orderItems: [...], paymentStatus: "success" }
├─ Product Stock: [unchanged] ⬅ Already updated
└─ Cart: [DELETED] ⬅ Cleared


┌─────────────────────────────────────────────────────────────────────┐
│                        ERROR SCENARIOS                               │
└─────────────────────────────────────────────────────────────────────┘

❌ Payment Failed on Paystack
   → Paystack returns status: "failed"
   → onError callback triggered
   → User sees: "Payment was cancelled by user"
   → No stock update
   → Checkout remains pending

❌ Payment Verification Failed
   → Backend can't verify with Paystack API
   → Returns 400 error
   → User sees: "Payment verification failed"
   → No stock update
   → Checkout remains pending

❌ Amount Mismatch
   → Paid amount ≠ checkout total
   → Backend returns: "Payment amount mismatch"
   → User sees error message
   → No stock update
   → Investigation required

❌ Insufficient Stock
   → Stock sold out between checkout creation and payment
   → Stock update transaction fails
   → Backend returns: "Insufficient stock for item"
   → User sees error
   → Payment succeeded but order can't be fulfilled
   → Manual refund required

❌ Checkout Not Found
   → Invalid checkout ID
   → Backend returns 404
   → User sees: "Checkout not found"
   → Check frontend state


┌─────────────────────────────────────────────────────────────────────┐
│                      API ENDPOINTS USED                              │
└─────────────────────────────────────────────────────────────────────┘

1. POST   /api/checkout
   Creates initial checkout session

2. PUT    /api/checkout/:id/payment
   Updates payment method selection

3. POST   /api/checkout/verify-paystack ⭐ NEW
   Verifies Paystack payment with API

4. POST   /api/checkout/:id/finalize
   Creates order from verified checkout


┌─────────────────────────────────────────────────────────────────────┐
│                    REDUX STATE CHANGES                               │
└─────────────────────────────────────────────────────────────────────┘

Initial:
checkout: {
  checkout: null,
  loading: false,
  error: null,
  paymentStatus: "pending"
}

After createCheckout:
checkout: {
  checkout: { _id: "...", paymentStatus: "pending" },
  loading: false,
  error: null,
  paymentStatus: "pending"
}

After verifyPaystackPayment:
checkout: {
  checkout: { _id: "...", paymentStatus: "success", isPaid: true },
  loading: false,
  error: null,
  paymentStatus: "success" ⬅ Updated
}

After finalizeCheckout:
checkout: {
  checkout: { /* Order object */ },
  loading: false,
  error: null,
  paymentStatus: "success"
}
```

## Key Points

### ✅ What Makes This Implementation Secure

1. **Backend Verification**: Payment is verified server-side with Paystack API
2. **Amount Validation**: Backend checks paid amount matches order total
3. **Atomic Stock Updates**: Uses MongoDB transactions for consistency
4. **No Frontend Trust**: Frontend can't fake payment success
5. **Secret Key Protected**: Never sent to browser

### ✅ What Makes This Implementation Robust

1. **Error Handling**: Every step has error handling
2. **Transaction Safety**: Stock updates rollback on failure
3. **Idempotency**: Can't finalize same checkout twice
4. **State Tracking**: Clear payment status at every step
5. **User Feedback**: Toast messages for all actions

### ✅ What Makes This Implementation User-Friendly

1. **Clear Flow**: Simple checkout process
2. **Real-time Updates**: Loading states and feedback
3. **Error Messages**: User-friendly error descriptions
4. **Order Confirmation**: Complete order details displayed
5. **Cart Cleared**: Automatic cleanup after purchase
