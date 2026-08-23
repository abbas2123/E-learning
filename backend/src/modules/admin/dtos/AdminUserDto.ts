export type AdminUserDto = {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  isBlocked: boolean;
  isVerified: boolean;
  avatar?: string;
  createdAt?: Date;
};
