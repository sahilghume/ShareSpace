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

module.exports = router;
