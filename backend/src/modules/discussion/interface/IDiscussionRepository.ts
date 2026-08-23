import type { DiscussionStatus } from "../database/Discussion";

export interface DiscussionAuthorDto {
  id: string;
  name: string;
  avatar: string | null;
  role: string;
}

export interface DiscussionDto {
  id: string;
  courseId: string;
  courseTitle?: string;
  lessonId: string | null;
  lessonTitle?: string | null;
  studentId: string;
  author: DiscussionAuthorDto;
  title: string;
  question: string;
  status: DiscussionStatus;
  isPinned: boolean;
  replyCount: number;
  lastReplyAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface PaginatedDiscussionsDto {
  discussions: DiscussionDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CreateDiscussionParams {
  courseId: string;
  lessonId?: string | null;
  studentId: string;
  title: string;
  question: string;
}

export interface UpdateDiscussionParams {
  title?: string;
  question?: string;
  status?: DiscussionStatus;
  isPinned?: boolean;
}

export interface IDiscussionRepository {
  create(params: CreateDiscussionParams): Promise<DiscussionDto>;
  findById(discussionId: string): Promise<DiscussionDto | null>;
  findCourseDiscussions(
    courseId: string,
    page: number,
    limit: number,
    status?: string,
    sort?: string,
  ): Promise<PaginatedDiscussionsDto>;
  findLessonDiscussions(
    courseId: string,
    lessonId: string,
    page: number,
    limit: number,
  ): Promise<PaginatedDiscussionsDto>;
  findInstructorDiscussions(
    instructorId: string,
    page: number,
    limit: number,
    status?: string,
    courseId?: string,
    search?: string,
  ): Promise<PaginatedDiscussionsDto>;
  search(
    courseId: string,
    query: string,
    page: number,
    limit: number,
  ): Promise<PaginatedDiscussionsDto>;
  update(discussionId: string, params: UpdateDiscussionParams): Promise<DiscussionDto | null>;
  incrementReplyCount(discussionId: string): Promise<void>;
  decrementReplyCount(discussionId: string): Promise<void>;
  delete(discussionId: string): Promise<boolean>;
}
