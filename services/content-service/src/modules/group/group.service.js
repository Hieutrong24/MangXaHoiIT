const { ASSIGNABLE_ROLES, normalizeRole } = require("./group.repository");
const { recommendGroups } = require("./group-recommendation");

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const URL_RE = /^https?:\/\//i;

function getMembership(group, userId) {
  if (!userId || !Array.isArray(group?.members)) return null;
  return group.members.find((m) => String(m.userId) === String(userId)) || null;
}

function isActiveMember(member) {
  return !!member && String(member.status || "active") !== "banned";
}

function hasManagerRole(group, userId) {
  const member = getMembership(group, userId);
  return isActiveMember(member) && ["owner", "admin", "moderator"].includes(String(member.role));
}

function hasElevatedRole(group, userId) {
  const member = getMembership(group, userId);
  return isActiveMember(member) && ["owner", "admin"].includes(String(member.role));
}

function hasOwnerRole(group, userId) {
  return String(group?.ownerId) === String(userId);
}

function ensureActor(actorId) {
  if (!actorId) throw new Error("x-user-id required");
}

function sanitizeShortText(value, max = 255) {
  return String(value || "").trim().slice(0, max);
}

function sanitizeGroupPatch(patch = {}) {
  const out = {};
  const textFields = [
    ["name", 120],
    ["description", 2000],
    ["avatarUrl", 1000],
    ["coverUrl", 1000],
    ["category", 80],
    ["privacy", 20],
    ["location", 200],
    ["website", 1000],
    ["contactEmail", 255],
  ];
  for (const [key, max] of textFields) {
    if (patch[key] !== undefined) out[key] = sanitizeShortText(patch[key], max);
  }
  if (Array.isArray(patch.rules)) out.rules = [...new Set(patch.rules.map((x) => sanitizeShortText(x, 300)).filter(Boolean))].slice(0, 30);
  if (Array.isArray(patch.topics)) out.topics = [...new Set(patch.topics.map((x) => sanitizeShortText(x, 120)).filter(Boolean))].slice(0, 20);
  return out;
}

function validateGroupPayload(payload, { partial = false } = {}) {
  const data = sanitizeGroupPatch(payload);

  if (!partial || payload.name !== undefined) {
    if (!data.name) throw new Error("name required");
    if (data.name.length < 3) throw new Error("name too short");
  }
  if (data.description && data.description.length < 10) throw new Error("description too short");
  if (data.contactEmail && !EMAIL_RE.test(data.contactEmail)) throw new Error("contactEmail invalid");
  if (data.website && !URL_RE.test(data.website)) throw new Error("website must start with http:// or https://");
  if (data.privacy && !["public", "private"].includes(data.privacy.toLowerCase())) throw new Error("privacy invalid");
  return data;
}

function canViewGroup(group, userId) {
  if (!group) return false;
  if (group.privacy === "public") return true;
  const member = getMembership(group, userId);
  return isActiveMember(member);
}

function ensureActiveMember(group, userId) {
  const member = getMembership(group, userId);
  if (!member) throw new Error("must join group first");
  if (!isActiveMember(member)) throw new Error("member is banned");
  return member;
}

function decorateGroup(group, userId) {
  const membership = getMembership(group, userId);
  const activeMembership = isActiveMember(membership) ? membership : null;
  return {
    ...group,
    isMember: !!activeMembership,
    isManager: activeMembership ? ["owner", "admin", "moderator"].includes(activeMembership.role) : false,
    currentUserRole: activeMembership?.role || null,
    currentUserStatus: membership?.status || null,
    joinCode: activeMembership && ["owner", "admin"].includes(activeMembership.role) ? group.joinCode : undefined,
  };
}

