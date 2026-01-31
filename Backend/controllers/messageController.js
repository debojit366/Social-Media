import mongoose from "mongoose"; // <--- Ye missing tha isliye 500 error aa raha tha
import Message from "../models/messageModel.js";

export const sendMessage = async (req, res) => {
  try {
    const { senderId, receiverId, text } = req.body;
    
    const newMessage = new Message({ senderId, receiverId, text });
    await newMessage.save();
    res.status(201).json(newMessage);
  } catch (error) {
    res.status(500).json({ message: "Message send karne mein error", error });
  }
};

// --- Chat History Fetch Karna ---
export const getMessages = async (req, res) => {
  try {
    const { senderId, receiverId } = req.params;
    const messages = await Message.find({
      $or: [
        { senderId: senderId, receiverId: receiverId },
        { senderId: receiverId, receiverId: senderId },
      ],
    }).sort({ createdAt: 1 });

    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ message: "Error while fetching old messages", error });
  }
};

export const clearChat = async (req, res) => {
  try {
    const { userId, friendId } = req.params;
    if (!userId || !friendId) {
      return res.status(400).json({ message: "User IDs are required" });
    }

    await Message.updateMany(
      {
        $or: [
          { senderId: userId, receiverId: friendId },
          { senderId: friendId, receiverId: userId }
        ]
      },
      { $addToSet: { deletedBy: userId } }
    );

    res.status(200).json({ success: true, message: "Chat cleared successfully for you" });
  } catch (error) {
    console.error("Clear Chat Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const markMessagesAsRead = async (req, res) => {
  try {
    const userId = req.user.id; 
    const { chatPartnerId } = req.params;

    await Message.updateMany(
      { 
        senderId: chatPartnerId, 
        receiverId: userId,      
        isRead: false 
      },
      { $set: { isRead: true } }
    );

    res.status(200).json("Messages read successfully");
  } catch (err) {
    res.status(500).json(err);
  }
};


export const getUnreadCount = async (req, res) => {
  try {
    const userId = req.user.id;

    const unreadStats = await Message.aggregate([
      { 
        $match: { 
          receiverId: new mongoose.Types.ObjectId(userId), 
          isRead: false 
        } 
      },
      { 
        $group: { 
          _id: "$senderId", 
          count: { $sum: 1 } 
        } 
      }
    ]);

    res.status(200).json(unreadStats);
  } catch (err) {
    console.error("Aggregation Error:", err);
    res.status(500).json(err);
  }
};