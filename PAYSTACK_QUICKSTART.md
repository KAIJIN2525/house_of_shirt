# Paystack Payment - Quick Start Guide

## 🚀 Quick Setup (5 minutes)

### Step 1: Get Paystack API Keys

1. Go to https://dashboard.paystack.com
2. Sign up or login
3. Navigate to Settings → API Keys & Webhooks
4. Copy your **Test Public Key** and **Test Secret Key**

### Step 2: Configure Backend

Add to `backend/.env`:

```env
PAYSTACK_SECRET_KEY=sk_test_xxxxxxxxxxxxx
PAYSTACK_PUBLIC_KEY=pk_test_xxxxxxxxxxxxx
```

### Step 3: Configure Frontend

Add to `frontend/.env` or `frontend/.env.local`:

```env
VITE_PAYSTACK_PUBLIC_KEY=pk_test_xxxxxxxxxxxxx
VITE_BACKEND_URL=http://localhost:9000
```

### Step 4: Install Dependencies (Already Done)

```bash
# Backend
cd backend
npm install axios

# Frontend already has @paystack/inline-js
```

### Step 5: Test the Integration

1. Start backend: `cd backend && npm run dev`
2. Start frontend: `cd frontend && npm run dev`
3. Add product to cart
4. Go to checkout and fill details
5. Click "Continue to Payment"
6. Select Paystack
7. Use test card: **4084 0840 8408 4081**
8. Complete payment → Should see order confirmation

## 🎯 What Was Built

### Backend API

✅ `/api/checkout/verify-paystack` - Verifies Paystack payments  
✅ Stock management - Automatically updates inventory  
✅ Payment validation - Ensures amount and status are correct  
✅ Order creation - Converts checkout to order after payment

### Frontend Integration

✅ PaystackButton - Opens payment popup  
✅ Payment verification - Calls backend to verify  
✅ Error handling - Shows user-friendly messages  
✅ Order confirmation - Displays success page

## 🔄 Payment Flow (Simplified)

```
Cart → Checkout → Select Paystack → Pay → Verify → Order Created ✅
```

## 🧪 Test Cards

| Card Number         | Result                |
| ------------------- | --------------------- |
| 4084 0840 8408 4081 | ✅ Success            |
| 4084 0800 0000 0408 | ❌ Insufficient Funds |

**Note**: Use any CVV, any future expiry date

## 📝 Code Examples

### How Payment Works in Your Frontend

```javascript
// User clicks "Pay with Paystack"
const handlePayment = () => {
  const paystack = new PaystackPop();
  paystack.newTransaction({
    key: VITE_PAYSTACK_PUBLIC_KEY,
    email: user.email,
    amount: totalPrice * 100, // Kobo
    onSuccess: (response) => {
      // Verify with backend
      dispatch(
        verifyPaystackPayment({
          reference: response.reference,
          checkoutId: checkout._id,
        })
      );

      // Finalize order
      dispatch(finalizeCheckout(checkout._id));

      // Show confirmation
      navigate("/order-confirmation");
    },
  });
};
```

### How Verification Works on Backend

```javascript
// 1. Receive payment reference from frontend
// 2. Call Paystack API to verify
const response = await axios.get(
  `https://api.paystack.co/transaction/verify/${reference}`,
  { headers: { Authorization: `Bearer ${PAYSTACK_SECRET_KEY}` } }
);

// 3. Validate payment
if (response.data.data.status === "success") {
  // Update stock
  // Mark as paid
  // Save payment details
}
```

## ✨ Your Frontend Logic (As Implemented)

### Checkout Component

- Creates checkout session
- Allows payment method selection
- Calls `handlePaymentSuccess` when payment completes

### PaystackButton Component

- Uses user's email
- Converts amount to kobo
- Opens Paystack popup
- Returns payment reference on success

### Order Confirmation Page

- Shows order details
- Displays payment method
- Shows estimated delivery
- Clears cart

## 🔐 Security

✅ Backend validates all payments  
✅ Amount verification prevents fraud  
✅ Stock updates are atomic  
✅ Secret key never exposed to frontend

## 🎉 You're Ready!

Your Paystack integration is complete and ready to test. The flow matches your existing UI logic:

1. ✅ Error handling in place
2. ✅ Success messages configured
3. ✅ Order confirmation shows payment details
4. ✅ Stock management automated
5. ✅ Payment verification secured

## 🆘 Support

**Issues?** Check:

- Environment variables are set correctly
- Backend is running on port 9000
- Frontend can reach backend
- Using test mode keys (sk*test*, pk*test*)

**Still stuck?**

- Check browser console for errors
- Check backend terminal for logs
- Verify keys on Paystack dashboard
