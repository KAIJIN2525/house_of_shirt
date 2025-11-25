# Quick Reference Card

## 🚀 Start Application

```bash
# Backend
cd backend
npm start

# Frontend (new terminal)
cd frontend
npm run dev
```

## 📧 Email Verification

### User Flow

1. User registers → Email sent automatically
2. User clicks link in email → Email verified
3. User can now login

### Resend Email

- Banner appears for unverified users
- Click "Resend Email" button
- Check inbox for new verification email

### Test with Mailtrap

1. Sign up: https://mailtrap.io
2. Get credentials
3. Add to `backend/.env`:
   ```env
   EMAIL_SERVICE=mailtrap
   MAILTRAP_USER=your_username
   MAILTRAP_PASS=your_password
   ```

## 📦 Inventory Management

### Access Dashboard

```
http://localhost:5173/admin/inventory
```

### Features

- **Summary Stats**: Total products, stock, low stock, out of stock
- **Filter**: All / Critical (≤5) / Low Stock
- **Search**: By product name or SKU
- **Update Stock**: Edit inline, press Enter
- **Send Alert**: Click button to email admin

### Set Low Stock Threshold

```javascript
// When creating/editing product
variant: {
  size: "M",
  color: "Blue",
  stock: 15,
  lowStockThreshold: 10  // Alert when stock ≤ 10
}
```

### Automated Alerts

- **Daily**: 9:00 AM
- **Weekly**: Monday 2:00 PM
- Emails sent to `ADMIN_EMAIL` in `.env`

## 🔑 Environment Variables Required

```env
# Email (Required for email verification)
EMAIL_SERVICE=mailtrap
MAILTRAP_USER=your_username
MAILTRAP_PASS=your_password
ADMIN_EMAIL=admin@yourdomain.com
EMAIL_FROM=noreply@yourdomain.com

# Already configured
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_secret
SESSION_SECRET=your_secret
GOOGLE_CLIENT_ID=your_google_id
GOOGLE_CLIENT_SECRET=your_google_secret
FRONTEND_URL=http://localhost:5173
```

## 📍 New Routes

### Frontend

- `/verify-email` - Email verification page
- `/admin/inventory` - Inventory dashboard

### Backend API

```
# Email Verification
POST   /api/users/signup
GET    /api/users/verify-email/:token
POST   /api/users/resend-verification
POST   /api/users/forgot-password
POST   /api/users/reset-password/:token

# Inventory Management
GET    /api/admin/inventory/low-stock
GET    /api/admin/inventory/summary
GET    /api/admin/inventory/by-category
PUT    /api/admin/inventory/update-stock
PUT    /api/admin/inventory/bulk-update
POST   /api/admin/inventory/check-alerts
```

## 🧪 Quick Test

### Test Email Verification

```bash
# 1. Register
POST http://localhost:9000/api/users/signup
{
  "name": "Test User",
  "email": "test@example.com",
  "password": "password123"
}

# 2. Check Mailtrap inbox
# 3. Click verification link
# 4. Login should now work
```

### Test Inventory Alerts

```bash
# 1. Create product with low stock (stock ≤ threshold)
# 2. Go to http://localhost:5173/admin/inventory
# 3. Click "Send Alert Email"
# 4. Check admin email inbox
```

## 🎨 UI Components Added

- `EmailVerificationBanner` - Shows for unverified users
- `VerifyEmail` - Verification success/error page
- `InventoryManagement` - Full inventory dashboard

## 📊 Stock Status Levels

| Status   | Stock Level      | Color  | Action         |
| -------- | ---------------- | ------ | -------------- |
| Healthy  | > Threshold      | Green  | None           |
| Low      | ≤ Threshold, > 5 | Yellow | Restock soon   |
| Critical | ≤ 5              | Red    | Urgent restock |
| Out      | 0                | Red    | Unavailable    |

## 🔔 Cron Jobs

Logs on server start:

```
✅ Cron jobs initialized:
  - Daily stock check: Every day at 9:00 AM
  - Weekly stock check: Every Monday at 2:00 PM
```

Check logs to verify cron execution.

## 📖 Full Documentation

- `EMAIL_AND_INVENTORY_GUIDE.md` - Complete guide
- `IMPLEMENTATION_SUMMARY.md` - What was built
- `QUICK_START.md` - Setup instructions
- `MULTIPLE_PAYMENT_METHODS.md` - Payment integration

## 🆘 Troubleshooting

### Emails Not Sending

1. Check `.env` email configuration
2. Verify Mailtrap credentials
3. Check server logs for errors
4. Test with manual resend

### Inventory Not Loading

1. Verify admin token is valid
2. Check if products have variants
3. Check browser console for errors
4. Verify backend route is registered

### Cron Not Running

1. Check server logs for initialization
2. Ensure server is running continuously
3. Test with manual trigger button
4. Verify cron syntax is correct

## ✅ Production Checklist

- [ ] Switch to production email service (SendGrid/AWS SES)
- [ ] Update `ADMIN_EMAIL` to real admin address
- [ ] Test all email templates
- [ ] Set up email domain authentication (SPF/DKIM)
- [ ] Adjust cron schedule for timezone
- [ ] Monitor email delivery rates
- [ ] Set up error alerting
- [ ] Add logging for production

---

**Need Help?** Check the full documentation files!
