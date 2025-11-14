import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import dotenv from "dotenv";
import User from "../models/User.js";

dotenv.config();

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "http://localhost:5000/api/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
  try {
    const email = profile.emails[0].value;
    console.log("🔍 Google login:", email);

    let user = await User.findOne({ email });

    if (!user) {
  console.log("🆕 Creating new user in MongoDB...");
  try {
    user = await User.create({
      name: profile.displayName,
      email,
      google_id: profile.id,
      profileImage: profile.photos[0]?.value,
      role:
        email === "alina_m250234cs@nitc.ac.in"
          ? "admin"
          : email.endsWith("@nitc.ac.in")
          ? "internal user"
          : "external user",
    });
    console.log("✅ User created successfully:", user.email);
  } catch (createErr) {
    console.error("❌ Failed to create user:", createErr);
  }
} else {
  console.log("👤 Existing user found:", user.email);
}


    return done(null, user);
  } catch (err) {
    console.error("Error in Google Strategy:", err);
    return done(err, null);
  }
}
  )
);

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});
