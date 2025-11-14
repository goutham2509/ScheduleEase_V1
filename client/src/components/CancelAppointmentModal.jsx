import React, { useState } from "react";

export default function CancelAppointmentModal({ appointment, onClose, onConfirm }) {
  const [reason, setReason] = useState("");

  if (!appointment) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center border-b px-5 py-3">
          <h3 className="text-lg font-semibold text-red-600 flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-5 h-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            Cancel Appointment
          </h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          <div className="bg-gray-50 border rounded-lg p-3">
            <p className="text-sm font-semibold">Appointment Details</p>
            <p className="text-xs text-gray-600 mt-2">
              <b>Date:</b> {new Date(appointment.datetime).toLocaleDateString()} <br />
              <b>Time:</b>{" "}
              {new Date(appointment.datetime).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}{" "}
              <br />
              <b>Purpose:</b> {appointment.title || "Meeting"}
            </p>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">
              Reason for cancellation (optional)
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Write your reason here..."
              className="w-full border rounded-lg px-3 py-2 mt-2 min-h-[80px] text-sm"
            />
          </div>

          <div className="bg-red-50 border border-red-100 rounded-lg p-3 text-sm text-red-700">
            Are you sure you want to cancel this appointment? <br />
            <b>This action cannot be undone.</b>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 border-t px-5 py-3">
          <button
            onClick={onClose}
            className="border rounded-lg px-4 py-2 text-sm hover:bg-gray-100"
          >
            Keep Appointment
          </button>
          <button
            onClick={() => {
              onConfirm && onConfirm({ id: appointment.id, reason });
              onClose();
            }}
            className="bg-red-600 hover:bg-red-700 text-white rounded-lg px-4 py-2 text-sm"
          >
            Cancel Appointment
          </button>
        </div>
      </div>
    </div>
  );
}
