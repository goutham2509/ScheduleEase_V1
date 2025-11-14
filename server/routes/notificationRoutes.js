import express from "express";
import { sendEmailAPI } from "../controllers/notificationController.js";

const router = express.Router();

// POST /api/notifications/send
router.post("/send", sendEmailAPI);

export default router;
