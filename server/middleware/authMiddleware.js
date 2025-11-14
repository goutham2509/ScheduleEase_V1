import jwt from "jsonwebtoken";
import User from "../models/User.js";

// export const protect = async (req, res, next) => {
//   let token;

//   if (
//     req.headers.authorization &&
//     req.headers.authorization.startsWith("Bearer")
//   ) {
//     try {
//       token = req.headers.authorization.split(" ")[1];
//       const decoded = jwt.verify(token, process.env.JWT_SECRET);

//       req.user = await User.findById(decoded.id).select("-password");
//       if (!req.user) {
//         return res.status(404).json({ message: "User not found" });
//       }

//       return next();
//     } catch (err) {
//       return res.status(401).json({ message: "Invalid or expired token" });
//     }
//   }

//   res.status(401).json({ message: "No token provided" });
// };


export const ensureAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "Unauthorized: Please log in" });
};
