export type CreatePendingUserProps = {
  name: string;
  email: string;
  hashedPassword: string;
};
export interface PendingUserPersistenceProps {
  name: string;
  email: string;
  hashedPassword: string;
  createdAt: Date;
  expiresAt: Date;
}

export class PendingUser {
  private constructor(
    private name: string,
    private email: string,
    private hashedPassword: string,
    private readonly createdAt: Date,
    private expiresAt: Date,
  ) {}
  static create(props: CreatePendingUserProps): PendingUser {
    if (props.name.trim() === "") {
      throw new Error("Name is required");
    }

    if (props.email.trim() === "") {
      throw new Error("Email is required");
    }

    if (props.hashedPassword.trim() === "") {
      throw new Error("Password is required");
    }

    const now = new Date();
    const name = props.name.trim();

    const email = props.email.trim().toLowerCase();
    const expiresAt = new Date(now.getTime() + 5 * 60 * 1000);
    return new PendingUser(name, email, props.hashedPassword, now, expiresAt);
  }
  static fromPersistence(props: PendingUserPersistenceProps): PendingUser {
    return new PendingUser(
      props.name,
      props.email,
      props.hashedPassword,
      props.createdAt,
      props.expiresAt,
    );
  }
  toPersistence(): PendingUserPersistenceProps {
    return {
      name: this.name,
      email: this.email,
      hashedPassword: this.hashedPassword,
      createdAt: this.createdAt,
      expiresAt: this.expiresAt,
    };
  }
  isExpired(): boolean {
    return Date.now() > this.expiresAt.getTime();
  }
  getEmail(): string {
    return this.email;
  }

  getName(): string {
    return this.name;
  }
}
