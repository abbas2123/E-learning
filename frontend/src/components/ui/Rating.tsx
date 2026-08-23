import { Star } from "lucide-react";

interface RatingProps {
  value: number;
  reviewsCount?: number;
  size?: "sm" | "md" | "lg";
  showNumber?: boolean;
  className?: string;
}

export function Rating({
  value,
  reviewsCount,
  size = "md",
  showNumber = true,
  className = "",
}: RatingProps) {
  const rounded = Math.round(value * 10) / 10;

  const starSizes = {
    sm: 12,
    md: 14,
    lg: 18,
  };

  return (
    <div className={`flex items-center gap-1.5 ${className}`}>
      {showNumber && (
        <span className="font-bold text-amber-500">{rounded.toFixed(1)}</span>
      )}
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={starSizes[size]}
            fill={star <= Math.round(value) ? "#f59e0b" : "none"}
            className={
              star <= Math.round(value) ? "text-amber-500" : "text-slate-300"
            }
          />
        ))}
      </div>
      {typeof reviewsCount === "number" && (
        <span className="text-xs text-slate-400">({reviewsCount})</span>
      )}
    </div>
  );
}
