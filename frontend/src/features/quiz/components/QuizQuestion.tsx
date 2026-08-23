import type { QuizQuestion, QuizOption } from "../types/quiz.types";
import { CheckSquare, Square, Circle, CheckCircle2 } from "lucide-react";

interface QuizQuestionProps {
  question: QuizQuestion;
  questionNumber: number;
  totalQuestions: number;
  selectedOptionIds: string[];
  onChange: (selectedOptionIds: string[]) => void;
  disabled?: boolean;
}

export function QuizQuestionView({
  question,
  questionNumber,
  totalQuestions,
  selectedOptionIds,
  onChange,
  disabled = false,
}: QuizQuestionProps) {
  const isMultiple = question.questionType === "multiple_choice";

  const handleOptionClick = (optionId: string) => {
    if (disabled) return;

    if (isMultiple) {
      if (selectedOptionIds.includes(optionId)) {
        onChange(selectedOptionIds.filter((id) => id !== optionId));
      } else {
        onChange([...selectedOptionIds, optionId]);
      }
    } else {
      onChange([optionId]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Badge */}
      <div className="flex items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-2">
          <span className="rounded-lg bg-indigo-500/20 px-2.5 py-1 text-xs font-bold text-indigo-400 border border-indigo-500/30">
            Question {questionNumber} of {totalQuestions}
          </span>
          <span className="rounded-lg bg-slate-800 px-2.5 py-1 text-xs font-medium text-slate-400">
            {question.points} {question.points === 1 ? "point" : "points"}
          </span>
        </div>
        <span className="text-xs text-slate-500 font-medium capitalize">
          {question.questionType.replace("_", " ")}
        </span>
      </div>

      {/* Question Text */}
      <h3 className="text-lg font-bold text-white leading-relaxed">
        {question.questionText}
      </h3>

      {isMultiple && (
        <p className="text-xs text-amber-400 font-medium">
          * Select all that apply
        </p>
      )}

      {/* Options List */}
      <div className="space-y-3">
        {question.options.map((option: QuizOption) => {
          const isSelected = selectedOptionIds.includes(option.id);

          return (
            <button
              key={option.id}
              type="button"
              onClick={() => handleOptionClick(option.id)}
              disabled={disabled}
              className={`w-full flex items-start gap-3 rounded-xl p-4 text-left text-sm transition-all border ${
                isSelected
                  ? "bg-indigo-600/20 border-indigo-500 text-white shadow-lg shadow-indigo-600/10"
                  : "bg-slate-800/60 border-slate-700/80 text-slate-300 hover:bg-slate-800 hover:border-slate-600"
              } ${disabled ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`}
            >
              <div className="mt-0.5 shrink-0">
                {isMultiple ? (
                  isSelected ? (
                    <CheckSquare size={18} className="text-indigo-400" />
                  ) : (
                    <Square size={18} className="text-slate-500" />
                  )
                ) : isSelected ? (
                  <CheckCircle2 size={18} className="text-indigo-400" />
                ) : (
                  <Circle size={18} className="text-slate-500" />
                )}
              </div>
              <span className="leading-relaxed font-medium">{option.text}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
