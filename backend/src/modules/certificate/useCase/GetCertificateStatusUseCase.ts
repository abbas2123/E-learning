import type { ICertificateRepository, CertificateDto } from "../interface/ICertificateRepository";
import type { CourseSummaryDto, ICourseRepository } from "../../course/interface/ICourseRepository";
import type { IEnrollmentRepository } from "../../admin/interface/IEnrollmentRepository";
import type { ILessonRepository } from "../../curriculum/interface/ILessonRepository";
import type { ILessonProgressRepository } from "../../progress/interface/ILessonProgressRepository";
import type { IQuizRepository } from "../../quiz/interface/IQuizRepository";
import type { IQuizAttemptRepository } from "../../quiz/interface/IQuizAttemptRepository";
import { VIDEO_COMPLETION_THRESHOLD, DEFAULT_MIN_CERTIFICATE_SCORE } from "../../../shared/constants/courseConstants";
import {
  NotFoundError,
  UnauthorizedError,
  ValidationError,
} from "../../../core/errors/AppError";

export interface GetCertificateStatusInput {
  userId: string;
  courseId: string;
  userRole?: string;
}

export interface CertificateStatusResult {
  eligible: boolean;
  certificate: CertificateDto | null;
  progress: {
    completedLessons: number;
    totalLessons: number;
    completedQuizzes: number;
    totalQuizzes: number;
    progressPercentage: number;
  };
  score: {
    current: number;
    required: number;
    passed: boolean;
  };
  reasons: string[];
}

export class GetCertificateStatusUseCase {
  constructor(
    private readonly certificateRepository: ICertificateRepository,
    private readonly courseRepository: ICourseRepository,
    private readonly enrollmentRepository: IEnrollmentRepository,
    private readonly lessonRepository: ILessonRepository,
    private readonly progressRepository: ILessonProgressRepository,
    private readonly quizRepository: IQuizRepository,
    private readonly attemptRepository: IQuizAttemptRepository,
  ) {}

  async execute(input: GetCertificateStatusInput): Promise<CertificateStatusResult> {
    const { userId, courseId, userRole } = input;

    if (!userId) throw new UnauthorizedError();
    if (!courseId) throw new ValidationError("Course ID is required.");

    const course: CourseSummaryDto | null = await this.courseRepository.findSummaryById(courseId);
    if (!course) throw new NotFoundError("Course not found.", "COURSE_NOT_FOUND");

    // Check existing certificate
    const existingCert = await this.certificateRepository.findByStudentAndCourse(userId, courseId);

    // Verify enrollment
    const isOwnerOrAdmin = userRole === "admin" || course.createdBy === userId;
    const isEnrolled = isOwnerOrAdmin || await this.enrollmentRepository.isStudentEnrolled(userId, courseId);

    // 1. Lessons check
    const lessons = await this.lessonRepository.findByCourseId(courseId);
    const totalLessons = lessons.length;

    const progressRecords = await this.progressRepository.findByCourse(userId, courseId);
    const progressMap = new Map(progressRecords.map((p) => [p.lessonId, p]));

    let completedLessons = 0;
    for (const lesson of lessons) {
      const p = progressMap.get(lesson.id);
      if (p && p.completed) {
        completedLessons++;
      } else if (lesson.type === "video" && p && lesson.duration) {
        // Video threshold check using the centralized constant
        const requiredSeconds = Math.floor(lesson.duration * 60 * VIDEO_COMPLETION_THRESHOLD);
        if (p.watchedSeconds >= requiredSeconds) {
          completedLessons++;
          // Idempotent: auto-mark completed in background without blocking
          this.progressRepository.upsertProgress({
            studentId: userId,
            courseId,
            lessonId: lesson.id,
            completed: true,
            watchedSeconds: p.watchedSeconds,
            completedAt: new Date(),
          }).catch(() => {});
        }
      }
    }

    // 2. Quizzes check & Scoring via repositories
    const quizzes = await this.quizRepository.findByCourseId(courseId);
    const totalQuizzes = quizzes.length;

    let completedQuizzes = 0;
    let totalScoreSum = 0;

    for (const quiz of quizzes) {
      const submittedAttempts = await this.attemptRepository.findSubmittedByStudentAndQuiz(
        userId,
        quiz.id,
      );

      if (submittedAttempts.length > 0) {
        completedQuizzes++;
        const bestScore = Math.max(...submittedAttempts.map((a) => a.percentage || 0));
        totalScoreSum += bestScore;
      }
    }

    const minRequiredScore = typeof course.minCertificateScore === "number"
      ? course.minCertificateScore
      : DEFAULT_MIN_CERTIFICATE_SCORE;

    const currentScore = totalQuizzes > 0
      ? Math.round(totalScoreSum / totalQuizzes)
      : totalLessons > 0 && completedLessons === totalLessons
        ? 100
        : totalLessons > 0
          ? Math.round((completedLessons / totalLessons) * 100)
          : 0;

    const totalActivities = totalLessons + totalQuizzes;
    const completedActivities = completedLessons + completedQuizzes;
    const progressPercentage = totalActivities > 0
      ? Math.round((completedActivities / totalActivities) * 100)
      : 0;

    const lessonsDone = totalLessons > 0 && completedLessons >= totalLessons;
    const quizzesDone = totalQuizzes === 0 || completedQuizzes >= totalQuizzes;
    const scorePassed = totalQuizzes === 0 || currentScore >= minRequiredScore;

    const eligible = isEnrolled && lessonsDone && quizzesDone && scorePassed;

    const reasons: string[] = [];
    if (!isEnrolled) {
      reasons.push("You must be enrolled in this course to earn a certificate.");
    }
    if (totalLessons === 0) {
      reasons.push("This course does not have any published curriculum lessons yet.");
    } else if (completedLessons < totalLessons) {
      const remaining = totalLessons - completedLessons;
      reasons.push(
        `${remaining} of ${totalLessons} lesson${remaining !== 1 ? "s" : ""} remaining to complete.`,
      );
    }
    if (totalQuizzes > 0 && completedQuizzes < totalQuizzes) {
      const remaining = totalQuizzes - completedQuizzes;
      reasons.push(
        `${remaining} of ${totalQuizzes} quiz${remaining !== 1 ? "zes" : ""} remaining to attempt.`,
      );
    }
    if (totalQuizzes > 0 && !scorePassed) {
      reasons.push(
        `Current course score (${currentScore}%) is below the minimum required passing score (${minRequiredScore}%). Retrying quizzes can improve your score.`,
      );
    }

    return {
      eligible: Boolean(existingCert) || eligible,
      certificate: existingCert,
      progress: {
        completedLessons,
        totalLessons,
        completedQuizzes,
        totalQuizzes,
        progressPercentage,
      },
      score: {
        current: currentScore,
        required: minRequiredScore,
        passed: scorePassed,
      },
      reasons,
    };
  }
}
