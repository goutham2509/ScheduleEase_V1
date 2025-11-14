import User from "../models/User.js";
import { generateToken } from "../utils/generateToken.js";

const adminEmails = ["director@nitc.ac.in", "admin@nitc.ac.in"];

export const oauthLogin = async (req, res) => {
  try {
    const { email, name, googleId, profileImage } = req.body;

    if (!email || !googleId) {
      return res.status(400).json({ message: "Email and Google ID required" });
    }

    let user = await User.findOne({ email });

    if (!user) {
      const domain = email.split("@")[1];
      let role = "external user";

      if (adminEmails.includes(email)) role = "admin";
      else if (domain === "nitc.ac.in") role = "internal user";

      user = await User.create({
        name,
        email,
        google_id: googleId,
        profileImage,
        role,
      });
    }

    const token = generateToken(user._id);

    res.status(200).json({
      message: "Login successful",
      token,
      user,
    });
  } catch (err) {
    console.error("OAuth login error:", err);
    res.status(500).json({ message: err.message });
  }
};

// export const logoutUser = async (req, res) => {
//   req.logout?.(() => {});
//   res.json({ message: "Logged out successfully" });
// };

export const logoutUser = (req, res, next) => {
  req.logout(err => {
    if (err) return next(err);
    // Destroy session cookie too
    req.session.destroy(() => {
      res.clearCookie("connect.sid"); // ✅ this clears the cookie in the browser
      res.json({ message: "Logged out successfully" });
    });
  });
};
