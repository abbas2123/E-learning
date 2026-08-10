import { User } from "../userEnitity/User";

export interface IUserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  create(user: User): Promise<User>;
  update(user: User): Promise<User>;
  delete(id: string): Promise<void>;

  savePasswordResetToken(
    userId: string,

    token: string,

    expiresAt: Date,
  ): Promise<void>;

  findByPasswordResetToken(token: string): Promise<User | null>;

  clearPasswordResetToken(userId: string): Promise<void>;
}
