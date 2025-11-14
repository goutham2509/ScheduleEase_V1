import Appointment from "../models/Appointment.js";
import Slot from "../models/Slot.js";
import { sendEmail } from "../utils/emailService.js";
import {
  bookingEmailTemplate,
  approvalEmailTemplate,
  rejectionEmailTemplate,
  cancellationEmailTemplate,
  rescheduleEmailTemplate
} from "../utils/emailTemplates.js";

/* ========================================================
   GET ALL / MINE
======================================================== */
export const getAppointments = async (req, res) => {
  try {
    const { role, _id } = req.user;
    const filter = { is_deleted: false };

    if (role !== "admin") filter.user = _id;

    const appointments = await Appointment.find(filter)
      .populate("user")
      .populate("slot")
      .sort({ createdAt: -1 });

    res.json(appointments);
  } catch (err) {
    console.error("Error fetching appointments:", err);
    res.status(500).json({ message: "Server error while fetching appointments." });
  }
};

/* ========================================================
   CREATE APPOINTMENT
======================================================== */
function addMinutes(timeStr, minutes) {
  const [h, m] = timeStr.split(":").map(Number);
  const total = h * 60 + m + Number(minutes);
  return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
}

export const createAppointment = async (req, res) => {
  try {
    const { date, startTime, duration, title, description } = req.body;

    if (!date || !startTime || !duration || !title || !description)
      return res.status(400).json({ message: "Missing required fields" });

    const user = req.user;
    const endTime = addMinutes(startTime, duration);

    const parentSlot = await Slot.findOne({
      date,
      timeStart: { $lte: startTime },
      timeEnd: { $gte: endTime }
    });

    if (!parentSlot)
      return res.status(400).json({ message: "Director not available at this time" });

    const realSlot = await Slot.create({
      date,
      timeStart: startTime,
      timeEnd: endTime,
      duration,
      isBooked: true
    });

    const status = user.role === "internal user" ? "approved" : "pending";

    const appt = await Appointment.create({
      user: user._id,
      slot: realSlot._id,
      title,
      description,
      role_name: user.role,
      status
    });

    const populated = await Appointment.findById(appt._id)
      .populate("user")
      .populate("slot");

    // EMAIL — Booking confirmation
    await sendEmail(
      user.email,
      "Your Appointment is Booked",
      bookingEmailTemplate(
        user.name,
        title,
        date,
        startTime,
        status
      )
    );

    res.status(201).json(populated);
  } catch (err) {
    console.error("createAppointment error:", err);
    res.status(500).json({ message: err.message });
  }
};

