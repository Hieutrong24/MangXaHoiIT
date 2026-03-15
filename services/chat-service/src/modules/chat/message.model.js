// src/modules/chat/message.model.js
const mongoose = require("mongoose");

const MessageSchema = new mongoose.Schema(
  {
    chatId: { type: String, required: true, index: true },
    senderId: { type: String, required: true, index: true },

    
    clientMessageId: { type: String, required: false },

    type: {
      type: String,
      enum: ["text", "system", "file"],
      default: "text",
      required: true
    },

    content: { type: String, required: true },  
    meta: { type: Object, default: {} }, 

   
    seq: { type: Number, required: true },

    createdAt: { type: Date, default: Date.now, index: true },
    editedAt: { type: Date, default: null }
  },
  { versionKey: false }
);

 
MessageSchema.index({ chatId: 1, createdAt: -1 });
MessageSchema.index({ chatId: 1, seq: 1 }, { unique: true });
 
MessageSchema.index(
  { chatId: 1, senderId: 1, clientMessageId: 1 },
  {
    unique: true,
    partialFilterExpression: { clientMessageId: { $type: "string" } }
  }
);

const MessageModel = mongoose.model("Message", MessageSchema);

module.exports = { MessageModel };
