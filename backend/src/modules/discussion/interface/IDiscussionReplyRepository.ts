import type { DiscussionAuthorDto } from "./IDiscussionRepository";

export interface DiscussionReplyDto {
  id: string;
  discussionId: string;
  authorId: string;
  authorRole: "student" | "instructor" | "admin";
  author: DiscussionAuthorDto;
  content: string;
  isInstructorReply: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateDiscussionReplyParams {
  discussionId: string;
  authorId: string;
  authorRole: "student" | "instructor" | "admin";
  content: string;
  isInstructorReply: boolean;
}

export interface IDiscussionReplyRepository {
  create(params: CreateDiscussionReplyParams): Promise<DiscussionReplyDto>;
  findById(replyId: string): Promise<DiscussionReplyDto | null>;
  findByDiscussionId(discussionId: string): Promise<DiscussionReplyDto[]>;
  update(replyId: string, content: string): Promise<DiscussionReplyDto | null>;
  delete(replyId: string): Promise<boolean>;
  deleteByDiscussionId(discussionId: string): Promise<number>;
}
