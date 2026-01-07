import express from "express";
import { createPost, updatePost, deletePost, getPost, likePost } from "../controllers/postController.js";
import verifyToken from "../middleware/verifyToken.js";
import { upload } from "../config/cloudinary.js";

const router = express.Router();

router.post("/", verifyToken, upload.single("img"), createPost);

router.put("/:id", verifyToken,upload.single("img"), updatePost);
router.delete("/:id", verifyToken, deletePost);
router.get("/:id", getPost);
router.put("/:id/like", verifyToken, likePost);

export default router;