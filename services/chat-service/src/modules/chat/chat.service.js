const mongoose = require('mongoose');
const repo = require('./chat.repository');
const { emitMessageSent } = require('../../events/message-sent.event');

function sanitizeText(s) {
  return String(s ?? '').replace(/\r\n/g, '\n');
}

function normalizeIds(input) {
  if (!Array.isArray(input)) return [];
  return [...new Set(input.map((item) => String(item || '').trim()).filter(Boolean))];
}

function isGroupChatId(chatId) {
  return String(chatId || '').startsWith('group:');
}

function parseDmPeerIds(chatId) {
  try {
    const s = String(chatId || '');
    if (!s.startsWith('dm:')) return null;
    const parts = s.split(':');
    if (parts.length !== 3) return null;
    return { a: String(parts[1]), b: String(parts[2]) };
  } catch {
    return null;
  }
}

function sanitizeAttachments(input) {
  const arr = Array.isArray(input) ? input : [];
  return arr
    .map((item) => {
      const url = String(item?.secureUrl || item?.url || '').trim();
      if (!url) return null;

      const filename = String(
        item?.originalFilename || item?.originalName || item?.filename || item?.name || 'tep-dinh-kem'
      ).trim();

      return {
        url,
        secureUrl: url,
        filename,
        publicId: String(item?.publicId || item?.public_id || '').trim(),
        resourceType: String(item?.resourceType || item?.resource_type || item?.kind || 'raw').trim(),
        format: String(item?.format || '').trim(),
        bytes: Number(item?.bytes || item?.size || 0) || 0,
        mimeType: String(item?.mimeType || item?.mimetype || '').trim(),
      };
    })
    .filter(Boolean);
}

function previewOfMessage(message) {
  if (!message) return '';
  if (message.type === 'file') {
    const first = Array.isArray(message?.meta?.attachments) ? message.meta.attachments[0] : null;
    const label = first?.filename || message.content || 'Tệp đính kèm';
    return `📎 ${label}`;
  }

  const raw = sanitizeText(message.content).trim();
  if (!raw) return '';
  return raw.length > 160 ? `${raw.slice(0, 157)}...` : raw;
}

function toDto(m) {
  return {
    id: String(m._id || m.id),
    chatId: m.chatId,
    senderId: m.senderId,
    clientMessageId: m.clientMessageId || null,
    type: m.type,
    content: m.content,
    meta: m.meta || {},
    seq: m.seq,
    createdAt: m.createdAt,
    editedAt: m.editedAt || null,
  };
}

function toMemberDto(member) {
  return {
    userId: String(member?.userId || ''),
    role: String(member?.role || 'member'),
    joinedAt: member?.joinedAt || null,
    addedBy: member?.addedBy || null,
  };
}

function toGroupDto(group, viewerId = null) {
  const members = Array.isArray(group?.members) ? group.members.map(toMemberDto) : [];
  const viewer = viewerId
    ? members.find((member) => String(member.userId) === String(viewerId)) || null
    : null;
  const owner = members.find((member) => member.role === 'owner') || members[0] || null;

  return {
    chatId: group.chatId,
    type: 'group',
    name: group.name,
    description: group.description || '',
    avatarUrl: group.avatarUrl || '',
    createdBy: group.createdBy,
    ownerId: owner?.userId || group.createdBy,
    members,
    memberCount: Number(group.memberCount || members.length || 0),
    lastMessagePreview: group.lastMessagePreview || '',
    lastMessageAt: group.lastMessageAt || null,
    createdAt: group.createdAt || null,
    updatedAt: group.updatedAt || null,
    userRole: viewer?.role || null,
    canManage: viewer ? ['owner', 'admin'].includes(viewer.role) : false,
    canManageRoles: viewer?.role === 'owner',
  };
}

async function getGroupDocOrThrow(chatId) {
  const group = await repo.getGroupDocByChatId(chatId);
  if (!group) throw new Error('Group not found');
  return group;
}

