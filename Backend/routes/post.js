import express from "express";
import { createPost,updatePost,deletePost,getPost, likePost } from "../controllers/postController.js";
import  verifyToken  from "../middleware/verifyToken.js";

const router = express.Router();

// Route: http://localhost:8080/api/v1/posts/
router.post("/", verifyToken, createPost);
router.put("/:id", verifyToken, updatePost);
router.delete("/:id", verifyToken, deletePost);
router.get("/:id", getPost);
router.put("/:id/like",verifyToken,likePost)
export default router;