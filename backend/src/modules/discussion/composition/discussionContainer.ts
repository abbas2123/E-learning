import { DiscussionRepository } from "../repository/DiscussionRepository";
import { DiscussionReplyRepository } from "../repository/DiscussionReplyRepository";
import { DiscussionReportRepository } from "../repository/DiscussionReportRepository";
import { CreateDiscussionUseCase } from "../useCase/CreateDiscussionUseCase";
import { GetCourseDiscussionsUseCase } from "../useCase/GetCourseDiscussionsUseCase";
import { GetLessonDiscussionsUseCase } from "../useCase/GetLessonDiscussionsUseCase";
import { GetDiscussionUseCase } from "../useCase/GetDiscussionUseCase";
import { UpdateDiscussionUseCase } from "../useCase/UpdateDiscussionUseCase";
import { DeleteDiscussionUseCase } from "../useCase/DeleteDiscussionUseCase";
import { CreateDiscussionReplyUseCase } from "../useCase/CreateDiscussionReplyUseCase";
import { UpdateDiscussionReplyUseCase } from "../useCase/UpdateDiscussionReplyUseCase";
import { DeleteDiscussionReplyUseCase } from "../useCase/DeleteDiscussionReplyUseCase";
import { MarkDiscussionResolvedUseCase } from "../useCase/MarkDiscussionResolvedUseCase";
import { PinDiscussionUseCase } from "../useCase/PinDiscussionUseCase";
import { SearchDiscussionsUseCase } from "../useCase/SearchDiscussionsUseCase";
import { ReportDiscussionUseCase } from "../useCase/ReportDiscussionUseCase";
import { GetInstructorDiscussionsUseCase } from "../useCase/GetInstructorDiscussionsUseCase";
import { ModerateDiscussionUseCase } from "../useCase/ModerateDiscussionUseCase";
import { DiscussionController } from "../controller/DiscussionController";

export function createDiscussionContainer() {
  const discussionRepo = new DiscussionRepository();
  const replyRepo = new DiscussionReplyRepository();
  const reportRepo = new DiscussionReportRepository();

  const createDiscussionUseCase = new CreateDiscussionUseCase(discussionRepo);
  const getCourseDiscussionsUseCase = new GetCourseDiscussionsUseCase(discussionRepo);
  const getLessonDiscussionsUseCase = new GetLessonDiscussionsUseCase(discussionRepo);
  const getDiscussionUseCase = new GetDiscussionUseCase(discussionRepo, replyRepo);
  const updateDiscussionUseCase = new UpdateDiscussionUseCase(discussionRepo);
  const deleteDiscussionUseCase = new DeleteDiscussionUseCase(discussionRepo, replyRepo, reportRepo);
  const createDiscussionReplyUseCase = new CreateDiscussionReplyUseCase(discussionRepo, replyRepo);
  const updateDiscussionReplyUseCase = new UpdateDiscussionReplyUseCase(replyRepo);
  const deleteDiscussionReplyUseCase = new DeleteDiscussionReplyUseCase(discussionRepo, replyRepo);
  const markDiscussionResolvedUseCase = new MarkDiscussionResolvedUseCase(discussionRepo);
  const pinDiscussionUseCase = new PinDiscussionUseCase(discussionRepo);
  const searchDiscussionsUseCase = new SearchDiscussionsUseCase(discussionRepo);
  const reportDiscussionUseCase = new ReportDiscussionUseCase(reportRepo, discussionRepo, replyRepo);
  const getInstructorDiscussionsUseCase = new GetInstructorDiscussionsUseCase(discussionRepo);
  const moderateDiscussionUseCase = new ModerateDiscussionUseCase(discussionRepo, replyRepo, reportRepo);

  const controller = new DiscussionController(
    createDiscussionUseCase,
    getCourseDiscussionsUseCase,
    getLessonDiscussionsUseCase,
    getDiscussionUseCase,
    updateDiscussionUseCase,
    deleteDiscussionUseCase,
    createDiscussionReplyUseCase,
    updateDiscussionReplyUseCase,
    deleteDiscussionReplyUseCase,
    markDiscussionResolvedUseCase,
    pinDiscussionUseCase,
    searchDiscussionsUseCase,
    reportDiscussionUseCase,
    getInstructorDiscussionsUseCase,
    moderateDiscussionUseCase,
    discussionRepo,
    reportRepo,
  );

  return { controller };
}
