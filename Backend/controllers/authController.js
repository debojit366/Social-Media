import User from "../models/userModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

/**
 * @desc    Handle user registration
 * @route   POST /api/v1/auth/register
 */
export const registerController = async (req, res, next) => {
  try {
    const { firstName, lastName, dob, gender, phoneNumber, password } = req.body;

    // 1. Check for missing fields
    if (!firstName || !lastName || !dob || !gender || !phoneNumber || !password) {
      return res.status(400).json({ success: false, message: "All fields are required!" });
    }

    // 2. Check if user already exists
    const existingUser = await User.findOne({ phoneNumber });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "Phone number already registered!" });
    }

    // 3. Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4. Create and save user
    const newUser = new User({
      firstName, lastName, dob, gender, phoneNumber,
      password: hashedPassword,
    });

    const savedUser = await newUser.save();
    
    // 5. Convert to object and remove password before sending response
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

    // 1. Validation
    if (!phoneNumber || !password) {
      return res.status(400).json({ success: false, message: "Please provide phone and password" });
    }

    // 2. Find user in Database
    const user = await User.findOne({ phoneNumber });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // 3. Compare hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid Credentials" });
    }

    // 4. Generate JWT Token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

    // 5. Remove password from response
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