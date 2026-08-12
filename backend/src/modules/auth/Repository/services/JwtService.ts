import jwt, { type SignOptions } from "jsonwebtoken";
import type { IJwtService } from "../../interface/IJwtService";

const accessTokenExpiresIn = (process.env.ACCESS_TOKEN_EXPIRES_IN ??
  "15m") as SignOptions["expiresIn"];

const refreshTokenExpiresIn = (process.env.REFRESH_TOKEN_EXPIRES_IN ??
  "7d") as SignOptions["expiresIn"];

export class JwtService implements IJwtService {
  generateAccessToken(userId: string): string {
    return jwt.sign({ userId }, process.env.ACCESS_TOKEN_SECRET!, {
      expiresIn: accessTokenExpiresIn,
    });
  }

  generateRefreshToken(userId: string): string {
    return jwt.sign({ userId }, process.env.REFRESH_TOKEN_SECRET!, {
      expiresIn: refreshTokenExpiresIn,
    });
  }

  verifyAccessToken(token: string) {
    return jwt.verify(token, process.env.ACCESS_TOKEN_SECRET!) as {
      userId: string;
    };
  }

  verifyRefreshToken(token: string) {
    return jwt.verify(token, process.env.REFRESH_TOKEN_SECRET!) as {
      userId: string;
    };
  }
}
