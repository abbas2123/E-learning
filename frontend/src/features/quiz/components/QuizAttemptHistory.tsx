import type { QuizAttempt } from "../types/quiz.types";
import { CheckCircle2, XCircle, Clock } from "lucide-react";

interface QuizAttemptHistoryProps {
  attempts: QuizAttempt[];
  onSelectAttempt?: (attemptId: string) => void;
}

export function QuizAttemptHistory({
  attempts,
  onSelectAttempt,
}: QuizAttemptHistoryProps) {
  if (attempts.length === 0) {
    return (
      <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6 text-center text-xs text-slate-400">
        No previous attempts found.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/50">
      <table className="w-full text-left text-xs text-slate-300">
        <thead className="border-b border-slate-800 bg-slate-900 text-slate-400 uppercase text-[10px] tracking-wider font-semibold">
          <tr>
            <th className="p-3">Attempt</th>
            <th className="p-3">Score</th>
            <th className="p-3">Result</th>
            <th className="p-3">Time</th>
            <th className="p-3">Date</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800/60">
          {attempts.map((att) => (
            <tr
              key={att.id}
              onClick={() => onSelectAttempt?.(att.id)}
              className={`transition hover:bg-slate-800/60 ${
                onSelectAttempt ? "cursor-pointer" : ""
              }`}
            >
              <td className="p-3 font-bold text-white">#{att.attemptNumber}</td>
              <td className="p-3 font-semibold">
                {att.percentage}% ({att.score}/{att.totalPoints})
              </td>
              <td className="p-3">
                {att.passed ? (
                  <span className="inline-flex items-center gap-1 text-emerald-400 font-bold">
                    <CheckCircle2 size={13} /> Passed
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-rose-400 font-bold">
                    <XCircle size={13} /> Failed
                  </span>
                )}
              </td>
              <td className="p-3 text-slate-400">
                <span className="inline-flex items-center gap-1">
                  <Clock size={12} />
                  {Math.floor(att.timeSpentSeconds / 60)}m {att.timeSpentSeconds % 60}s
                </span>
              </td>
              <td className="p-3 text-slate-400">
                {new Date(att.createdAt).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
