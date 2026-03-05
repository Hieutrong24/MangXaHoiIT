// post.model.js
const mongoose = require("mongoose");

const PostSchema = new mongoose.Schema({
  authorId: { type: String, required: true },   
  title: { type: String, required: true },    
  content: { type: String, required: true },    

  tags: [{ type: String }],
  isPublic: { type: Boolean, default: true },

  images: [{ type: String }],
  videos: [{ type: String }],
  others: [{ type: String }],

  shares: [{ type: mongoose.Schema.Types.ObjectId, ref: "Post" }],

  likes: [{ type: String }],                   
  comments: [
    {
      userId: { type: String },                 
      name: String,
      avatar: String,
      text: String,
      createdAt: { type: Date, default: Date.now },
    },
  ],

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Post", PostSchema);