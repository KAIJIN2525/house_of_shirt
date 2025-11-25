# Backend Setup Guide

## Changes Made

### Redis/Upstash Removal

- **Removed all Redis/Upstash dependencies** from the project
- **Updated passport.js** to use MongoDB directly for user deserialization (no more caching)
- **Removed redis package** from package.json
- All authentication now uses MongoDB for session management

### Google OAuth Configuration

- Google OAuth is properly configured with Passport.js
- User authentication supports both local (email/password) and Google OAuth
- Sessions are managed using express-session (stored in memory by default)

## Environment Variables Required

Create a `.env` file in the backend directory with the following variables:

```env
# Server Configuration
PORT=9000

# Database
MONGODB_URI=your_mongodb_connection_string

# JWT Secret (use a long random string)
JWT_SECRET=your_jwt_secret_key

# Session Secret (use a long random string)
SESSION_SECRET=your_session_secret_key

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:9000/api/users/auth/google/callback

# Frontend URL (for CORS and OAuth redirect)
FRONTEND_URL=http://localhost:5173

# Optional: Cloudinary (if used for image uploads)
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Optional: Mailtrap (if used for email notifications)
MAILTRAP_TOKEN=your_mailtrap_token
```

## Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API
4. Go to "Credentials" and create OAuth 2.0 credentials
5. Add authorized redirect URIs:
   - `http://localhost:9000/api/users/auth/google/callback` (development)
   - Your production callback URL (when deployed)
6. Copy the Client ID and Client Secret to your `.env` file

## Installation

```bash
# Install dependencies
npm install

# Run in development mode
npm run dev

# Run in production mode
npm start
```

## Authentication Flow

### Local Authentication

1. User signs up with email/password → JWT token generated
2. User logs in with email/password → JWT token returned

### Google OAuth Authentication

1. User clicks "Sign in with Google"
2. User is redirected to Google authentication
3. Google redirects back to `/api/users/auth/google/callback`
4. Backend creates/updates user in MongoDB
5. JWT token is generated and passed to frontend via postMessage
6. Frontend stores token and uses it for API calls

## API Endpoints

### User Routes

- `POST /api/users/signup` - Register new user
- `POST /api/users/login` - Login user
- `GET /api/users/profile` - Get user profile (protected)
- `GET /api/users/auth/google` - Initiate Google OAuth
- `GET /api/users/auth/google/callback` - Google OAuth callback

## Session Management

The application uses `express-session` for managing passport sessions. In production, consider using a session store like:

- MongoDB session store (connect-mongo)
- PostgreSQL session store (connect-pg-simple)
- Memory store is used by default (suitable for development only)

## Important Notes

1. **No Redis/Upstash**: All caching has been removed. User data is fetched from MongoDB on each request.
2. **JWT Tokens**: Used for API authentication (12-hour expiry)
3. **Sessions**: Used for Google OAuth flow only
4. **CORS**: Configured to accept credentials from frontend URL
5. **Production**: Update callback URLs and frontend URL for production deployment
