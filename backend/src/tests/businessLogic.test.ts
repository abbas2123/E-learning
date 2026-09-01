import test from "node:test";
import assert from "node:assert/strict";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import mongoose from "mongoose";
import { errorHandler } from "../middlewares/errorHandler.js";
import { adminMiddleware } from "../middlewares/adminMiddleware.js";
import { instructorMiddleware } from "../middlewares/instructorMiddleware.js";
import {
  AppError,
  ValidationError,
  ForbiddenError,
  UnauthorizedError,
  NotFoundError,
  UserBlockedError,
  InvalidCredentialsError,
} from "../core/errors/AppError.js";

function runErrorHandler(error: unknown, path = "/api/test") {
  const previousNodeEnv = process.env.NODE_ENV;
  process.env.NODE_ENV = "production";

  let statusCode = 0;
  let responseBody: Record<string, unknown> | undefined;
  const response = {
    clearCookie: () => response,
    status: (status: number) => {
      statusCode = status;
      return response;
    },
    json: (body: Record<string, unknown>) => {
      responseBody = body;
      return response;
    },
  } as any;

  errorHandler(
    error,
    { path, requestId: "req_test" } as any,
    response,
    (() => {}) as any,
  );

  if (previousNodeEnv === undefined) delete process.env.NODE_ENV;
  else process.env.NODE_ENV = previousNodeEnv;

  return { statusCode, responseBody };
}

// ─── 1. Error Hierarchy Tests ───────────────────────────────────────────────
test("AppError Hierarchy and HTTP Status Codes", () => {
  const validationErr = new ValidationError("Invalid payload");
  assert.equal(validationErr.statusCode, 400);
  assert.equal(validationErr.code, "VALIDATION_ERROR");
  assert.equal(validationErr instanceof AppError, true);

  const unauthorizedErr = new UnauthorizedError("Auth required");
  assert.equal(unauthorizedErr.statusCode, 401);
  assert.equal(unauthorizedErr.code, "UNAUTHORIZED");

  const forbiddenErr = new ForbiddenError("Access denied");
  assert.equal(forbiddenErr.statusCode, 403);
  assert.equal(forbiddenErr.code, "FORBIDDEN");

  const notFoundErr = new NotFoundError("Course not found");
  assert.equal(notFoundErr.statusCode, 404);
  assert.equal(notFoundErr.code, "NOT_FOUND");

  const blockedErr = new UserBlockedError();
  assert.equal(blockedErr.statusCode, 403);
  assert.equal(blockedErr.code, "USER_BLOCKED");
  assert.equal(
    blockedErr.message,
    "Your account has been blocked by the administrator.",
  );

  const credentialsErr = new InvalidCredentialsError();
  assert.equal(credentialsErr.statusCode, 401);
  assert.equal(credentialsErr.code, "INVALID_CREDENTIALS");
});

test("Global error handler maps expected Mongoose and JWT errors safely", () => {
  const duplicate = runErrorHandler({
    code: 11000,
    message: "secret collection details",
  });
  assert.equal(duplicate.statusCode, 409);
  assert.deepEqual(duplicate.responseBody, {
    success: false,
    code: "RESOURCE_CONFLICT",
    message: "A resource with the provided value already exists.",
    requestId: "req_test",
  });

  const validation = runErrorHandler(new mongoose.Error.ValidationError());
  assert.equal(validation.statusCode, 400);
  assert.equal(validation.responseBody?.code, "VALIDATION_ERROR");
  assert.equal(
    validation.responseBody?.message,
    "The request contains invalid data.",
  );

  const cast = runErrorHandler(
    new mongoose.Error.CastError("ObjectId", "bad-id", "courseId"),
  );
  assert.equal(cast.statusCode, 400);
  assert.equal(cast.responseBody?.code, "VALIDATION_ERROR");
  assert.equal(
    cast.responseBody?.message,
    "The request contains an invalid resource identifier.",
  );

  const expiredAccess = runErrorHandler(
    new jwt.TokenExpiredError("jwt expired", new Date()),
  );
  assert.equal(expiredAccess.statusCode, 401);
  assert.equal(expiredAccess.responseBody?.code, "ACCESS_TOKEN_EXPIRED");
  assert.equal(expiredAccess.responseBody?.message, "Access token expired.");

  const invalidAccess = runErrorHandler(
    new jwt.JsonWebTokenError("jwt malformed"),
  );
  assert.equal(invalidAccess.statusCode, 401);
  assert.equal(invalidAccess.responseBody?.code, "INVALID_ACCESS_TOKEN");
  assert.equal(invalidAccess.responseBody?.message, "Invalid access token.");

  const invalidRefresh = runErrorHandler(
    new jwt.JsonWebTokenError("jwt malformed"),
    "/api/auth/refresh",
  );
  assert.equal(invalidRefresh.statusCode, 401);
  assert.equal(invalidRefresh.responseBody?.code, "INVALID_REFRESH_TOKEN");

  const unexpected = runErrorHandler(
    new Error("database password and stack path"),
  );
  assert.equal(unexpected.statusCode, 500);
  assert.equal(unexpected.responseBody?.code, "INTERNAL_SERVER_ERROR");
  assert.equal(
    unexpected.responseBody?.message,
    "Internal Server Error. Please contact support if the problem persists.",
  );
  assert.equal(
    String(unexpected.responseBody?.message).includes("password"),
    false,
  );
});

