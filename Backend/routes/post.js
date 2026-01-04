import express from "express";
import { createPost,updatePost,deletePost,getPost } from "../controllers/postController.js";
import  verifyToken  from "../middleware/verifyToken.js";

const router = express.Router();

// Route: http://localhost:8080/api/v1/posts/
// verifyToken isliye taaki humein req.user mil sake
router.post("/", verifyToken, createPost);
router.put("/:id", verifyToken, updatePost);    // Update ke liye PUT
router.delete("/:id", verifyToken, deletePost); // Delete ke liye DELETE
router.get("/:id", getPost);
export default router;