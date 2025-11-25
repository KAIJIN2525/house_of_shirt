# Email Verification & Inventory Management Guide

## Table of Contents

1. [Email Verification System](#email-verification-system)
2. [Inventory Management System](#inventory-management-system)
3. [Setup Instructions](#setup-instructions)
4. [API Endpoints](#api-endpoints)
5. [Testing](#testing)

---

## Email Verification System

### Overview

Users must verify their email address after registration before they can log in. Google OAuth users are automatically verified.

### Features

- ✅ Email verification on signup
- ✅ Verification link with 24-hour expiry
- ✅ Resend verification email
- ✅ Visual banner for unverified users
- ✅ Auto-verification for Google OAuth users
- ✅ Password reset functionality
- ✅ Beautiful HTML email templates

### User Flow

#### Registration Flow:

1. User registers with email and password
2. System creates account with `isEmailVerified: false`
3. Verification email sent automatically
4. User clicks link in email
5. System verifies email and updates `isEmailVerified: true`
6. User can now log in

#### Login Flow:

- **Verified User**: Login successful
- **Unverified User**: Login blocked with message to check email
- **Google OAuth User**: Auto-verified, login successful

### Frontend Components

#### `VerifyEmail.jsx`

- Standalone verification page
- Handles token from URL query parameter
- Shows success/error states
- Auto-redirects to login after success

#### `EmailVerificationBanner.jsx`

- Shows at top of all pages for unverified users
- "Resend Email" button
- Dismissible notification
- Only visible when user is logged in but not verified

### Backend Implementation

#### User Model Fields:

```javascript
{
  isEmailVerified: Boolean,
  emailVerificationToken: String,
  emailVerificationExpires: Date,
  passwordResetToken: String,
  passwordResetExpires: Date
}
```

#### API Endpoints:

- `POST /api/users/signup` - Register and send verification email
- `GET /api/users/verify-email/:token` - Verify email with token
- `POST /api/users/resend-verification` - Resend verification email
- `POST /api/users/forgot-password` - Request password reset
- `POST /api/users/reset-password/:token` - Reset password

---

## Inventory Management System

### Overview

Comprehensive inventory tracking system that monitors stock levels by product variant (size, color) and sends automated alerts when stock is low.

### Features

- ✅ Track stock by size and color for each product
- ✅ Customizable low stock threshold per variant
- ✅ Real-time inventory dashboard
- ✅ Automated email alerts (daily at 9 AM and weekly on Monday at 2 PM)
- ✅ Manual alert triggering
- ✅ Quick stock updates from dashboard
- ✅ Inventory summary statistics
- ✅ Filter by stock level (critical, low, all)
- ✅ Search products by name or SKU

### Product Variant Structure

Each product has variants with:

```javascript
{
  size: "M",
  color: "Blue",
  stock: 15,
  lowStockThreshold: 10,
  sku: "PROD-001-M-BLUE"
}
```

### Stock Alert Levels

| Status           | Condition                 | Color  |
| ---------------- | ------------------------- | ------ |
| **Healthy**      | Stock > Threshold         | Green  |
| **Low Stock**    | Stock ≤ Threshold but > 5 | Yellow |
| **Critical**     | Stock ≤ 5                 | Red    |
| **Out of Stock** | Stock = 0                 | Red    |

### Admin Dashboard Features

#### Summary Cards:

1. **Total Products** - Total number of variants across all products
2. **Total Stock** - Sum of all stock units
3. **Low Stock Count** - Variants at or below threshold
4. **Out of Stock Count** - Variants with zero stock

#### Filters:

- **All** - Show all low stock items
- **Critical** - Show only items with ≤5 units
- **Low Stock** - Show items between 5 and threshold

#### Quick Actions:

- **Search** - Find products by name or SKU
- **Send Alert Email** - Manually trigger low stock alert
- **Update Stock** - Change stock quantity inline

### Automated Alerts

#### Cron Schedule:

```javascript
// Daily check at 9:00 AM
cron.schedule("0 9 * * *", checkStockLevels);

// Weekly check on Monday at 2:00 PM
cron.schedule("0 14 * * 1", checkStockLevels);
```

#### Alert Email Contains:

- List of all low stock products
- Product name and image
- Variant details (size, color)
- Current stock level
- Threshold level
- Visual status indicators
- Link to admin inventory dashboard

### Frontend Components

#### `InventoryManagement.jsx`

- Full admin inventory dashboard
- Summary statistics
- Low stock products table
- Inline stock editing
- Search and filter functionality
- Manual alert triggering

### Backend Implementation

#### Inventory Controller Functions:

1. **`getLowStockProducts()`**

   - Fetches all variants at or below threshold
   - Returns sorted list (lowest stock first)
   - Includes product details and images

2. **`getInventorySummary()`**

   - Calculates total products, stock, low stock, out of stock
   - Returns summary statistics

3. **`updateVariantStock()`**

   - Updates stock for specific variant
   - Updates threshold if provided

4. **`bulkUpdateStock()`**

   - Updates multiple variants at once
   - Returns success/error for each update

5. **`checkAndSendStockAlerts()`**

   - Manually trigger stock check
   - Sends email if low stock items found

6. **`getInventoryByCategory()`**
   - Group inventory statistics by category
   - Useful for category-level analysis

#### API Endpoints:

- `GET /api/admin/inventory/low-stock` - Get all low stock products
- `GET /api/admin/inventory/summary` - Get inventory statistics
- `GET /api/admin/inventory/by-category` - Get inventory grouped by category
- `PUT /api/admin/inventory/update-stock` - Update single variant stock
- `PUT /api/admin/inventory/bulk-update` - Update multiple variants
- `POST /api/admin/inventory/check-alerts` - Manually trigger alerts
- `GET /api/admin/inventory/history/:productId` - Get stock movement history (future)

---

## Setup Instructions

### 1. Environment Variables

Add to `backend/.env`:

```env
# Email Configuration
EMAIL_SERVICE=mailtrap  # Options: gmail, mailtrap, smtp
EMAIL_FROM=noreply@houseofshirt.com

# For Gmail (Production)
# EMAIL_SERVICE=gmail
# EMAIL_USER=your-email@gmail.com
# EMAIL_PASSWORD=your-app-password

# For Mailtrap (Development/Testing)
MAILTRAP_HOST=smtp.mailtrap.io
MAILTRAP_PORT=2525
MAILTRAP_USER=your_mailtrap_user
MAILTRAP_PASS=your_mailtrap_password

# For Custom SMTP
# EMAIL_SERVICE=smtp
# SMTP_HOST=smtp.yourprovider.com
# SMTP_PORT=587
# SMTP_SECURE=false
# SMTP_USER=your-email@yourprovider.com
# SMTP_PASSWORD=your-password

# Admin email for low stock alerts
ADMIN_EMAIL=admin@houseofshirt.com
```

### 2. Email Service Setup

#### Option A: Mailtrap (Recommended for Development)

1. Sign up at https://mailtrap.io
2. Create an inbox
3. Copy SMTP credentials
4. Add to `.env` file

#### Option B: Gmail (Production)

1. Enable 2-Factor Authentication on Gmail
2. Generate App Password: Google Account → Security → App Passwords
3. Use App Password in `.env` (not your regular password)

#### Option C: SendGrid, AWS SES, Mailgun (Production)

1. Sign up for service
2. Get SMTP credentials
3. Configure custom SMTP settings in `.env`

### 3. Install Dependencies

Already installed:

```bash
cd backend
npm install nodemailer node-cron
```

### 4. Test Email Sending

#### Test Verification Email:

```bash
# Register a new user
POST http://localhost:9000/api/users/signup
{
  "name": "Test User",
  "email": "test@example.com",
  "password": "password123"
}

# Check Mailtrap inbox for verification email
```

#### Test Low Stock Alert:

```bash
# Manually trigger alert
POST http://localhost:9000/api/admin/inventory/check-alerts
Authorization: Bearer <your-admin-token>
```

### 5. Update Product Stock Thresholds

```javascript
// Update a product variant
PUT http://localhost:9000/api/admin/inventory/update-stock
{
  "productId": "product_id",
  "size": "M",
  "color": "Blue",
  "stock": 8,
  "lowStockThreshold": 10
}
```

---

## API Endpoints

### Email Verification Endpoints

#### Register User

```http
POST /api/users/signup
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123"
}

Response:
{
  "user": {
    "_id": "...",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "customer",
    "isEmailVerified": false
  },
  "token": "jwt_token",
  "message": "Registration successful! Please check your email to verify your account."
}
```

#### Verify Email

```http
GET /api/users/verify-email/:token

Response:
{
  "success": true,
  "message": "Email verified successfully! You can now log in."
}
```

#### Resend Verification Email

```http
POST /api/users/resend-verification
Content-Type: application/json

{
  "email": "john@example.com"
}

Response:
{
  "success": true,
  "message": "Verification email sent! Please check your inbox."
}
```

#### Login (Checks Email Verification)

```http
POST /api/users/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securePassword123"
}

Response (if not verified):
{
  "message": "Please verify your email before logging in.",
  "emailNotVerified": true,
  "userId": "user_id"
}
```

### Inventory Management Endpoints

#### Get Low Stock Products

```http
GET /api/admin/inventory/low-stock
Authorization: Bearer <token>

Response:
{
  "success": true,
  "count": 5,
  "data": [
    {
      "productId": "...",
      "productName": "Classic T-Shirt",
      "sku": "SHIRT-001",
      "variantSku": "SHIRT-001-M-BLUE",
      "size": "M",
      "color": "Blue",
      "currentStock": 3,
      "threshold": 10,
      "category": "T-Shirts",
      "image": "url",
      "price": 29.99
    }
  ]
}
```

#### Get Inventory Summary

```http
GET /api/admin/inventory/summary
Authorization: Bearer <token>

Response:
{
  "success": true,
  "summary": {
    "totalProducts": 150,
    "totalStock": 1250,
    "lowStockCount": 12,
    "outOfStockCount": 3,
    "healthyStockCount": 135
  }
}
```

#### Update Stock

```http
PUT /api/admin/inventory/update-stock
Authorization: Bearer <token>
Content-Type: application/json

{
  "productId": "product_id",
  "size": "M",
  "color": "Blue",
  "stock": 25,
  "lowStockThreshold": 10
}

Response:
{
  "success": true,
  "message": "Stock updated successfully",
  "data": {
    "productId": "...",
    "variantSku": "SHIRT-001-M-BLUE",
    "stock": 25,
    "lowStockThreshold": 10
  }
}
```

#### Send Stock Alert Manually

```http
POST /api/admin/inventory/check-alerts
Authorization: Bearer <token>

Response:
{
  "success": true,
  "message": "Low stock alert sent for 5 variants",
  "count": 5
}
```

---

## Testing

### Test Email Verification

1. **Register New User:**

   - Use Postman or frontend to register
   - Check Mailtrap inbox for verification email
   - Click verification link or copy token

2. **Verify Email:**

   - Navigate to `/verify-email?token=<token>`
   - Should see success message
   - User should now be able to log in

3. **Test Unverified Login:**

   - Try to log in before verifying
   - Should be blocked with message

4. **Resend Verification:**
   - Click "Resend Email" in banner
   - Check inbox for new email

### Test Inventory Management

1. **Set Up Test Data:**

   ```javascript
   // Create a product with low stock
   const product = {
     name: "Test Shirt",
     variants: [{ size: "M", color: "Blue", stock: 3, lowStockThreshold: 10 }],
   };
   ```

2. **Check Dashboard:**

   - Navigate to `/admin/inventory`
   - Should see low stock product listed
   - Summary should show correct counts

3. **Test Filters:**

   - Click "Critical" - should show items with ≤5 units
   - Click "Low Stock" - should show items between 5 and threshold
   - Use search to find specific products

4. **Update Stock:**

   - Change stock value in input field
   - Press Enter or click away
   - Should see success toast
   - Stock should update immediately

5. **Send Manual Alert:**

   - Click "Send Alert Email" button
   - Check admin email inbox
   - Should receive formatted alert with product list

6. **Test Automated Alerts:**
   ```javascript
   // Wait for scheduled cron job or manually trigger
   // Check server logs for cron execution
   // Check admin email for alerts
   ```

### Test Scenarios

#### Scenario 1: New User Registration

1. Register with `test@example.com`
2. Verify email not working → should be blocked from login
3. Check Mailtrap inbox → click verification link
4. Login → should succeed

#### Scenario 2: Stock Running Low

1. Set product stock to 3 units
2. Wait for cron job (or trigger manually)
3. Admin receives email alert
4. Admin updates stock in dashboard
5. Stock alert no longer triggers

#### Scenario 3: Multiple Variants Low

1. Create product with 3 variants, all low stock
2. Dashboard shows all 3 variants separately
3. Alert email includes all 3 variants
4. Admin can update each variant individually

---

## Troubleshooting

### Email Not Sending

**Problem:** Verification emails not arriving

**Solutions:**

1. Check `.env` configuration
2. For Gmail: Use App Password, not regular password
3. For Mailtrap: Verify credentials are correct
4. Check server logs for email errors
5. Verify `EMAIL_SERVICE` is set correctly

### Verification Link Expired

**Problem:** "Invalid or expired verification token"

**Solutions:**

1. Token expires after 24 hours
2. Use "Resend Email" to get new token
3. Check `emailVerificationExpires` field in database

### Cron Jobs Not Running

**Problem:** Automated alerts not sending

**Solutions:**

1. Check server logs for cron initialization message
2. Verify cron schedule syntax
3. Ensure server is running continuously
4. Test with manual trigger first
5. Check server timezone settings

### Inventory Not Updating

**Problem:** Stock updates not saving

**Solutions:**

1. Verify user has admin role
2. Check authentication token
3. Ensure product and variant exist
4. Check server logs for errors
5. Verify MongoDB connection

---

## Production Considerations

### Email Service

- ✅ Use dedicated email service (SendGrid, AWS SES, Mailgun)
- ✅ Set up email domain authentication (SPF, DKIM)
- ✅ Monitor email delivery rates
- ✅ Set up bounce and complaint handling

### Cron Jobs

- ✅ Use production-grade scheduler (Bull, Agenda)
- ✅ Monitor job execution
- ✅ Set up error alerting
- ✅ Consider timezone differences

### Security

- ✅ Rate limit verification resend
- ✅ Validate email addresses
- ✅ Use HTTPS for all emails links
- ✅ Sanitize user input
- ✅ Implement CAPTCHA on signup

### Performance

- ✅ Index database fields (emailVerificationToken, email)
- ✅ Cache inventory summary
- ✅ Batch email sending for multiple alerts
- ✅ Use background jobs for email sending

---

## Future Enhancements

### Email System

- [ ] Email templates customization
- [ ] Multi-language support
- [ ] Email preferences management
- [ ] Order confirmation emails
- [ ] Shipping notification emails

### Inventory System

- [ ] Stock movement history tracking
- [ ] Automatic reorder suggestions
- [ ] Supplier management
- [ ] Inventory forecasting
- [ ] Barcode scanning integration
- [ ] CSV import/export
- [ ] Real-time dashboard updates (WebSocket)
- [ ] Mobile app notifications

---

## Support

For issues or questions:

1. Check this documentation
2. Review server logs
3. Test with Mailtrap first
4. Verify environment configuration
5. Check API endpoint responses

**Key Files:**

- Backend Email Config: `backend/config/email.js`
- Backend Cron Config: `backend/config/cron.js`
- Backend User Controller: `backend/controllers/user.controller.js`
- Backend Inventory Controller: `backend/controllers/inventory.controller.js`
- Frontend Verification Page: `frontend/src/pages/VerifyEmail.jsx`
- Frontend Inventory Dashboard: `frontend/src/components/Admin/InventoryManagement.jsx`