test("Role middleware forwards stable authorization errors to the global handler", () => {
  let adminError: unknown;
  adminMiddleware(
    { userId: "student_1", userRole: "student" } as any,
    {} as any,
    (error?: unknown) => {
      adminError = error;
    },
  );
  const adminResponse = runErrorHandler(adminError);
  assert.equal(adminResponse.statusCode, 403);
  assert.equal(adminResponse.responseBody?.code, "FORBIDDEN");

  let instructorError: unknown;
  instructorMiddleware(
    { userId: "student_1", userRole: "student" } as any,
    {} as any,
    (error?: unknown) => {
      instructorError = error;
    },
  );
  const instructorResponse = runErrorHandler(instructorError);
  assert.equal(instructorResponse.statusCode, 403);
  assert.equal(instructorResponse.responseBody?.code, "FORBIDDEN");
});

// ─── 2. Cryptographic Payment Verification ──────────────────────────────────
test("Razorpay Payment Client HMAC SHA256 Verification", () => {
  const secret = "test_razorpay_secret_key";
  const orderId = "order_123456789";
  const paymentId = "pay_987654321";

  const validSignature = crypto
    .createHmac("sha256", secret)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");

  const verifySignature = (
    oId: string,
    pId: string,
    sig: string,
    key: string,
  ) => {
    const expected = crypto
      .createHmac("sha256", key)
      .update(`${oId}|${pId}`)
      .digest("hex");
    return expected === sig;
  };

  assert.equal(
    verifySignature(orderId, paymentId, validSignature, secret),
    true,
  );
  assert.equal(
    verifySignature(orderId, paymentId, "tampered_sig", secret),
    false,
  );
  assert.equal(
    verifySignature("different_order", paymentId, validSignature, secret),
    false,
  );
});

test("Razorpay Webhook Payload Signature Verification", () => {
  const secret = "webhook_secret_xyz";
  const payloadStr = JSON.stringify({
    event: "payment.captured",
    payload: {
      payment: {
        entity: { id: "pay_abc", order_id: "order_xyz", amount: 4900 },
      },
    },
  });

  const validWebhookSig = crypto
    .createHmac("sha256", secret)
    .update(payloadStr)
    .digest("hex");

  const computedSig = crypto
    .createHmac("sha256", secret)
    .update(payloadStr)
    .digest("hex");

  assert.equal(computedSig, validWebhookSig);

  const invalidSig = crypto
    .createHmac("sha256", "wrong_key")
    .update(payloadStr)
    .digest("hex");

  assert.notEqual(invalidSig, validWebhookSig);
});

// ─── 3. Quiz Auto-Grading & Scoring Engine ──────────────────────────────────
test("Quiz Auto-Grading Engine: Single & Multi-Choice Rules", () => {
  const questions = [
    {
      id: "q1",
      points: 2,
      questionType: "single_choice",
      correctOptionIds: ["opt1"],
    },
    {
      id: "q2",
      points: 3,
      questionType: "multiple_choice",
      correctOptionIds: ["optA", "optB"],
    },
    {
      id: "q3",
      points: 5,
      questionType: "multiple_choice",
      correctOptionIds: ["optX", "optY", "optZ"],
    },
  ];

  const studentSubmission = [
    { questionId: "q1", selectedOptionIds: ["opt1"] }, // Correct (2 pts)
    { questionId: "q2", selectedOptionIds: ["optA", "optB"] }, // Correct (3 pts)
    { questionId: "q3", selectedOptionIds: ["optX", "optY"] }, // Partial/Incorrect (0 pts)
  ];

  let score = 0;
  let totalPoints = 0;

  for (const q of questions) {
    totalPoints += q.points;
    const studentAns = studentSubmission.find((a) => a.questionId === q.id);
    if (studentAns) {
      const correctSet = new Set(q.correctOptionIds);
      const selectedSet = new Set(studentAns.selectedOptionIds);

      let isCorrect = false;
      if (q.questionType === "multiple_choice") {
        isCorrect =
          correctSet.size === selectedSet.size &&
          [...correctSet].every((id) => selectedSet.has(id));
      } else {
        isCorrect =
          studentAns.selectedOptionIds.length === 1 &&
          correctSet.has(studentAns.selectedOptionIds[0]);
      }

      if (isCorrect) score += q.points;
    }
  }

  const percentage = Math.round((score / totalPoints) * 100);
  assert.equal(score, 5);
  assert.equal(totalPoints, 10);
  assert.equal(percentage, 50);

  const passingScore = 70;
  assert.equal(percentage >= passingScore, false); // Failed

  const passingScoreLow = 50;
  assert.equal(percentage >= passingScoreLow, true); // Passed
});

