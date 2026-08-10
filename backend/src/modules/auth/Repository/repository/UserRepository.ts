import type { IUserRepository } from "../../interface/IUserRepository";
import { User } from "../../userEnitity/User";
import { UserModel } from "../database/User";

export class UserRepository implements IUserRepository {
  private toEntity(document: typeof UserModel.prototype): User {
    return User.reconstruct({
      id: document.id ?? document._id.toString(),
      name: document.name,
      email: document.email,
      password: document.password,
      role: document.role,
      provider: document.provider,
      isVerified: document.isVerified,
      isBlocked: document.isBlocked,
      createdAt: document.createdAt,
      updatedAt: document.updatedAt,
      avatar: document.avatar ?? undefined,
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    const result = await UserModel.findOne({ email });
    if (!result) return null;
    return this.toEntity(result);
  }

  async create(user: User): Promise<User> {
    const doc = new UserModel({
      id: user.getId(),
      name: user.getName(),
      email: user.getEmail(),
      password: user.getPassword(),
      role: user.getRole(),
      provider: user.getProvider(),
      avatar: user.getAvatar() ?? null,
    });
    const saved = await doc.save();
    return this.toEntity(saved);
  }

  async findById(id: string): Promise<User | null> {
    const result = await UserModel.findOne({ id });
    if (!result) return null;
    return this.toEntity(result);
  }

  async update(user: User): Promise<User> {
    const updated = await UserModel.findOneAndUpdate(
      { id: user.getId() },

      {
        name: user.getName(),

        avatar: user.getAvatar() ?? null,

        role: user.getRole(),

        password: user.getPassword(),

        isVerified: user.isEmailVerified(),

        isBlocked: user.getIsBlocked(),
      },

      {
        returnDocument: "after",
      },
    );

    if (!updated) {
      throw new Error("User not found for update.");
    }

    return this.toEntity(updated);
  }

  async delete(id: string): Promise<void> {
    await UserModel.deleteOne({ id });
  }

  async savePasswordResetToken(
    userId: string,
    token: string,
    expiresAt: Date,
  ): Promise<void> {
    const updated = await UserModel.findOneAndUpdate(
      { id: userId },
      {
        passwordResetToken: token,
        passwordResetExpires: expiresAt,
      },
      { returnDocument: "after" },
    );

    if (!updated) {
      throw new Error("User not found.");
    }
  }

  async findByPasswordResetToken(token: string): Promise<User | null> {
    const result = await UserModel.findOne({
      passwordResetToken: token,
      passwordResetExpires: {
        $gt: new Date(),
      },
    });

    if (!result) return null;

    return this.toEntity(result);
  }

  async clearPasswordResetToken(userId: string): Promise<void> {
    const updated = await UserModel.findOneAndUpdate(
      { id: userId },
      {
        $set: {
          passwordResetToken: null,
          passwordResetExpires: null,
        },
      },
      { returnDocument: "after" },
    );

    if (!updated) {
      throw new Error("User not found.");
    }
  }
}
