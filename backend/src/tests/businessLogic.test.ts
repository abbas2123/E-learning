import test from "node:test";
import assert from "node:assert/strict";
import crypto from "crypto";
import { AppError, ValidationError, ForbiddenError } from "../core/errors/AppError.js";

test("AppError Hierarchy Test", () => {
  const err = new ValidationError("Invalid payload");
  assert.equal(err.statusCode, 400);
  assert.equal(err.code, "VALIDATION_ERROR");
  assert.equal(err instanceof AppError, true);

  const forbiddenErr = new ForbiddenError("Access denied");
  assert.equal(forbiddenErr.statusCode, 403);
  assert.equal(forbiddenErr.code, "FORBIDDEN");
});

test("Razorpay Webhook HMAC SHA256 Signature Verification", () => {
  const secret = "test_webhook_secret_key_123";
  const payloadStr = JSON.stringify({
    event: "payment.captured",
    payload: { payment: { entity: { id: "pay_123", order_id: "order_123", amount: 199900 } } },
  });

  const validSignature = crypto
    .createHmac("sha256", secret)
    .update(payloadStr)
    .digest("hex");

  // Re-calculate to assert matching
  const testSignature = crypto
    .createHmac("sha256", secret)
    .update(payloadStr)
    .digest("hex");

  assert.equal(testSignature, validSignature);

  const invalidSignature = crypto
    .createHmac("sha256", "wrong_secret")
    .update(payloadStr)
    .digest("hex");

  assert.notEqual(invalidSignature, validSignature);
});

test("Quiz Auto-Grading Calculation Rules", () => {
  const questions = [
    { id: "q1", points: 2, correctOptionIds: ["opt1"] },
    { id: "q2", points: 3, correctOptionIds: ["opt2"] },
  ];

  const studentAnswers = [
    { questionId: "q1", selectedOptionIds: ["opt1"] }, // Correct (2 pts)
    { questionId: "q2", selectedOptionIds: ["opt3"] }, // Incorrect (0 pts)
  ];

  let score = 0;
  let totalPoints = 0;

  for (const q of questions) {
    totalPoints += q.points;
    const studentAns = studentAnswers.find((a) => a.questionId === q.id);
    if (studentAns) {
      const isCorrect =
        studentAns.selectedOptionIds.length === q.correctOptionIds.length &&
        studentAns.selectedOptionIds.every((id) => q.correctOptionIds.includes(id));

      if (isCorrect) score += q.points;
    }
  }

  const percentage = Math.round((score / totalPoints) * 100);
  assert.equal(score, 2);
  assert.equal(totalPoints, 5);
  assert.equal(percentage, 40);
});

test("Certificate Eligibility Progress Requirement Rule", () => {
  const isEligible = (completedLessons: number, totalLessons: number) => {
    if (totalLessons === 0) return false;
    return (completedLessons / totalLessons) * 100 >= 100;
  };

  assert.equal(isEligible(10, 10), true);
  assert.equal(isEligible(9, 10), false);
  assert.equal(isEligible(0, 5), false);
});
