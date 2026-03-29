"use client";

type StarRatingProps = {
  value: number;
  onChange: (value: number) => void;
  readOnly?: boolean;
};

export function StarRating({ value, onChange, readOnly = false }: StarRatingProps) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          data-filled={star <= value ? "true" : "false"}
          onClick={() => {
            if (readOnly) return;
            onChange(star === value ? 0 : star);
          }}
          className={`text-lg transition-colors ${
            star <= value
              ? "text-yellow-400"
              : "text-gray-300 dark:text-gray-600"
          } ${readOnly ? "cursor-default" : "cursor-pointer hover:text-yellow-300"}`}
        >
          ★
        </button>
      ))}
    </div>
  );
}
