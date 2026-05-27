const mongoose = require("mongoose");
const Group = require("./group.model");
const GroupInvitation = require("./group-invitation.model");
const GroupJoinRequest = require("./group-join-request.model");
const Post = require("../post/post.model");
const {
  loadGroups,
  saveGroups,
  loadGroupInvites,
  saveGroupInvites,
  loadGroupJoinRequests,
  saveGroupJoinRequests,
  loadPosts,
  savePosts,
  randomObjectId,
  slugify,
} = require("../../storage/fileStore");

const VALID_GROUP_ROLES = ["owner", "admin", "moderator", "member"];
const ASSIGNABLE_ROLES = ["admin", "moderator", "member"];

function paginate(items, { page = 1, pageSize = 20 } = {}) {
  const safePage = Math.max(1, Number(page) || 1);
  const safePageSize = Math.max(1, Math.min(100, Number(pageSize) || 20));
  const total = items.length;
  return {
    items: items.slice((safePage - 1) * safePageSize, safePage * safePageSize),
    total,
    page: safePage,
    pageSize: safePageSize,
  };
}

function normalizeRole(role, { allowOwner = false, fallback = "member" } = {}) {
  const value = String(role || fallback).trim().toLowerCase();
  const allowed = allowOwner ? VALID_GROUP_ROLES : ASSIGNABLE_ROLES;
  return allowed.includes(value) ? value : fallback;
}

function uniqueCleanList(values, maxItems = 20, maxLength = 120) {
  if (!Array.isArray(values)) return [];
  return [...new Set(values.map((x) => String(x || "").trim()).filter(Boolean))]
    .slice(0, maxItems)
    .map((x) => x.slice(0, maxLength));
}

async function ensureUniqueSlug(base, excludeId = null) {
  const root = slugify(base);
  let candidate = root;
  let index = 0;
  while (true) {
    const found = await Group.findOne({
      slug: candidate,
      ...(excludeId ? { _id: { $ne: excludeId } } : {}),
    }).lean();
    if (!found) return candidate;
    index += 1;
    candidate = `${root}-${index}`;
  }
}

async function ensureUniqueJoinCode(base, excludeId = null) {
  let candidate = String(base || randomObjectId().slice(0, 8))
    .replace(/[^a-z0-9]/gi, "")
    .slice(0, 8)
    .toUpperCase();
  if (!candidate) candidate = randomObjectId().slice(0, 8).toUpperCase();
  while (true) {
    const found = await Group.findOne({
      joinCode: candidate,
      ...(excludeId ? { _id: { $ne: excludeId } } : {}),
    }).lean();
    if (!found) return candidate;
    candidate = randomObjectId().slice(0, 8).toUpperCase();
  }
}

