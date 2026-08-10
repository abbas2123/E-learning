import type { Request, Response, NextFunction } from "express";

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  const isDev = process.env.NODE_ENV !== "production";

  console.error(`[ERROR] ${err.message}`);
  if (isDev) console.error(err.stack);

  const statusCode =
    err.message === "User already exists." ? 409 : 500;

  res.status(statusCode).json({
    success: false,
    message: err.message || "Internal Server Error",
    ...(isDev && { stack: err.stack }),
  });
}