function createGroupService({ groupRepository, postRepository }) {
  return {
    async listGroups(query, userId) {
      const data = await groupRepository.list(query);
      return {
        ...data,
        items: data.items
          .filter((g) => g.privacy === "public" || canViewGroup(g, userId))
          .map((g) => decorateGroup(g, userId)),
      };
    },
    async recommendGroups(query = {}, userId) {
      const page = Math.max(1, Number(query.page) || 1);
      const pageSize = Math.max(1, Math.min(100, Number(query.pageSize) || Number(query.limit) || 10));
      const candidateLimit = Math.max(page * pageSize, Math.min(300, Number(query.candidateLimit) || 150));
      const data = await groupRepository.list({ ...query, page: 1, pageSize: candidateLimit });
      const visible = data.items
        .filter((g) => g.privacy === "public" || canViewGroup(g, userId))
        .map((g) => decorateGroup(g, userId));
      const recommended = recommendGroups(visible, { ...query, viewerId: userId || query.viewerId || query.userId });
      const start = (page - 1) * pageSize;
      return {
        items: recommended.slice(start, start + pageSize),
        total: recommended.length,
        page,
        pageSize,
        algorithm: "topic_overlap_friends_joined_activity_major_class_v1",
      };
    },
    async adminListGroups(query = {}) {
      return groupRepository.adminList(query);
    },
    async createGroup(payload) {
      ensureActor(payload.ownerId);
      const data = validateGroupPayload(payload);
      return groupRepository.create({ ...payload, ...data });
    },
    async getGroup(idOrSlug, userId) {
      const group = await groupRepository.getById(idOrSlug);
      if (!group) return null;
      if (!canViewGroup(group, userId)) throw new Error("forbidden");
      return decorateGroup(group, userId);
    },
    async updateGroup(groupId, actorId, patch) {
      ensureActor(actorId);
      const group = await groupRepository.getById(groupId);
      if (!group) throw new Error("group not found");
      if (!hasManagerRole(group, actorId)) throw new Error("forbidden");
      const sanitized = validateGroupPayload(patch, { partial: true });
      return groupRepository.update(group._id, sanitized);
    },
    async joinGroup(groupId, userId, payload = {}) {
      ensureActor(userId);
      const group = await groupRepository.getById(groupId);
      if (!group) throw new Error("group not found");
      const existing = getMembership(group, userId);
      if (existing && existing.status === "banned") throw new Error("you are banned from this group");
      if (existing && isActiveMember(existing)) return decorateGroup(group, userId);
      if (group.privacy === "private") {
        const request = await groupRepository.createJoinRequest(group._id, userId, payload);
        return { joinRequest: request, requiresApproval: true };
      }
      const updated = await groupRepository.addMember(group._id, userId, "member");
      if (!updated) throw new Error("join group failed");
      return decorateGroup(updated, userId);
    },
    async joinByCode(code, userId) {
      ensureActor(userId);
      if (!code) throw new Error("code required");
      const group = await groupRepository.getByJoinCode(code);
      if (!group) throw new Error("group not found");
      const existing = getMembership(group, userId);
      if (existing && existing.status === "banned") throw new Error("you are banned from this group");
      const updated = await groupRepository.addMember(group._id, userId, "member");
      if (!updated) throw new Error("join group failed");
      return decorateGroup(updated, userId);
    },
    async listMembers(groupId, actorId) {
      const group = await groupRepository.getById(groupId);
      if (!group) throw new Error("group not found");
      if (!canViewGroup(group, actorId)) throw new Error("forbidden");
      return { items: group.members || [], total: (group.members || []).length };
    },
    async promoteMember(groupId, actorId, memberId, role = "admin") {
      ensureActor(actorId);
      const group = await groupRepository.getById(groupId);
      if (!group) throw new Error("group not found");
      const actor = ensureActiveMember(group, actorId);
      if (!["owner", "admin"].includes(actor.role)) throw new Error("forbidden");
      if (String(group.ownerId) === String(memberId)) throw new Error("owner role immutable");
      const target = ensureActiveMember(group, memberId);
      const nextRole = normalizeRole(role, { allowOwner: false, fallback: "member" });
      if (!ASSIGNABLE_ROLES.includes(nextRole)) throw new Error("role invalid");
      if (actor.role === "admin" && nextRole === "admin") throw new Error("only owner can assign admin role");
      if (target.role === "admin" && actor.role !== "owner") throw new Error("only owner can change admin role");
      const updated = await groupRepository.setMemberRole(group._id, memberId, nextRole);
      if (!updated) throw new Error("member not found");
      return updated;
    },
    async removeMember(groupId, actorId, memberId) {
      ensureActor(actorId);
      const group = await groupRepository.getById(groupId);
      if (!group) throw new Error("group not found");
      const actor = ensureActiveMember(group, actorId);
      if (!["owner", "admin", "moderator"].includes(actor.role)) throw new Error("forbidden");
      if (String(group.ownerId) === String(memberId)) throw new Error("cannot remove owner");
      const target = getMembership(group, memberId);
      if (!target) throw new Error("member not found");
      if (["admin", "moderator"].includes(target.role) && actor.role !== "owner") throw new Error("only owner can remove admin or moderator");
      return groupRepository.removeMember(group._id, memberId);
    },
    async createGroupPost(groupId, payload) {
      const group = await groupRepository.getById(groupId);
      if (!group) throw new Error("group not found");
      ensureActor(payload.authorId);
      const member = ensureActiveMember(group, payload.authorId);
      const approved = ["owner", "admin", "moderator"].includes(member.role);
      const post = await postRepository.create({
        authorId: payload.authorId,
        title: payload.title || "Bài viết nhóm",
        content: payload.content || "",
        tags: payload.tags || [],
        isPublic: false,
        media: payload.media || [],
        postType: "group",
        visibility: "group",
        groupId: group._id,
        moderationStatus: approved ? "approved" : "pending",
        approvedAt: approved ? new Date().toISOString() : null,
        approvedBy: approved ? String(payload.authorId) : null,
      });
      await groupRepository.update(group._id, {
        postCount: Number(group.postCount || 0) + (approved ? 1 : 0),
        pendingPostCount: Number(group.pendingPostCount || 0) + (approved ? 0 : 1),
      });
      return post;
    },
    async listGroupPosts(groupId, query = {}, userId) {
      const group = await groupRepository.getById(groupId);
      if (!group) throw new Error("group not found");
      if (!canViewGroup(group, userId)) throw new Error("forbidden");
      const canSeeModeration = hasManagerRole(group, userId);
      const moderationStatus = canSeeModeration && query.status ? query.status : "approved";
      const listQuery = { ...query, groupId: group._id, postType: "group" };
      if (moderationStatus !== "all") {
        listQuery.moderationStatus = moderationStatus;
      }
      return postRepository.list(listQuery);
    },
    async moderateGroupPost(groupId, postId, actorId, action, rejectionReason = "") {
      ensureActor(actorId);
      const group = await groupRepository.getById(groupId);
      if (!group) throw new Error("group not found");
      if (!hasManagerRole(group, actorId)) throw new Error("forbidden");
      const post = await postRepository.getById(postId);
      if (!post || String(post.groupId) !== String(group._id)) throw new Error("post not found");
      if (action === "approve") {
        const updated = await postRepository.update(postId, {
          moderationStatus: "approved",
          approvedAt: new Date().toISOString(),
          approvedBy: String(actorId),
          rejectionReason: "",
        });
        await groupRepository.update(group._id, {
          postCount: Number(group.postCount || 0) + (post.moderationStatus === "approved" ? 0 : 1),
          pendingPostCount: Math.max(0, Number(group.pendingPostCount || 0) - (post.moderationStatus === "pending" ? 1 : 0)),
        });
        return updated;
      }
      if (action === "reject") {
        const updated = await postRepository.update(postId, {
          moderationStatus: "rejected",
          approvedAt: null,
          approvedBy: String(actorId),
          rejectionReason: String(rejectionReason || "Bài viết chưa phù hợp"),
        });
        await groupRepository.update(group._id, {
          pendingPostCount: Math.max(0, Number(group.pendingPostCount || 0) - (post.moderationStatus === "pending" ? 1 : 0)),
        });
        return updated;
      }
      throw new Error("unsupported action");
    },
    async inviteMember(groupId, actorId, payload) {
      ensureActor(actorId);
      const group = await groupRepository.getById(groupId);
      if (!group) throw new Error("group not found");
      if (!hasElevatedRole(group, actorId)) throw new Error("forbidden");
      const recipientId = String(payload.recipientId || "").trim();
      if (!recipientId) throw new Error("recipientId required");
      const existingMember = getMembership(group, recipientId);
      if (existingMember?.status === "banned") throw new Error("recipient is banned");
      if (existingMember && isActiveMember(existingMember)) throw new Error("already in group");
      const role = normalizeRole(payload.role, { allowOwner: false, fallback: "member" });
      if (role === "admin" && !hasOwnerRole(group, actorId)) throw new Error("only owner can invite admin");
      return groupRepository.createInvitation(group._id, {
        recipientId,
        invitedBy: String(actorId),
        role,
        note: payload.note || "",
      });
    },
    async listGroupInvitations(groupId, actorId, query = {}) {
      const group = await groupRepository.getById(groupId);
      if (!group) throw new Error("group not found");
      if (!hasManagerRole(group, actorId)) throw new Error("forbidden");
      return groupRepository.listInvitations({ groupId: group._id, status: query.status || undefined, page: query.page, pageSize: query.pageSize });
    },
    async listInvitationsForUser(userId, query = {}) {
      ensureActor(userId);
      const data = await groupRepository.listInvitations({ recipientId: String(userId), status: query.status || "pending", page: query.page, pageSize: query.pageSize });
      return {
        ...data,
        items: await Promise.all(data.items.map(async (item) => {
          const group = await groupRepository.getById(item.groupId);
          return { ...item, group: group ? decorateGroup(group, userId) : null };
        })),
      };
    },
    async respondToInvitation(inviteId, actorId, action) {
      ensureActor(actorId);
      if (!["accept", "reject"].includes(String(action || "").toLowerCase())) throw new Error("action invalid");
      const invite = await groupRepository.getInvitationById(inviteId);
      if (!invite) throw new Error("invite not found");
      if (String(invite.recipientId) !== String(actorId)) throw new Error("forbidden");
      if (invite.status !== "pending") throw new Error("invite already handled");
      const group = await groupRepository.getById(invite.groupId);
      if (!group) throw new Error("group not found");
      const existingMember = getMembership(group, actorId);
      if (existingMember?.status === "banned") throw new Error("you are banned from this group");
      const nextStatus = action === "accept" ? "accepted" : "rejected";
      const updated = await groupRepository.updateInvitation(inviteId, { status: nextStatus, respondedAt: new Date().toISOString() });
      let updatedGroup = group;
      if (action === "accept") {
        updatedGroup = await groupRepository.addMember(invite.groupId, actorId, invite.role || "member");
      }
      return { invitation: updated, group: updatedGroup ? decorateGroup(updatedGroup, actorId) : null };
    },
    async listJoinRequests(groupId, actorId, query = {}) {
      const group = await groupRepository.getById(groupId);
      if (!group) throw new Error("group not found");
      if (!hasManagerRole(group, actorId)) throw new Error("forbidden");
      return groupRepository.listJoinRequests({ groupId: group._id, status: query.status || undefined, page: query.page, pageSize: query.pageSize });
    },
    async listMyJoinRequests(userId, query = {}) {
      ensureActor(userId);
      const data = await groupRepository.listJoinRequests({ userId: String(userId), status: query.status || undefined, page: query.page, pageSize: query.pageSize });
      return {
        ...data,
        items: await Promise.all(data.items.map(async (item) => ({ ...item, group: await groupRepository.getById(item.groupId) }))),
      };
    },
    async respondToJoinRequest(groupId, requestId, actorId, action) {
      ensureActor(actorId);
      const group = await groupRepository.getById(groupId);
      if (!group) throw new Error("group not found");
      if (!hasManagerRole(group, actorId)) throw new Error("forbidden");
      if (!["approve", "reject"].includes(String(action || "").toLowerCase())) throw new Error("action invalid");
      const request = await groupRepository.getJoinRequestById(requestId);
      if (!request || String(request.groupId) !== String(group._id)) throw new Error("join request not found");
      if (request.status !== "pending") throw new Error("join request already handled");
      const member = getMembership(group, request.userId);
      if (member?.status === "banned") throw new Error("user is banned");
      const status = action === "approve" ? "approved" : "rejected";
      const updatedRequest = await groupRepository.updateJoinRequest(requestId, {
        status,
        reviewedBy: String(actorId),
        reviewedAt: new Date().toISOString(),
      });
      let updatedGroup = group;
      if (status === "approved") updatedGroup = await groupRepository.addMember(group._id, request.userId, "member");
      return { joinRequest: updatedRequest, group: updatedGroup ? decorateGroup(updatedGroup, actorId) : null };
    },
    async leaveGroup(groupId, userId) {
      ensureActor(userId);
      const group = await groupRepository.getById(groupId);
      if (!group) throw new Error("group not found");
      if (String(group.ownerId) === String(userId)) throw new Error("owner cannot leave group");
      const member = getMembership(group, userId);
      if (!member) throw new Error("not a member");
      return groupRepository.removeMember(group._id, userId);
    },
    async deleteGroup(groupId, actorId) {
      ensureActor(actorId);
      const group = await groupRepository.getById(groupId);
      if (!group) throw new Error("group not found");
      if (String(group.ownerId) !== String(actorId)) throw new Error("only owner can delete group");
      return groupRepository.deleteGroup(group._id);
    },
    async getMemberStatus(groupId, actorId, userId) {
      const group = await groupRepository.getById(groupId);
      if (!group) throw new Error("group not found");
      if (!canViewGroup(group, actorId)) throw new Error("forbidden");
      const member = await groupRepository.getMemberStatus(group._id, userId);
      if (!member) throw new Error("not a member");
      return member;
    },
    async banMember(groupId, actorId, memberId) {
      ensureActor(actorId);
      const group = await groupRepository.getById(groupId);
      if (!group) throw new Error("group not found");
      if (!hasManagerRole(group, actorId)) throw new Error("forbidden");
      if (String(group.ownerId) === String(memberId)) throw new Error("cannot ban owner");
      const member = getMembership(group, memberId);
      if (!member) throw new Error("member not found");
      if (["admin", "moderator"].includes(member.role) && !hasOwnerRole(group, actorId)) throw new Error("only owner can ban admin or moderator");
      return groupRepository.banMember(group._id, memberId);
    },
    async unbanMember(groupId, actorId, memberId) {
      ensureActor(actorId);
      const group = await groupRepository.getById(groupId);
      if (!group) throw new Error("group not found");
      if (!hasManagerRole(group, actorId)) throw new Error("forbidden");
      const member = getMembership(group, memberId);
      if (!member) throw new Error("member not found");
      if (member.status !== "banned") throw new Error("member is not banned");
      return groupRepository.unbanMember(group._id, memberId);
    },
    async transferOwnership(groupId, actorId, newOwnerId) {
      ensureActor(actorId);
      if (!newOwnerId) throw new Error("newOwnerId required");
      const group = await groupRepository.getById(groupId);
      if (!group) throw new Error("group not found");
      if (String(group.ownerId) !== String(actorId)) throw new Error("only owner can transfer ownership");
      const newOwner = ensureActiveMember(group, newOwnerId);
      if (!["admin", "moderator", "member"].includes(newOwner.role)) throw new Error("new owner role invalid");
      return groupRepository.transferOwnership(group._id, actorId, newOwnerId);
    },
    async regenerateJoinCode(groupId, actorId) {
      ensureActor(actorId);
      const group = await groupRepository.getById(groupId);
      if (!group) throw new Error("group not found");
      if (!hasElevatedRole(group, actorId)) throw new Error("forbidden");
      return groupRepository.regenerateJoinCode(group._id);
    },
    async getGroupStats(groupId, actorId) {
      const group = await groupRepository.getById(groupId);
      if (!group) throw new Error("group not found");
      if (!hasManagerRole(group, actorId)) throw new Error("forbidden");
      return groupRepository.getGroupStats(group._id);
    },
    async adminGetGroup(groupId) {
      const group = await groupRepository.getById(groupId);
      if (!group) throw new Error("group not found");
      return group;
    },
    async adminDeleteGroup(groupId) {
      const group = await groupRepository.getById(groupId);
      if (!group) throw new Error("group not found");
      return groupRepository.deleteGroup(group._id);
    },
    async adminModerateGroupPost(groupId, postId, actorId, action, rejectionReason = "") {
      const group = await groupRepository.getById(groupId);
      if (!group) throw new Error("group not found");
      const post = await postRepository.getById(postId);
      if (!post || String(post.groupId) !== String(group._id)) throw new Error("post not found");
      if (action !== "approve" && action !== "reject") throw new Error("unsupported action");

      const nextStatus = action === "approve" ? "approved" : "rejected";
      const updated = await postRepository.update(postId, {
        moderationStatus: nextStatus,
        approvedAt: action === "approve" ? new Date().toISOString() : null,
        approvedBy: actorId ? String(actorId) : null,
        rejectionReason: action === "reject" ? String(rejectionReason || "").trim() : "",
      });

      const wasPending = String(post.moderationStatus || "") === "pending";
      const wasApproved = String(post.moderationStatus || "") === "approved";
      const nextPatch = {
        postCount: Math.max(0, Number(group.postCount || 0) + (action === "approve" && !wasApproved ? 1 : 0) - (action === "reject" && wasApproved ? 1 : 0)),
        pendingPostCount: Math.max(0, Number(group.pendingPostCount || 0) - (wasPending ? 1 : 0)),
      };
      await groupRepository.update(group._id, nextPatch);
      return updated;
    },
    async getAdminDashboard() {
      return groupRepository.getAdminDashboard();
    },
  };
}

module.exports = { createGroupService };
