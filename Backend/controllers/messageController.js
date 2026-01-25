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
    }).sort({ createdAt: 1 }); // Purane se naya (Ascending order)

    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ message: "History fetch karne mein error", error });
  }
};