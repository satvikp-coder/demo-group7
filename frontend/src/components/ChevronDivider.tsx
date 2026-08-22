import React from "react";

interface ChevronDividerProps {
  className?: string;
  count?: number;
}

export const ChevronDivider: React.FC<ChevronDividerProps> = ({
  className = "",
  count = 8,
}) => {
  return (
    <div
      className={`flex items-center justify-center gap-1.5 py-4 ${className}`}
      aria-hidden="true"
    >
      {Array.from({ length: count }).map((_, idx) => (
        <svg
          key={idx}
          width="24"
          height="12"
          viewBox="0 0 24 12"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="text-gold/70"
        >
          <path
            d="M0 0L6 6L0 12H3.5L9.5 6L3.5 0H0ZM12 0L18 6L12 12H15.5L21.5 6L15.5 0H12Z"
            fill="currentColor"
          />
        </svg>
      ))}
    </div>
  );
};
