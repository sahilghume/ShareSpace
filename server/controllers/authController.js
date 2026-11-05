const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const User = require("../models/User");

const registerUser = async (req, res) => {
  try {
    const { fullName, email, password, mobile } = req.body;
    const normalizedEmail = email?.trim().toLowerCase();

    // Validate required fields
    if (!fullName || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email and password are required",
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email address",
      });
    }

    // Check existing user
    const existingUser = await User.findByEmail(normalizedEmail.trim());

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Email already registered",
      });
    }

    // Prepare user data according to database columns
    const userData = {
      name: fullName.trim(),
      email: normalizedEmail,
      password: password,
      phone: mobile || null,
    };

    // Save user
    const result = await User.createUser(userData);

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: {
        id: result.insertId,
        name: userData.name,
        email: userData.email,
        phone: userData.phone,
      },
    });
  } catch (error) {
    console.error("Registration Error:", error);

    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({
        success: false,
        message: "Email already registered",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Find user by email
    const user = await User.findByEmail(normalizedEmail);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Compare entered password with hashed password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Generate unique token ID
    const jti = crypto.randomUUID();

    // Set token expiration
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    // Generate JWT
    const token = jwt.sign(
      {
        id: user.user_id,
        email: user.email,
        jti: jti,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1h",
      },
    );

    // Save token in database
    await User.saveToken(user.user_id, jti, expiresAt);

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token: token,
      user: {
        id: user.user_id,
        name: user.name,
        email: user.email,
        phone: user.phone,
      },
    });
  } catch (error) {
    console.error("Login Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const getProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      user: {
        id: user.user_id,
        name: user.name,
        email: user.email,
        phone: user.phone,
      },
    });
  } catch (error) {
    console.error("Profile Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch profile",
    });
  }
};

const logoutUser = async (req, res) => {
  try {
    const jti = req.user.jti;

    await User.deleteToken(jti);

    return res.status(200).json({
      success: true,
      message: "Logout successful",
    });
  } catch (error) {
    console.error("Logout Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to logout",
    });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getProfile,
  logoutUser,
};
