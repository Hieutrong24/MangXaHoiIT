// src/events/code-result.handler.js
const { EVENTS, CHANNELS } = require("../config/constants");

async function handleCodeResult({ payload, notificationService, logger }) {
  // payload kỳ vọng:
  // {
  //   userId, email?, deviceTokens?,
  //   submissionId, problemId, verdict, score?
  // }
  const p = payload || {};
  if (!p.userId) throw new Error("code.result requires userId");
  if (!p.submissionId) throw new Error("code.result requires submissionId");
  if (!p.verdict) throw new Error("code.result requires verdict");

  const title = `Kết quả bài nộp: ${String(p.verdict).toUpperCase()}`;
  const body = `Submission ${p.submissionId} - Verdict: ${p.verdict}${p.score != null ? ` - Score: ${p.score}` : ""}`;

  const recipients = [{
    userId: String(p.userId),
    email: p.email || null,
    deviceTokens: p.deviceTokens || []
  }];

  const notification = {
    title,
    body,
    data: {
      type: EVENTS.CODE_RESULT,
      submissionId: p.submissionId,
      problemId: p.problemId || null,
      verdict: p.verdict,
      score: p.score ?? null,
    },
  };

  const res = await notificationService.send({
    recipients,
    notification,
    channels: [CHANNELS.WEBSOCKET, CHANNELS.EMAIL], // default: ws + email nếu có
  });

  logger?.info?.(`[handler:${EVENTS.CODE_RESULT}] done user=${p.userId} submission=${p.submissionId}`);
  return res;
}

module.exports = { handleCodeResult };
