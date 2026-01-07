import express from "express";
import { upload, handleUpload } from "../config/cloudinary.js";

const router = express.Router();

router.post("/test-upload", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json("file not found");
    }

    const result = await handleUpload(req.file.path);

    res.status(200).json({
      message: "file uploaded successfully to Cloudinary",
      result
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "cloudinary upload error", error });
  }
});

export default router;