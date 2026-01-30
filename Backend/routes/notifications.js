import express from "express";
import { getNotifications, markAsRead, getUnreadCount } from "../controllers/notificationController.js";
import verifyToken from "../middleware/verifyToken.js";

const router = express.Router();

// Get all notifications for the logged-in user
router.get("/", verifyToken, getNotifications);

// Get just the count of unread notifications (for the badge)
router.get("/unread-count", verifyToken, getUnreadCount);

// Mark notifications as read
router.put("/mark-as-read", verifyToken, markAsRead);

export default router;