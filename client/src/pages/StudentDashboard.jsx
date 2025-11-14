// src/pages/StudentDashboard.jsx
import axios from "axios";
import React, { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import BookAppointmentModal from "../components/BookAppointmentModal";
import CancelAppointmentModal from "../components/CancelAppointmentModal";
import RescheduleAppointmentModal from "../components/RescheduleAppointmentModal";
import { PlusCircle, CalendarClock, XCircle } from "lucide-react";

/**
 * StudentDashboard
 * - shows only the logged-in user's approved appointments
 * - loads slots from /api/slots and uses them for the calendar
 * - opens BookAppointmentModal with a full slot object when slot clicked
 *
 * NOTE: Adjust API URLs if your backend endpoints differ.
 */

export default function StudentDashboard() {
  const navigate = useNavigate();

  // Appointments shown on the left (only approved ones)
  const [appointments, setAppointments] = useState([]);

  // Map of slots grouped by date: { "2025-11-13": [{ id, timeStart, timeEnd, isBooked, date, raw }] }
  const [slotsMap, setSlotsMap] = useState({});

  const [viewDate, setViewDate] = useState(new Date());
  const [modalPrefill, setModalPrefill] = useState(false); // { slot } or false

  // Modal states
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [rescheduleTarget, setRescheduleTarget] = useState(null);

  // Calendar helpers
  const month = viewDate.getMonth();
  const year = viewDate.getFullYear();
  const monthNames = useMemo(
    () => [
      "January","February","March","April","May","June",
      "July","August","September","October","November","December",
    ],
    []
  );
  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  // --- Refresh functions (call anytime to reload everything) ---
const refreshSlots = async () => {
  try {
    const res = await fetch("http://localhost:5000/api/slots", {
      method: "GET",
      credentials: "include",
    });
    if (!res.ok) return;

    const data = await res.json();

    const grouped = {};
    data.forEach((s) => {
      const d = s.date;
      if (!grouped[d]) grouped[d] = [];
      grouped[d].push({
        id: s._id || s.id,
        timeStart: s.timeStart,
        timeEnd: s.timeEnd,
        isBooked: !!(s.isBooked || s.is_booked),
        date: s.date,
        raw: s,
      });
    });

    setSlotsMap(grouped);
  } catch (err) {
    console.error("Refresh slots error:", err);
  }
};

const refreshAppointments = async () => {
  try {
    const res = await fetch("http://localhost:5000/api/appointments?mine=true", {
      method: "GET",
      credentials: "include",
    });
    if (!res.ok) return;
    const data = await res.json();

    const mapped = data.map((a) => {
      const statusStr = (a.status || "").toString();
      let slotInfo = null;

      if (a.slot && typeof a.slot === "object") {
        slotInfo = {
          id: a.slot._id || a.slot.id,
          date: a.slot.date,
          timeStart: a.slot.timeStart,
          timeEnd: a.slot.timeEnd,
          isBooked: !!(a.slot.isBooked || a.slot.is_booked),
        };
      }

      const datetime =
        slotInfo && slotInfo.date && slotInfo.timeStart
          ? `${slotInfo.date}T${slotInfo.timeStart}:00.000`
          : a.datetime || new Date().toISOString();

      return {
        id: a._id,
        title: a.title,
        desc: a.description,
        datetime,
        status: statusStr.charAt(0).toUpperCase() + statusStr.slice(1),
        raw: a,
        slot: slotInfo,
      };
    });

    const approved = mapped.filter(
      (m) => String(m.status || "").toLowerCase() === "approved"
    );

    setAppointments(approved);
  } catch (err) {
    console.error("Refresh appointments error:", err);
  }
};


  // --- Load slots from backend and build slotsMap ---
 useEffect(() => {
  refreshSlots();
  refreshAppointments();
}, []);


  // --- Handlers ---
  const openModal = (pref = { slot: null }) => setModalPrefill(pref);
  const closeModal = () => setModalPrefill(false);

  const handleCancelClick = (appointment) => {
    setSelectedAppointment(appointment);
    setShowCancelModal(true);
  };

  const handleConfirmCancel = async ({ id, reason }) => {
  try {
    console.log("DEBUG: sending cancel request for", id);

    const res = await axios.delete(
      `http://localhost:5000/api/appointments/${id}`,
      {
        data: { reason },          // axios allows body in DELETE
        withCredentials: true      // MOST IMPORTANT
      }
    );

    // Remove from UI
  await refreshAppointments();
await refreshSlots();

    alert("Appointment cancelled successfully!");
  } catch (err) {
    console.error("Cancel error:", err);
    alert(err.response?.data?.message || "Failed to cancel appointment");
  }
};




  // Add appointment to UI (only if approved)
  const addAppointment = async(appt) => {
    const created = {
      id: appt._id || appt.id || "ap" + Math.random().toString(36).slice(2, 9),
      title: appt.title || appt.purpose || "Appointment",
      desc: appt.description || "",
      datetime: appt.datetime || appt.dateTime || new Date().toISOString(),
      status: (appt.status && typeof appt.status === "string")
        ? (appt.status.charAt(0).toUpperCase() + appt.status.slice(1))
        : "Pending",
      raw: appt,
      slot: appt.slot || null,
    };

    if (String(created.status || "").toLowerCase() === "approved") {
      setAppointments((prev) => [created, ...prev]);
    } else {
      console.log("New appointment not approved yet; not added to approved list.");
    }
  // After backend creates the appointment, just reload everything fresh
  await refreshAppointments();
  await refreshSlots();



  };

  const handleRescheduleClick = (appointment) => {
    setRescheduleTarget(appointment);
    setShowRescheduleModal(true);
  };

  const handleConfirmReschedule = async ({ appointmentId, slotId }) => {
  console.log("DEBUG: Sending reschedule:", appointmentId, slotId);

  try {
    await axios.patch(
  `http://localhost:5000/api/appointments/${appointmentId}/reschedule`,
  { slotId },
  { withCredentials: true }
);




    // Update UI
   await refreshAppointments();
  await refreshSlots();

    setShowRescheduleModal(false);
    alert("Appointment rescheduled!");
  } catch (err) {
    console.error(err);
    alert(err.response?.data?.message || "Failed to reschedule");
  }
};

  const formatDateTime = (iso) => {
    try {
      const d = new Date(iso);
      return `${d.toLocaleDateString()} · ${d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
    } catch {
      return iso;
    }
  };

const prevMonth = () => {
  setViewDate((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1));
  refreshSlots();
};

const nextMonth = () => {
  setViewDate((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1));
  refreshSlots();
};


  const handleLogout = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });

      if (res.ok) {
        console.log("Logout successful");
        navigate("/login");
      } else {
        const data = await res.json();
        console.error("Logout failed:", data.message);
      }
    } catch (err) {
      console.error("Logout error:", err);
    }
  };


  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="border-b bg-white">
        <div className="max-w-7xl mx-auto flex justify-between items-center px-6 py-3">
          <div>
            <h1 className="text-sky-600 font-semibold text-lg">SchedulEase</h1>
            <p className="text-xs text-gray-500">Student Dashboard</p>
          </div>
          <button
            onClick={handleLogout}
            className="border border-gray-300 text-sm px-3 py-1 rounded-md hover:bg-gray-50"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Quick Actions */}
      <section className="mt-6 flex justify-center">
        <div className="grid grid-cols-3 gap-4 w-full max-w-4xl">
          <button
            onClick={() => openModal({ slot: null })}
            className="flex items-center justify-center gap-2 py-3 rounded-lg font-medium text-white bg-gradient-to-r from-blue-500 to-green-400 shadow hover:opacity-90"
          >
            <PlusCircle size={18} /> Book New Appointment
          </button>

          <button
            onClick={() => (appointments.length ? handleRescheduleClick(appointments[0]) : alert("No appointments to reschedule"))}
            className="flex items-center justify-center gap-2 py-3 rounded-lg font-medium bg-white border border-gray-300 hover:border-blue-400 text-gray-700 transition"
          >
            <CalendarClock size={18} /> Reschedule Appointment
          </button>

          <button
            onClick={() => handleCancelClick(appointments[0])}
            className="flex items-center justify-center gap-2 py-3 rounded-lg font-medium bg-white border border-gray-300 hover:border-rose-400 text-gray-700 transition"
          >
            <XCircle size={18} /> Cancel Appointment
          </button>
        </div>
      </section>

      {/* Two Column Layout */}
      <main className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6 px-6 py-6">
        {/* My Appointments */}
        <div className="bg-white border rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">My Approved Appointments</h3>
          {appointments.length === 0 ? (
            <div className="text-gray-500 text-sm">No approved appointments found</div>
          ) : (
            <div className="space-y-4">
              {appointments.map((a) => (
                <div key={a.id} className="border rounded-lg p-4 flex justify-between items-start">
                  <div>
                    <p className="font-semibold text-sm">{a.title}</p>
                    <p className="text-xs text-gray-500">{formatDateTime(a.datetime)}</p>
                    <p className="text-xs text-gray-400 mt-1">{a.desc}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs ${a.status === "Approved" ? "bg-blue-100 text-blue-700" : a.status === "Pending" ? "bg-yellow-100 text-yellow-700" : "bg-gray-100 text-gray-700"}`}>
                      {a.status}
                    </span>
                    <div className="flex gap-2">
                      <button onClick={() => handleRescheduleClick(a)} className="text-xs px-2 py-1 border rounded hover:bg-gray-50">Reschedule</button>
                      <button onClick={() => handleCancelClick(a)} className="text-xs px-2 py-1 border rounded hover:bg-gray-50">Cancel</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Calendar */}
        <div className="bg-white border rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Available Slots</h3>
            <div className="flex items-center gap-2">
              <button onClick={prevMonth} className="px-2 py-1 border rounded">‹</button>
              <span className="text-sm text-gray-600">{monthNames[month]} {year}</span>
              <button onClick={nextMonth} className="px-2 py-1 border rounded">›</button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1 text-xs text-gray-500 mb-2">
            {daysOfWeek.map((d) => (<div key={d} className="text-center">{d}</div>))}
          </div>

          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: firstDayOfMonth }).map((_, i) => (
              <div key={`empty-${i}`} className="h-28 rounded border bg-gray-50" />
            ))}

            {Array.from({ length: daysInMonth }).map((_, idx) => {
              const dateObj = new Date(year, month, idx + 1);
              const iso = dateObj.toISOString().slice(0, 10);
              const slotsForDay = slotsMap[iso] || [];

              return (
                <div key={iso} className="h-40 rounded border p-2 flex flex-col bg-gray-50 hover:bg-gray-100 transition">
                  <div className="flex justify-between">
                    <span className="text-sm font-semibold text-gray-700">{idx + 1}</span>
                    <span className="text-xs text-gray-400">{slotsForDay.length}</span>
                  </div>

                  <div className="mt-1 overflow-auto space-y-1">
                    {slotsForDay.length === 0 ? (
                      <div className="text-xs text-gray-400">No slots</div>
                    ) : (
                      slotsForDay.slice(0, 3).map((s) => (
                        <button
  key={s.id}
  onClick={() => !s.isBooked && openModal({ slot: s.raw })}
  className={`w-full text-xs text-left px-2 py-1 rounded border 
    ${s.isBooked 
      ? "bg-red-100 text-red-700 border-red-300 cursor-not-allowed" 
      : "bg-green-100 text-green-700 border-green-300 hover:bg-green-200"
    }`
  }
  disabled={s.isBooked}
>
  {s.timeStart} - {s.timeEnd}
</button>

                      ))
                    )}
                    {slotsForDay.length > 3 && <div className="text-xs text-gray-400">+{slotsForDay.length - 3} more</div>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>

      {/* Stats Section */}
      <section className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-4 px-6 pb-10">
        <StatCard title="Total Appointments" value={appointments.length} subtitle="+0 this month" color="green" />
        <StatCard title="Pending Requests" value={0} subtitle="(only approved shown)" color="yellow" />
        <StatCard title="Approval Rate" value={`${appointments.length ? "100%" : "0%"}`} subtitle={`${appointments.length}/${appointments.length} approved`} color="blue" />
      </section>

      {/* Book Appointment Modal */}
      {modalPrefill && (
        <BookAppointmentModal
          slot={modalPrefill.slot || null}
          defaultDate={modalPrefill.slot?.date || ""}
          defaultTime={modalPrefill.slot?.timeStart || ""}
          onClose={closeModal}
          onSubmit={addAppointment}
        />
      )}

      {/* Cancel Appointment Modal */}
      {showCancelModal && selectedAppointment && (
        <CancelAppointmentModal appointment={selectedAppointment} onClose={() => setShowCancelModal(false)} onConfirm={handleConfirmCancel} />
      )}

      {/* Reschedule Modal */}
      {showRescheduleModal && rescheduleTarget && (
  <RescheduleAppointmentModal
    appointment={rescheduleTarget}
    availableSlots={slotsMap}   // <-- FIX: pass slotsMap here
    onClose={() => setShowRescheduleModal(false)}
    onConfirm={handleConfirmReschedule}
  />
)}

    </div>
  );
}

/* StatCard Component */
function StatCard({ title, value, subtitle, color }) {
  const colorClass = { green: "text-green-500", yellow: "text-yellow-500", blue: "text-blue-500" }[color];
  return (
    <div className="bg-white border rounded-lg p-4">
      <div className="text-sm text-gray-500">{title}</div>
      <div className="text-2xl font-semibold">{value}</div>
      <div className={`text-xs ${colorClass} mt-1`}>{subtitle}</div>
    </div>
  );
}
