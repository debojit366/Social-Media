import User from "../models/userModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

/**
 * @desc    Handle user registration
 * @route   POST /api/v1/auth/register
 */
export const registerController = async (req, res, next) => {
  try {
    const { firstName, lastName, dob, gender, phoneNumber, password, username } = req.body;

    if (!firstName || !lastName || !dob || !gender || !phoneNumber || !password || !username) {
      return res.status(400).json({ success: false, message: "All fields are required!" });
    }

    
    const existingUser = await User.findOne({ 
      $or: [{ phoneNumber }, { username }] 
    });

    if (existingUser) {
      const field = existingUser.phoneNumber === phoneNumber ? "Phone number" : "Username";
      return res.status(400).json({ success: false, message: `${field} already registered!` });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      firstName, 
      lastName, 
      dob, 
      gender, 
      phoneNumber,
      username,
      password: hashedPassword,
    });

    const savedUser = await newUser.save();
    
    const userObj = savedUser.toObject();
    delete userObj.password;

    res.status(201).json({ 
        success: true, 
        message: "User registered successfully", 
        user: userObj 
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Handle user login
 * @route   POST /api/v1/auth/login
 */
export const loginController = async (req, res, next) => {
  try {
    const { phoneNumber, password } = req.body;

    if (!phoneNumber || !password) {
      return res.status(400).json({ success: false, message: "Please provide phone and password" });
    }

    const user = await User.findOne({ phoneNumber });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      
      return res.status(401).json({ success: false, message: "Invalid Credentials" });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

    const userObj = user.toObject();
    delete userObj.password;

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: userObj
    });

  } catch (err) {
    next(err);
  }
};