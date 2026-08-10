export interface IJwtService {
  generateAccessToken(userId: string): string;

  generateRefreshToken(userId: string): string;

  verifyAccessToken(token: string): { userId: string };

  verifyRefreshToken(token: string): { userId: string };
}
