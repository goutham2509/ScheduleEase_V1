import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import BookAppointmentModal from "../components/BookAppointmentModal";
import CancelAppointmentModal from "../components/CancelAppointmentModal";
import RescheduleAppointmentModal from "../components/RescheduleAppointmentModal"; // ✅ Added
import { PlusCircle, CalendarClock, XCircle } from "lucide-react";
import { useEffect } from "react";


// import AppointmentsList from "../components/AppointmentsList";

// export default function ExternalDashboard() {
//   return (
//     <div className="min-h-screen bg-gray-50">
//       <div className="max-w-4xl mx-auto py-8">
//         <AppointmentsList />
//       </div>
//     </div>
//   );



export default function ExternalDashboard() {
  const navigate = useNavigate();

  useEffect(() => {
    fetch("http://localhost:5000/api/auth/me", {
      credentials: "include",
    })
      .then(res => {
        if (!res.ok) {
          // not logged in — redirect to login page
          navigate("/login");
        }
      })
      .catch(() => navigate("/login"));
  }, [navigate]);

  // Mock appointments
  const [appointments, setAppointments] = useState([
    {
      id: "e1",
      title: "Industry Collaboration Discussion",
      desc: "External Visitor",
      datetime: (() => {
        const d = new Date();
        d.setDate(d.getDate() + 4);
        d.setHours(14, 0, 0, 0);
        return d.toISOString();
      })(),
      status: "Approved",
    },
    {
      id: "e2",
      title: "Guest Lecture Planning",
      desc: "External Visitor",
      datetime: (() => {
        const d = new Date();
        d.setDate(d.getDate() + 7);
        d.setHours(11, 0, 0, 0);
        return d.toISOString();
      })(),
      status: "Pending",
    },
  ]);

  // Calendar state
  const [slotsMap, setSlotsMap] = useState(() => buildDefaultSlots(new Date()));
  const [viewDate, setViewDate] = useState(new Date());
  const month = viewDate.getMonth();
  const year = viewDate.getFullYear();

  const monthNames = useMemo(
    () => [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ],
    []
  );
  const daysOfWeek = useMemo(() => ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"], []);

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const prevMonth = () => setViewDate(d => new Date(d.getFullYear(), d.getMonth() - 1, 1));
  const nextMonth = () => setViewDate(d => new Date(d.getFullYear(), d.getMonth() + 1, 1));

  // Book modal
  const [modalPrefill, setModalPrefill] = useState(false);
  const openModal = (pref = { date: "", time: "" }) => setModalPrefill(pref);
  const closeModal = () => setModalPrefill(false);

  const addAppointment = (appt) => {
    setAppointments((prev) => [appt, ...prev]);
    const dateISO = appt.datetime.slice(0, 10);
    const time = appt.datetime.slice(11, 16);
    setSlotsMap((prev) => {
      const arr = prev[dateISO] ? prev[dateISO].filter((t) => t !== time) : [];
      return { ...prev, [dateISO]: arr };
    });
  };

  // Cancel modal
  const [cancelModal, setCancelModal] = useState(null);
  const openCancelModal = (appt) => setCancelModal(appt);
  const closeCancelModal = () => setCancelModal(null);
  const handleCancelConfirm = (id, reason) => {
    setAppointments((prev) =>
      prev.map((a) =>
        a.id === id ? { ...a, status: "Cancelled", cancelReason: reason } : a
      )
    );
  };

  // ✅ Reschedule modal
  const [rescheduleModal, setRescheduleModal] = useState(null);
  const openRescheduleModal = (appt) => setRescheduleModal(appt);
  const closeRescheduleModal = () => setRescheduleModal(null);
  const handleRescheduleConfirm = ({ id, datetime }) => {
    setAppointments((prev) =>
      prev.map((a) =>
        a.id === id
          ? { ...a, datetime: new Date(datetime).toISOString(), status: "Pending" }
          : a
      )
    );
    closeRescheduleModal();
  };

  // Enforce 2-day booking rule
  const minDate = new Date();
  minDate.setDate(minDate.getDate() + 2);
  const minDateISO = minDate.toISOString().slice(0, 10);

  const handleLogout = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/auth/logout", {
        method: "POST",
        credentials: "include", // ✅ important so cookies are sent to backend
      });

      if (res.ok) {
        console.log("Logout successful");
        navigate("/login"); // ✅ redirect to login AFTER backend logout
      } else {
        const data = await res.json();
        console.error("Logout failed:", data.message);
      }
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

