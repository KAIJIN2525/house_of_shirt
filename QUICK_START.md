# Quick Start Guide - House of Shirt

## Prerequisites

- Node.js (v18 or higher)
- MongoDB (local or Atlas)
- npm or yarn

## Initial Setup

### 1. Clone and Install Dependencies

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 2. Configure Environment Variables

#### Backend Setup

```bash
cd backend
cp .env.example .env
```

Edit `backend/.env` with your actual values:

```env
# Required - Basic Setup
PORT=9000
MONGODB_URI=mongodb://localhost:27017/house-of-shirt
JWT_SECRET=your_random_secret_key_here
SESSION_SECRET=your_random_session_secret_here
FRONTEND_URL=http://localhost:5173

# Required - Google OAuth
GOOGLE_CLIENT_ID=xxxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=xxxxx
GOOGLE_CALLBACK_URL=http://localhost:9000/api/users/auth/google/callback

# Required - At least one payment gateway
PAYSTACK_SECRET_KEY=sk_test_xxxxx
PAYSTACK_PUBLIC_KEY=pk_test_xxxxx

STRIPE_SECRET_KEY=sk_test_xxxxx
STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx

# Optional
CLOUDINARY_CLOUD_NAME=xxxxx
CLOUDINARY_API_KEY=xxxxx
CLOUDINARY_API_SECRET=xxxxx
```

#### Frontend Setup

```bash
cd frontend
cp .env.example .env
```

Edit `frontend/.env`:

```env
VITE_BACKEND_URL=http://localhost:9000
VITE_PAYSTACK_PUBLIC_KEY=pk_test_xxxxx
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx
VITE_PAYPAL_CLIENT_ID=xxxxx
VITE_GOOGLE_CLIENT_ID=xxxxx.apps.googleusercontent.com
```

### 3. Get API Keys

#### Google OAuth (Required)

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project
3. Enable Google+ API
4. Go to Credentials → Create OAuth 2.0 Client ID
5. Add authorized redirect URI: `http://localhost:9000/api/users/auth/google/callback`
6. Copy Client ID and Client Secret

#### Paystack (For Nigerian Payments)

