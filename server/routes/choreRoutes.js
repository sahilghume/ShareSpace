const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
  createChore,
  createRotationChore,
  getGroupChores,
  getChoreById,
  updateChore,
  deleteChore,
  assignChore,
  getDailyAssignments,
  updateChoreStatus,
  submitChoreForVerification,
  approveChore,
} = require("../controllers/choreController");

router.use(authMiddleware);

// Chore routes
router.post("/", createChore);
router.post("/rotation", createRotationChore);
router.get("/group/:groupId", getGroupChores);
router.get("/assignments/:groupId", getDailyAssignments);
router.post("/assign", assignChore);
router.patch("/assignments/:id/status", updateChoreStatus);
router.patch("/assignments/:id/submit", submitChoreForVerification);
router.patch("/assignments/:id/approve", approveChore);
router.get("/:id", getChoreById);
router.put("/:id", updateChore);
router.delete("/:id", deleteChore);

module.exports = router;
