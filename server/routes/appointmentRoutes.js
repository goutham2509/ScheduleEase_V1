import express from "express";
import {
  getAppointments,
  createAppointment,
  getAppointmentById,
  rescheduleAppointment,
  updateAppointment,
  deleteAppointment,
  updateAppointmentStatus,
  getApprovedAppointments,
  getPendingAppointments
} from "../controllers/appointmentController.js";

import { ensureAuthenticated } from "../middleware/authMiddleware.js";

const router = express.Router();

/* =====================
   STATIC ROUTES FIRST
===================== */

// All approved appointments
router.get("/approved", ensureAuthenticated, (req, res, next) => {
  console.log("🔥 HIT /approved ROUTE");
  next();
}, getApprovedAppointments);

router.get(
  "/pending", ensureAuthenticated,(req, res, next) => {
    console.log("🟡 HIT /pending ROUTE");
    next();
}, getPendingAppointments);


/* =====================
   LIST + CREATE
===================== */

router.get("/", ensureAuthenticated, getAppointments);
router.post("/", ensureAuthenticated, createAppointment);
router.patch("/:id/reschedule", ensureAuthenticated, rescheduleAppointment);


/* =====================
   SPECIFIC APPOINTMENT
===================== */

// get specific appointment
router.get("/:id", ensureAuthenticated, getAppointmentById);

// update appointment
router.put("/:id", ensureAuthenticated, updateAppointment);

// delete appointment
router.delete("/:id", ensureAuthenticated, deleteAppointment);

/* =====================
   ADMIN STATUS UPDATE
===================== */

router.put("/:id/status", ensureAuthenticated, updateAppointmentStatus);
router.patch("/:id/approve", ensureAuthenticated, (req, res, next) => {
  console.log("🔥 HIT /:id/approve");
  next();
}, updateAppointmentStatus);
router.patch("/:id/reject", ensureAuthenticated, updateAppointmentStatus);


export default router;
