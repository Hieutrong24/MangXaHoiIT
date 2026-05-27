const userClient = require('../../integrations/user.client');

function firstNonEmpty(...values) {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) return value.trim();
  }
  return '';
}

function normalizeType(type) {
  return String(type || '')
    .trim()
    .toLowerCase()
    .replace(/[.\-\s]+/g, '_');
}

async function resolveActor(payload = {}) {
  const actorId = payload.actorId || payload.data?.actorId || payload.data?.senderId || payload.data?.fromUserId || null;
  let actorName = firstNonEmpty(
    payload.actorName,
    payload.senderName,
    payload.commenterName,
    payload.applicantName,
    payload.userName,
    payload.data?.actorName,
    payload.data?.senderName,
    payload.data?.commenterName,
    payload.data?.applicantName,
    payload.data?.userName,
    payload.data?.fullName,
    payload.data?.displayName
  );
  let actorEmail = firstNonEmpty(payload.actorEmail, payload.data?.actorEmail, payload.data?.senderEmail, payload.data?.email);
  let actorAvatarUrl = firstNonEmpty(payload.actorAvatarUrl, payload.data?.actorAvatarUrl, payload.data?.avatarUrl);

  if (!actorName && actorId) {
    try {
      const actor = await userClient.getUserById(actorId);
      actorName = firstNonEmpty(actor?.fullName, actor?.name, actor?.displayName);
      actorEmail = actorEmail || firstNonEmpty(actor?.email);
      actorAvatarUrl = actorAvatarUrl || firstNonEmpty(actor?.avatarUrl);
    } catch (error) {
      // Ignore enrichment errors to avoid breaking notification creation.
    }
  }

  return { actorId, actorName: actorName || 'Một người dùng', actorEmail: actorEmail || null, actorAvatarUrl: actorAvatarUrl || null };
}

function getContext(payload = {}, actor = {}) {
  const data = payload.data || {};
  return {
    actorId: actor.actorId || payload.actorId || null,
    actorName: actor.actorName || 'Một người dùng',
    actorEmail: actor.actorEmail || null,
    actorAvatarUrl: actor.actorAvatarUrl || null,
    recipientName: firstNonEmpty(payload.recipientName, data.recipientName),
    groupName: firstNonEmpty(payload.groupName, data.groupName, data.communityName, data.teamName, data.groupTitle),
    groupCode: firstNonEmpty(payload.groupCode, data.groupCode, data.inviteCode),
    jobTitle: firstNonEmpty(payload.jobTitle, data.jobTitle, data.positionTitle, data.roleTitle),
    companyName: firstNonEmpty(payload.companyName, data.companyName, data.employerName, data.recruiterName),
    postTitle: firstNonEmpty(payload.postTitle, data.postTitle, data.contentTitle),
    targetName: firstNonEmpty(payload.targetName, data.targetName),
    actionText: firstNonEmpty(payload.actionText, data.actionText),
    preview: firstNonEmpty(payload.preview, data.preview),
    statusLabel: firstNonEmpty(payload.statusLabel, data.statusLabel, data.applicationStatusLabel),
    cvFileName: firstNonEmpty(payload.cvFileName, data.cvFileName, data.resumeName),
    occurredAt: payload.occurredAt || data.occurredAt || new Date().toISOString(),
  };
}

