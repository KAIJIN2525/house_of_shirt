import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import User from "../models/user.model.js";
import redis from "redis";
import dotenv from "dotenv";

dotenv.config();

// Create Redis client with retry strategy
const client = redis.createClient({
  url: `rediss://default:${process.env.UPSTASH_REDIS_PASSWORD}@${process.env.UPSTASH_REDIS_ENDPOINT}:${process.env.UPSTASH_REDIS_PORT}`,
  retry_strategy: (options) => {
    if (options.error && options.error.code === "ECONNRESET") {
      console.error("Redis connection lost, reconnecting...");
      return 3000; // Retry after 3 seconds
    }
    if (options.total_retry_time > 1000 * 60 * 60) {
      return new Error("Retry time exhausted");
    }
    if (options.attempt > 10) {
      return new Error("Max retries reached");
    }
    return Math.min(options.attempt * 100, 3000); // Retry with exponential backoff
  },
});

// Handle Redis connection errors
client.on("error", (err) => {
  console.error("Redis error:", err);
});

// Connect to Redis
client.connect();

// Google OAuth Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "http://localhost:9000/api/users/auth/google/callback",
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
            await user.save();
          }
          return done(null, user);
        }

        // User doesn't exist, create a new user
        const newUser = await User.create({
          googleId: profile.id,
          name: profile.displayName,
          email: profile.emails[0].value,
        });

        done(null, newUser);
      } catch (error) {
        done(error);
      }
    }
  )
);

// Serialize and deserialize user
passport.serializeUser((user, done) => {
  done(null, user._id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const data = await client.get(id);

    if (data) {
      const user = JSON.parse(data);
      done(null, user);
    } else {
      const user = await User.findById(id);
      if (!user) return done(null, false);

      await client.setEx(id, 3600, JSON.stringify(user)); // Cache for 1 hour
      done(null, user);
    }
  } catch (error) {
    done(error, null);
  }
});

export default passport;
