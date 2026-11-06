const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
  createGroup,
  joinGroup,
  getMyGroups,
  getGroupDetails,
  getGroupMembers,
  removeMember,
  leaveGroup,
  transferAdminAndLeave,
  deleteGroup,
} = require("../controllers/groupController");

// Protect all group routes
router.use(authMiddleware);

router.post("/create", createGroup);
router.post("/join", joinGroup);
router.get("/my-groups", getMyGroups);
router.get("/:id", getGroupDetails);
router.get("/:id/members", getGroupMembers);
router.delete("/:id/members/:memberId", removeMember);
router.delete("/:id/leave", leaveGroup);
router.put("/:id/transfer-admin", transferAdminAndLeave);
router.delete("/:id", deleteGroup);

module.exports = router;
