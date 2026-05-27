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

export function formatNotificationRelativeTime(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';

  const diffMs = Date.now() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHour = Math.floor(diffMs / 3600000);
  const diffDay = Math.floor(diffMs / 86400000);

  if (diffMin < 1) return 'Vừa xong';
  if (diffMin < 60) return `${diffMin} phút trước`;
  if (diffHour < 24) return `${diffHour} giờ trước`;
  if (diffDay < 7) return `${diffDay} ngày trước`;

  return date.toLocaleDateString('vi-VN');
}

export function formatNotificationAbsoluteTime(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleString('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function buildTitle(typeKey, ctx) {
  switch (typeKey) {
    case 'friend_request_sent':
      return 'Lời mời kết bạn';
    case 'message_sent':
      return 'Tin nhắn mới';
    case 'comment_created':
      return 'Bình luận mới';
    case 'group_invite':
    case 'group_member_invited':
      return 'Lời mời vào nhóm';
    case 'group_invite_accepted':
      return 'Đã chấp nhận lời mời nhóm';
    case 'group_invite_rejected':
      return 'Đã từ chối lời mời nhóm';
    case 'group_post_pending':
      return 'Bài viết đang chờ duyệt';
    case 'group_post_approved':
      return 'Bài viết đã được duyệt';
    case 'group_post_rejected':
      return 'Bài viết bị từ chối';
    case 'job_created':
    case 'job_published':
      return 'Tin tuyển dụng mới';
    case 'job_application_created':
    case 'job_application_submitted':
      return 'Ứng tuyển mới';
    case 'job_application_status_changed':
      return 'Cập nhật trạng thái ứng tuyển';
    default:
      return firstNonEmpty(ctx.actionText, ctx.rawTitle, 'Thông báo');
  }
}

function buildBody(typeKey, ctx) {
  const actor = ctx.actorName || 'Một người dùng';
  const timeText = ctx.occurredAtText ? ` · ${ctx.occurredAtText}` : '';

  switch (typeKey) {
    case 'friend_request_sent':
      return `${actor} đã gửi cho bạn lời mời kết bạn${timeText}.`;
    case 'message_sent':
      return ctx.preview
        ? `${actor} vừa nhắn: "${ctx.preview}"${timeText}.`
        : `${actor} đã gửi cho bạn một tin nhắn mới${timeText}.`;
    case 'comment_created':
      return ctx.postTitle
        ? `${actor} vừa bình luận vào bài viết "${ctx.postTitle}"${timeText}.`
        : `${actor} vừa bình luận vào bài viết của bạn${timeText}.`;
    case 'group_invite':
    case 'group_member_invited':
      return `${actor} đã mời bạn tham gia nhóm ${ctx.groupName || 'mới'}${ctx.groupCode ? ` bằng mã ${ctx.groupCode}` : ''}${timeText}.`;
    case 'group_invite_accepted':
      return `${actor} đã chấp nhận lời mời và tham gia nhóm ${ctx.groupName || 'của bạn'}${timeText}.`;
    case 'group_invite_rejected':
      return `${actor} đã từ chối lời mời tham gia nhóm ${ctx.groupName || 'của bạn'}${timeText}.`;
    case 'group_post_pending':
      return `${actor} vừa gửi một bài viết vào nhóm ${ctx.groupName || 'của bạn'} và đang chờ quản trị viên duyệt${timeText}.`;
    case 'group_post_approved':
      return `${actor} đã duyệt bài viết${ctx.postTitle ? ` "${ctx.postTitle}"` : ''} trong nhóm ${ctx.groupName || 'của bạn'}${timeText}.`;
    case 'group_post_rejected':
      return `${actor} đã từ chối bài viết${ctx.postTitle ? ` "${ctx.postTitle}"` : ''} trong nhóm ${ctx.groupName || 'của bạn'}${timeText}.`;
    case 'job_created':
    case 'job_published':
      return `${ctx.companyName || actor} vừa đăng tin tuyển dụng ${ctx.jobTitle || 'mới'}${timeText}.`;
    case 'job_application_created':
    case 'job_application_submitted':
      return `${actor} vừa ứng tuyển vào vị trí ${ctx.jobTitle || 'mới'}${ctx.cvFileName ? ` với CV ${ctx.cvFileName}` : ''}${timeText}.`;
    case 'job_application_status_changed':
      return `${actor} đã cập nhật trạng thái hồ sơ${ctx.jobTitle ? ` cho vị trí ${ctx.jobTitle}` : ''}${ctx.statusLabel ? ` thành ${ctx.statusLabel}` : ''}${timeText}.`;
    default:
      if (ctx.preview) return `${actor} ${ctx.preview}${timeText}.`;
      return firstNonEmpty(ctx.rawBody, `${actor} vừa có hoạt động mới${timeText}.`);
  }
}

export function formatNotificationDisplay(notification = {}) {
  const data = notification.data || {};
  const typeKey = normalizeType(notification.type);
  const occurredAt = notification.occurredAt || data.occurredAt || notification.createdAt || notification.updatedAt || null;
  const occurredAtText = formatNotificationAbsoluteTime(occurredAt);

  const ctx = {
    actorName: firstNonEmpty(notification.actorName, data.actorName, data.senderName, data.commenterName, data.applicantName, data.userName),
    actorEmail: firstNonEmpty(notification.actorEmail, data.actorEmail, data.senderEmail, data.email),
    actorAvatarUrl: firstNonEmpty(notification.actorAvatarUrl, data.actorAvatarUrl, data.avatarUrl),
    groupName: firstNonEmpty(notification.groupName, data.groupName, data.communityName, data.teamName),
    groupCode: firstNonEmpty(data.groupCode, data.inviteCode),
    jobTitle: firstNonEmpty(notification.jobTitle, data.jobTitle, data.positionTitle),
    companyName: firstNonEmpty(notification.companyName, data.companyName, data.employerName, data.recruiterName),
    postTitle: firstNonEmpty(data.postTitle, notification.postTitle),
    targetName: firstNonEmpty(data.targetName, notification.targetName),
    actionText: firstNonEmpty(notification.actionText, data.actionText),
    preview: firstNonEmpty(data.preview, notification.preview),
    statusLabel: firstNonEmpty(data.statusLabel, data.applicationStatusLabel, notification.statusLabel),
    cvFileName: firstNonEmpty(data.cvFileName, data.resumeName, notification.cvFileName),
    rawTitle: firstNonEmpty(notification.title),
    rawBody: firstNonEmpty(notification.body),
    occurredAtText,
  };

  return {
    ...notification,
    typeKey,
    occurredAt,
    occurredAtRelative: formatNotificationRelativeTime(occurredAt),
    occurredAtAbsolute: occurredAtText,
    actorName: ctx.actorName || 'Một người dùng',
    actorEmail: ctx.actorEmail || '',
    actorAvatarUrl: ctx.actorAvatarUrl || '',
    groupName: ctx.groupName || '',
    jobTitle: ctx.jobTitle || '',
    companyName: ctx.companyName || '',
    titleDisplay: buildTitle(typeKey, ctx),
    bodyDisplay: buildBody(typeKey, ctx),
  };
}
