import type { Response, NextFunction } from "express";
import type { AuthenticatedRequest } from "../../../middlewares/authMiddleware";
import type { CreateDiscussionUseCase } from "../useCase/CreateDiscussionUseCase";
import type { GetCourseDiscussionsUseCase } from "../useCase/GetCourseDiscussionsUseCase";
import type { GetLessonDiscussionsUseCase } from "../useCase/GetLessonDiscussionsUseCase";
import type { GetDiscussionUseCase } from "../useCase/GetDiscussionUseCase";
import type { UpdateDiscussionUseCase } from "../useCase/UpdateDiscussionUseCase";
import type { DeleteDiscussionUseCase } from "../useCase/DeleteDiscussionUseCase";
import type { CreateDiscussionReplyUseCase } from "../useCase/CreateDiscussionReplyUseCase";
import type { UpdateDiscussionReplyUseCase } from "../useCase/UpdateDiscussionReplyUseCase";
import type { DeleteDiscussionReplyUseCase } from "../useCase/DeleteDiscussionReplyUseCase";
import type { MarkDiscussionResolvedUseCase } from "../useCase/MarkDiscussionResolvedUseCase";
import type { PinDiscussionUseCase } from "../useCase/PinDiscussionUseCase";
import type { SearchDiscussionsUseCase } from "../useCase/SearchDiscussionsUseCase";
import type { ReportDiscussionUseCase } from "../useCase/ReportDiscussionUseCase";
import type { GetInstructorDiscussionsUseCase } from "../useCase/GetInstructorDiscussionsUseCase";
import type { ModerateDiscussionUseCase } from "../useCase/ModerateDiscussionUseCase";
import type { IDiscussionReportRepository } from "../interface/IDiscussionReportRepository";
import type { IDiscussionRepository } from "../interface/IDiscussionRepository";

export class DiscussionController {
  constructor(
    private readonly createDiscussionUseCase: CreateDiscussionUseCase,
    private readonly getCourseDiscussionsUseCase: GetCourseDiscussionsUseCase,
    private readonly getLessonDiscussionsUseCase: GetLessonDiscussionsUseCase,
    private readonly getDiscussionUseCase: GetDiscussionUseCase,
    private readonly updateDiscussionUseCase: UpdateDiscussionUseCase,
    private readonly deleteDiscussionUseCase: DeleteDiscussionUseCase,
    private readonly createDiscussionReplyUseCase: CreateDiscussionReplyUseCase,
    private readonly updateDiscussionReplyUseCase: UpdateDiscussionReplyUseCase,
    private readonly deleteDiscussionReplyUseCase: DeleteDiscussionReplyUseCase,
    private readonly markDiscussionResolvedUseCase: MarkDiscussionResolvedUseCase,
    private readonly pinDiscussionUseCase: PinDiscussionUseCase,
    private readonly searchDiscussionsUseCase: SearchDiscussionsUseCase,
    private readonly reportDiscussionUseCase: ReportDiscussionUseCase,
    private readonly getInstructorDiscussionsUseCase: GetInstructorDiscussionsUseCase,
    private readonly moderateDiscussionUseCase: ModerateDiscussionUseCase,
    private readonly discussionRepo: IDiscussionRepository,
    private readonly reportRepo: IDiscussionReportRepository,
  ) {}

