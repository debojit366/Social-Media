import express from "express";
import { 
  sendFollowRequest, 
  acceptFollowRequest, 
  rejectFollowRequest,
  getPendingRequests,getUserProfile,updateUser
} from "../controllers/userController.js";
import verifyToken from "../middleware/verifyToken.js";

const router = express.Router();

router.get("/requests/pending", verifyToken, getPendingRequests);
router.patch("/:id/request", verifyToken, sendFollowRequest);
router.patch("/:id/accept", verifyToken, acceptFollowRequest);
router.patch("/:id/reject", verifyToken, rejectFollowRequest);
router.get("/find/:id",verifyToken,getUserProfile);

router.patch("/update/:id", verifyToken, updateUser);

export default router;