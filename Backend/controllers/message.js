import {Message} from "../models/Message.js";

export const saveMessage = async (req, res) => {
    try {
        const { senderId, receiverId, text } = req.body;
        const newMessage = new Message({ senderId, receiverId, text });
        await newMessage.save();
        res.status(200).json(newMessage);
    } catch (err) {
        res.status(500).json({ error: "Message save nahi ho paya" });
    }
};

export const getMessages = async (req, res) => {
    try {
        const { senderId, receiverId } = req.params;
        const messages = await Message.find({
            $or: [
                { senderId, receiverId },
                { senderId: receiverId, receiverId: senderId }
            ]
        }).sort({ createdAt: 1 });
        res.status(200).json(messages);
    } catch (err) {
        res.status(500).json({ error: "History fetch nahi ho payi" });
    }
};