// models/Notification.js
const mongoose = require("mongoose");
const NotificationSchema = new mongoose.Schema({
  receiverId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  type: { 
    type: String, 
    enum: ["follow_request", "like", "comment", "accept_follow"], 
    required: true 
  },
  postId: { type: mongoose.Schema.Types.ObjectId, ref: "Post" },
  commentText: { type: String },
  read: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model("Notification", NotificationSchema);