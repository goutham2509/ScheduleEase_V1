import Slot from "../models/Slot.js";
import Appointment from "../models/Appointment.js";


// GET /api/slots
export const getSlots = async (req, res) => {
  try {
    // allow query ?date=YYYY-MM-DD to filter
    const q = {};
    if (req.query.date) q.date = req.query.date;
    const slots = await Slot.find(q).sort({ date: 1, timeStart: 1 });
    res.json(slots);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/slots (admin only)
// POST /api/slots (admin only)
export const createSlot = async (req, res) => {
  try {
    const { date, timeStart, timeEnd } = req.body;

    // Validate required fields
    if (!date || !timeStart || !timeEnd) {
      return res.status(400).json({ message: "Missing required fields (date, timeStart, timeEnd)" });
    }

    // Convert inputs to comparable values
    const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

    // -------------------------------------------------------
    // ✅ 1. Prevent creating slots for past dates
    // -------------------------------------------------------
    if (date < today) {
      return res.status(400).json({
        message: "Cannot create a slot for a past date",
      });
    }

    // -------------------------------------------------------
    // ✅ 2. Prevent creating slots with invalid time ordering
    // -------------------------------------------------------
    if (timeEnd <= timeStart) {
      return res.status(400).json({
        message: "End time must be later than start time",
      });
    }

    // -------------------------------------------------------
    // ✅ 3. Prevent creating past-time slots if date = today
    // -------------------------------------------------------
    if (date === today) {
      // format "HH:MM" into minutes-since-midnight
      const now = new Date();
      const currentTime = `${String(now.getHours()).padStart(2, "0")}:${String(
        now.getMinutes()
      ).padStart(2, "0")}`;

      if (timeStart < currentTime) {
        return res.status(400).json({
          message: "Cannot create a slot in the past for today",
        });
      }
    }

    // -------------------------------------------------------
    // OPTIONAL BUT IMPORTANT:
    // ✅ 4. Prevent overlapping slot ranges
    //   Example:
    //   existing: 10:00 - 11:00
    //   new slot: 10:30 - 10:45 (should be blocked)
    // -------------------------------------------------------
    const overlappingSlot = await Slot.findOne({
      date,
      $or: [
        { timeStart: { $lt: timeEnd }, timeEnd: { $gt: timeStart } }
      ],
    });

    if (overlappingSlot) {
      return res.status(400).json({
        message: "This time range overlaps with an existing slot",
      });
    }

    // -------------------------------------------------------
    // VALID — Create Slot
    // -------------------------------------------------------
    const newSlot = await Slot.create({
      date,
      timeStart,
      timeEnd,
      isBooked: false,
    });

    return res.status(201).json({
      message: "New time slot added successfully",
      slot: newSlot,
    });

  } catch (error) {
    console.error("Error creating slot:", error);
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// PUT /api/slots/:id (admin only)
export const updateSlot = async (req, res) => {
  try {
    if (req.user.role !== "admin") return res.status(403).json({ message: "Admin only" });
    const slot = await Slot.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!slot) return res.status(404).json({ message: "Not found" });
    res.json(slot);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// DELETE /api/slots/:id (admin only)
export const deleteSlot = async (req, res) => {
  try {
    if (req.user.role !== "admin") return res.status(403).json({ message: "Admin only" });
    await Slot.findByIdAndDelete(req.params.id);
    res.json({ message: "Slot deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

//virtual slot division logic
// --- Helpers ---
const toMinutes = (time) => {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
};

const toTimeString = (mins) => {
  const h = String(Math.floor(mins / 60)).padStart(2, "0");
  const m = String(mins % 60).padStart(2, "0");
  return `${h}:${m}`;
};

const overlaps = (aStart, aEnd, bStart, bEnd) => {
  return aStart < bEnd && bStart < aEnd;
};

// --- MAIN ---
export const getVirtualAvailableSlots = async (req, res) => {
  try {
    const { date, duration } = req.query;

    if (!date || !duration)
      return res.status(400).json({ message: "date and duration required" });

    const dur = Number(duration);

    // -------------------------------------------------------
    // 1️⃣ FETCH ONLY ADMIN AVAILABILITY SLOTS
    //    Ignore real bookings completely
    // -------------------------------------------------------
    const adminSlots = await Slot.find({
      date,
      isBooked: false,   // <-- FIX: only real availability
    });

    // -------------------------------------------------------
    // 2️⃣ FETCH ALL APPOINTMENTS THAT DAY (booked periods)
    // -------------------------------------------------------
    const appointments = await Appointment.find({
      is_deleted: false,
    }).populate("slot");

    const result = [];

    // -------------------------------------------------------
    // 3️⃣ GENERATE VIRTUAL SLOTS INSIDE ADMIN SLOTS
    // -------------------------------------------------------
    for (const s of adminSlots) {
      let start = toMinutes(s.timeStart);
      const end = toMinutes(s.timeEnd);

      while (start + dur <= end) {
        const vStart = start;
        const vEnd = start + dur;

        // Check overlap with existing booked slots
        let isTaken = false;

        for (const a of appointments) {
          if (!a.slot || a.slot.date !== date) continue;

          const aStart = toMinutes(a.slot.timeStart);
          const aEnd = toMinutes(a.slot.timeEnd);

          if (overlaps(vStart, vEnd, aStart, aEnd)) {
            isTaken = true;
            break;
          }
        }

        // If not overlapping → AVAILABLE
        if (!isTaken) {
          result.push({
            start: toTimeString(vStart),
            end: toTimeString(vEnd),
          });
        }

        // move pointer forward by duration
        start += dur;
      }
    }

    return res.json(result);
  } catch (err) {
    console.error("Virtual slot error:", err);
    res.status(500).json({ message: err.message });
  }
};
