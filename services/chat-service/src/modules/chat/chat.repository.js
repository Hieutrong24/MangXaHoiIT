const mongoose = require('mongoose');
const { MessageModel } = require('./message.model');
const { GroupChatModel } = require('./group.model');

const CounterSchema = new mongoose.Schema(
  {
    chatId: { type: String, required: true, unique: true },
    value: { type: Number, required: true, default: 0 },
  },
  { versionKey: false }
);

const CounterModel = mongoose.models.ChatCounter || mongoose.model('ChatCounter', CounterSchema);

async function getNextSeq(chatId) {
  const doc = await CounterModel.findOneAndUpdate(
    { chatId },
    { $inc: { value: 1 } },
    { new: true, upsert: true }
  );
  return doc.value;
}

async function createMessage({
  chatId,
  senderId,
  type,
  content,
  meta,
  clientMessageId,
}) {
  const seq = await getNextSeq(chatId);

  const msg = await MessageModel.create({
    chatId,
    senderId,
    type,
    content,
    meta: meta || {},
    clientMessageId: clientMessageId || undefined,
    seq,
  });

  return msg.toObject();
}

async function findMessageById(messageId) {
  if (!mongoose.isValidObjectId(messageId)) return null;
  return MessageModel.findById(messageId).lean();
}

async function listMessagesByChat(chatId, { limit = 30, beforeId = null } = {}) {
  const q = { chatId };
  if (beforeId && mongoose.isValidObjectId(beforeId)) {
    q._id = { $lt: new mongoose.Types.ObjectId(beforeId) };
  }

  const items = await MessageModel.find(q)
    .sort({ _id: -1 })
    .limit(Math.min(Math.max(limit, 1), 100))
    .lean();

  const nextCursor = items.length > 0 ? String(items[items.length - 1]._id) : null;

  return { items, nextCursor };
}

async function createGroup(groupInput) {
  const doc = await GroupChatModel.create(groupInput);
  return doc.toObject();
}

async function getGroupByChatId(chatId) {
  return GroupChatModel.findOne({ chatId }).lean();
}

async function getGroupDocByChatId(chatId) {
  return GroupChatModel.findOne({ chatId });
}

async function listGroupsByUserId(userId) {
  return GroupChatModel.find({ 'members.userId': String(userId) })
    .sort({ lastMessageAt: -1, updatedAt: -1 })
    .lean();
}

async function listAllGroups({ page = 1, limit = 20, keyword = '' } = {}) {
  const safePage = Math.max(1, Number(page) || 1);
  const safeLimit = Math.max(1, Math.min(100, Number(limit) || 20));
  const skip = (safePage - 1) * safeLimit;
  const query = {};
  if (String(keyword || '').trim()) {
    const regex = new RegExp(String(keyword).trim(), 'i');
    query.$or = [{ name: regex }, { description: regex }, { chatId: regex }];
  }

  const [items, total] = await Promise.all([
    GroupChatModel.find(query).sort({ lastMessageAt: -1, updatedAt: -1 }).skip(skip).limit(safeLimit).lean(),
    GroupChatModel.countDocuments(query),
  ]);

  return { items, total, page: safePage, limit: safeLimit };
}

async function touchGroupLastMessage(chatId, { preview = '', at = new Date() } = {}) {
  await GroupChatModel.updateOne(
    { chatId },
    {
      $set: {
        lastMessagePreview: preview,
        lastMessageAt: at,
      },
    }
  );
}

async function deleteGroupByChatId(chatId) {
  await Promise.all([
    GroupChatModel.deleteOne({ chatId }),
    MessageModel.deleteMany({ chatId }),
    CounterModel.deleteOne({ chatId }),
  ]);
}

async function deleteMessageById(messageId) {
  if (!mongoose.isValidObjectId(messageId)) return null;
  return MessageModel.findByIdAndDelete(messageId).lean();
}

async function getAdminDashboard() {
  const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const [totalGroups, recentGroups7d, totalMessages, recentMessages7d, memberSummary] = await Promise.all([
    GroupChatModel.countDocuments({}),
    GroupChatModel.countDocuments({ createdAt: { $gte: since } }),
    MessageModel.countDocuments({}),
    MessageModel.countDocuments({ createdAt: { $gte: since } }),
    GroupChatModel.aggregate([
      {
        $group: {
          _id: null,
          totalMembers: { $sum: { $ifNull: ['$memberCount', 0] } },
        },
      },
    ]),
  ]);

  return {
    totalGroups,
    recentGroups7d,
    totalMessages,
    recentMessages7d,
    totalMembers: Number(memberSummary[0]?.totalMembers || 0),
  };
}

module.exports = {
  createMessage,
  listMessagesByChat,
  findMessageById,
  createGroup,
  getGroupByChatId,
  getGroupDocByChatId,
  listGroupsByUserId,
  listAllGroups,
  touchGroupLastMessage,
  deleteGroupByChatId,
  deleteMessageById,
  getAdminDashboard,
};