//   router.get("/logout", (req, res, next) => {
//   console.log("GET logout endpoint hit ✅");
//   req.logout(err => {
//     if (err) return next(err);

//     req.session.destroy(() => {
//       res.clearCookie("connect.sid", {
//         httpOnly: true,
//         sameSite: "lax",
//         secure: false,
//         path: "/",
//       });
//       res.redirect("http://localhost:5173/login"); // ✅ redirect directly from backend
//     });
//   });
// });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Bar */}
      <div className="border-b bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4 py-3">
          <div>
            <div className="text-sky-600 font-semibold text-lg">SchedulEase</div>
            <div className="text-xs text-gray-500">External Dashboard</div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-gray-600 bg-yellow-50 border border-yellow-200 px-3 py-1 rounded-lg">
              External User
            </span>
            <button
              onClick={handleLogout}
              className="bg-white border px-3 py-1 rounded-md text-sm hover:bg-gray-50"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Quick Actions */}
        <section className="flex justify-center mt-6 px-6">
          <div className="grid grid-cols-3 gap-4 w-full max-w-4xl">
            <button
              onClick={() => openModal({ date: "", time: "" })}
              className="flex items-center justify-center gap-2 py-3 rounded-lg font-medium bg-gradient-to-r from-blue-500 to-green-400 text-white shadow hover:opacity-90 transition-all"
            >
              <PlusCircle /> Book New Appointment
            </button>
            <button
              onClick={() =>
                appointments.length
                  ? openRescheduleModal(appointments[0])
                  : alert("No appointments to reschedule")
              }
              className="flex items-center justify-center gap-2 py-3 rounded-lg font-medium bg-white border border-gray-300 text-gray-700 hover:border-blue-400 transition-all"
            >
              <CalendarClock /> Reschedule Appointment
            </button>
            <button
              onClick={() => openCancelModal(appointments[0])}
              className="flex items-center justify-center gap-2 py-3 rounded-lg font-medium bg-white border border-gray-300 text-gray-700 hover:border-rose-400 transition-all"
            >
              <XCircle /> Cancel Appointment
            </button>
          </div>
        </section>

        {/* Yellow Rule Banner */}
        <div className="mt-6 mb-4">
          <div className="text-center bg-yellow-50 border border-yellow-200 text-yellow-700 py-2 rounded font-medium">
            ⚠️ External users must book appointments at least 2 days in advance.
          </div>
        </div>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          {/* Left - Appointments */}
          <div className="bg-white rounded-lg border p-6">
            <h3 className="text-lg font-semibold mb-4">Appointment Requests</h3>
            <div className="space-y-4">
              {appointments.map((a) => {
                const d = new Date(a.datetime);
                return (
                  <div key={a.id} className="border rounded p-4 flex justify-between items-start">
                    <div>
                      <div className="text-sm font-semibold">{a.title}</div>
                      <div className="text-xs text-gray-500">{a.desc}</div>
                      <div className="text-xs text-gray-400 mt-2">
                        {d.toLocaleDateString()} ·{" "}
                        {d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <div
                        className={`px-3 py-1 rounded-full text-xs ${
                          a.status === "Approved"
                            ? "bg-green-100 text-green-700"
                            : a.status === "Pending"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {a.status}
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => openRescheduleModal(a)} // ✅ Opens reschedule modal
                          className="text-xs px-2 py-1 border rounded hover:bg-gray-50"
                        >
                          Reschedule
                        </button>
                        <button
                          onClick={() => openCancelModal(a)}
                          className="text-xs px-2 py-1 border rounded hover:bg-gray-50"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right - Calendar */}
          <div className="bg-white rounded-lg border p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Available Slots</h3>
              <div className="flex items-center gap-2">
                <button onClick={prevMonth} className="px-2 py-1 rounded border">
                  ‹
                </button>
                <div className="text-sm text-gray-600">
                  {monthNames[month]} {year}
                </div>
                <button onClick={nextMonth} className="px-2 py-1 rounded border">
                  ›
                </button>
              </div>
            </div>

            {/* Days header */}
            <div className="grid grid-cols-7 gap-1 text-xs text-gray-500 mb-2">
              {daysOfWeek.map((d) => (
                <div key={d} className="text-center">
                  {d}
                </div>
              ))}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-2">
              {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                <div key={`e-${i}`} className="h-28 rounded border bg-gray-50" />
              ))}

              {Array.from({ length: daysInMonth }).map((_, idx) => {
                const dateObj = new Date(year, month, idx + 1);
                const iso = dateObj.toISOString().slice(0, 10);
                const times = slotsMap[iso] || [];
                const isDisabled = iso < minDateISO;
                return (
                  <div
                    key={iso}
                    className={`h-48 rounded border p-2 flex flex-col ${
                      isDisabled
                        ? "bg-gray-100 text-gray-400"
                        : "hover:border-sky-400 hover:bg-sky-50 cursor-pointer"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-700 font-semibold">{idx + 1}</div>
                      <div className="text-xs text-gray-400">{times.length}</div>
                    </div>

                    <div className="mt-2 space-y-1 overflow-auto">
                      {times.length === 0 ? (
                        <div className="text-xs text-gray-400">No slots</div>
                      ) : (
                        times.slice(0, 3).map((t) => (
                          <button
                            key={t}
                            onClick={() => {
                              if (isDisabled) {
                                alert("External users must book at least 2 days in advance.");
                                return;
                              }
                              openModal({ date: iso, time: t });
                            }}
                            className="w-full text-xs text-left px-2 py-1 border rounded text-gray-700 hover:bg-blue-50"
                          >
                            {t}
                          </button>
                        ))
                      )}
                      {times.length > 3 && (
                        <div className="text-xs text-gray-400 mt-1">
                          +{times.length - 3} more
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
          <div className="bg-white rounded-lg border p-4">
            <div className="text-sm text-gray-500">Total Appointments</div>
            <div className="text-2xl font-semibold">{appointments.length}</div>
            <div className="text-xs text-green-500 mt-1">+1 this month</div>
          </div>
          <div className="bg-white rounded-lg border p-4">
            <div className="text-sm text-gray-500">Pending Requests</div>
            <div className="text-2xl font-semibold">
              {appointments.filter((a) => a.status === "Pending").length}
            </div>
            <div className="text-xs text-yellow-500 mt-1">Awaiting approval</div>
          </div>
          <div className="bg-white rounded-lg border p-4">
            <div className="text-sm text-gray-500">Approved Rate</div>
            <div className="text-2xl font-semibold">
              {Math.round(
                (appointments.filter((a) => a.status === "Approved").length /
                  Math.max(1, appointments.length)) *
                  100
              )}
              %
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {appointments.filter((a) => a.status === "Approved").length}/{appointments.length} approved
            </div>
          </div>
        </div>
      </main>

      {/* Modals */}
      {modalPrefill && (
        <BookAppointmentModal
          role="External User"
          defaultDate={modalPrefill.date}
          defaultTime={modalPrefill.time}
          onClose={closeModal}
          onSubmit={addAppointment}
        />
      )}

      {cancelModal && (
        <CancelAppointmentModal
          appointment={cancelModal}
          onClose={closeCancelModal}
          onConfirm={handleCancelConfirm}
        />
      )}

      {/* ✅ Reschedule Modal */}
      {rescheduleModal && (
        <RescheduleAppointmentModal
          appointment={rescheduleModal}
          onClose={closeRescheduleModal}
          onConfirm={handleRescheduleConfirm}
        />
      )}
    </div>
  );
}

/* Helper */
function buildDefaultSlots(date) {
  const map = {};
  const year = date.getFullYear();
  const month = date.getMonth();
  const days = new Date(year, month + 1, 0).getDate();
  for (let i = 1; i <= days; i++) {
    const d = new Date(year, month, i);
    const day = d.getDay();
    map[d.toISOString().slice(0, 10)] =
      day === 0 || day === 6
        ? ["09:00", "10:00"]
        : ["09:00", "09:30", "10:00", "11:00", "14:00"];
  }
  return map;
}