function getGroupMember(group, userId) {
  return (group.members || []).find((member) => String(member.userId) === String(userId)) || null;
}

function requireGroupMember(group, userId) {
  const member = getGroupMember(group, userId);
  if (!member) throw new Error('You are not a member of this group');
  return member;
}

function requireGroupAdmin(group, userId) {
  const member = requireGroupMember(group, userId);
  if (!['owner', 'admin'].includes(member.role)) {
    throw new Error('Admin permission required');
  }
  return member;
}

function requireGroupOwner(group, userId) {
  const member = requireGroupMember(group, userId);
  if (member.role !== 'owner') throw new Error('Owner permission required');
  return member;
}

async function createSystemMessage({ chatId, actorUserId, content, meta = {} }) {
  const created = await repo.createMessage({
    chatId,
    senderId: String(actorUserId || 'system'),
    type: 'system',
    content: sanitizeText(content).slice(0, 5000) || 'Cập nhật nhóm',
    meta: {
      ...meta,
      silent: true,
    },
    clientMessageId: null,
  });

  const dto = toDto(created);
  emitMessageSent({ chatId, message: dto });
  if (isGroupChatId(chatId)) {
    await repo.touchGroupLastMessage(chatId, {
      preview: previewOfMessage(dto),
      at: created.createdAt || new Date(),
    });
  }
  return dto;
}

async function ensureChatAccess(chatId, userId) {
  if (!chatId || typeof chatId !== 'string') throw new Error('chatId required');
  if (!userId) return { type: 'anonymous', allowed: !isGroupChatId(chatId) };

  if (!isGroupChatId(chatId)) {
    const dm = parseDmPeerIds(chatId);
    if (!dm) return { type: 'direct', allowed: true };
    const allowed = [dm.a, dm.b].includes(String(userId));
    if (!allowed) throw new Error('Forbidden');
    return { type: 'direct', allowed: true, peerIds: [dm.a, dm.b] };
  }

  const group = await getGroupDocOrThrow(chatId);
  const member = requireGroupMember(group, userId);
  return {
    type: 'group',
    allowed: true,
    group,
    role: member.role,
  };
}

function validateSend({ chatId, senderId, type, content, meta }) {
  if (!chatId || typeof chatId !== 'string') throw new Error('chatId required');
  if (!senderId || typeof senderId !== 'string') throw new Error('senderId required');

  const normalizedType = type || 'text';
  const allowed = new Set(['text', 'system', 'file']);
  if (!allowed.has(normalizedType)) throw new Error('type invalid');

  const rawContent = sanitizeText(content);
  const normalizedMeta = meta && typeof meta === 'object' ? { ...meta } : {};

  if (normalizedType === 'file') {
    const attachments = sanitizeAttachments(normalizedMeta.attachments);
    if (!attachments.length) throw new Error('file attachment required');
    normalizedMeta.attachments = attachments;
    const fallbackContent = attachments.map((item) => item.filename).join(', ');
    const finalContent = rawContent.trim() || fallbackContent || 'Tệp đính kèm';
    return {
      chatId,
      senderId,
      type: normalizedType,
      content: finalContent.slice(0, 5000),
      meta: normalizedMeta,
    };
  }

  if (!rawContent.trim()) throw new Error('content required');
  if (rawContent.length > 5000) throw new Error('content too long');

  return {
    chatId,
    senderId,
    type: normalizedType,
    content: rawContent,
    meta: normalizedMeta,
  };
}

