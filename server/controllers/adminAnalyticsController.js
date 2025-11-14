import Appointment from "../models/Appointment.js";
import User from "../models/User.js";

/* ============================
   ADMIN ANALYTICS CONTROLLER
============================ */

export const getAdminAnalytics = async (req, res) => {
  try {
    const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

    // 1️⃣ Pending Requests
    const pendingCount = await Appointment.countDocuments({
      status: "pending",
      is_deleted: false
    });

    // 2️⃣ Today's Appointments
    const todayAppointments = await Appointment.countDocuments({
      is_deleted: false
    }).populate("slot");

    // 3️⃣ Approved This Week
    const lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - 7);

    const approvedThisWeek = await Appointment.countDocuments({
      status: "approved",
      createdAt: { $gte: lastWeek },
      is_deleted: false
    });

    // 4️⃣ Total Users
    const totalUsers = await User.countDocuments();

    // 5️⃣ Monthly Appointments
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);

    const monthlyAppointments = await Appointment.countDocuments({
      createdAt: { $gte: monthStart },
      is_deleted: false
    });

    // 6️⃣ Approval Rate
    const totalNonDeleted = await Appointment.countDocuments({ is_deleted: false });
    const approved = await Appointment.countDocuments({
      status: "approved",
      is_deleted: false
    });

    const approvalRate = totalNonDeleted === 0 
      ? 0 
      : Math.round((approved / totalNonDeleted) * 100);

    // 7️⃣ Cancellations
    const cancellations = await Appointment.countDocuments({
      status: "cancelled"
    });

    return res.json({
      pendingCount,
      todayAppointments,
      approvedThisWeek,
      totalUsers,
      monthlyAppointments,
      approvalRate,
      cancellations,
    });

  } catch (err) {
    console.error("Analytics Error:", err);
    res.status(500).json({ message: "Server error loading analytics" });
  }
};
