// src/components/RescheduleAppointmentModal.jsx
import React, { useState, useEffect } from "react";
import { X } from "lucide-react";

/**
 * Props:
 * - appointment: object (the appointment being rescheduled). Expect appointment.id or appointment._id and appointment.datetime
 * - availableSlots: object mapping date "YYYY-MM-DD" -> [{ id, timeStart, timeEnd, isBooked, date, raw }]
 * - onClose: () => void
 * - onConfirm: ({ appointmentId, slotId }) => void
 */
export default function RescheduleAppointmentModal({
  appointment,
  availableSlots = {},
  onClose = () => {},
  onConfirm = () => {},
}) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedSlotId, setSelectedSlotId] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    if (appointment?.datetime) {
      const d = new Date(appointment.datetime);
      setSelectedDate(d);
      setCurrentMonth(new Date(d.getFullYear(), d.getMonth(), 1));
    } else if (appointment?.slot?.date) {
      // If appointment has slot object with date/time, prefer that.
      const d = new Date(`${appointment.slot.date}T${appointment.slot.timeStart}:00`);
      setSelectedDate(d);
      setCurrentMonth(new Date(d.getFullYear(), d.getMonth(), 1));
    }
    setSelectedSlotId(null);
  }, [appointment]);

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const handlePrevMonth = () => setCurrentMonth(new Date(year, month - 1, 1));
  const handleNextMonth = () => setCurrentMonth(new Date(year, month + 1, 1));

  const handleDayClick = (day) => {
    const d = new Date(year, month, day);
    setSelectedDate(d);
    setSelectedSlotId(null);
  };

  const dateISO = selectedDate.toISOString().slice(0, 10);

  // Normalize available slots for this date to objects of shape:
  // { id, timeStart, timeEnd, isBooked, date, raw }
  const times = (availableSlots[dateISO] || []).map((s) => {
    // support both { id, _id } and possible raw fields name differences
    return {
      id: s.id || s._id || (s.raw && (s.raw._id || s.raw.id)) || null,
      timeStart: s.timeStart || s.start || (s.raw && s.raw.timeStart) || "-",
      timeEnd: s.timeEnd || s.end || (s.raw && s.raw.timeEnd) || "-",
      isBooked: !!(s.isBooked || s.is_booked || (s.raw && (s.raw.isBooked || s.raw.is_booked))),
      date: s.date || (s.raw && s.raw.date) || dateISO,
      raw: s.raw || s,
    };
  });

  // When month changes, clear selected slot/time
  useEffect(() => {
    setSelectedSlotId(null);
  }, [currentMonth]);

  const selectedSlot = times.find((t) => String(t.id) === String(selectedSlotId)) || null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-3xl rounded-xl shadow-lg overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-800">Reschedule Appointment</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left: Current Info + Calendar */}
          <div>
            <div className="bg-gray-50 rounded-lg p-4 mb-4 border">
              <p className="text-sm text-gray-500 font-medium">Current Appointment</p>
              <p className="text-gray-700 mt-1">
                Date:{" "}
                <span className="font-semibold">
                  {appointment?.datetime ? new Date(appointment.datetime).toLocaleDateString() : (appointment?.slot?.date || "-")}
                </span>
              </p>
              <p className="text-gray-700">
                Time:{" "}
                <span className="font-semibold">
                  {appointment?.datetime
                    ? new Date(appointment.datetime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                    : appointment?.slot ? `${appointment.slot.timeStart} - ${appointment.slot.timeEnd}` : "-"}
                </span>
              </p>
              <p className="text-gray-700">
                Purpose: <span className="font-semibold">{appointment?.title || "-"}</span>
              </p>
            </div>

            {/* Calendar */}
            <div className="border rounded-lg p-3">
              <div className="flex justify-between items-center mb-3">
                <button
                  onClick={handlePrevMonth}
                  className="px-2 py-1 border rounded hover:bg-gray-100"
                >
                  ‹
                </button>
                <div className="text-sm font-medium text-gray-700">
                  {monthNames[month]} {year}
                </div>
                <button
                  onClick={handleNextMonth}
                  className="px-2 py-1 border rounded hover:bg-gray-100"
                >
                  ›
                </button>
              </div>

              <div className="grid grid-cols-7 text-center text-xs text-gray-500 mb-2">
                {daysOfWeek.map((d) => (
                  <div key={d}>{d}</div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1 text-sm">
                {Array.from({ length: firstDay }).map((_, i) => (
                  <div key={`empty-${i}`} className="h-8" />
                ))}

                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const day = i + 1;
                  const isSelected =
                    selectedDate.getDate() === day &&
                    selectedDate.getMonth() === month &&
                    selectedDate.getFullYear() === year;

                  // mark days that have slots (optional visual cue)
                  const iso = new Date(year, month, day).toISOString().slice(0, 10);
                  const hasSlots = Array.isArray(availableSlots[iso]) && availableSlots[iso].length > 0;

                  return (
                    <button
                      key={day}
                      onClick={() => handleDayClick(day)}
                      className={`h-8 w-8 flex items-center justify-center rounded-full mx-auto
                        ${isSelected ? "bg-blue-500 text-white" : "hover:bg-gray-100 text-gray-700"}
                      `}
                      title={hasSlots ? `${availableSlots[iso].length} slot(s)` : "No slots"}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right: Time slots for selectedDate */}
          <div>
            <h3 className="text-sm font-medium text-gray-600 mb-2">
              Available Times - <span className="font-semibold">{selectedDate.toLocaleDateString()}</span>
            </h3>

            <div className="border rounded-lg p-3 h-80 overflow-y-auto space-y-2">
              {times.length === 0 ? (
                <div className="text-sm text-gray-500">No slots available for this date</div>
              ) : (
                times.map((slot, idx) => (
                  <button
                    key={String(slot.id || idx)}
                    disabled={slot.isBooked}
                    onClick={() => !slot.isBooked && setSelectedSlotId(slot.id)}
                    className={`flex justify-between items-center w-full text-left px-3 py-2 rounded border
                      ${slot.isBooked
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200"
                        : selectedSlotId && String(selectedSlotId) === String(slot.id)
                        ? "bg-blue-50 border-blue-400 text-blue-700"
                        : "hover:bg-gray-50"
                      }`}
                  >
                    <span className="font-medium">
                      {slot.timeStart} — {slot.timeEnd}
                    </span>
                    <span className="text-xs text-gray-500">
                      {slot.isBooked ? "Booked" : "Available"}
                    </span>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t px-6 py-4 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>

          <button
            onClick={() =>
              onConfirm({
                appointmentId: appointment?._id || appointment?.id,
                slotId: selectedSlotId,
              })
            }
            disabled={!selectedSlotId}
            className={`px-4 py-2 rounded-md text-white transition
              ${selectedSlotId ? "bg-blue-600 hover:bg-blue-700" : "bg-gray-400 cursor-not-allowed"}`}
          >
            Confirm Reschedule
          </button>
        </div>
      </div>
    </div>
  );
}