async function sendMessage(input) {
  const validated = validateSend(input);
  const clientMessageId = input.clientMessageId || null;

  let access = null;
  if (isGroupChatId(validated.chatId)) {
    access = await ensureChatAccess(validated.chatId, validated.senderId);
    const recipientIds = (access.group.members || [])
      .map((member) => String(member.userId))
      .filter((id) => id !== String(validated.senderId));

    validated.meta = {
      ...validated.meta,
      recipientIds,
      chatType: 'group',
      groupName: access.group.name,
    };
  } else {
    const dm = parseDmPeerIds(validated.chatId);
    if (dm) {
      if (![dm.a, dm.b].includes(String(validated.senderId))) {
        throw new Error('Forbidden');
      }
      validated.meta = {
        ...validated.meta,
        recipientIds: [dm.a, dm.b].filter((id) => id !== String(validated.senderId)),
        chatType: 'direct',
      };
    }
  }

  let created;
  try {
    created = await repo.createMessage({
      chatId: validated.chatId,
      senderId: validated.senderId,
      type: validated.type,
      content: validated.content,
      meta: validated.meta || {},
      clientMessageId,
    });
  } catch (e) {
    if (e && e.code === 11000 && clientMessageId) {
      const { MessageModel } = require('./message.model');
      const existed = await MessageModel.findOne({ chatId: validated.chatId, senderId: validated.senderId, clientMessageId }).lean();
      if (existed) created = existed;
      else throw e;
    } else {
      throw e;
    }
  }

  const dto = toDto(created);

  emitMessageSent({ chatId: validated.chatId, message: dto });

  if (isGroupChatId(validated.chatId)) {
    await repo.touchGroupLastMessage(validated.chatId, {
      preview: previewOfMessage(dto),
      at: created.createdAt || new Date(),
    });
  }

  return dto;
}

async function listMessages(chatId, { limit = 30, beforeId = null, viewerId = null } = {}) {
  if (!chatId || typeof chatId !== 'string') throw new Error('chatId required');
  if (isGroupChatId(chatId)) {
    if (!viewerId) throw new Error('viewerId required');
    await ensureChatAccess(chatId, viewerId);
  }

  const { items, nextCursor } = await repo.listMessagesByChat(chatId, { limit, beforeId });
  return {
    items: items.map(toDto),
    nextCursor,
  };
}

async function createGroup({ createdBy, name, description = '', avatarUrl = '', memberIds = [] }) {
  if (!createdBy) throw new Error('createdBy required');

  const cleanName = sanitizeText(name).trim();
  if (!cleanName) throw new Error('group name required');
  if (cleanName.length > 120) throw new Error('group name too long');

  const allMemberIds = normalizeIds([createdBy, ...memberIds]);
  if (allMemberIds.length < 2) {
    throw new Error('A group must have at least 2 members');
  }

  const groupId = new mongoose.Types.ObjectId();
  const chatId = `group:${groupId.toString()}`;
  const createdAt = new Date();

  const members = allMemberIds.map((userId) => ({
    userId,
    role: String(userId) === String(createdBy) ? 'owner' : 'member',
    joinedAt: createdAt,
    addedBy: String(createdBy),
  }));

  const group = await repo.createGroup({
    _id: groupId,
    chatId,
    name: cleanName,
    description: sanitizeText(description).trim().slice(0, 500),
    avatarUrl: String(avatarUrl || '').trim(),
    createdBy: String(createdBy),
    members,
    memberCount: members.length,
  });

  await createSystemMessage({
    chatId,
    actorUserId: createdBy,
    content: `${cleanName} đã được tạo.`,
    meta: {
      recipientIds: members.map((member) => String(member.userId)).filter((id) => id !== String(createdBy)),
      systemEvent: 'group.created',
      silent: true,
    },
  });

  return toGroupDto(group, createdBy);
}

async function listGroupsForUser(userId) {
  if (!userId) throw new Error('userId required');
  const groups = await repo.listGroupsByUserId(userId);
  return groups.map((group) => toGroupDto(group, userId));
}

async function getGroupDetail(chatId, viewerId) {
  if (!viewerId) throw new Error('viewerId required');
  const access = await ensureChatAccess(chatId, viewerId);
  return toGroupDto(access.group.toObject ? access.group.toObject() : access.group, viewerId);
}

