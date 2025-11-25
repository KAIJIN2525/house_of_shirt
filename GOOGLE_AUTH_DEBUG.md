# Google OAuth Debugging Guide

## Changes Made to Fix Google Authentication

### 1. Backend Route (`backend/routes/user.route.js`)

✅ **Fixed**: Now sends token and user data via postMessage
✅ **Added**: Proper error handling with redirect fallback
✅ **Added**: User data serialization in the callback response

### 2. Frontend Login (`frontend/src/pages/Login.jsx`)

✅ **Fixed**: Origin verification now checks both backend URL and window origin
✅ **Fixed**: Properly dispatches loginUser with Google OAuth data
✅ **Added**: Error handling and toast notifications
✅ **Added**: Window close detection and cleanup

### 3. Frontend Register (`frontend/src/pages/Register.jsx`)

✅ **Fixed**: Same improvements as Login page
✅ **Fixed**: Consistent handling with Login flow

## Testing Steps

### 1. Check Environment Variables

**Backend** (`.env`):

```env
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
GOOGLE_CALLBACK_URL=http://localhost:9000/api/users/auth/google/callback
FRONTEND_URL=http://localhost:5173
SESSION_SECRET=your_session_secret
JWT_SECRET=your_jwt_secret
```

**Frontend** (`.env` or `.env.local`):

```env
VITE_BACKEND_URL=http://localhost:9000
```

### 2. Verify Google Cloud Console Setup

1. Go to https://console.cloud.google.com
2. Select your project
3. Go to APIs & Services → Credentials
4. Check your OAuth 2.0 Client ID
5. **Authorized JavaScript origins**:
   - `http://localhost:5173`
   - `http://localhost:9000`
6. **Authorized redirect URIs**:
   - `http://localhost:9000/api/users/auth/google/callback`

### 3. Test the Flow

Open browser console (F12) and watch for:

```javascript
// When clicking Google login button:
1. Popup opens → http://localhost:9000/api/users/auth/google
2. Google OAuth screen appears
3. After authentication → redirects to callback
4. Console should show: "oauth_complete" message received
5. Window closes
6. User should be logged in
```

### 4. Debug Console Messages

**If you see:**

```
Invalid origin: http://localhost:9000
```

**Solution**: The backend is sending the message correctly, origin check might be too strict.

**If you see:**

```
Error in generating JWT token
```

**Solution**: Check JWT_SECRET is set in backend .env

**If popup closes without login:**

- Check browser console for errors
- Check backend terminal for errors
- Verify Google credentials are correct

### 5. Common Issues & Solutions

#### Issue: "Popup blocked"

**Solution**:

- Allow popups for localhost
- Use Chrome/Firefox (not Brave/Arc in strict mode)

#### Issue: "Invalid origin"

**Solution**:

- Make sure FRONTEND_URL matches exactly (no trailing slash)
- Check browser console for the actual origin value

#### Issue: "Token not saved"

**Solution**:

- Check localStorage in DevTools → Application tab
- Should see `userToken` and `userInfo`

#### Issue: "User not persisting after refresh"

**Solution**:

- Check if token is in localStorage
- Check if authSlice is reading from localStorage correctly

### 6. Manual Test Backend Endpoint

Test the Google OAuth initiation:

```bash
# Open in browser:
http://localhost:9000/api/users/auth/google
```

Should redirect to Google login, then back to callback which shows:

```
Authentication successful! Closing window...
```

### 7. Check Browser Console Logs

After clicking Google login, you should see:

```
1. Window opens
2. Google authentication
3. Callback receives data
4. Message posted to parent window
5. "Google login successful!" toast
6. Navigation to home/checkout
```

### 8. Verify Database

After successful Google login, check MongoDB:

```javascript
// User should be created/updated with:
{
  _id: "...",
  name: "User Name",
  email: "user@gmail.com",
  googleId: "1234567890", // Google user ID
  role: "customer",
  createdAt: "...",
  updatedAt: "..."
}
```

## Quick Fixes

### If still redirecting to login:

1. **Clear browser data**:

   - localStorage
   - sessionStorage
   - cookies
   - cache

2. **Restart both servers**:

```bash
# Terminal 1 (Backend)
cd backend
npm run dev

# Terminal 2 (Frontend)
cd frontend
npm run dev
```

3. **Check for CORS errors** in browser console

4. **Verify session secret** is set in backend .env

5. **Check passport is initialized** - server.js should have:

```javascript
app.use(session({ secret: ... }));
app.use(passport.initialize());
app.use(passport.session());
```

## Working Flow Diagram

```
User clicks "Google Login"
    ↓
Popup opens → /api/users/auth/google
    ↓
Redirects to Google OAuth
    ↓
User authenticates with Google
    ↓
Google redirects → /api/users/auth/google/callback
    ↓
Backend:
  - Finds/Creates user in DB
  - Generates JWT token
  - Sends HTML with postMessage script
    ↓
Frontend receives message:
  - Saves token to localStorage
  - Saves user to localStorage
  - Dispatches Redux action
  - Shows success toast
  - Closes popup
  - Navigates to home/checkout
    ↓
User is logged in! ✅
```

## Still Not Working?

Check these files have the correct code:

1. `backend/routes/user.route.js` - Callback should send postMessage with token and user
2. `frontend/src/pages/Login.jsx` - Should handle message event properly
3. `backend/config/passport.js` - Should serialize/deserialize user correctly
4. `backend/.env` - All required variables set
5. `frontend/.env` - VITE_BACKEND_URL set correctly

## Need More Help?

Run backend with debug logs:

```javascript
// In backend/routes/user.route.js callback, add:
console.log("User authenticated:", req.user);
console.log("Token generated:", token);
console.log("Frontend URL:", process.env.FRONTEND_URL);
```

Check what's logged when you complete Google authentication.
