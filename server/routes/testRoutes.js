const express = require("express");
const router = express.Router();

// GET API
router.get("/test", (req, res) => {
  res.status(200).json({
    success: true,
    message: "ShareSpace API is working!",
  });
});

module.exports = router;
