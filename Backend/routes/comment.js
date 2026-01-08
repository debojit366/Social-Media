import express from "express";
import { addComment, getPostComments, deleteComment } from "../controllers/commentController.js";
import verifyToken from "../middleware/verifyToken.js";

const router = express.Router();


router.post("/", verifyToken, addComment);


router.get("/:postId", getPostComments);


router.delete("/:id", verifyToken, deleteComment);

export default router;