1. Sign up at [Paystack](https://paystack.com)
2. Go to Settings → API Keys & Webhooks
3. Copy Test Public Key and Test Secret Key
4. For production: Switch to Live keys

#### Stripe (For International Payments)

1. Sign up at [Stripe](https://stripe.com)
2. Go to Developers → API Keys
3. Copy Publishable Key and Secret Key
4. For production: Toggle to Live mode

#### PayPal (Optional)

1. Sign up at [PayPal Developer](https://developer.paypal.com)
2. Create a Sandbox app
3. Copy Client ID
4. For production: Create Live app

### 4. Initialize Database

```bash
cd backend

# Option 1: Seed with sample data
node seeder.js

# Option 2: Start with empty database (just run the server)
npm start
```

### 5. Start Development Servers

#### Terminal 1 - Backend

```bash
cd backend
npm start
```

Server runs on `http://localhost:9000`

#### Terminal 2 - Frontend

```bash
cd frontend
npm run dev
```

Frontend runs on `http://localhost:5173`

## Project Structure

```
House-of-Shirt/
├── backend/
│   ├── config/
│   │   ├── db.js              # MongoDB connection
│   │   └── passport.js        # Google OAuth config
│   ├── controllers/           # Business logic
│   │   ├── checkout.controller.js  # Payment processing
│   │   └── ...
│   ├── models/                # MongoDB schemas
│   ├── routes/                # API endpoints
│   ├── middleware/            # Auth & validation
│   └── server.js              # Entry point
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── Cart/          # Checkout & payment components
    │   │   ├── Admin/         # Admin dashboard
    │   │   └── Product/       # Product components
    │   ├── pages/             # Route pages
    │   ├── redux/             # State management
    │   └── App.jsx            # Main app
    └── package.json
```

## Testing the Application

### 1. Test Authentication

```
1. Navigate to http://localhost:5173
2. Click Login/Register
3. Try Google Sign In (should redirect and log you in)
4. Or create a local account
```

### 2. Test Product Browsing

```
1. Browse products on home page
2. Filter by category/tags
3. Search for products
4. Add items to cart
```

### 3. Test Payments

#### Test Paystack

```
Card: 4084 0840 8408 4081
CVV: 408
Expiry: 12/25
PIN: 0000
```

#### Test Stripe

```
Card: 4242 4242 4242 4242
CVV: Any 3 digits
Expiry: Any future date
ZIP: Any 5 digits
```

#### Test PayPal

```
Use PayPal Sandbox account from developer.paypal.com
```

## Common Issues & Solutions

### Issue: MongoDB Connection Failed

```bash
# Solution: Check if MongoDB is running
# For local MongoDB:
mongod

# For MongoDB Atlas:
# - Check connection string
# - Whitelist your IP address
# - Check credentials
```

### Issue: Google OAuth Not Working

```bash
# Solutions:
1. Check GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in backend/.env
2. Verify redirect URI matches exactly: http://localhost:9000/api/users/auth/google/callback
3. Check FRONTEND_URL is set to http://localhost:5173
4. Clear browser cache and cookies
```

### Issue: Payment Not Working

```bash
# Solutions:
1. Check if API keys are correct in .env files
2. Verify you're using TEST keys, not LIVE keys
3. Check browser console for errors
4. Verify VITE_BACKEND_URL is correct in frontend/.env
```

### Issue: CORS Errors

```bash
# Solution: Verify FRONTEND_URL in backend/.env matches your frontend URL
# Should be: http://localhost:5173
```

### Issue: Port Already in Use

```bash
# Backend (Port 9000)
# Windows:
netstat -ano | findstr :9000
taskkill /PID <PID> /F

# Frontend (Port 5173)
# Just choose a different port when prompted
```

## Admin Access

### Create Admin User

```javascript
// Connect to MongoDB and run:
db.users.updateOne(
  { email: "your-email@example.com" },
  { $set: { isAdmin: true } }
);
```

### Admin Features

- Product Management (CRUD)
- Order Management
- User Management
- Stock Management

Access admin panel: `http://localhost:5173/admin`

## Payment Method Configuration

### Which Payment Gateway to Use?

**Use Paystack if:**

- Primary customers are in Nigeria
- Need bank transfer support
- Want mobile money integration

**Use Stripe if:**

- International customers
- Need multi-currency support
- Want comprehensive fraud protection

**Use PayPal if:**

- Customers prefer PayPal accounts
- Need buyer protection
- Want simple integration

**Use Bank Transfer if:**

- Manual verification is acceptable
- Lower transaction fees needed
- Target market prefers bank transfers

## Production Deployment

### Backend (Recommended: Railway, Render, or Vercel)

1. **Set Environment Variables** (all from `.env.example`)
2. **Switch to Production API Keys**:
   - Paystack: Live keys
   - Stripe: Live keys
   - PayPal: Live Client ID
3. **Update FRONTEND_URL** to your deployed frontend URL
4. **Update GOOGLE_CALLBACK_URL** to your production URL

### Frontend (Recommended: Vercel, Netlify)

1. **Set Environment Variables**:
   - `VITE_BACKEND_URL` = Your backend URL
   - `VITE_PAYSTACK_PUBLIC_KEY` = Live public key
   - `VITE_STRIPE_PUBLISHABLE_KEY` = Live publishable key
2. **Build**: `npm run build`
3. **Deploy**: `dist/` folder

### Google OAuth Production

1. Add production callback URL in Google Console:
   - `https://your-backend.com/api/users/auth/google/callback`
2. Add authorized JavaScript origins:
   - `https://your-frontend.com`

## Security Checklist

- [ ] Never commit `.env` files
- [ ] Use strong JWT_SECRET and SESSION_SECRET
- [ ] Switch to HTTPS in production
- [ ] Validate all user inputs
- [ ] Use production API keys in production
- [ ] Set up webhook endpoints for payment gateways
- [ ] Enable MongoDB authentication
- [ ] Set proper CORS origins
- [ ] Implement rate limiting
- [ ] Regular security audits

## Resources

- [Full Documentation](./MULTIPLE_PAYMENT_METHODS.md)
- [Backend API Docs](#) - Coming soon
- [Frontend Component Docs](#) - Coming soon

## Support

For issues:

1. Check the [Common Issues](#common-issues--solutions) section
2. Review [MULTIPLE_PAYMENT_METHODS.md](./MULTIPLE_PAYMENT_METHODS.md)
3. Check console logs (browser & server)
4. Verify all environment variables

## Development Tips

```bash
# Run both servers concurrently (optional)
npm install -g concurrently
concurrently "cd backend && npm start" "cd frontend && npm run dev"

# Database GUI tools
# - MongoDB Compass (free GUI for MongoDB)
# - Prisma Studio: npm install -g prisma && prisma studio

# API Testing
# - Postman: https://postman.com
# - Thunder Client (VS Code extension)
```

## Next Steps

1. ✅ Complete setup using this guide
2. ✅ Test all payment methods with test cards
3. ✅ Customize products and categories
4. ✅ Configure email notifications
5. ✅ Set up proper logging
6. ✅ Add more payment gateways if needed
7. ✅ Deploy to production

Happy coding! 🚀