  async createDiscussion(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const courseId = String(req.params.courseId);
      const { title, question, lessonId } = req.body;
      const discussion = await this.createDiscussionUseCase.execute(
        req.userId!,
        courseId,
        title,
        question,
        lessonId ?? null,
      );
      return res.status(201).json({ success: true, data: discussion });
    } catch (err) { next(err); }
  }

  async getCourseDiscussions(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const courseId = String(req.params.courseId);
      const page = req.query.page ? Number(req.query.page) : 1;
      const limit = req.query.limit ? Number(req.query.limit) : 20;
      const status = req.query.status ? String(req.query.status) : undefined;
      const sort = req.query.sort ? String(req.query.sort) : "newest";
      const result = await this.getCourseDiscussionsUseCase.execute(courseId, page, limit, status, sort);
      return res.status(200).json({ success: true, data: result });
    } catch (err) { next(err); }
  }

  async getLessonDiscussions(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const courseId = String(req.params.courseId);
      const lessonId = String(req.params.lessonId);
      const page = req.query.page ? Number(req.query.page) : 1;
      const limit = req.query.limit ? Number(req.query.limit) : 20;
      const result = await this.getLessonDiscussionsUseCase.execute(courseId, lessonId, page, limit);
      return res.status(200).json({ success: true, data: result });
    } catch (err) { next(err); }
  }

  async getDiscussion(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const discussionId = String(req.params.discussionId);
      const result = await this.getDiscussionUseCase.execute(discussionId);
      return res.status(200).json({ success: true, data: result });
    } catch (err) { next(err); }
  }

  async updateDiscussion(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const discussionId = String(req.params.discussionId);
      const { title, question } = req.body;
      const result = await this.updateDiscussionUseCase.execute(discussionId, req.userId!, title, question);
      return res.status(200).json({ success: true, data: result });
    } catch (err) { next(err); }
  }

  async deleteDiscussion(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const discussionId = String(req.params.discussionId);
      await this.deleteDiscussionUseCase.execute(discussionId, req.userId!, req.userRole!);
      return res.status(200).json({ success: true, message: "Discussion deleted." });
    } catch (err) { next(err); }
  }

  async createReply(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const discussionId = String(req.params.discussionId);
      const { content } = req.body;
      const reply = await this.createDiscussionReplyUseCase.execute(
        discussionId,
        req.userId!,
        req.userRole!,
        content,
      );
      return res.status(201).json({ success: true, data: reply });
    } catch (err) { next(err); }
  }

  async updateReply(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const replyId = String(req.params.replyId);
      const { content } = req.body;
      const reply = await this.updateDiscussionReplyUseCase.execute(replyId, req.userId!, content);
      return res.status(200).json({ success: true, data: reply });
    } catch (err) { next(err); }
  }

  async deleteReply(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const replyId = String(req.params.replyId);
      await this.deleteDiscussionReplyUseCase.execute(replyId, req.userId!, req.userRole!);
      return res.status(200).json({ success: true, message: "Reply deleted." });
    } catch (err) { next(err); }
  }

  async resolveDiscussion(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const discussionId = String(req.params.discussionId);
      const result = await this.markDiscussionResolvedUseCase.execute(
        discussionId,
        req.userId!,
        req.userRole!,
      );
      return res.status(200).json({ success: true, data: result });
    } catch (err) { next(err); }
  }

  async pinDiscussion(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const discussionId = String(req.params.discussionId);
      const result = await this.pinDiscussionUseCase.execute(
        discussionId,
        req.userId!,
        req.userRole!,
      );
      return res.status(200).json({ success: true, data: result });
    } catch (err) { next(err); }
  }

  async searchDiscussions(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const courseId = String(req.query.courseId || "");
      const query = String(req.query.q || "");
      const page = req.query.page ? Number(req.query.page) : 1;
      const limit = req.query.limit ? Number(req.query.limit) : 20;
      const result = await this.searchDiscussionsUseCase.execute(courseId, query, page, limit);
      return res.status(200).json({ success: true, data: result });
    } catch (err) { next(err); }
  }

  async reportDiscussion(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const discussionId = String(req.params.discussionId);
      const { reason } = req.body;
      const report = await this.reportDiscussionUseCase.execute(req.userId!, discussionId, reason, null);
      return res.status(201).json({ success: true, data: report });
    } catch (err) { next(err); }
  }

  async reportReply(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const discussionId = String(req.params.discussionId);
      const replyId = String(req.params.replyId);
      const { reason } = req.body;
      const report = await this.reportDiscussionUseCase.execute(req.userId!, discussionId, reason, replyId);
      return res.status(201).json({ success: true, data: report });
    } catch (err) { next(err); }
  }

  // Instructor endpoints
  async getInstructorDiscussions(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const page = req.query.page ? Number(req.query.page) : 1;
      const limit = req.query.limit ? Number(req.query.limit) : 20;
      const status = req.query.status ? String(req.query.status) : undefined;
      const courseId = req.query.courseId ? String(req.query.courseId) : undefined;
      const search = req.query.search ? String(req.query.search) : undefined;
      const result = await this.getInstructorDiscussionsUseCase.execute(
        req.userId!,
        page,
        limit,
        status,
        courseId,
        search,
      );
      return res.status(200).json({ success: true, data: result });
    } catch (err) { next(err); }
  }

  // Admin endpoints
  async getAllDiscussions(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const page = req.query.page ? Number(req.query.page) : 1;
      const limit = req.query.limit ? Number(req.query.limit) : 20;
      const status = req.query.status ? String(req.query.status) : undefined;
      const result = await this.discussionRepo.findCourseDiscussions("", page, limit, status);
      return res.status(200).json({ success: true, data: result });
    } catch (err) { next(err); }
  }

  async getDiscussionReports(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const page = req.query.page ? Number(req.query.page) : 1;
      const limit = req.query.limit ? Number(req.query.limit) : 20;
      const status = req.query.status ? String(req.query.status) : undefined;
      const result = await this.reportRepo.findAll(page, limit, status);
      return res.status(200).json({ success: true, data: result });
    } catch (err) { next(err); }
  }

  async moderateDiscussion(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { action, discussionId, replyId, reportId } = req.body;
      const result = await this.moderateDiscussionUseCase.execute(action, discussionId, replyId, reportId);
      return res.status(200).json(result);
    } catch (err) { next(err); }
  }
}
