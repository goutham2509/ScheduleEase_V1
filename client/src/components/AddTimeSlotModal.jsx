import React, { useState } from "react";

export default function AddTimeSlotModal({ onClose, onConfirm }) {
  const [fromTime, setFromTime] = useState("");
  const [toTime, setToTime] = useState("");
  const [date, setDate] = useState("");
  const [loading, setLoading] = useState(false);

  // inside AddTimeSlotModal.jsx
const handleSubmit = async (e) => {
  e.preventDefault();
  if (!fromTime || !toTime || !date) {
    alert("Please fill all fields!");
    return;
  }

  setLoading(true);
  try {
    const res = await fetch("http://localhost:5000/api/slots", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ date, timeStart: fromTime, timeEnd: toTime }),
    });

    // parse response safely
    let data = null;
    try { data = await res.json(); } catch (err) { console.warn("Non-JSON response", err); }

    // backend might return { slot: {...} } or the slot directly — handle both
    const createdSlot = data?.slot ?? data ?? null;

    if (res.ok && createdSlot) {
      // pass the real DB object to parent
      onConfirm && onConfirm(createdSlot);
      onClose && onClose();
    } else if (res.status === 400 && data?.message?.includes("already")) {
      alert("This slot already exists!");
      onClose && onClose();
    } else {
      alert("Error creating slot: " + (data?.message || res.statusText));
    }
  } catch (err) {
    console.error("Create slot failed:", err);
    alert("Network error while creating slot.");
  } finally {
    setLoading(false);
  }
};


  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
      <div className="bg-white rounded-xl shadow-lg w-[90%] max-w-md p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          Add Time Slot
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              From Time
            </label>
            <input
              type="time"
              value={fromTime}
              onChange={(e) => setFromTime(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              To Time
            </label>
            <input
              type="time"
              value={toTime}
              onChange={(e) => setToTime(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <div className="flex justify-end gap-2 mt-6">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-sm rounded-lg border border-gray-300 hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`px-4 py-2 text-sm rounded-lg text-white ${
                loading
                  ? "bg-sky-300 cursor-not-allowed"
                  : "bg-sky-600 hover:bg-sky-700"
              }`}
            >
              {loading ? "Saving..." : "Add Slot"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
