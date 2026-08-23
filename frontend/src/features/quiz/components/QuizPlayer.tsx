import { useEffect, useState, useCallback } from "react";
import quizService from "../service/quizService";
import type {
  Quiz,
  QuizAttempt,
  QuizQuestion,
  QuizResultDetails,
  AnswerPayload,
} from "../types/quiz.types";
import { QuizQuestionView } from "./QuizQuestion";
import { QuizTimer } from "./QuizTimer";
import { QuizProgress } from "./QuizProgress";
import { QuizResultView } from "./QuizResult";
import { QuizAttemptHistory } from "./QuizAttemptHistory";
import { toast } from "sonner";
import {
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  Send,
  Loader2,
  AlertCircle,
  History,
} from "lucide-react";

interface QuizPlayerProps {
  quizId?: string;
  courseId: string;
  lessonId?: string;
  onComplete?: () => void;
}

export function QuizPlayer({
  quizId: initialQuizId,
  courseId,
  lessonId,
  onComplete,
}: QuizPlayerProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [activeQuizId, setActiveQuizId] = useState<string | null>(initialQuizId || null);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [attempt, setAttempt] = useState<QuizAttempt | null>(null);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string[]>>({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<QuizResultDetails | null>(null);
  const [previousAttempts, setPreviousAttempts] = useState<QuizAttempt[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  const initQuiz = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let targetQuizId = initialQuizId;

      if (!targetQuizId) {
        const courseQuizzes = await quizService.getCourseQuizzes(courseId);
        const match = lessonId
          ? courseQuizzes.find((q) => q.lessonId === lessonId)
          : courseQuizzes[0];

        if (!match) {
          setError("No quiz found for this lesson.");
          setLoading(false);
          return;
        }
        targetQuizId = match.id;
      }

      setActiveQuizId(targetQuizId);

      // Start or resume attempt
      const startData = await quizService.startAttempt(targetQuizId);
      setQuiz(startData.quiz);
      setAttempt(startData.attempt);
      setQuestions(startData.questions || []);

      // If existing answers were saved, populate them
      const initialAnswersMap: Record<string, string[]> = {};
      if (startData.attempt.answers) {
        startData.attempt.answers.forEach((ans) => {
          initialAnswersMap[ans.questionId] = ans.selectedOptionIds;
        });
      }
      setAnswers(initialAnswersMap);

      // Load attempt history
      try {
        const history = await quizService.getAttempts(targetQuizId);
        setPreviousAttempts(history);
      } catch {
        setPreviousAttempts([]);
      }

      // If attempt was already submitted/expired in past, view result directly
      if (startData.attempt.status !== "in_progress") {
        const resultData = await quizService.getAttemptResult(startData.attempt.id);
        setResult(resultData);
      }
    } catch (err: any) {
      console.error("Failed to initialize quiz:", err);
      setError(err.message || "Failed to load quiz.");
    } finally {
      setLoading(false);
    }
  }, [initialQuizId, courseId, lessonId]);

  useEffect(() => {
    initQuiz();
  }, [initQuiz]);

  const handleAnswerChange = (selectedOptionIds: string[]) => {
    if (!questions[currentIndex]) return;
    const currentQ = questions[currentIndex];
    setAnswers((prev) => ({
      ...prev,
      [currentQ.id]: selectedOptionIds,
    }));
  };

  const handleSubmit = async () => {
    if (!attempt || submitting) return;

    setSubmitting(true);
    try {
      const answersArray: AnswerPayload[] = Object.entries(answers).map(
        ([questionId, selectedOptionIds]) => ({
          questionId,
          selectedOptionIds,
        }),
      );

      const res = await quizService.submitAttempt(attempt.id, answersArray);
      toast.success(
        res.attempt.passed
          ? "Quiz passed! Excellent work."
          : "Quiz submitted. Review your results.",
      );

      // Fetch full result with question breakdown
      const resultData = await quizService.getAttemptResult(attempt.id);
      setResult(resultData);

      if (res.lessonMarkedComplete || res.attempt.passed) {
        onComplete?.();
      }

      // Refresh attempts history
      if (activeQuizId) {
        const history = await quizService.getAttempts(activeQuizId);
        setPreviousAttempts(history);
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to submit quiz.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRetry = () => {
    setResult(null);
    setAnswers({});
    setCurrentIndex(0);
    initQuiz();
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-slate-400">
        <Loader2 size={32} className="animate-spin text-indigo-500 mb-3" />
        <span className="text-xs font-semibold">Loading quiz workspace...</span>
      </div>
    );
  }

  if (error || !quiz) {
    return (
      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-8 text-center text-slate-300">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400 mb-4">
          <AlertCircle size={24} />
        </div>
        <h3 className="text-base font-bold text-white mb-1">Quiz Unavailable</h3>
        <p className="text-xs text-slate-400 max-w-sm mx-auto">{error || "Could not load quiz questions."}</p>
      </div>
    );
  }

  // If viewing result
  if (result) {
    return (
      <QuizResultView
        result={result}
        onRetry={handleRetry}
        onContinue={onComplete}
      />
    );
  }

  const currentQuestion = questions[currentIndex];
  const questionIds = questions.map((q) => q.id);
  const isLastQuestion = currentIndex === questions.length - 1;
  const answeredCount = Object.values(answers).filter((arr) => arr.length > 0).length;

  return (
    <div className="space-y-6 rounded-2xl border border-slate-800 bg-slate-900 p-6 md:p-8 text-white">
      {/* Quiz Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/20 text-indigo-400">
              <HelpCircle size={18} />
            </div>
            <h2 className="text-xl font-black text-white">{quiz.title}</h2>
          </div>
          {quiz.description && (
            <p className="mt-1 text-xs text-slate-400 max-w-xl">{quiz.description}</p>
          )}
        </div>

        <div className="flex items-center gap-3">
          {quiz.timeLimitSeconds > 0 && attempt && (
            <QuizTimer
              timeLimitSeconds={quiz.timeLimitSeconds}
              startedAt={attempt.startedAt}
              onTimeExpired={handleSubmit}
            />
          )}

          {previousAttempts.length > 0 && (
            <button
              type="button"
              onClick={() => setShowHistory(!showHistory)}
              className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-300 transition hover:bg-slate-700 hover:text-white"
            >
              <History size={14} />
              <span>History ({previousAttempts.length})</span>
            </button>
          )}
        </div>
      </div>

      {/* History Drawer toggle */}
      {showHistory && (
        <div className="space-y-3 rounded-xl border border-slate-800 bg-slate-950 p-4">
          <h4 className="text-xs font-bold text-slate-300">Attempt History</h4>
          <QuizAttemptHistory attempts={previousAttempts} />
        </div>
      )}

      {/* Question Progress dots */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
        <QuizProgress
          totalQuestions={questions.length}
          currentIndex={currentIndex}
          answers={answers}
          questionIds={questionIds}
          onSelectIndex={setCurrentIndex}
        />
        <span className="text-xs text-slate-400 font-medium">
          {answeredCount} of {questions.length} answered
        </span>
      </div>

      {/* Active Question */}
      {currentQuestion && (
        <QuizQuestionView
          question={currentQuestion}
          questionNumber={currentIndex + 1}
          totalQuestions={questions.length}
          selectedOptionIds={answers[currentQuestion.id] || []}
          onChange={handleAnswerChange}
          disabled={submitting}
        />
      )}

      {/* Action Footer Navigation */}
      <div className="flex items-center justify-between border-t border-slate-800 pt-6">
        <button
          type="button"
          onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
          disabled={currentIndex === 0 || submitting}
          className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 text-xs font-bold text-slate-300 transition hover:bg-slate-700 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <ChevronLeft size={16} />
          Previous
        </button>

        <div className="flex items-center gap-3">
          {!isLastQuestion ? (
            <button
              type="button"
              onClick={() => setCurrentIndex((prev) => Math.min(questions.length - 1, prev + 1))}
              disabled={submitting}
              className="flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-indigo-600/30 transition hover:bg-indigo-700"
            >
              Next
              <ChevronRight size={16} />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className="flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-2.5 text-xs font-bold text-white shadow-lg shadow-emerald-600/30 transition hover:bg-emerald-700 disabled:opacity-50"
            >
              {submitting ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Send size={16} />
              )}
              Submit Assessment
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