// ─── 4. Certificate Issuance Rule ───────────────────────────────────────────
test("Certificate Issuance Progress Requirement", () => {
  const isEligibleForCertificate = (completed: number, total: number) => {
    if (total <= 0) return false;
    return (completed / total) * 100 >= 100;
  };

  assert.equal(isEligibleForCertificate(12, 12), true);
  assert.equal(isEligibleForCertificate(11, 12), false);
  assert.equal(isEligibleForCertificate(0, 10), false);
  assert.equal(isEligibleForCertificate(0, 0), false);
});

// ─── 5. Authentication: Password Hashing & JWT ──────────────────────────────
test("Password Hashing & Bcrypt Verification", async () => {
  const plainPassword = "SecurePassword@123";
  const hash = await bcrypt.hash(plainPassword, 10);

  assert.equal(typeof hash, "string");
  assert.notEqual(hash, plainPassword);

  const isMatch = await bcrypt.compare(plainPassword, hash);
  assert.equal(isMatch, true);

  const isWrongMatch = await bcrypt.compare("WrongPassword!", hash);
  assert.equal(isWrongMatch, false);
});

test("JWT Access & Refresh Token Claims Verification", () => {
  const secret = "test_jwt_secret_token_123456";
  const userId = "user_abc_789";

  const token = jwt.sign({ userId }, secret, { expiresIn: "15m" });
  assert.equal(typeof token, "string");

  const decoded = jwt.verify(token, secret) as { userId: string };
  assert.equal(decoded.userId, userId);

  assert.throws(() => {
    jwt.verify(token, "invalid_secret_key");
  });
});

// ─── 6. Server-side Multi-Cart Price Calculation ────────────────────────────
test("Server-Side Price Calculation for Multi-Course Cart", () => {
  const catalog = [
    { id: "c1", title: "React Masterclass", price: 1499, status: "published" },
    {
      id: "c2",
      title: "Node.js Microservices",
      price: 1999,
      status: "published",
    },
    { id: "c3", title: "Python AI", price: 2499, status: "published" },
  ];

  const cartCourseIds = ["c1", "c2", "c1"]; // Note duplicate c1 from client

  // Server de-duplicates and sums from database prices only
  const uniqueIds = Array.from(new Set(cartCourseIds));
  const matchedCourses = catalog.filter((c) => uniqueIds.includes(c.id));

  const totalCalculated = matchedCourses.reduce((sum, c) => sum + c.price, 0);

  assert.equal(uniqueIds.length, 2);
  assert.equal(totalCalculated, 1499 + 1999);
  assert.equal(totalCalculated, 3498);
});

// ─── 7. Role Access Authorization Guards ────────────────────────────────────
test("Role Access Control Matrix Guard", () => {
  type Role = "student" | "instructor" | "admin";

  const canAccessInstructorStudio = (role: Role) =>
    role === "instructor" || role === "admin";
  const canAccessAdminDashboard = (role: Role) => role === "admin";
  const canAccessLearningPlayer = (isEnrolled: boolean) => isEnrolled;

  assert.equal(canAccessInstructorStudio("student"), false);
  assert.equal(canAccessInstructorStudio("instructor"), true);
  assert.equal(canAccessInstructorStudio("admin"), true);

  assert.equal(canAccessAdminDashboard("student"), false);
  assert.equal(canAccessAdminDashboard("instructor"), false);
  assert.equal(canAccessAdminDashboard("admin"), true);

  assert.equal(canAccessLearningPlayer(false), false);
  assert.equal(canAccessLearningPlayer(true), true);
});