function defaultTexts(typeKey, ctx) {
  const when = ctx.occurredAt ? new Date(ctx.occurredAt).toLocaleString('vi-VN') : null;
  const timeSuffix = when ? ` lúc ${when}` : '';

  switch (typeKey) {
    case 'friend_request_sent':
      return {
        title: 'Lời mời kết bạn mới',
        body: `${ctx.actorName} đã gửi cho bạn lời mời kết bạn${timeSuffix}.`,
      };
    case 'friend_request_accepted':
      return {
        title: 'Lời mời kết bạn đã được chấp nhận',
        body: `${ctx.actorName} đã chấp nhận lời mời kết bạn của bạn${timeSuffix}.`,
      };
    case 'message_sent':
      return {
        title: 'Tin nhắn mới',
        body: ctx.preview
          ? `${ctx.actorName} vừa nhắn: "${ctx.preview}"${timeSuffix}.`
          : `${ctx.actorName} đã gửi cho bạn một tin nhắn mới${timeSuffix}.`,
      };
    case 'comment_created':
      return {
        title: 'Bình luận mới',
        body: `${ctx.actorName} vừa bình luận vào bài viết của bạn${timeSuffix}.`,
      };
    case 'group_invite':
    case 'group_member_invited':
      return {
        title: 'Lời mời vào nhóm',
        body: `${ctx.actorName} đã mời bạn tham gia nhóm ${ctx.groupName || 'mới'}${ctx.groupCode ? ` bằng mã ${ctx.groupCode}` : ''}${timeSuffix}.`,
      };
    case 'group_invite_accepted':
      return {
        title: 'Lời mời vào nhóm đã được chấp nhận',
        body: `${ctx.actorName} đã chấp nhận lời mời và tham gia nhóm ${ctx.groupName || ''}${timeSuffix}.`.replace(/\s+/g, ' ').trim(),
      };
    case 'group_invite_rejected':
      return {
        title: 'Lời mời vào nhóm bị từ chối',
        body: `${ctx.actorName} đã từ chối lời mời tham gia nhóm ${ctx.groupName || ''}${timeSuffix}.`.replace(/\s+/g, ' ').trim(),
      };
    case 'group_post_pending':
      return {
        title: 'Bài viết nhóm đang chờ duyệt',
        body: `${ctx.actorName} đã đăng một bài viết mới trong nhóm ${ctx.groupName || ''} và đang chờ quản trị viên duyệt${timeSuffix}.`.replace(/\s+/g, ' ').trim(),
      };
    case 'group_post_approved':
      return {
        title: 'Bài viết nhóm đã được duyệt',
        body: `${ctx.actorName} đã duyệt bài viết${ctx.postTitle ? ` "${ctx.postTitle}"` : ''} trong nhóm ${ctx.groupName || ''}${timeSuffix}.`.replace(/\s+/g, ' ').trim(),
      };
    case 'group_post_rejected':
      return {
        title: 'Bài viết nhóm bị từ chối',
        body: `${ctx.actorName} đã từ chối bài viết${ctx.postTitle ? ` "${ctx.postTitle}"` : ''} trong nhóm ${ctx.groupName || ''}${timeSuffix}.`.replace(/\s+/g, ' ').trim(),
      };
    case 'job_published':
    case 'job_created':
      return {
        title: 'Tin tuyển dụng mới',
        body: `${ctx.companyName || ctx.actorName} vừa đăng tin tuyển dụng ${ctx.jobTitle || 'mới'}${timeSuffix}.`,
      };
    case 'job_application_created':
    case 'job_application_submitted':
      return {
        title: 'Ứng tuyển mới',
        body: `${ctx.actorName} vừa ứng tuyển vào vị trí ${ctx.jobTitle || ''}${ctx.cvFileName ? ` với CV ${ctx.cvFileName}` : ''}${timeSuffix}.`.replace(/\s+/g, ' ').trim(),
      };
    case 'job_application_status_changed':
      return {
        title: 'Cập nhật trạng thái ứng tuyển',
        body: `${ctx.actorName} đã cập nhật hồ sơ ứng tuyển${ctx.jobTitle ? ` cho vị trí ${ctx.jobTitle}` : ''} sang trạng thái ${ctx.statusLabel || 'mới'}${timeSuffix}.`.replace(/\s+/g, ' ').trim(),
      };
    default:
      return {
        title: payloadTitleFallback(ctx),
        body: payloadBodyFallback(ctx, timeSuffix),
      };
  }
}

function payloadTitleFallback(ctx) {
  if (ctx.actionText) return ctx.actionText;
  return 'Thông báo mới';
}

function payloadBodyFallback(ctx, timeSuffix) {
  if (ctx.preview) return `${ctx.actorName} ${ctx.preview}${timeSuffix}.`;
  return `${ctx.actorName} vừa thực hiện một hoạt động mới${timeSuffix}.`;
}

async function normalizeNotificationPayload(payload = {}) {
  const actor = await resolveActor(payload);
  const ctx = getContext(payload, actor);
  const typeKey = normalizeType(payload.type);
  const texts = defaultTexts(typeKey, ctx);
  const knownType = [
    'friend_request_sent',
    'friend_request_accepted',
    'message_sent',
    'comment_created',
    'group_invite',
    'group_member_invited',
    'group_invite_accepted',
    'group_invite_rejected',
    'group_post_pending',
    'group_post_approved',
    'group_post_rejected',
    'job_published',
    'job_created',
    'job_application_created',
    'job_application_submitted',
    'job_application_status_changed',
  ].includes(typeKey);

  const title = knownType ? firstNonEmpty(texts.title, payload.title, 'Thông báo mới') : firstNonEmpty(payload.title, texts.title, 'Thông báo mới');
  const body = knownType ? firstNonEmpty(texts.body, payload.body, `${ctx.actorName} vừa có hoạt động mới.`) : firstNonEmpty(payload.body, texts.body, `${ctx.actorName} vừa có hoạt động mới.`);

  return {
    ...payload,
    actorId: ctx.actorId,
    actorName: ctx.actorName,
    actorEmail: ctx.actorEmail,
    actorAvatarUrl: ctx.actorAvatarUrl,
    groupName: ctx.groupName || null,
    jobTitle: ctx.jobTitle || null,
    companyName: ctx.companyName || null,
    actionText: ctx.actionText || null,
    occurredAt: ctx.occurredAt,
    title,
    body,
    data: {
      ...(payload.data || {}),
      actorId: ctx.actorId,
      actorName: ctx.actorName,
      actorEmail: ctx.actorEmail,
      actorAvatarUrl: ctx.actorAvatarUrl,
      groupName: ctx.groupName || undefined,
      groupCode: ctx.groupCode || undefined,
      jobTitle: ctx.jobTitle || undefined,
      companyName: ctx.companyName || undefined,
      postTitle: ctx.postTitle || undefined,
      targetName: ctx.targetName || undefined,
      actionText: ctx.actionText || undefined,
      preview: ctx.preview || undefined,
      statusLabel: ctx.statusLabel || undefined,
      cvFileName: ctx.cvFileName || undefined,
      occurredAt: ctx.occurredAt,
    },
  };
}

module.exports = {
  normalizeNotificationPayload,
  normalizeType,
};
