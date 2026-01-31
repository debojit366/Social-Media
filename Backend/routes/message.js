import express from "express";
import { 
  sendMessage, 
  getMessages, 
  clearChat, 
  markMessagesAsRead, 
  getUnreadCount 
} from "../controllers/messageController.js";
import verifyToken from "../middleware/verifyToken.js";

const router = express.Router();


// Send Message
router.post("/send", verifyToken, sendMessage);

router.get("/unread/count", verifyToken, getUnreadCount);

// Mark as Read
router.put("/read/:chatPartnerId", verifyToken, markMessagesAsRead);

// Clear Chat
router.put("/clear/:userId/:friendId", verifyToken, clearChat);



router.get("/:senderId/:receiverId", getMessages);

export default router;