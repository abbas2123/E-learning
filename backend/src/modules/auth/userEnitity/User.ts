import { UserRole } from "../../../types/user.types";
import { AuthProvider } from "../../../types/user.types";

type CreateUserProps = {
  id: string;

  name: string;

  email: string;

  password: string | null;

  role: UserRole;

  provider: AuthProvider;

  avatar?: string;
};

type ReconstructUserProps = {
  id: string;

  name: string;

  email: string;

  password: string | null;

  role: UserRole;

  provider: AuthProvider;

  isVerified: boolean;

  isBlocked: boolean;

  createdAt: Date;

  updatedAt: Date;

  avatar?: string;
};

export class User {
  private constructor(
    private readonly id: string,
    private name: string,
    private email: string,
    private password: string | null,
    private role: UserRole,
    private provider: AuthProvider,
    private isVerified: boolean = false,
    private isBlocked: boolean = false,
    private readonly createdAt: Date,
    private updatedAt: Date,
    private avatar?: string,
  ) {}

  static create(props: CreateUserProps): User {
    const now = new Date();

    return new User(
      props.id,

      props.name,

      props.email,

      props.password,

      props.role,

      props.provider,

      false,

      false,

      now,

      now,

      props.avatar,
    );
  }

  static reconstruct(props: ReconstructUserProps): User {
    return new User(
      props.id,

      props.name,

      props.email,

      props.password,

      props.role,

      props.provider,

      props.isVerified,

      props.isBlocked,

      props.createdAt,

      props.updatedAt,

      props.avatar,
    );
  }
  getId() {
    return this.id;
  }
  getName() {
    return this.name;
  }
  getEmail() {
    return this.email;
  }
  getRole() {
    return this.role;
  }
  getProvider() {
    return this.provider;
  }
  getAvatar() {
    return this.avatar;
  }
  isEmailVerified() {
    return this.isVerified;
  }
  getIsBlocked() {
    return this.isBlocked;
  }
  getPassword(): string | null {
    return this.password;
  }
  updateProfile(name: string, avatar?: string): void {
    if (!name.trim()) {
      throw new Error("Name cannot be empty.");
    }

    this.name = name;
    this.avatar = avatar;
    this.updatedAt = new Date();
  }

  changePassword(hashedPassword: string): void {
    this.password = hashedPassword;

    this.updatedAt = new Date();
  }

  verifyEmail(): void {
    this.isVerified = true;

    this.updatedAt = new Date();
  }

  block(): void {
    this.isBlocked = true;

    this.updatedAt = new Date();
  }

  unblock(): void {
    this.isBlocked = false;

    this.updatedAt = new Date();
  }

  changeRole(role: UserRole): void {
    if (this.role === role) return;

    this.role = role;
    this.updatedAt = new Date();
  }
  toJSON() {
    return {
      id: this.id,

      name: this.name,

      email: this.email,

      role: this.role,

      provider: this.provider,

      avatar: this.avatar,

      isVerified: this.isVerified,

      isBlocked: this.isBlocked,

      createdAt: this.createdAt,

      updatedAt: this.updatedAt,
    };
  }
}
