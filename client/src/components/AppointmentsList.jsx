import React, { useEffect, useState } from "react";
import { getAppointments } from "../api/appointmentAPI";

export default function AppointmentsList() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getAppointments();
        setAppointments(data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch appointments");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="p-4 text-gray-600">Loading appointments...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;
  if (appointments.length === 0) return <div className="p-4 text-gray-500">No appointments found.</div>;

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4">Your Appointments</h2>
      <div className="grid gap-4">
        {appointments.map((appt) => (
          <div key={appt._id} className="border rounded-lg p-4 shadow-sm bg-white">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-medium text-gray-800">{appt.title}</h3>
              <span
                className={`text-sm px-2 py-1 rounded-full ${
                  appt.status === "approved"
                    ? "bg-green-100 text-green-700"
                    : appt.status === "pending"
                    ? "bg-yellow-100 text-yellow-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {appt.status}
              </span>
            </div>

            <p className="text-sm text-gray-600">
              <strong>Date:</strong> {appt.slot?.date || "N/A"}<br />
              <strong>Time:</strong> {appt.slot?.start_time || "N/A"}
            </p>

            <p className="mt-2 text-sm text-gray-700">{appt.description}</p>

            <div className="mt-2 text-xs text-gray-500">
              Created: {new Date(appt.createdAt).toLocaleString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
