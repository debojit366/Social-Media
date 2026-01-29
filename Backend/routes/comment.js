import express from "express";
import { addComment, getPostComments, deleteComment,toggleCommentLike } from "../controllers/commentController.js";
import verifyToken from "../middleware/verifyToken.js";

const router = express.Router();


router.post("/", verifyToken, addComment);


router.get("/:postId", getPostComments);


router.delete("/:id", verifyToken, deleteComment);


router.put('/:commentId/like', verifyToken, toggleCommentLike);
export default router;