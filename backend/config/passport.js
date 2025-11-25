import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import User from "../models/user.model.js";
import dotenv from "dotenv";

dotenv.config();

// Only initialize Google OAuth if credentials are available
const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;

if (googleClientId && googleClientSecret) {
  // Google OAuth Strategy
  passport.use(
    new GoogleStrategy(
      {
        clientID: googleClientId,
        clientSecret: googleClientSecret,
        callbackURL:
          process.env.GOOGLE_CALLBACK_URL || "/api/users/auth/google/callback",
        scope: ["profile", "email"],
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          // Check if the user already exists in the database by googleId or email
          const user = await User.findOne({
            $or: [{ googleId: profile.id }, { email: profile.emails[0].value }],
          });

          if (user) {
            // If the user exists but doesn't have a googleId, update their record
            if (!user.googleId) {
              user.googleId = profile.id;
              user.isEmailVerified = true; // Google accounts are pre-verified
              await user.save();
            }
            return done(null, user);
          }

          // User doesn't exist, create a new user
          const newUser = await User.create({
            googleId: profile.id,
            name: profile.displayName,
            email: profile.emails[0].value,
            isEmailVerified: true, // Google accounts are pre-verified
          });

          done(null, newUser);
        } catch (error) {
          done(error);
        }
      }
    )
  );
} else {
  console.warn(
    "Google OAuth credentials not found. Google login will be disabled."
  );
}

// Serialize and deserialize user
passport.serializeUser((user, done) => {
  done(null, user._id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    if (!user) return done(null, false);

    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

export default passport;
