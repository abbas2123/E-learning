import { useState } from "react";
import type { QuizResultDetails, QuizQuestion } from "../types/quiz.types";
import {
  CheckCircle2,
  XCircle,
  Award,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  Clock,
  Sparkles,
} from "lucide-react";

interface QuizResultProps {
  result: QuizResultDetails;
  onRetry?: () => void;
  onContinue?: () => void;
}

export function QuizResultView({ result, onRetry, onContinue }: QuizResultProps) {
  const { attempt, quiz, questions } = result;
  const [expandedQuestions, setExpandedQuestions] = useState<Record<string, boolean>>({});

  const toggleExpand = (qId: string) => {
    setExpandedQuestions((prev) => ({ ...prev, [qId]: !prev[qId] }));
  };

  const isPassed = attempt.passed;
  const canRetry =
    quiz.maxAttempts === null || attempt.attemptNumber < quiz.maxAttempts;

  return (
    <div className="space-y-8 p-6 md:p-8 bg-slate-900 text-white rounded-2xl border border-slate-800">
      {/* Top Banner */}
      <div
        className={`rounded-2xl p-6 text-center border ${
          isPassed
            ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
            : "bg-rose-500/10 border-rose-500/30 text-rose-300"
        }`}
      >
        <div
          className={`mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border ${
            isPassed
              ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40"
              : "bg-rose-500/20 text-rose-400 border-rose-500/40"
          }`}
        >
          {isPassed ? <Award size={36} /> : <XCircle size={36} />}
        </div>

        <h2 className="mt-4 text-2xl font-extrabold text-white">
          {isPassed ? "Congratulations! Quiz Passed" : "Quiz Not Passed"}
        </h2>
        <p className="mt-1 text-xs text-slate-300">
          {isPassed
            ? "Great job! You have demonstrated understanding of this topic."
            : `You need ${quiz.passingScore}% to pass this assessment.`}
        </p>

        {/* Key Metrics */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-6 border-t border-slate-800/80 pt-6">
          <div className="text-center">
            <span className="text-xs text-slate-400 block font-medium">Your Score</span>
            <span
              className={`text-3xl font-black ${
                isPassed ? "text-emerald-400" : "text-rose-400"
              }`}
            >
              {attempt.percentage}%
            </span>
          </div>

          <div className="h-8 w-px bg-slate-800 hidden sm:block" />

          <div className="text-center">
            <span className="text-xs text-slate-400 block font-medium">Points</span>
            <span className="text-2xl font-bold text-white">
              {attempt.score} / {attempt.totalPoints}
            </span>
          </div>

          <div className="h-8 w-px bg-slate-800 hidden sm:block" />

          <div className="text-center">
            <span className="text-xs text-slate-400 block font-medium">Time Spent</span>
            <div className="flex items-center justify-center gap-1 mt-1 text-sm font-bold text-slate-200">
              <Clock size={14} className="text-slate-400" />
              <span>
                {Math.floor(attempt.timeSpentSeconds / 60)}m {attempt.timeSpentSeconds % 60}s
              </span>
            </div>
          </div>

          <div className="h-8 w-px bg-slate-800 hidden sm:block" />

          <div className="text-center">
            <span className="text-xs text-slate-400 block font-medium">Attempt</span>
            <span className="text-sm font-bold text-slate-200 mt-1 block">
              #{attempt.attemptNumber}{" "}
              {quiz.maxAttempts ? `/ ${quiz.maxAttempts}` : ""}
            </span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        {canRetry && onRetry ? (
          <button
            type="button"
            onClick={onRetry}
            className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-5 py-2.5 text-xs font-bold text-slate-200 transition hover:bg-slate-700 hover:text-white"
          >
            <RotateCcw size={15} />
            Retake Quiz
          </button>
        ) : <div />}

        {onContinue && (
          <button
            type="button"
            onClick={onContinue}
            className="flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-2.5 text-xs font-bold text-white shadow-lg shadow-indigo-600/30 transition hover:bg-indigo-700"
          >
            <Sparkles size={15} />
            Continue Course
          </button>
        )}
      </div>

      {/* Question Breakdown Section */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-white border-b border-slate-800 pb-2">
          Question Breakdown ({questions.length})
        </h3>

        <div className="space-y-3">
          {questions.map((q: QuizQuestion, index: number) => {
            const userAns = attempt.answers.find((a) => a.questionId === q.id);
            const userSelected = userAns?.selectedOptionIds || [];
            const correctSet = new Set(q.correctOptionIds || []);
            const userSet = new Set(userSelected);

            const isCorrect =
              q.questionType === "multiple_choice"
                ? correctSet.size === userSet.size &&
                  [...correctSet].every((id) => userSet.has(id))
                : userSelected.length === 1 && correctSet.has(userSelected[0]);

            const isExpanded = Boolean(expandedQuestions[q.id]);

            return (
              <div
                key={q.id}
                className="rounded-xl border border-slate-800 bg-slate-800/40 p-4 transition-all"
              >
                <div
                  onClick={() => toggleExpand(q.id)}
                  className="flex items-start justify-between gap-4 cursor-pointer"
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 shrink-0">
                      {isCorrect ? (
                        <CheckCircle2 size={18} className="text-emerald-400" />
                      ) : (
                        <XCircle size={18} className="text-rose-400" />
                      )}
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-400 block mb-0.5">
                        Question {index + 1}
                      </span>
                      <p className="text-sm font-semibold text-slate-200">
                        {q.questionText}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="text-slate-400 hover:text-white shrink-0"
                  >
                    {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </button>
                </div>

                {isExpanded && (
                  <div className="mt-4 space-y-2 border-t border-slate-800/80 pt-4 text-xs">
                    {q.options.map((opt) => {
                      const isSelected = userSelected.includes(opt.id);
                      const isRightOption = q.correctOptionIds?.includes(opt.id);

                      let badgeClass = "bg-slate-800 text-slate-400 border-slate-700";
                      if (isRightOption) {
                        badgeClass = "bg-emerald-500/20 text-emerald-300 border-emerald-500/40 font-bold";
                      } else if (isSelected && !isRightOption) {
                        badgeClass = "bg-rose-500/20 text-rose-300 border-rose-500/40 line-through";
                      }

                      return (
                        <div
                          key={opt.id}
                          className={`flex items-center justify-between rounded-lg border p-2.5 ${badgeClass}`}
                        >
                          <span>{opt.text}</span>
                          {isRightOption && (
                            <span className="text-[10px] uppercase font-black text-emerald-400">
                              Correct Answer
                            </span>
                          )}
                        </div>
                      );
                    })}

                    {q.explanation && (
                      <div className="mt-3 rounded-lg bg-indigo-500/10 p-3 border border-indigo-500/20 text-indigo-300">
                        <strong className="block text-[11px] uppercase tracking-wider font-bold mb-1">
                          Explanation:
                        </strong>
                        {q.explanation}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
