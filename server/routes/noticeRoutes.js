const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
  createNotice,
  getGroupNotices,
  getNoticeById,
  updateNotice,
  deleteNotice,
} = require("../controllers/noticeController");

router.use(authMiddleware);

// Notice routes
router.post("/", createNotice);
router.get("/group/:groupId", getGroupNotices);
router.get("/:id", getNoticeById);
router.put("/:id", updateNotice);
router.delete("/:id", deleteNotice);

module.exports = router;
