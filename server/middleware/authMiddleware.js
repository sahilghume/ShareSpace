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

    // Verify JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check token in database
    const savedToken = await User.findToken(decoded.jti);

    if (!savedToken) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired session. Please login again.",
      });
    }

    // Attach user details to request
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
      message: "Invalid or expired token",
    });
  }
};

module.exports = authMiddleware;
