import { randomUUID } from "crypto";
import { NotificationModel } from "../database/Notification";
import type {
  INotificationRepository,
  NotificationDto,
  CreateNotificationParams,
} from "../../interface/INotificationRepository";

export class NotificationRepository implements INotificationRepository {
  private toDto(doc: any): NotificationDto {
    return {
      id: doc.id ?? doc._id.toString(),
      title: doc.title,
      message: doc.message,
      type: doc.type ?? "system",
      userId: doc.userId ?? null,
      read: Boolean(doc.read),
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }

  async createNotification(params: CreateNotificationParams): Promise<NotificationDto> {
    const doc = new NotificationModel({
      id: randomUUID(),
      title: params.title.trim(),
      message: params.message.trim(),
      type: params.type || "system",
      userId: params.userId || null,
      read: Boolean(params.read),
    });
    const saved = await doc.save();
    return this.toDto(saved);
  }

  async findByUserId(userId: string): Promise<NotificationDto[]> {
    const docs = await NotificationModel.find({
      $or: [{ userId }, { userId: null }],
    }).sort({ createdAt: -1 });
    return docs.map((d) => this.toDto(d));
  }

  async markAsRead(id: string, userId?: string): Promise<boolean> {
    const filter: any = { id };
    if (userId) {
      filter.$or = [{ userId }, { userId: null }];
    }
    const res = await NotificationModel.updateOne(filter, { $set: { read: true } });
    return res.modifiedCount > 0;
  }

  async markAllAsRead(userId: string): Promise<number> {
    const res = await NotificationModel.updateMany(
      { $or: [{ userId }, { userId: null }], read: false },
      { $set: { read: true } },
    );
    return res.modifiedCount;
  }

  async getUnreadCount(userId: string): Promise<number> {
    return NotificationModel.countDocuments({
      $or: [{ userId }, { userId: null }],
      read: false,
    });
  }
}
