function valueOrNull(value) {
  if (value === undefined || value === null || value === '') return null;
  return value;
}

function pickFirst(obj, paths = []) {
  for (const path of paths) {
    const parts = String(path).split('.');
    let cur = obj;
    let ok = true;
    for (const part of parts) {
      if (!cur || typeof cur !== 'object' || !(part in cur)) {
        ok = false;
        break;
      }
      cur = cur[part];
    }
    if (ok && cur !== undefined && cur !== null && cur !== '') {
      return cur;
    }
  }
  return null;
}

function unwrapPayload(payload) {
  if (!payload || typeof payload !== 'object') return {};
  if (payload.data && typeof payload.data === 'object') return payload.data;
  return payload;
}

function buildCommentEvent({ upstreamData, req }) {
  const data = unwrapPayload(upstreamData);
  const actorId = req.user?.id || req.user?.userId || req.body?.authorId || null;
  return {
    eventName: 'post.commented',
    payload: {
      recipientId: valueOrNull(
        pickFirst(data, ['postOwnerId', 'post.ownerId', 'ownerId']) || req.body?.postOwnerId
      ),
      actorId,
      actorName: valueOrNull(req.user?.fullName || req.user?.name || req.body?.authorName),
      postId: valueOrNull(pickFirst(data, ['postId', 'post.id']) || req.params.id),
      commentId: valueOrNull(pickFirst(data, ['commentId', 'comment.id', 'id'])),
      commentPreview: valueOrNull(req.body?.content || req.body?.text),
    },
  };
}

function buildShareEvent({ upstreamData, req }) {
  const data = unwrapPayload(upstreamData);
  const actorId = req.user?.id || req.user?.userId || null;
  return {
    eventName: 'post.shared',
    payload: {
      recipientId: valueOrNull(
        pickFirst(data, ['postOwnerId', 'post.ownerId', 'ownerId']) || req.body?.postOwnerId
      ),
      actorId,
      actorName: valueOrNull(req.user?.fullName || req.user?.name),
      postId: valueOrNull(pickFirst(data, ['postId', 'post.id']) || req.params.id),
      shareId: valueOrNull(pickFirst(data, ['shareId', 'id'])),
    },
  };
}

function buildFriendRequestSentEvent({ upstreamData, req, toUserId }) {
  const data = unwrapPayload(upstreamData);
  const actorId = req.user?.id || req.user?.userId || null;
  return {
    eventName: 'friend_request.sent',
    payload: {
      toUserId,
      fromUserId: actorId,
      senderName: valueOrNull(req.user?.fullName || req.user?.name),
      receiverEmail: valueOrNull(pickFirst(data, ['toUser.email', 'receiver.email', 'receiverEmail'])),
      requestId: valueOrNull(pickFirst(data, ['requestId', 'id'])),
    },
  };
}

function buildFriendRequestAcceptedEvent({ upstreamData, req, requestId }) {
  const data = unwrapPayload(upstreamData);
  const actorId = req.user?.id || req.user?.userId || null;
  const recipientId = valueOrNull(
    pickFirst(data, ['request.fromUserId', 'fromUserId', 'senderId', 'request.senderId'])
  );
  return {
    eventName: 'friend_request.accepted',
    payload: {
      requestId,
      recipientId,
      actorId,
      actorName: valueOrNull(req.user?.fullName || req.user?.name),
      friendId: actorId,
    },
  };
}

module.exports = {
  buildCommentEvent,
  buildShareEvent,
  buildFriendRequestSentEvent,
  buildFriendRequestAcceptedEvent,
};
