import { useState } from "react";

type StarRatingProps = {
  value?: number;
  onChange?: (rating: number) => void;
};

export default function StarRating({
  value = 0,
  onChange,
}: StarRatingProps) {
  const [rating, setRating] = useState<number>(value);

  const handleClick = (star: number) => {
    setRating(star);
    onChange?.(star);
  };

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => handleClick(star)}
          className="focus:outline-none"
          aria-label={`${star} star`}
        >
          <Star filled={star <= rating} />
        </button>
      ))}
    </div>
  );
}

type StarProps = {
  filled: boolean;
};

function Star({ filled }: StarProps) {
  return (
    <svg
      className={`w-6 h-6 my-4 transition-colors ${
        filled
          ? "fill-yellow-400 stroke-yellow-400"
          : "fill-none stroke-gray-700"
      }`}
      viewBox="0 0 24 24"
      strokeWidth="2"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l2.062 6.345h6.666c.969 0 1.371 1.24.588 1.81l-5.393 3.918 2.062 6.345c.3.921-.755 1.688-1.54 1.118L12 17.77l-5.396 3.693c-.784.57-1.838-.197-1.539-1.118l2.062-6.345-5.393-3.918c-.783-.57-.38-1.81.588-1.81h6.666l2.061-6.345z"
      />
    </svg>
  );
}
