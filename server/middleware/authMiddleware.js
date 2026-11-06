const jwt = require("jsonwebtoken");
const User = require("../models/User");

const authMiddleware = async (req, res, next) => {
  try {
    // Get token from request header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Access denied. Token is required.",
      });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Invalid authorization header.",
      });
    }

    // Verify JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check token in database
    const savedToken = await User.findToken(decoded.jti);

    if (!savedToken) {
      return res.status(401).json({
        success: false,
        message: "Invalid session. Please login again.",
      });
    }

    // Check token ownership
    if (savedToken.user_id !== decoded.id) {
      return res.status(401).json({
        success: false,
        message: "Invalid authentication session.",
      });
    }

    // Check database token expiration
    if (new Date(savedToken.expires_at) <= new Date()) {
      await User.deleteToken(decoded.jti);

      return res.status(401).json({
        success: false,
        message: "Session expired. Please login again.",
      });
    }

    // Attach authenticated user details
    req.user = {
      id: decoded.id,
      email: decoded.email,
      jti: decoded.jti,
    };

    next();
  } catch (error) {
    console.error("Authentication Error:", error.message);

    return res.status(401).json({
      success: false,
      message: "Invalid or expired token.",
    });
  }
};

module.exports = authMiddleware;