async function listGroupMembers(chatId, viewerId) {
  const group = await getGroupDocOrThrow(chatId);
  requireGroupMember(group, viewerId);
  return (group.members || []).map(toMemberDto);
}

async function updateGroup(chatId, actorUserId, changes = {}) {
  const group = await getGroupDocOrThrow(chatId);
  requireGroupAdmin(group, actorUserId);

  const updates = [];
  const nextName = changes.name !== undefined ? sanitizeText(changes.name).trim() : null;
  const nextDescription = changes.description !== undefined ? sanitizeText(changes.description).trim().slice(0, 500) : null;
  const nextAvatarUrl = changes.avatarUrl !== undefined ? String(changes.avatarUrl || '').trim() : null;

  if (nextName !== null && nextName && nextName !== group.name) {
    group.name = nextName;
    updates.push(`đổi tên nhóm thành ${nextName}`);
  }

  if (nextDescription !== null && nextDescription !== group.description) {
    group.description = nextDescription;
    updates.push('cập nhật mô tả nhóm');
  }

  if (nextAvatarUrl !== null && nextAvatarUrl !== group.avatarUrl) {
    group.avatarUrl = nextAvatarUrl;
    updates.push('cập nhật ảnh nhóm');
  }

  if (!updates.length) return toGroupDto(group.toObject(), actorUserId);

  await group.save();

  await createSystemMessage({
    chatId,
    actorUserId,
    content: `${actorUserId} đã ${updates.join(', ')}.`,
    meta: {
      recipientIds: group.members.map((member) => String(member.userId)).filter((id) => id !== String(actorUserId)),
      systemEvent: 'group.updated',
      silent: true,
    },
  });

  return toGroupDto(group.toObject(), actorUserId);
}

async function addGroupMembers(chatId, actorUserId, memberIds = []) {
  const group = await getGroupDocOrThrow(chatId);
  requireGroupAdmin(group, actorUserId);

  const additions = normalizeIds(memberIds).filter(
    (userId) => !group.members.some((member) => String(member.userId) === String(userId))
  );

  if (!additions.length) {
    return toGroupDto(group.toObject(), actorUserId);
  }

  const now = new Date();
  additions.forEach((userId) => {
    group.members.push({
      userId,
      role: 'member',
      joinedAt: now,
      addedBy: String(actorUserId),
    });
  });
  group.memberCount = group.members.length;
  await group.save();

  await createSystemMessage({
    chatId,
    actorUserId,
    content: `${actorUserId} đã thêm ${additions.length} thành viên vào nhóm.`,
    meta: {
      recipientIds: group.members.map((member) => String(member.userId)).filter((id) => id !== String(actorUserId)),
      systemEvent: 'group.members.added',
      affectedUserIds: additions,
      silent: true,
    },
  });

  return toGroupDto(group.toObject(), actorUserId);
}

async function removeGroupMember(chatId, actorUserId, memberUserId) {
  const group = await getGroupDocOrThrow(chatId);
  const actor = requireGroupAdmin(group, actorUserId);
  const target = getGroupMember(group, memberUserId);
  if (!target) throw new Error('Member not found');
  if (String(actorUserId) === String(memberUserId)) {
    return leaveGroup(chatId, actorUserId);
  }
  if (target.role === 'owner') throw new Error('Owner cannot be removed');
  if (actor.role !== 'owner' && target.role === 'admin') {
    throw new Error('Only owner can remove an admin');
  }

  group.members = group.members.filter((member) => String(member.userId) !== String(memberUserId));
  group.memberCount = group.members.length;
  await group.save();

  await createSystemMessage({
    chatId,
    actorUserId,
    content: `${memberUserId} đã bị xóa khỏi nhóm.`,
    meta: {
      recipientIds: group.members.map((member) => String(member.userId)).filter((id) => id !== String(actorUserId)),
      systemEvent: 'group.members.removed',
      affectedUserIds: [String(memberUserId)],
      silent: true,
    },
  });

  return toGroupDto(group.toObject(), actorUserId);
}

