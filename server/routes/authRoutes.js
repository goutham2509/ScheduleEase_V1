import express from "express";
import passport from "passport";
import { oauthLogin, logoutUser } from "../controllers/authController.js";
import { ensureAuthenticated } from "../middleware/authMiddleware.js"; // ✅ new middleware

const router = express.Router();

// 🔹 Step 1: Google OAuth entry point
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    prompt: "select_account", // 👈 always opens account chooser
  })
);

// 🔹 Step 2: Google OAuth callback
router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: "http://localhost:5173/login",
  }),
  (req, res) => {
    // ✅ After successful login, Passport gives you req.user
    const email = req.user.email;

    // Decide redirect based on email domain
    let redirectURL;
    if (email === "alina_m250234cs@nitc.ac.in") {
      redirectURL = "http://localhost:5173/admin"; // Admin email (hardcoded)
    } else if (email.endsWith("@nitc.ac.in")) {
      redirectURL = "http://localhost:5173/student"; // Internal NITC email
    } else {
      redirectURL = "http://localhost:5173/external"; // External users
  }


    // Redirect to the chosen frontend page
    res.redirect(redirectURL);
  }
);


// 🔹 Optional: Manual OAuth login (if you have a token-exchange endpoint)
router.post("/google-login", oauthLogin);

// 🔹 Step 3: Logout (protected — must be logged in)
router.post("/logout", (req, res, next) => {
  console.log("Logout endpoint hit ✅");

  req.logout(err => {
    if (err) return next(err);

    req.session.destroy(() => {
      res.clearCookie("connect.sid", {
        httpOnly: true,
        sameSite: "lax",
        secure: false,
        path: "/", // must match cookie setup
      });

      console.log("Session destroyed, cookie cleared ✅");
      res.status(200).json({ message: "Logged out successfully" }); // ✅ crucial
    });
  });
});

router.get("/me", (req, res) => {
  if (req.isAuthenticated() && req.user) {
    // ✅ Return basic user info (no passwords)
    res.json({
      success: true,
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
      },
    });
  } else {
    res.status(401).json({ success: false, message: "Not logged in" });
  }
});

export default router;
