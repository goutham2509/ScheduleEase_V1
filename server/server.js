import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import session from "express-session";
import passport from "passport";
import MongoStore from "connect-mongo";

import { connectDB } from "./config/db.js";
import appointmentRoutes from "./routes/appointmentRoutes.js";
import slotRoutes from "./routes/slotRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";



import "./config/passport.js";

dotenv.config();
connectDB();

const app = express();

/* ------------------------------------
   1️⃣ CORS (must be first)
------------------------------------ */
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.options("*", cors());

/* ------------------------------------
   2️⃣ JSON Parser
------------------------------------ */
app.use(express.json());

/* ------------------------------------
   3️⃣ Session (before Passport)
------------------------------------ */
app.use(
  session({
    name: "connect.sid",
    secret: process.env.SESSION_SECRET || "keyboard cat",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URI,
      collectionName: "sessions",
    }),
    cookie: {
      httpOnly: true,
      secure: false, // true only on HTTPS production
      sameSite: "lax",
      path: "/",
    },
  })
);

/* ------------------------------------
   4️⃣ Passport (after session)
------------------------------------ */
app.use(passport.initialize());
app.use(passport.session());

/* ------------------------------------
   5️⃣ Routes
------------------------------------ */
app.use("/api/appointments", appointmentRoutes);
app.use("/api/slots", slotRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/notifications", notificationRoutes);

/* ------------------------------------
   6️⃣ Health Check
------------------------------------ */
app.get("/", (req, res) => res.send("NITC Appointments Backend is running 🚀"));

/* ------------------------------------
   7️⃣ Global Error Handler
------------------------------------ */
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(500).json({ message: err.message });
});

/* ------------------------------------
   8️⃣ Start Server (only once)
------------------------------------ */
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log("CONNECTED TO DB:", process.env.MONGO_URI);
});