async function updateGroupMemberRole(chatId, actorUserId, memberUserId, role) {
  const group = await getGroupDocOrThrow(chatId);
  requireGroupOwner(group, actorUserId);

  const target = getGroupMember(group, memberUserId);
  if (!target) throw new Error('Member not found');
  if (target.role === 'owner') throw new Error('Owner role cannot be changed');
  if (!['admin', 'member'].includes(String(role || ''))) throw new Error('role invalid');

  target.role = String(role);
  await group.save();

  await createSystemMessage({
    chatId,
    actorUserId,
    content: `${memberUserId} hiện là ${target.role}.`,
    meta: {
      recipientIds: group.members.map((member) => String(member.userId)).filter((id) => id !== String(actorUserId)),
      systemEvent: 'group.role.updated',
      affectedUserIds: [String(memberUserId)],
      silent: true,
    },
  });

  return toGroupDto(group.toObject(), actorUserId);
}

async function leaveGroup(chatId, userId) {
  const group = await getGroupDocOrThrow(chatId);
  const member = requireGroupMember(group, userId);

  const remaining = group.members.filter((item) => String(item.userId) !== String(userId));

  if (!remaining.length) {
    await repo.deleteGroupByChatId(chatId);
    return { deleted: true, chatId };
  }

  if (member.role === 'owner') {
    const nextOwner = remaining.find((item) => item.role === 'admin') || remaining[0];
    nextOwner.role = 'owner';
  }

  group.members = remaining;
  group.memberCount = remaining.length;
  await group.save();

  await createSystemMessage({
    chatId,
    actorUserId: userId,
    content: `${userId} đã rời nhóm.`,
    meta: {
      recipientIds: remaining.map((item) => String(item.userId)).filter((id) => id !== String(userId)),
      systemEvent: 'group.member.left',
      affectedUserIds: [String(userId)],
      silent: true,
    },
  });

  return { deleted: false, group: toGroupDto(group.toObject(), userId) };
}

async function adminListGroups(query = {}) {
  const data = await repo.listAllGroups(query);
  return {
    ...data,
    items: data.items.map((group) => toGroupDto(group)),
  };
}

async function adminGetGroupDetail(chatId) {
  const group = await repo.getGroupByChatId(chatId);
  if (!group) throw new Error('Group not found');
  return toGroupDto(group);
}

async function adminListMessages(chatId, query = {}) {
  const group = await repo.getGroupByChatId(chatId);
  if (!group) throw new Error('Group not found');
  const data = await repo.listMessagesByChat(chatId, {
    limit: query.limit,
    beforeId: query.beforeId,
  });
  return {
    ...data,
    items: data.items.map(toDto),
  };
}

async function adminDeleteMessage(messageId) {
  const deleted = await repo.deleteMessageById(messageId);
  if (!deleted) throw new Error('Message not found');
  return toDto(deleted);
}

async function adminDeleteGroup(chatId) {
  const group = await repo.getGroupByChatId(chatId);
  if (!group) throw new Error('Group not found');
  await repo.deleteGroupByChatId(chatId);
  return toGroupDto(group);
}

async function adminGetDashboard() {
  return repo.getAdminDashboard();
}

module.exports = {
  sendMessage,
  listMessages,
  ensureChatAccess,
  createGroup,
  listGroupsForUser,
  getGroupDetail,
  listGroupMembers,
  updateGroup,
  addGroupMembers,
  removeGroupMember,
  updateGroupMemberRole,
  leaveGroup,
  adminListGroups,
  adminGetGroupDetail,
  adminListMessages,
  adminDeleteMessage,
  adminDeleteGroup,
  adminGetDashboard,
};
