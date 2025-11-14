import React, { useState } from "react";
import { useNavigate } from "react-router-dom";


export default function Login() {
  const [selectedRole, setSelectedRole] = useState(null);

  const navigate = useNavigate();

  const handleOAuthLogin = (role) => {
  window.location.href = `http://localhost:5000/api/auth/google?role=${role}`;
};

  const handleext = () => {
  navigate("/external");
};
  const handleint = () => {
  navigate("/student");
};
  const handleadm = () => {
  navigate("/admin");
};


  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-500 to-teal-400 px-4">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-md p-8 space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center items-center mb-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="#3b82f6"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8.25 6.75h7.5m-7.5 3.75h7.5M3 6.75A2.25 2.25 0 015.25 4.5h13.5A2.25 2.25 0 0121 6.75v10.5A2.25 2.25 0 0118.75 19.5H5.25A2.25 2.25 0 013 17.25V6.75z"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-800">SchedulEase</h1>
          <p className="text-sm text-gray-500">
            Director's Office Administration
          </p>
        </div>

        {/* Role Selection */}
        <div className="space-y-3">
          <p className="text-center text-gray-700 font-semibold">
            Welcome Back
          </p>
          <p className="text-center text-gray-500 text-sm">
            Choose your account type to sign in with Google
          </p>

          <div className="space-y-3 mt-4">
            {/* NITC User */}
            <button
              //onClick={() => handleOAuthLogin("internal user")}
              onClick={handleint}
              className={`w-full border flex items-center justify-between px-4 py-3 rounded-xl transition ${
                selectedRole === "internal user"
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-300 hover:border-blue-400"
              }`}
            >
              <span className="flex items-center gap-2 text-gray-700">
                <span className="text-blue-500 font-semibold">👤</span>
                <span>NITC User</span>
              </span>
              <span className="text-xs text-gray-500">
                Auto-approved appointments
              </span>
            </button>

            {/* External User */}
            <button
              onClick={() => handleOAuthLogin("external user")}
              //onClick={handleext}
              className={`w-full border flex items-center justify-between px-4 py-3 rounded-xl transition ${
                selectedRole === "external user"
                  ? "border-green-500 bg-green-50"
                  : "border-gray-300 hover:border-green-400"
              }`}
            >
              <span className="flex items-center gap-2 text-gray-700">
                <span className="text-green-500 font-semibold">🌐</span>
                <span>External User</span>
              </span>
              <span className="text-xs text-gray-500">
                Book 2 days in advance
              </span>
            </button>

            {/* Administrator */}
            <button
              //onClick={() => handleOAuthLogin("admin")}
              onClick={handleadm}
              className={`w-full border flex items-center justify-between px-4 py-3 rounded-xl transition ${
                selectedRole === "admin"
                  ? "border-yellow-500 bg-yellow-50"
                  : "border-gray-300 hover:border-yellow-400"
              }`}
            >
              <span className="flex items-center gap-2 text-gray-700">
                <span className="text-yellow-500 font-semibold">🛠️</span>
                <span>Administrator</span>
              </span>
              <span className="text-xs text-gray-500">
                Manage schedules & appointments
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
