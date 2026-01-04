import express from "express";
import { 
  sendFollowRequest, 
  acceptFollowRequest, 
  rejectFollowRequest 
} from "../controllers/userController.js";
import verifyToken from "../middleware/verifyToken.js";

// Initialize the router
const router = express.Router();

// Route to send a follow request
router.put("/:id/request", verifyToken, sendFollowRequest);

// Route to accept a follow request
router.put("/:id/accept", verifyToken, acceptFollowRequest);

// Route to reject/decline a follow request
router.put("/:id/reject", verifyToken, rejectFollowRequest);

export default router;
