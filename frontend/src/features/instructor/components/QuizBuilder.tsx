import { useEffect, useState, useCallback } from "react";
import quizService from "../../quiz/service/quizService";
import type {
  Quiz,
  QuizQuestion,
  QuizOption,
} from "../../quiz/types/quiz.types";
import apiClient from "../../../services/apiClient";
import { toast } from "sonner";
import {
  HelpCircle,
  Plus,
  Trash2,
  CheckCircle2,
  Loader2,
  Clock,
  Award,
} from "lucide-react";

interface QuizBuilderProps {
  courseId: string;
}

export function QuizBuilder({ courseId }: QuizBuilderProps) {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);

  // Active Selected Quiz & Questions
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);

  // Quiz Modal State
  const [quizModalOpen, setQuizModalOpen] = useState(false);
  const [quizTitle, setQuizTitle] = useState("");
  const [quizDescription, setQuizDescription] = useState("");
  const [quizPassingScore, setQuizPassingScore] = useState(70);
  const [quizTimeLimit, setQuizTimeLimit] = useState(600);
  const [quizMaxAttempts] = useState<number | undefined>(3);
  const [savingQuiz, setSavingQuiz] = useState(false);

  // Question Modal State
  const [questionModalOpen, setQuestionModalOpen] = useState(false);
  const [questionText, setQuestionText] = useState("");
  const [questionType, setQuestionType] = useState<
    "single_choice" | "multiple_choice" | "true_false"
  >("single_choice");
  const [options, setOptions] = useState<QuizOption[]>([
    { id: "opt-1", text: "Option A" },
    { id: "opt-2", text: "Option B" },
  ]);
  const [correctOptionIds, setCorrectOptionIds] = useState<string[]>(["opt-1"]);
  const [questionPoints] = useState(1);
  const [explanation, setExplanation] = useState("");
  const [savingQuestion, setSavingQuestion] = useState(false);

  const selectQuiz = useCallback(async (quizId: string) => {
    try {
      const res = await quizService.getQuiz(quizId);
      setSelectedQuiz(res.quiz);
      setQuestions(res.questions || []);
    } catch (err: any) {
      toast.error(err.message || "Failed to load quiz details.");
    }
  }, []);

  const fetchQuizzes = useCallback(async () => {
    setLoading(true);
    try {
      const data = await quizService.getCourseQuizzes(courseId);
      setQuizzes(data || []);
      if (data && data.length > 0 && !selectedQuiz) {
        selectQuiz(data[0].id);
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to load course quizzes.");
    } finally {
      setLoading(false);
    }
  }, [courseId, selectedQuiz, selectQuiz]);

  useEffect(() => {
    fetchQuizzes();
  }, [fetchQuizzes]);

  const handleCreateQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quizTitle.trim()) return;
    setSavingQuiz(true);
    try {
      const res = await apiClient.post(`/api/courses/${courseId}/quizzes`, {
        title: quizTitle.trim(),
        description: quizDescription.trim(),
        passingScore: Number(quizPassingScore),
        timeLimitSeconds: Number(quizTimeLimit),
        maxAttempts: quizMaxAttempts ? Number(quizMaxAttempts) : null,
      });
      toast.success("Quiz created successfully.");
      setQuizModalOpen(false);
      setQuizTitle("");
      setQuizDescription("");
      await fetchQuizzes();
      if (res.data?.data?.id) {
        selectQuiz(res.data.data.id);
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to create quiz.");
    } finally {
      setSavingQuiz(false);
    }
  };

  const handleTogglePublish = async (
    quizId: string,
    currentStatus: boolean,
  ) => {
    try {
      await apiClient.put(`/api/quizzes/${quizId}`, {
        isPublished: !currentStatus,
      });
      toast.success(!currentStatus ? "Quiz published." : "Quiz unpublished.");
      fetchQuizzes();
      if (selectedQuiz?.id === quizId) {
        setSelectedQuiz((prev) =>
          prev ? { ...prev, isPublished: !currentStatus } : null,
        );
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to update quiz status.");
    }
  };

  const handleDeleteQuiz = async (quizId: string) => {
    if (!confirm("Are you sure you want to delete this quiz?")) return;
    try {
      await apiClient.delete(`/api/quizzes/${quizId}`);
      toast.success("Quiz deleted.");
      if (selectedQuiz?.id === quizId) setSelectedQuiz(null);
      fetchQuizzes();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete quiz.");
    }
  };

  const handleAddOption = () => {
    const newId = `opt-${Date.now()}`;
    setOptions((prev) => [...prev, { id: newId, text: `New Option` }]);
  };

  const handleRemoveOption = (id: string) => {
    if (options.length <= 2) {
      toast.error("Questions must have at least 2 options.");
      return;
    }
    setOptions((prev) => prev.filter((o) => o.id !== id));
    setCorrectOptionIds((prev) => prev.filter((cid) => cid !== id));
  };

  const handleOptionTextChange = (id: string, text: string) => {
    setOptions((prev) => prev.map((o) => (o.id === id ? { ...o, text } : o)));
  };

  const toggleCorrectOption = (id: string) => {
    if (questionType === "multiple_choice") {
      if (correctOptionIds.includes(id)) {
        if (correctOptionIds.length === 1) {
          toast.error("At least one option must be marked correct.");
          return;
        }
        setCorrectOptionIds((prev) => prev.filter((cid) => cid !== id));
      } else {
        setCorrectOptionIds((prev) => [...prev, id]);
      }
    } else {
      setCorrectOptionIds([id]);
    }
  };

  const handleSaveQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedQuiz) return;
    if (!questionText.trim()) {
      toast.error("Question text is required.");
      return;
    }
    if (correctOptionIds.length === 0) {
      toast.error("Select at least one correct answer option.");
      return;
    }

    setSavingQuestion(true);
    try {
      await apiClient.post(`/api/quizzes/${selectedQuiz.id}/questions`, {
        questionText: questionText.trim(),
        questionType,
        options,
        correctOptionIds,
        points: Number(questionPoints),
        explanation: explanation.trim() || undefined,
      });

      toast.success("Question added to quiz.");
      setQuestionModalOpen(false);
      setQuestionText("");
      selectQuiz(selectedQuiz.id);
    } catch (err: any) {
      toast.error(err.message || "Failed to add question.");
    } finally {
      setSavingQuestion(false);
    }
  };

  const handleDeleteQuestion = async (questionId: string) => {
    if (!confirm("Delete this question?")) return;
    try {
      await apiClient.delete(`/api/questions/${questionId}`);
      toast.success("Question deleted.");
      if (selectedQuiz) selectQuiz(selectedQuiz.id);
    } catch (err: any) {
      toast.error(err.message || "Failed to delete question.");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center p-8 text-slate-400">
        <Loader2 size={24} className="animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Quiz Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-800 bg-slate-900 p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400">
            <HelpCircle size={20} />
          </div>
          <div>
            <h3 className="font-bold text-sm text-white">
              Assessment Quizzes ({quizzes.length})
            </h3>
            <p className="text-xs text-slate-400">
              Build quizzes and auto-graded knowledge tests for this course.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setQuizModalOpen(true)}
          className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-indigo-600/30 transition hover:bg-indigo-700"
        >
          <Plus size={14} />
          Create Quiz
        </button>
      </div>

      {/* Main Grid: Quiz List + Question Workspace */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Quiz Selector */}
        <div className="space-y-3 md:col-span-1">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Quizzes
          </h4>
          {quizzes.length === 0 ? (
            <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6 text-center text-xs text-slate-500">
              No quizzes created yet.
            </div>
          ) : (
            quizzes.map((q) => (
              <div
                key={q.id}
                onClick={() => selectQuiz(q.id)}
                className={`flex flex-col gap-2 rounded-xl border p-3.5 text-xs transition cursor-pointer ${
                  selectedQuiz?.id === q.id
                    ? "border-indigo-500 bg-indigo-600/10 text-white shadow-md"
                    : "border-slate-800 bg-slate-900/60 text-slate-300 hover:border-slate-700"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold">{q.title}</span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                      q.isPublished
                        ? "bg-emerald-500/20 text-emerald-400"
                        : "bg-slate-800 text-slate-400"
                    }`}
                  >
                    {q.isPublished ? "Published" : "Draft"}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-[11px] text-slate-400">
                  <span className="flex items-center gap-1">
                    <Award size={12} /> {q.passingScore}% pass
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock size={12} /> {Math.floor(q.timeLimitSeconds / 60)}m
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Right Column: Questions Workspace */}
        <div className="md:col-span-2 space-y-4">
          {selectedQuiz ? (
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 space-y-6">
              {/* Active Quiz Header */}
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
                <div>
                  <h3 className="text-lg font-bold text-white">
                    {selectedQuiz.title}
                  </h3>
                  {selectedQuiz.description && (
                    <p className="text-xs text-slate-400 mt-1">
                      {selectedQuiz.description}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      handleTogglePublish(
                        selectedQuiz.id,
                        selectedQuiz.isPublished,
                      )
                    }
                    className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                      selectedQuiz.isPublished
                        ? "bg-slate-800 text-slate-300 hover:bg-slate-700"
                        : "bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg shadow-emerald-600/30"
                    }`}
                  >
                    {selectedQuiz.isPublished
                      ? "Unpublish Quiz"
                      : "Publish Quiz"}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDeleteQuiz(selectedQuiz.id)}
                    className="rounded-xl border border-slate-800 p-2 text-slate-400 hover:text-rose-400"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              {/* Questions List */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Questions ({questions.length})
                  </h4>
                  <button
                    type="button"
                    onClick={() => setQuestionModalOpen(true)}
                    className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-lg shadow-indigo-600/30 hover:bg-indigo-700"
                  >
                    <Plus size={14} />
                    Add Question
                  </button>
                </div>

                {questions.length === 0 ? (
                  <div className="rounded-xl border border-slate-800 bg-slate-950 p-6 text-center text-xs text-slate-500">
                    No questions added to this quiz yet. Click &quot;Add
                    Question&quot; to begin.
                  </div>
                ) : (
                  questions.map((q, idx) => (
                    <div
                      key={q.id}
                      className="rounded-xl border border-slate-800 bg-slate-950 p-4 space-y-3 text-xs"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-2.5">
                          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-indigo-500/20 font-bold text-indigo-400">
                            {idx + 1}
                          </span>
                          <div>
                            <span className="font-bold text-slate-200 block text-sm">
                              {q.questionText}
                            </span>
                            <span className="text-[10px] text-slate-500 capitalize">
                              {q.questionType.replace("_", " ")} • {q.points}{" "}
                              {q.points === 1 ? "point" : "points"}
                            </span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleDeleteQuestion(q.id)}
                          className="text-slate-500 hover:text-rose-400 p-1"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>

                      {/* Options preview */}
                      <div className="space-y-1.5 pl-8">
                        {q.options.map((opt) => (
                          <div
                            key={opt.id}
                            className="flex items-center gap-2 text-slate-400 text-[11px]"
                          >
                            <span className="h-1.5 w-1.5 rounded-full bg-slate-600" />
                            <span>{opt.text}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-12 text-center text-slate-500 text-xs">
              Select or create a quiz to manage its questions.
            </div>
          )}
        </div>
      </div>

      {/* Create Quiz Modal */}
      {quizModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
          <div className="max-h-[calc(100dvh-2rem)] w-full max-w-md overflow-y-auto rounded-2xl border border-slate-800 bg-slate-900 p-4 text-white shadow-2xl space-y-4 sm:p-6">
            <h3 className="text-base font-bold text-white">
              Create New Assessment Quiz
            </h3>
            <form onSubmit={handleCreateQuiz} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 font-medium mb-1">
                  Quiz Title
                </label>
                <input
                  type="text"
                  required
                  value={quizTitle}
                  onChange={(e) => setQuizTitle(e.target.value)}
                  placeholder="e.g. Module 1 Final Quiz"
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">
                  Instructions / Description
                </label>
                <textarea
                  rows={2}
                  value={quizDescription}
                  onChange={(e) => setQuizDescription(e.target.value)}
                  placeholder="Instructions for students..."
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">
                    Passing Score (%)
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={quizPassingScore}
                    onChange={(e) =>
                      setQuizPassingScore(Number(e.target.value))
                    }
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-white focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-medium mb-1">
                    Time Limit (Seconds)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={quizTimeLimit}
                    onChange={(e) => setQuizTimeLimit(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-white focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setQuizModalOpen(false)}
                  className="rounded-xl border border-slate-800 px-4 py-2 text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingQuiz}
                  className="flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2 font-bold text-white shadow-lg shadow-indigo-600/30 hover:bg-indigo-700 disabled:opacity-50"
                >
                  {savingQuiz && <Loader2 size={14} className="animate-spin" />}
                  Create Quiz
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Question Modal */}
      {questionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
          <div className="max-h-[calc(100dvh-2rem)] w-full max-w-lg overflow-y-auto rounded-2xl border border-slate-800 bg-slate-900 p-4 text-white shadow-2xl space-y-4 sm:p-6">
            <h3 className="text-base font-bold text-white">Add Question</h3>
            <form onSubmit={handleSaveQuestion} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 font-medium mb-1">
                  Question Prompt
                </label>
                <input
                  type="text"
                  required
                  value={questionText}
                  onChange={(e) => setQuestionText(e.target.value)}
                  placeholder="e.g. Which hook is used for side effects in React?"
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">
                  Question Type
                </label>
                <select
                  value={questionType}
                  onChange={(e) => setQuestionType(e.target.value as any)}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-white focus:border-indigo-500 focus:outline-none"
                >
                  <option value="single_choice">Single Choice (Radio)</option>
                  <option value="multiple_choice">
                    Multiple Choice (Checkboxes)
                  </option>
                  <option value="true_false">True / False</option>
                </select>
              </div>

              {/* Options Builder */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-slate-400 font-medium">
                    Answer Options
                  </label>
                  <button
                    type="button"
                    onClick={handleAddOption}
                    className="text-[11px] font-bold text-indigo-400 hover:underline"
                  >
                    + Add Option
                  </button>
                </div>

                {options.map((opt) => {
                  const isCorrect = correctOptionIds.includes(opt.id);
                  return (
                    <div key={opt.id} className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => toggleCorrectOption(opt.id)}
                        className={`h-5 w-5 shrink-0 rounded border flex items-center justify-center transition ${
                          isCorrect
                            ? "bg-emerald-500 border-emerald-400 text-white"
                            : "border-slate-700 bg-slate-950 text-transparent"
                        }`}
                      >
                        <CheckCircle2 size={12} />
                      </button>

                      <input
                        type="text"
                        required
                        value={opt.text}
                        onChange={(e) =>
                          handleOptionTextChange(opt.id, e.target.value)
                        }
                        className="flex-1 rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
                      />

                      <button
                        type="button"
                        onClick={() => handleRemoveOption(opt.id)}
                        className="text-slate-500 hover:text-rose-400 p-1"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  );
                })}
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">
                  Explanation (Shown after submission)
                </label>
                <textarea
                  rows={2}
                  value={explanation}
                  onChange={(e) => setExplanation(e.target.value)}
                  placeholder="Why is this answer correct?"
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setQuestionModalOpen(false)}
                  className="rounded-xl border border-slate-800 px-4 py-2 text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingQuestion}
                  className="flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2 font-bold text-white shadow-lg shadow-indigo-600/30 hover:bg-indigo-700 disabled:opacity-50"
                >
                  {savingQuestion && (
                    <Loader2 size={14} className="animate-spin" />
                  )}
                  Save Question
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