function createMongoGroupRepository() {
  return {
    driver: "mongo",
    async create(data) {
      const ownerId = String(data.ownerId).trim();
      const now = new Date();
      const slug = await ensureUniqueSlug(data.name);
      const joinCode = await ensureUniqueJoinCode(data.joinCode || slug);
      const doc = await Group.create({
        name: String(data.name).trim(),
        slug,
        description: String(data.description || "").trim(),
        avatarUrl: String(data.avatarUrl || "").trim(),
        coverUrl: String(data.coverUrl || "").trim(),
        category: String(data.category || "general").trim().toLowerCase(),
        privacy: ["public", "private"].includes(String(data.privacy || "public").toLowerCase())
          ? String(data.privacy || "public").toLowerCase()
          : "public",
        joinCode,
        ownerId,
        location: String(data.location || "").trim(),
        website: String(data.website || "").trim(),
        contactEmail: String(data.contactEmail || "").trim(),
        rules: uniqueCleanList(data.rules, 30, 300),
        topics: uniqueCleanList(data.topics, 20, 120),
        members: [{ userId: ownerId, role: "owner", status: "active", joinedAt: now, bannedAt: null }],
        memberCount: 1,
        postCount: 0,
        pendingPostCount: 0,
      });
      return doc.toObject();
    },
    async list(query = {}) {
      const mongoQuery = {};
      if (query.keyword) {
        const regex = new RegExp(String(query.keyword), "i");
        mongoQuery.$or = [
          { name: regex },
          { description: regex },
          { category: regex },
          { topics: { $elemMatch: { $regex: regex } } },
        ];
      }
      if (query.category) mongoQuery.category = String(query.category).toLowerCase();
      if (query.privacy) mongoQuery.privacy = String(query.privacy).toLowerCase();
      const safePage = Math.max(1, Number(query.page) || 1);
      const safePageSize = Math.max(1, Math.min(100, Number(query.pageSize) || 20));
      const skip = (safePage - 1) * safePageSize;
      const [items, total] = await Promise.all([
        Group.find(mongoQuery).sort({ createdAt: -1 }).skip(skip).limit(safePageSize).lean(),
        Group.countDocuments(mongoQuery),
      ]);
      return { items, total, page: safePage, pageSize: safePageSize };
    },
    async adminList(query = {}) {
      return this.list(query);
    },
    async getById(idOrSlug) {
      const normalized = String(idOrSlug || "").trim();
      const query = [{ slug: normalized }, { joinCode: normalized.toUpperCase() }];
      if (mongoose.isValidObjectId(normalized)) query.unshift({ _id: normalized });
      return Group.findOne({ $or: query }).lean();
    },
    async getByJoinCode(code) {
      return Group.findOne({ joinCode: String(code || "").trim().toUpperCase() }).lean();
    },
    async update(id, patch) {
      const updated = await Group.findByIdAndUpdate(
        id,
        { $set: { ...patch, updatedAt: new Date() } },
        { new: true }
      ).lean();
      if (!updated) return null;
      if (Array.isArray(updated.members) && updated.memberCount !== updated.members.length) {
        await Group.updateOne({ _id: id }, { $set: { memberCount: updated.members.length } });
        updated.memberCount = updated.members.length;
      }
      return updated;
    },
    async addMember(groupId, userId, role = "member") {
      const group = await Group.findById(groupId);
      if (!group) return null;
      const existing = (group.members || []).find((m) => String(m.userId) === String(userId));
      if (!existing) {
        group.members.push({
          userId: String(userId),
          role: normalizeRole(role, { allowOwner: false, fallback: "member" }),
          status: "active",
          joinedAt: new Date(),
          bannedAt: null,
        });
      } else if (existing.status === "banned") {
        return null;
      } else {
        existing.status = existing.status || "active";
      }
      group.memberCount = group.members.length;
      group.updatedAt = new Date();
      await group.save();
      return group.toObject();
    },
    async setMemberRole(groupId, userId, role) {
      const group = await Group.findById(groupId);
      if (!group) return null;
      const member = group.members.find((m) => String(m.userId) === String(userId));
      if (!member) return null;
      member.role = normalizeRole(role, { allowOwner: true, fallback: "member" });
      group.updatedAt = new Date();
      await group.save();
      return group.toObject();
    },
    async removeMember(groupId, userId) {
      const group = await Group.findById(groupId);
      if (!group) return null;
      group.members = (group.members || []).filter((m) => String(m.userId) !== String(userId));
      group.memberCount = group.members.length;
      group.updatedAt = new Date();
      await group.save();
      return group.toObject();
    },
    async createInvitation(groupId, payload) {
      const existing = await GroupInvitation.findOne({
        groupId: String(groupId),
        recipientId: String(payload.recipientId),
        status: "pending",
      }).lean();
      if (existing) return existing;
      const doc = await GroupInvitation.create({
        groupId: String(groupId),
        recipientId: String(payload.recipientId),
        invitedBy: String(payload.invitedBy),
        role: normalizeRole(payload.role, { allowOwner: false, fallback: "member" }),
        status: "pending",
        note: String(payload.note || ""),
        respondedAt: null,
      });
      return doc.toObject();
    },
    async listInvitations(query = {}) {
      const mongoQuery = {};
      if (query.groupId) mongoQuery.groupId = String(query.groupId);
      if (query.recipientId) mongoQuery.recipientId = String(query.recipientId);
      if (query.status) mongoQuery.status = String(query.status);
      const safePage = Math.max(1, Number(query.page) || 1);
      const safePageSize = Math.max(1, Math.min(100, Number(query.pageSize) || 20));
      const skip = (safePage - 1) * safePageSize;
      const [items, total] = await Promise.all([
        GroupInvitation.find(mongoQuery).sort({ createdAt: -1 }).skip(skip).limit(safePageSize).lean(),
        GroupInvitation.countDocuments(mongoQuery),
      ]);
      return { items, total, page: safePage, pageSize: safePageSize };
    },
    async getInvitationById(inviteId) {
      if (!mongoose.isValidObjectId(inviteId)) return null;
      return GroupInvitation.findById(inviteId).lean();
    },
    async updateInvitation(inviteId, patch) {
      if (!mongoose.isValidObjectId(inviteId)) return null;
      return GroupInvitation.findByIdAndUpdate(inviteId, { $set: { ...patch, updatedAt: new Date() } }, { new: true }).lean();
    },
    async createJoinRequest(groupId, userId, payload = {}) {
      const existing = await GroupJoinRequest.findOne({
        groupId: String(groupId),
        userId: String(userId),
        status: "pending",
      }).lean();
      if (existing) return existing;
      const doc = await GroupJoinRequest.create({
        groupId: String(groupId),
        userId: String(userId),
        note: String(payload.note || "").trim(),
        status: "pending",
        reviewedBy: null,
        reviewedAt: null,
      });
      return doc.toObject();
    },
    async listJoinRequests(query = {}) {
      const mongoQuery = {};
      if (query.groupId) mongoQuery.groupId = String(query.groupId);
      if (query.userId) mongoQuery.userId = String(query.userId);
      if (query.status) mongoQuery.status = String(query.status);
      const safePage = Math.max(1, Number(query.page) || 1);
      const safePageSize = Math.max(1, Math.min(100, Number(query.pageSize) || 20));
      const skip = (safePage - 1) * safePageSize;
      const [items, total] = await Promise.all([
        GroupJoinRequest.find(mongoQuery).sort({ createdAt: -1 }).skip(skip).limit(safePageSize).lean(),
        GroupJoinRequest.countDocuments(mongoQuery),
      ]);
      return { items, total, page: safePage, pageSize: safePageSize };
    },
    async getJoinRequestById(requestId) {
      if (!mongoose.isValidObjectId(requestId)) return null;
      return GroupJoinRequest.findById(requestId).lean();
    },
    async updateJoinRequest(requestId, patch) {
      if (!mongoose.isValidObjectId(requestId)) return null;
      return GroupJoinRequest.findByIdAndUpdate(requestId, { $set: { ...patch, updatedAt: new Date() } }, { new: true }).lean();
    },
    async transferOwnership(groupId, currentOwnerId, newOwnerId) {
      const group = await Group.findById(groupId);
      if (!group) return null;
      const currentOwner = (group.members || []).find((m) => String(m.userId) === String(currentOwnerId));
      const newOwner = (group.members || []).find((m) => String(m.userId) === String(newOwnerId));
      if (!currentOwner || !newOwner) return null;
      currentOwner.role = "admin";
      currentOwner.status = currentOwner.status || "active";
      newOwner.role = "owner";
      newOwner.status = "active";
      newOwner.bannedAt = null;
      group.ownerId = String(newOwnerId);
      group.updatedAt = new Date();
      await group.save();
      return group.toObject();
    },
    async deleteGroup(id) {
      if (!mongoose.isValidObjectId(id)) return null;
      const deletedGroup = await Group.findByIdAndDelete(id).lean();
      if (!deletedGroup) return null;
      await Promise.all([
        GroupInvitation.deleteMany({ groupId: String(id) }),
        GroupJoinRequest.deleteMany({ groupId: String(id) }),
        Post.deleteMany({ groupId: String(id) }),
      ]);
      return deletedGroup;
    },
    async getMemberStatus(groupId, userId) {
      const group = await Group.findById(groupId).lean();
      if (!group) return null;
      return (group.members || []).find((m) => String(m.userId) === String(userId)) || null;
    },
    async banMember(groupId, userId) {
      const group = await Group.findById(groupId);
      if (!group) return null;
      const member = (group.members || []).find((m) => String(m.userId) === String(userId));
      if (!member) return null;
      member.status = "banned";
      member.role = member.role || "member";
      member.bannedAt = new Date();
      group.updatedAt = new Date();
      await group.save();
      return group.toObject();
    },
    async unbanMember(groupId, userId) {
      const group = await Group.findById(groupId);
      if (!group) return null;
      const member = (group.members || []).find((m) => String(m.userId) === String(userId));
      if (!member) return null;
      member.status = "active";
      member.bannedAt = null;
      group.updatedAt = new Date();
      await group.save();
      return group.toObject();
    },
    async regenerateJoinCode(groupId) {
      const group = await Group.findById(groupId);
      if (!group) return null;
      group.joinCode = await ensureUniqueJoinCode(randomObjectId().slice(0, 8), groupId);
      group.updatedAt = new Date();
      await group.save();
      return group.toObject();
    },
    async getGroupStats(groupId) {
      const group = await Group.findById(groupId).lean();
      if (!group) return null;
      const members = group.members || [];
      const [pendingInvites, pendingJoinRequests] = await Promise.all([
        GroupInvitation.countDocuments({ groupId: String(groupId), status: "pending" }),
        GroupJoinRequest.countDocuments({ groupId: String(groupId), status: "pending" }),
      ]);
      return {
        groupId: String(group._id),
        groupName: group.name,
        totalMembers: group.memberCount || 0,
        activeMembers: members.filter((m) => m.status !== "banned").length,
        bannedMembers: members.filter((m) => m.status === "banned").length,
        moderators: members.filter((m) => ["admin", "moderator"].includes(m.role)).length,
        totalPosts: group.postCount || 0,
        pendingPosts: group.pendingPostCount || 0,
        pendingInvites,
        pendingJoinRequests,
        createdAt: group.createdAt,
        updatedAt: group.updatedAt,
      };
    },
    async getAdminDashboard() {
      const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const [totalGroups, publicGroups, privateGroups, recentGroups30d, memberSummary, postSummary] = await Promise.all([
        Group.countDocuments({}),
        Group.countDocuments({ privacy: "public" }),
        Group.countDocuments({ privacy: "private" }),
        Group.countDocuments({ createdAt: { $gte: since } }),
        Group.aggregate([
          {
            $group: {
              _id: null,
              totalMembers: { $sum: { $ifNull: ["$memberCount", 0] } },
            },
          },
        ]),
        Group.aggregate([
          {
            $group: {
              _id: null,
              totalPosts: { $sum: { $ifNull: ["$postCount", 0] } },
              pendingPosts: { $sum: { $ifNull: ["$pendingPostCount", 0] } },
            },
          },
        ]),
      ]);

      return {
        totalGroups,
        publicGroups,
        privateGroups,
        recentGroups30d,
        totalMembers: Number(memberSummary[0]?.totalMembers || 0),
        totalPosts: Number(postSummary[0]?.totalPosts || 0),
        pendingPosts: Number(postSummary[0]?.pendingPosts || 0),
      };
    },
  };
}

