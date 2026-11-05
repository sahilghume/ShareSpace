const express = require("express");
const router = express.Router();

const {
  registerUser,
  loginUser,
  getProfile,
  logoutUser,
} = require("../controllers/authController");

const authMiddleware = require("../middleware/authMiddleware");

// Public routes
router.post("/register", registerUser);
router.post("/login", loginUser);

// Protected routes
router.get("/profile", authMiddleware, getProfile);
router.post("/logout", authMiddleware, logoutUser);

module.exports = router;
