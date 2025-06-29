import React from "react";

const ProgressBar = ({ progress, showPercent }) => (
  <div className="w-full bg-gray-700 rounded-full h-2.5 mb-4 relative">
    <div
      className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
      style={{ width: `${progress}%` }}
    />
    {showPercent && (
      <span
        className="absolute text-white text-xs font-semibold transition-all duration-300"
        style={{
          left: `calc(${progress}% - 16px)`,
          top: "150%", // move below the bar
          minWidth: "32px",
          textAlign: "center",
          pointerEvents: "none",
          transform: "translateY(0)", // remove vertical centering
        }}
      >
        {progress}%
      </span>
    )}
  </div>
);

export default ProgressBar;