function createFileGroupRepository() {
  return {
    driver: "file",
    async create(data) {
      const groups = loadGroups();
      const now = new Date().toISOString();
      let slug = slugify(data.name);
      if (groups.some((g) => g.slug === slug)) slug = `${slug}-${randomObjectId().slice(0, 4)}`;
      let joinCode = String(data.joinCode || slug.replace(/-/g, "").slice(0, 8)).toUpperCase();
      if (groups.some((g) => g.joinCode === joinCode)) joinCode = `${joinCode.slice(0, 4)}${randomObjectId().slice(0, 4)}`.toUpperCase();
      const ownerId = String(data.ownerId).trim();
      const group = {
        _id: randomObjectId(),
        name: String(data.name).trim(),
        slug,
        description: String(data.description || "").trim(),
        avatarUrl: String(data.avatarUrl || "").trim(),
        coverUrl: String(data.coverUrl || "").trim(),
        category: String(data.category || "general").trim().toLowerCase(),
        privacy: ["public", "private"].includes(String(data.privacy || "public").toLowerCase()) ? String(data.privacy || "public").toLowerCase() : "public",
        joinCode,
        ownerId,
        location: String(data.location || "").trim(),
        website: String(data.website || "").trim(),
        contactEmail: String(data.contactEmail || "").trim(),
        rules: uniqueCleanList(data.rules, 30, 300),
        topics: uniqueCleanList(data.topics, 20, 120),
        members: [{ userId: ownerId, role: "owner", status: "active", joinedAt: now, bannedAt: null }],
        memberCount: 1,
        postCount: 0,
        pendingPostCount: 0,
        createdAt: now,
        updatedAt: now,
      };
      groups.unshift(group);
      saveGroups(groups);
      return group;
    },
    async list(query = {}) {
      let items = loadGroups().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      if (query.keyword) {
        const k = String(query.keyword).trim().toLowerCase();
        items = items.filter((g) => [g.name, g.description, g.category, ...(g.topics || [])].join(" ").toLowerCase().includes(k));
      }
      if (query.category) items = items.filter((g) => g.category === String(query.category).toLowerCase());
      if (query.privacy) items = items.filter((g) => g.privacy === String(query.privacy).toLowerCase());
      return paginate(items, query);
    },
    async adminList(query = {}) {
      return this.list(query);
    },
    async getById(idOrSlug) {
      return loadGroups().find((g) =>
        String(g._id) === String(idOrSlug) ||
        String(g.slug) === String(idOrSlug) ||
        String(g.joinCode) === String(idOrSlug || "").toUpperCase()
      ) || null;
    },
    async getByJoinCode(code) {
      return loadGroups().find((g) => g.joinCode === String(code || "").trim().toUpperCase()) || null;
    },
    async update(id, patch) {
      const groups = loadGroups();
      const group = groups.find((g) => String(g._id) === String(id));
      if (!group) return null;
      Object.assign(group, patch, { updatedAt: new Date().toISOString() });
      group.memberCount = Array.isArray(group.members) ? group.members.length : Number(group.memberCount || 0);
      saveGroups(groups);
      return group;
    },
    async addMember(groupId, userId, role = "member") {
      const groups = loadGroups();
      const group = groups.find((g) => String(g._id) === String(groupId));
      if (!group) return null;
      if (!Array.isArray(group.members)) group.members = [];
      const existing = group.members.find((m) => String(m.userId) === String(userId));
      if (!existing) {
        group.members.push({
          userId: String(userId),
          role: normalizeRole(role, { allowOwner: false, fallback: "member" }),
          status: "active",
          joinedAt: new Date().toISOString(),
          bannedAt: null,
        });
      } else if (existing.status === "banned") {
        return null;
      } else {
        existing.status = existing.status || "active";
      }
      group.memberCount = group.members.length;
      group.updatedAt = new Date().toISOString();
      saveGroups(groups);
      return group;
    },
    async setMemberRole(groupId, userId, role) {
      const normalizedRole = normalizeRole(role, { allowOwner: true, fallback: "member" });
      const groups = loadGroups();
      const group = groups.find((g) => String(g._id) === String(groupId));
      if (!group) return null;
      const member = group.members.find((m) => String(m.userId) === String(userId));
      if (!member) return null;
      member.role = normalizedRole;
      group.updatedAt = new Date().toISOString();
      saveGroups(groups);
      return group;
    },
    async removeMember(groupId, userId) {
      const groups = loadGroups();
      const group = groups.find((g) => String(g._id) === String(groupId));
      if (!group) return null;
      group.members = (group.members || []).filter((m) => String(m.userId) !== String(userId));
      group.memberCount = group.members.length;
      group.updatedAt = new Date().toISOString();
      saveGroups(groups);
      return group;
    },
    async createInvitation(groupId, payload) {
      const invites = loadGroupInvites();
      const existing = invites.find((x) => String(x.groupId) === String(groupId) && String(x.recipientId) === String(payload.recipientId) && x.status === "pending");
      if (existing) return existing;
      const now = new Date().toISOString();
      const invite = {
        _id: randomObjectId(),
        groupId: String(groupId),
        recipientId: String(payload.recipientId),
        invitedBy: String(payload.invitedBy),
        role: normalizeRole(payload.role, { allowOwner: false, fallback: "member" }),
        status: "pending",
        note: String(payload.note || ""),
        respondedAt: null,
        createdAt: now,
        updatedAt: now,
      };
      invites.unshift(invite);
      saveGroupInvites(invites);
      return invite;
    },
    async listInvitations(query = {}) {
      let items = loadGroupInvites().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      if (query.groupId) items = items.filter((x) => String(x.groupId) === String(query.groupId));
      if (query.recipientId) items = items.filter((x) => String(x.recipientId) === String(query.recipientId));
      if (query.status) items = items.filter((x) => String(x.status) === String(query.status));
      return paginate(items, query);
    },
    async getInvitationById(inviteId) {
      return loadGroupInvites().find((x) => String(x._id) === String(inviteId)) || null;
    },
    async updateInvitation(inviteId, patch) {
      const invites = loadGroupInvites();
      const invite = invites.find((x) => String(x._id) === String(inviteId));
      if (!invite) return null;
      Object.assign(invite, patch, { updatedAt: new Date().toISOString() });
      saveGroupInvites(invites);
      return invite;
    },
    async createJoinRequest(groupId, userId, payload = {}) {
      const requests = loadGroupJoinRequests();
      const existing = requests.find((x) => String(x.groupId) === String(groupId) && String(x.userId) === String(userId) && x.status === "pending");
      if (existing) return existing;
      const now = new Date().toISOString();
      const item = {
        _id: randomObjectId(),
        groupId: String(groupId),
        userId: String(userId),
        note: String(payload.note || "").trim(),
        status: "pending",
        reviewedBy: null,
        reviewedAt: null,
        createdAt: now,
        updatedAt: now,
      };
      requests.unshift(item);
      saveGroupJoinRequests(requests);
      return item;
    },
    async listJoinRequests(query = {}) {
      let items = loadGroupJoinRequests().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      if (query.groupId) items = items.filter((x) => String(x.groupId) === String(query.groupId));
      if (query.userId) items = items.filter((x) => String(x.userId) === String(query.userId));
      if (query.status) items = items.filter((x) => String(x.status) === String(query.status));
      return paginate(items, query);
    },
    async getJoinRequestById(requestId) {
      return loadGroupJoinRequests().find((x) => String(x._id) === String(requestId)) || null;
    },
    async updateJoinRequest(requestId, patch) {
      const requests = loadGroupJoinRequests();
      const item = requests.find((x) => String(x._id) === String(requestId));
      if (!item) return null;
      Object.assign(item, patch, { updatedAt: new Date().toISOString() });
      saveGroupJoinRequests(requests);
      return item;
    },
    async transferOwnership(groupId, currentOwnerId, newOwnerId) {
      const groups = loadGroups();
      const group = groups.find((g) => String(g._id) === String(groupId));
      if (!group) return null;
      const currentOwner = (group.members || []).find((m) => String(m.userId) === String(currentOwnerId));
      const newOwner = (group.members || []).find((m) => String(m.userId) === String(newOwnerId));
      if (!currentOwner || !newOwner) return null;
      currentOwner.role = "admin";
      currentOwner.status = currentOwner.status || "active";
      newOwner.role = "owner";
      newOwner.status = "active";
      newOwner.bannedAt = null;
      group.ownerId = String(newOwnerId);
      group.updatedAt = new Date().toISOString();
      saveGroups(groups);
      return group;
    },
    async deleteGroup(id) {
      const groups = loadGroups();
      const groupIndex = groups.findIndex((g) => String(g._id) === String(id));
      if (groupIndex === -1) return null;
      const [deletedGroup] = groups.splice(groupIndex, 1);
      saveGroups(groups);

      const invites = loadGroupInvites().filter((x) => String(x.groupId) !== String(id));
      saveGroupInvites(invites);

      const joinRequests = loadGroupJoinRequests().filter((x) => String(x.groupId) !== String(id));
      saveGroupJoinRequests(joinRequests);

      const posts = loadPosts().filter((x) => String(x.groupId || "") !== String(id));
      savePosts(posts);

      return deletedGroup;
    },
    async getMemberStatus(groupId, userId) {
      const group = await this.getById(groupId);
      if (!group) return null;
      return (group.members || []).find((m) => String(m.userId) === String(userId)) || null;
    },
    async banMember(groupId, userId) {
      const groups = loadGroups();
      const group = groups.find((g) => String(g._id) === String(groupId));
      if (!group) return null;
      const member = (group.members || []).find((m) => String(m.userId) === String(userId));
      if (!member) return null;
      member.status = "banned";
      member.role = member.role || "member";
      member.bannedAt = new Date().toISOString();
      group.updatedAt = new Date().toISOString();
      saveGroups(groups);
      return group;
    },
    async unbanMember(groupId, userId) {
      const groups = loadGroups();
      const group = groups.find((g) => String(g._id) === String(groupId));
      if (!group) return null;
      const member = (group.members || []).find((m) => String(m.userId) === String(userId));
      if (!member) return null;
      member.status = "active";
      member.bannedAt = null;
      group.updatedAt = new Date().toISOString();
      saveGroups(groups);
      return group;
    },
    async regenerateJoinCode(groupId) {
      const groups = loadGroups();
      const group = groups.find((g) => String(g._id) === String(groupId));
      if (!group) return null;
      let joinCode = randomObjectId().slice(0, 8).toUpperCase();
      while (groups.some((g) => String(g._id) !== String(groupId) && g.joinCode === joinCode)) {
        joinCode = randomObjectId().slice(0, 8).toUpperCase();
      }
      group.joinCode = joinCode;
      group.updatedAt = new Date().toISOString();
      saveGroups(groups);
      return group;
    },
    async getGroupStats(groupId) {
      const group = await this.getById(groupId);
      if (!group) return null;
      const members = group.members || [];
      const bannedCount = members.filter((m) => m.status === "banned").length;
      const activeCount = members.filter((m) => m.status !== "banned").length;
      const moderators = members.filter((m) => ["admin", "moderator"].includes(m.role)).length;
      const pendingInvites = loadGroupInvites().filter((x) => String(x.groupId) === String(groupId) && x.status === "pending").length;
      const pendingJoinRequests = loadGroupJoinRequests().filter((x) => String(x.groupId) === String(groupId) && x.status === "pending").length;
      return {
        groupId: group._id,
        groupName: group.name,
        totalMembers: group.memberCount || 0,
        activeMembers: activeCount,
        bannedMembers: bannedCount,
        moderators,
        totalPosts: group.postCount || 0,
        pendingPosts: group.pendingPostCount || 0,
        pendingInvites,
        pendingJoinRequests,
        createdAt: group.createdAt,
        updatedAt: group.updatedAt,
      };
    },
    async getAdminDashboard() {
      const since = Date.now() - 30 * 24 * 60 * 60 * 1000;
      const groups = loadGroups();
      return groups.reduce((acc, group) => {
        acc.totalGroups += 1;
        if (String(group.privacy || "public") === "private") acc.privateGroups += 1;
        else acc.publicGroups += 1;
        if (new Date(group.createdAt).getTime() >= since) acc.recentGroups30d += 1;
        acc.totalMembers += Number(group.memberCount || 0);
        acc.totalPosts += Number(group.postCount || 0);
        acc.pendingPosts += Number(group.pendingPostCount || 0);
        return acc;
      }, {
        totalGroups: 0,
        publicGroups: 0,
        privateGroups: 0,
        recentGroups30d: 0,
        totalMembers: 0,
        totalPosts: 0,
        pendingPosts: 0,
      });
    },
  };
}

function createGroupRepository({ driver = "mongo" } = {}) {
  return driver === "file" ? createFileGroupRepository() : createMongoGroupRepository();
}

module.exports = { createGroupRepository, VALID_GROUP_ROLES, ASSIGNABLE_ROLES, normalizeRole };
