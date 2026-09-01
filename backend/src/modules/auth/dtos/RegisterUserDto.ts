export type RegisterUserDto = {
  name: string;
  email: string;
  password: string;
  role?: "student" | "instructor";
};