/* ========================================================
   GET APPOINTMENT BY ID
======================================================== */
export const getAppointmentById = async (req, res) => {
  try {
    const appt = await Appointment.findById(req.params.id).populate("user slot");

    if (!appt || appt.is_deleted)
      return res.status(404).json({ message: "Not found" });

    if (req.user.role !== "admin" &&
        String(appt.user._id) !== String(req.user._id))
      return res.status(403).json({ message: "Forbidden" });

    res.json(appt);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ========================================================
   APPROVED APPOINTMENTS
======================================================== */
export const getApprovedAppointments = async (req, res) => {
  try {
    const filter = {
      status: "approved",
      is_deleted: false,
      ...(req.user.role !== "admin" && { user: req.user._id })
    };

    const appts = await Appointment.find(filter)
      .populate("user slot")
      .sort({ createdAt: -1 });

    res.json(appts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ========================================================
   PENDING APPOINTMENTS
======================================================== */
export const getPendingAppointments = async (req, res) => {
  try {
    const filter = {
      status: "pending",
      is_deleted: false,
      ...(req.user.role !== "admin" && { user: req.user._id })
    };

    const appts = await Appointment.find(filter)
      .populate("user slot")
      .sort({ createdAt: -1 });

    res.json(appts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ========================================================
   UPDATE BASIC DETAILS
======================================================== */
export const updateAppointment = async (req, res) => {
  try {
    const appt = await Appointment.findById(req.params.id);
    if (!appt || appt.is_deleted)
      return res.status(404).json({ message: "Not found" });

    if (req.user.role !== "admin" &&
        String(appt.user) !== String(req.user._id))
      return res.status(403).json({ message: "Forbidden" });

    const { title, description } = req.body;

    if (title) appt.title = title;
    if (description) appt.description = description;

    await appt.save();

    const populated = await Appointment.findById(appt._id).populate("user slot");

    res.json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ========================================================
   DELETE APPOINTMENT (SOFT DELETE)
======================================================== */
export const deleteAppointment = async (req, res) => {
  try {
    const appt = await Appointment.findById(req.params.id).populate("slot user");
    if (!appt) return res.status(404).json({ message: "Not found" });

    if (req.user.role !== "admin" &&
        String(appt.user._id) !== String(req.user._id))
      return res.status(403).json({ message: "Forbidden" });

    if (appt.slot) {
      const slot = await Slot.findById(appt.slot._id);
      if (slot) {
        slot.isBooked = false;
        await slot.save();
      }
    }

    appt.is_deleted = true;
    appt.status = "cancelled";
    await appt.save();

    // EMAIL — Cancellation
    await sendEmail(
      req.user.email,
      "Appointment Cancelled",
      cancellationEmailTemplate(
        req.user.name,
        appt.title,
        appt.slot.date,
        appt.slot.timeStart
      )
    );

    res.json({ message: "Appointment cancelled" });
  } catch (err) {
    console.error("Delete error:", err);
    res.status(500).json({ message: err.message });
  }
};

/* ========================================================
   APPROVE / REJECT
======================================================== */
export const updateAppointmentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    let { status } = req.body;

    if (req.path.endsWith("approve")) status = "approved";
    if (req.path.endsWith("reject")) status = "rejected";

    const appt = await Appointment.findByIdAndUpdate(id, { status }, { new: true })
      .populate("user slot");

    if (!appt) return res.status(404).json({ message: "Not found" });

    // EMAIL — Approval / Rejection
    if (status === "approved") {
      await sendEmail(
        appt.user.email,
        "Appointment Approved",
        approvalEmailTemplate(
          appt.user.name,
          appt.title,
          appt.slot.date,
          appt.slot.timeStart
        )
      );
    }
    if (status === "rejected") {
      await sendEmail(
        appt.user.email,
        "Appointment Rejected",
        rejectionEmailTemplate(appt.user.name, appt.title)
      );
    }

    res.json({ success: true, appointment: appt });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ========================================================
   RESCHEDULE
======================================================== */
export const rescheduleAppointment = async (req, res) => {
  try {
    const { slotId } = req.body;
    const appt = await Appointment.findById(req.params.id).populate("slot user");

    if (!appt || appt.is_deleted)
      return res.status(404).json({ message: "Not found" });

    if (req.user.role !== "admin" &&
        String(appt.user._id) !== String(req.user._id))
      return res.status(403).json({ message: "Forbidden" });

    const newSlot = await Slot.findById(slotId);
    if (!newSlot) return res.status(404).json({ message: "Slot not found" });
    if (newSlot.isBooked) return res.status(400).json({ message: "Slot already booked" });

    const oldSlot = await Slot.findById(appt.slot._id);
    if (oldSlot) {
      oldSlot.isBooked = false;
      await oldSlot.save();
    }

    newSlot.isBooked = true;
    await newSlot.save();

    appt.slot = newSlot._id;
    appt.status = req.user.role === "internal user" ? "approved" : "pending";
    await appt.save();

    const updated = await Appointment.findById(appt._id).populate("slot user");

    // EMAIL — Rescheduled
    await sendEmail(
      updated.user.email,
      "Appointment Rescheduled",
      rescheduleEmailTemplate(
        updated.user.name,
        updated.title,
        updated.slot.date,
        updated.slot.timeStart
      )
    );

    res.json(updated);
  } catch (err) {
    console.error("Reschedule error:", err);
    res.status(500).json({ message: err.message });
  }
};
