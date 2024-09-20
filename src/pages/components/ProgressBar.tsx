import React from "react";

interface LoadingSpinnerProps {
  percent: number;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ percent }) => {
  const radius = 45; // Smaller radius
  const circumference = 2 * Math.PI * radius;

  return (
    <div className="flex items-center justify-center w-full text-gray-100">
      <div className="relative flex items-center justify-center">
        <svg className="transform -rotate-90 w-36 h-36">
          {" "}
          <circle
            cx="72"
            cy="72"
            r={radius}
            stroke="currentColor"
            strokeWidth="10"
            fill="transparent"
            className="text-gray-300"
          />
          <circle
            cx="72"
            cy="72"
            r={radius}
            stroke="currentColor"
            strokeWidth="10"
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={circumference - (percent / 100) * circumference}
            className="text-blue-500"
          />
        </svg>
        <span className="absolute text-gray-400 text-2xl">{`${percent}%`}</span>{" "}
        {/* Adjusted text size */}
      </div>
    </div>
  );
};

export default LoadingSpinner;
