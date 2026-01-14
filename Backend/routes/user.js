import express from "express";
import { 
  sendFollowRequest, 
  acceptFollowRequest, 
  rejectFollowRequest,
  getPendingRequests,getUserProfile,updateUser,searchUsers
} from "../controllers/userController.js";
import verifyToken from "../middleware/verifyToken.js";
import {upload} from "../config/cloudinary.js";

const router = express.Router();
router.patch(
  "/update", 
  verifyToken, 
  upload.fields([
    { name: 'image', maxCount: 1 }, 
    { name: 'coverImage', maxCount: 1 }
  ]), 
  updateUser
);
router.get("/requests/pending", verifyToken, getPendingRequests);
router.get("/search", verifyToken, searchUsers);
router.patch("/:id/request", verifyToken, sendFollowRequest);
router.patch("/:id/accept", verifyToken, acceptFollowRequest);
router.patch("/:id/reject", verifyToken, rejectFollowRequest);
router.get("/find/:id",verifyToken,getUserProfile);
export default router;