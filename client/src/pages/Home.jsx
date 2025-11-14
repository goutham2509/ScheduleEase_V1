import React from "react";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate("/login");
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-blue-400 to-teal-400 text-white px-4">
      <div className="text-center max-w-2xl">
        {/* Header Tag */}
        <div className="flex justify-center items-center mb-4">
          <div className="bg-white/25 px-4 py-2 rounded-full flex items-center gap-2 backdrop-blur-sm">
            {/* Icon */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="white"
              className="w-5 h-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8.25 6.75h7.5m-7.5 3.75h7.5M3 6.75A2.25 2.25 0 015.25 4.5h13.5A2.25 2.25 0 0121 6.75v10.5A2.25 2.25 0 0118.75 19.5H5.25A2.25 2.25 0 013 17.25V6.75z"
              />
            </svg>
            <span className="font-medium text-white text-sm md:text-base">
              NITC Director&apos;s Office
            </span>
          </div>
        </div>

        {/* Main Title */}
        <h1 className="text-5xl md:text-6xl font-extrabold mb-4 drop-shadow-lg">
          SchedulEase
        </h1>

        {/* Description */}
        <p className="text-lg md:text-xl text-white/90 mb-8">
          Streamlined appointment scheduling system for NITC Director&apos;s
          office. Book meetings efficiently with automated workflows for
          students, staff, and external visitors.
        </p>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={handleGetStarted}
            className="bg-gradient-to-r from-blue-500 to-green-400 text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:opacity-90 transition"
          >
            Get Started
          </button>
          <button className="border border-white/70 text-white px-8 py-3 rounded-xl font-semibold hover:bg-white/10 transition">
            Learn More
          </button>
        </div>
      </div>
    </div>
  );
}
