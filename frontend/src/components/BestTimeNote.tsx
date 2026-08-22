import React, { useState } from "react";
import { Clock } from "lucide-react";

interface BestTimeNoteProps {
  note?: string;
  className?: string;
}

export const BestTimeNote: React.FC<BestTimeNoteProps> = ({
  note,
  className = "",
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  if (!note) return null;

  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        setIsExpanded((prev) => !prev);
      }}
      title={`${note} (click to toggle full text)`}
      className={`group cursor-pointer inline-flex items-center gap-1.5 text-xs text-stone font-body italic transition-colors hover:text-charcoal ${className}`}
    >
      <Clock className="w-3.5 h-3.5 text-gold shrink-0" />
      <span
        className={`font-sans italic transition-all ${
          isExpanded
            ? "whitespace-normal block break-words"
            : "truncate line-clamp-1"
        }`}
      >
        {note}
      </span>
    </div>
  );
};
