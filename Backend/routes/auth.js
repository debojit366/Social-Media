import express from "express";
import { loginController, registerController } from '../controllers/authController.js';
const router = express.Router();
// Ye router sirf apne endpoints jaanta hai
router.post("/login",loginController)
router.post("/register",registerController)
export default router;