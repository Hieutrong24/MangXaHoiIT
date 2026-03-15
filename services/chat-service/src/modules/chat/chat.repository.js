// src/modules/chat/chat.repository.js
const mongoose = require("mongoose");
const { MessageModel } = require("./message.model");

// counters để cấp seq theo chatId
const CounterSchema = new mongoose.Schema(
  {
    chatId: { type: String, required: true, unique: true },
    value: { type: Number, required: true, default: 0 }
  },
  { versionKey: false }
);

const CounterModel = mongoose.model("ChatCounter", CounterSchema);

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
  clientMessageId
}) {
  const seq = await getNextSeq(chatId);

  const msg = await MessageModel.create({
    chatId,
    senderId,
    type,
    content,
    meta: meta || {},
    clientMessageId: clientMessageId || undefined,
    seq
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

module.exports = {
  createMessage,
  listMessagesByChat,
  findMessageById
};
