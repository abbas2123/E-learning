interface QuizProgressProps {
  totalQuestions: number;
  currentIndex: number;
  answers: Record<string, string[]>;
  questionIds: string[];
  onSelectIndex: (index: number) => void;
}

export function QuizProgress({
  totalQuestions,
  currentIndex,
  answers,
  questionIds,
  onSelectIndex,
}: QuizProgressProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {Array.from({ length: totalQuestions }).map((_, idx) => {
        const qId = questionIds[idx];
        const isAnswered = answers[qId] && answers[qId].length > 0;
        const isCurrent = idx === currentIndex;

        return (
          <button
            key={idx}
            type="button"
            onClick={() => onSelectIndex(idx)}
            className={`flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold transition-all ${
              isCurrent
                ? "bg-indigo-600 text-white ring-2 ring-indigo-400 ring-offset-2 ring-offset-slate-900 shadow-md"
                : isAnswered
                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 hover:bg-emerald-500/30"
                  : "bg-slate-800 text-slate-400 border border-slate-700 hover:bg-slate-700 hover:text-slate-200"
            }`}
          >
            {idx + 1}
          </button>
        );
      })}
    </div>
  );
}
