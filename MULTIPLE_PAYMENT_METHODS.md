# Multiple Payment Methods Integration Guide

## Overview

This e-commerce application supports **4 payment methods**:

1. **Paystack** - Nigerian card payments
2. **Stripe** - International card payments
3. **PayPal** - PayPal account payments
4. **Bank Transfer** - Manual bank transfer with confirmation

## Environment Setup

### Backend `.env`

```env
# Paystack
PAYSTACK_SECRET_KEY=sk_test_xxxxx
PAYSTACK_PUBLIC_KEY=pk_test_xxxxx

# Stripe
STRIPE_SECRET_KEY=sk_test_xxxxx
STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx

# PayPal (if needed)
PAYPAL_CLIENT_ID=xxxxx
PAYPAL_CLIENT_SECRET=xxxxx

# Other required
JWT_SECRET=your_jwt_secret
SESSION_SECRET=your_session_secret
MONGODB_URI=your_mongodb_uri
FRONTEND_URL=http://localhost:5173
```

### Frontend `.env`

```env
VITE_BACKEND_URL=http://localhost:9000
VITE_PAYSTACK_PUBLIC_KEY=pk_test_xxxxx
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx
VITE_PAYPAL_CLIENT_ID=xxxxx
```

## Payment Flow for Each Method

### 1. Paystack (Nigerian Cards)

**Flow:**

```
User selects Paystack → Paystack popup opens → User enters card →
Payment succeeds → Backend verifies with Paystack API →
Stock updated → Order created
```

**Backend Endpoints:**

- `POST /api/checkout/verify-paystack`

**Frontend:**

- `PaystackButton.jsx` - Uses `@paystack/inline-js`
- Handles popup, card entry, and payment

**Test Cards:**

- Success: `4084 0840 8408 4081`
- Insufficient Funds: `4084 0800 0000 0408`

### 2. Stripe (International Cards)

**Flow:**

```
User selects Stripe → Backend creates PaymentIntent →
Frontend shows card form → User enters card →
Payment succeeds → Backend verifies →
Stock updated → Order created
```

**Backend Endpoints:**

- `POST /api/checkout/create-payment-intent` - Creates Stripe PaymentIntent
- `POST /api/checkout/verify-stripe` - Verifies payment

**Frontend:**

- `StripeButton.jsx` - Uses `@stripe/react-stripe-js`
- Embedded card form with CardElement

**Test Cards:**

- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`
- 3D Secure: `4000 0025 0000 3155`

### 3. PayPal

**Flow:**

```
User selects PayPal → PayPal SDK loads →
User logs into PayPal → Approves payment →
Backend receives confirmation → Stock updated → Order created
```

**Frontend:**

- `PaypalButton.jsx` - Uses `@paypal/react-paypal-js`
- Converts NGN to USD using exchange rate API

**Test Account:**

- Use PayPal Sandbox accounts from developer.paypal.com

### 4. Bank Transfer

**Flow:**

```
User selects Bank Transfer → Shows bank details →
User makes transfer → User confirms →
Admin verifies (later) → Order created with pending status
```

**Backend Endpoints:**

- `PUT /api/checkout/:id/confirm-bank` - User confirms transfer

**Frontend:**

- `BankTransferDetails.jsx` - Shows bank account details
- User checkbox confirmation required

**Note:** Bank transfers require manual admin verification

## API Endpoints Summary

### Checkout Creation

```
POST /api/checkout
POST /api/checkout/guest
```

### Payment Verification

```
POST /api/checkout/verify-paystack      # Paystack
POST /api/checkout/verify-stripe        # Stripe
POST /api/checkout/create-payment-intent # Stripe (step 1)
PUT  /api/checkout/:id/confirm-bank     # Bank Transfer
```

### Order Finalization

```
POST /api/checkout/:id/finalize
PUT  /api/checkout/:id/payment
```

## Code Implementation

### Redux Actions (checkoutSlice.js)

```javascript
// Paystack
export const verifyPaystackPayment = createAsyncThunk(...)

// Stripe
export const createStripePaymentIntent = createAsyncThunk(...)
export const verifyStripePayment = createAsyncThunk(...)

// Bank Transfer
export const confirmBankPayment = createAsyncThunk(...)

// Generic
export const finalizeCheckout = createAsyncThunk(...)
```

### Payment Method Selection (Checkout.jsx)

```jsx
<input
  type="radio"
  value="paystack"
  checked={paymentMethod === "paystack"}
  onChange={(e) => handlePaymentMethodChange(e.target.value)}
/>

<input
  type="radio"
  value="stripe"
  checked={paymentMethod === "stripe"}
  onChange={(e) => handlePaymentMethodChange(e.target.value)}
/>

<input
  type="radio"
  value="paypal"
  checked={paymentMethod === "paypal"}
  onChange={(e) => handlePaymentMethodChange(e.target.value)}
/>

<input
  type="radio"
  value="bank-transfer"
  checked={paymentMethod === "bank-transfer"}
  onChange={(e) => handlePaymentMethodChange(e.target.value)}
