const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
  createRequest,
  getGroupRequests,
  getRequestById,
  updateRequest,
  updateRequestStatus,
  deleteRequest,
} = require("../controllers/maintenanceController");

router.use(authMiddleware);

// Maintenance routes
router.post("/", createRequest);
router.get("/group/:groupId", getGroupRequests);
router.patch("/:id/status", updateRequestStatus);
router.get("/:id", getRequestById);
router.put("/:id", updateRequest);
router.delete("/:id", deleteRequest);

module.exports = router;
