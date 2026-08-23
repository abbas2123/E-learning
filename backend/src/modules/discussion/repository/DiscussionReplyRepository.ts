import { randomUUID } from "crypto";
import { DiscussionReplyModel } from "../database/DiscussionReply";
import { UserModel } from "../../auth/Repository/database/User";
import type {
  IDiscussionReplyRepository,
  DiscussionReplyDto,
  CreateDiscussionReplyParams,
} from "../interface/IDiscussionReplyRepository";
import type { DiscussionAuthorDto } from "../interface/IDiscussionRepository";

export class DiscussionReplyRepository implements IDiscussionReplyRepository {
  private async buildAuthor(userId: string): Promise<DiscussionAuthorDto> {
    const user = await UserModel.findOne({ id: userId }).select("id name avatar role");
    if (!user) return { id: userId, name: "Unknown User", avatar: null, role: "student" };
    return { id: user.id, name: user.name, avatar: user.avatar ?? null, role: user.role };
  }

  private async toDto(doc: any): Promise<DiscussionReplyDto> {
    const author = await this.buildAuthor(doc.authorId);
    return {
      id: doc.id,
      discussionId: doc.discussionId,
      authorId: doc.authorId,
      authorRole: doc.authorRole,
      author,
      content: doc.content,
      isInstructorReply: Boolean(doc.isInstructorReply),
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }

  async create(params: CreateDiscussionReplyParams): Promise<DiscussionReplyDto> {
    const doc = await DiscussionReplyModel.create({
      id: randomUUID(),
      ...params,
    });
    return this.toDto(doc);
  }

  async findById(replyId: string): Promise<DiscussionReplyDto | null> {
    const doc = await DiscussionReplyModel.findOne({ id: replyId });
    if (!doc) return null;
    return this.toDto(doc);
  }

  async findByDiscussionId(discussionId: string): Promise<DiscussionReplyDto[]> {
    const docs = await DiscussionReplyModel.find({ discussionId }).sort({ createdAt: 1 });
    return Promise.all(docs.map((d) => this.toDto(d)));
  }

  async update(replyId: string, content: string): Promise<DiscussionReplyDto | null> {
    const doc = await DiscussionReplyModel.findOneAndUpdate(
      { id: replyId },
      { $set: { content } },
      { new: true, runValidators: true },
    );
    if (!doc) return null;
    return this.toDto(doc);
  }

  async delete(replyId: string): Promise<boolean> {
    const result = await DiscussionReplyModel.deleteOne({ id: replyId });
    return result.deletedCount > 0;
  }

  async deleteByDiscussionId(discussionId: string): Promise<number> {
    const result = await DiscussionReplyModel.deleteMany({ discussionId });
    return result.deletedCount;
  }
}
