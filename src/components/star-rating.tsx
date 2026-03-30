"use client";

import { useState } from "react";

type StarRatingProps = {
  value: number;
  onChange: (value: number) => void;
  readOnly?: boolean;
};

export function StarRating({ value, onChange, readOnly = false }: StarRatingProps) {
  const [hovered, setHovered] = useState(0);
  const display = !readOnly && hovered > 0 ? hovered : value;

  return (
    <div className="flex gap-0.5" onMouseLeave={() => setHovered(0)}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          data-filled={star <= value ? "true" : "false"}
          onClick={() => {
            if (readOnly) return;
            onChange(star === value ? 0 : star);
          }}
          onMouseEnter={() => {
            if (!readOnly) setHovered(star);
          }}
          className={`text-lg transition-colors ${
            star <= display ? "text-yellow-400" : "text-gray-300 dark:text-gray-600"
          } ${readOnly ? "cursor-default" : "cursor-pointer"}`}
        >
          ★
        </button>
      ))}
    </div>
  );
}