/>
```

### Conditional Rendering

```jsx
{
  paymentMethod === "paystack" && (
    <PaystackButton
      amount={cart.totalPrice}
      onSuccess={handlePaymentSuccess}
      onError={(error) => toast.error(error)}
    />
  );
}

{
  paymentMethod === "stripe" && (
    <StripeButton
      clientSecret={stripeClientSecret}
      onSuccess={handlePaymentSuccess}
      onError={(error) => toast.error(error.message)}
    />
  );
}

{
  paymentMethod === "paypal" && (
    <PaypalButton
      amount={cart.totalPrice}
      onSuccess={handlePaymentSuccess}
      onError={(error) => toast.error("PayPal payment failed")}
    />
  );
}

{
  paymentMethod === "bank-transfer" && (
    <BankTransferDetails
      amount={cart.totalPrice}
      onConfirm={handleBankTransferConfirmation}
      isLoading={loading}
    />
  );
}
```

## Payment Success Handler

```javascript
const handlePaymentSuccess = async (details) => {
  try {
    if (paymentMethod === "paystack") {
      await dispatch(verifyPaystackPayment({
        reference: details.reference,
        checkoutId: checkout._id,
      })).unwrap();
    }
    else if (paymentMethod === "stripe") {
      await dispatch(verifyStripePayment({
        paymentIntentId: details.id,
        checkoutId: checkout._id,
      })).unwrap();
    }
    else {
      await dispatch(updatePaymentStatus({
        checkoutId: checkout._id,
        status: "success",
        paymentDetails: {...}
      })).unwrap();
    }

    const result = await dispatch(finalizeCheckout(checkout._id)).unwrap();
    navigate("/order-confirmation", { state: { order: result } });
  } catch (error) {
    toast.error(error?.error || "Payment processing failed");
  }
};
```

## Stock Management

All payment methods (except bank transfer) automatically update stock:

1. **Paystack/Stripe/PayPal**: Stock reduced immediately after payment verification
2. **Bank Transfer**: Stock reduced when admin confirms payment

```javascript
// In backend controller
await updateStockForItems(checkout.checkoutItems);
```

## Security Features

### ✅ All Payment Methods

1. **Backend Verification**: All payments verified server-side
2. **Amount Validation**: Ensures paid amount matches order total
3. **Atomic Stock Updates**: Uses MongoDB transactions
4. **No Secret Keys in Frontend**: Only public keys sent to browser
5. **Double-spend Prevention**: Checks if checkout already finalized

### ✅ Paystack Security

- Server-side verification with Paystack API
- Transaction reference validation
- Amount in kobo verification

### ✅ Stripe Security

- PaymentIntent server-side creation
- Client secret regenerated per transaction
- Built-in 3D Secure support

### ✅ PayPal Security

- Server-side order capture
- PayPal handles all card data
- No PCI compliance needed

### ✅ Bank Transfer Security

- Manual admin verification required
- Reference number tracking
- Delayed stock update until confirmed

## Testing Each Payment Method

### Test Paystack

```bash
1. Select Paystack
2. Card: 4084 0840 8408 4081
3. CVV: 408
4. Expiry: 12/25
5. PIN: 0000
```

### Test Stripe

```bash
1. Select Stripe
2. Card: 4242 4242 4242 4242
3. CVV: any 3 digits
4. Expiry: any future date
5. ZIP: any 5 digits
```

### Test PayPal

```bash
1. Select PayPal
2. Login with PayPal Sandbox account
3. Approve payment
```

### Test Bank Transfer

```bash
1. Select Bank Transfer
2. Note bank details shown
3. Check "I confirm..." checkbox
4. Click Confirm Bank Transfer
```

## Error Handling

```javascript
// Toast notifications for all errors
toast.error("Payment failed");
toast.success("Payment successful!");
toast.warning("Please confirm transfer");

// Backend returns structured errors
{
  error: "Payment verification failed",
  status: "failed"
}
```

## Payment Status Flow

```
pending → success → finalized
pending → failed
pending → unconfirmed (bank transfer)
```

## Database Schema

### Checkout Model

```javascript
{
  paymentMethod: {
    type: String,
    enum: ["bank-transfer", "paystack", "stripe", "paypal"]
  },
  paymentStatus: {
    type: String,
    enum: ["pending", "unconfirmed", "success", "failed"]
  },
  paymentDetails: {
    transactionId: String,
    paymentGateway: String, // "paystack", "stripe", "paypal", "bank-transfer"
    amount: Number,
    currency: String,
    paymentResponse: Mixed
  }
}
```

## Production Checklist

- [ ] Replace all test keys with live keys
- [ ] Test each payment method with real small amounts
- [ ] Set up Stripe webhook for payment notifications
- [ ] Set up Paystack webhook for payment notifications
- [ ] Configure PayPal production credentials
- [ ] Update bank account details for transfers
- [ ] Set up proper error logging
- [ ] Add payment receipt emails
- [ ] Test refund processes
- [ ] Monitor payment dashboards

## Support Links

- **Paystack**: https://paystack.com/docs
- **Stripe**: https://stripe.com/docs
- **PayPal**: https://developer.paypal.com
- **Dashboard**: Check respective provider dashboards for transaction history
