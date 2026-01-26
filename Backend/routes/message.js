import express from "express";
import { sendMessage, getMessages,clearChat } from "../controllers/messageController.js"
import verifyToken from "../middleware/verifyToken.js";


const router = express.Router();

// Route: http://localhost:8080/api/v1/messages/send
router.post("/send",verifyToken,sendMessage);

// Route: http://localhost:8080/api/v1/messages/:senderId/:receiverId
router.get("/:senderId/:receiverId", getMessages);


router.put("/clear/:userId/:friendId",verifyToken, clearChat);

export default router;