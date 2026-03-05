// src/events/post-created.handler.js
const { EVENTS, CHANNELS } = require("../config/constants");

async function handlePostCreated({ payload, notificationService, logger }) {
  // payload kỳ vọng:
  // {
  //   postId, authorId, title?,
  //   recipients: [{userId, email?, deviceTokens?}, ...]
  // }
  const p = payload || {};
  if (!p.postId) throw new Error("post.created requires postId");
  if (!Array.isArray(p.recipients) || p.recipients.length === 0) {
    // Không có recipients thì coi như không cần làm gì
    logger?.warn?.(`[handler:${EVENTS.POST_CREATED}] no recipients -> skip`);
    return [];
  }

  const title = "Bài viết mới";
  const body = p.title ? `Có bài viết mới: ${p.title}` : `Có bài viết mới (ID: ${p.postId})`;

  const notification = {
    title,
    body,
    data: {
      type: EVENTS.POST_CREATED,
      postId: p.postId,
      authorId: p.authorId || null,
    },
  };

  const res = await notificationService.send({
    recipients: p.recipients,
    notification,
    channels: [CHANNELS.WEBSOCKET], // post-created thường ws là đủ, tuỳ bạn thêm EMAIL/PUSH
  });

  logger?.info?.(`[handler:${EVENTS.POST_CREATED}] done post=${p.postId} recipients=${p.recipients.length}`);
  return res;
}

module.exports = { handlePostCreated };
