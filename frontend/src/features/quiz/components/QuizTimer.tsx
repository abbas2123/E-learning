import { useEffect, useState } from "react";
import { Clock, AlertTriangle } from "lucide-react";

interface QuizTimerProps {
  timeLimitSeconds: number;
  startedAt: string;
  onTimeExpired: () => void;
}

export function QuizTimer({
  timeLimitSeconds,
  startedAt,
  onTimeExpired,
}: QuizTimerProps) {
  const [secondsLeft, setSecondsLeft] = useState<number>(() => {
    if (timeLimitSeconds <= 0) return 0;
    const startMs = new Date(startedAt).getTime();
    const elapsedSec = Math.floor((Date.now() - startMs) / 1000);
    return Math.max(0, timeLimitSeconds - elapsedSec);
  });

  useEffect(() => {
    if (timeLimitSeconds <= 0) return;

    const interval = setInterval(() => {
      const startMs = new Date(startedAt).getTime();
      const elapsedSec = Math.floor((Date.now() - startMs) / 1000);
      const remaining = Math.max(0, timeLimitSeconds - elapsedSec);

      setSecondsLeft(remaining);

      if (remaining <= 0) {
        clearInterval(interval);
        onTimeExpired();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [timeLimitSeconds, startedAt, onTimeExpired]);

  if (timeLimitSeconds <= 0) return null;

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const isWarning = secondsLeft <= Math.max(30, timeLimitSeconds * 0.2);

  return (
    <div
      className={`flex items-center gap-2 rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all ${
        isWarning
          ? "bg-rose-500/20 text-rose-400 border border-rose-500/40 animate-pulse"
          : "bg-slate-800 text-slate-300 border border-slate-700"
      }`}
    >
      {isWarning ? <AlertTriangle size={14} /> : <Clock size={14} />}
      <span>
        {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
      </span>
    </div>
  );
}
