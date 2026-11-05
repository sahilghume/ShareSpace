const Notice = require("../models/Notice");
const Group = require("../models/Group");

// 1. Create notice
const createNotice = async (req, res) => {
  try {
    const { groupId, title, message } = req.body;
    const userId = req.user.id;

    if (
      !groupId ||
      typeof title !== "string" ||
      !title.trim() ||
      typeof message !== "string" ||
      !message.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Group ID, title and message are required",
      });
    }

    const member = await Group.findMember(groupId, userId);

    if (!member) {
      return res.status(403).json({
        success: false,
        message: "You are not a member of this group",
      });
    }

    const notice = await Notice.createNotice({
      group_id: groupId,
      posted_by: userId,
      title: title.trim(),
      message: message.trim(),
    });

    return res.status(201).json({
      success: true,
      message: "Notice created successfully",
      notice,
    });
  } catch (error) {
    console.error("Create Notice Error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to create notice",
    });
  }
};

// 2. Get group notices
const getGroupNotices = async (req, res) => {
  try {
    const groupId = req.params.groupId;
    const userId = req.user.id;

    const member = await Group.findMember(groupId, userId);

    if (!member) {
      return res.status(403).json({
        success: false,
        message: "You are not a member of this group",
      });
    }

    const notices = await Notice.getGroupNotices(groupId);

    return res.status(200).json({
      success: true,
      count: notices.length,
      notices,
    });
  } catch (error) {
    console.error("Get Notices Error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to fetch notices",
    });
  }
};

// 3. Get notice by ID
const getNoticeById = async (req, res) => {
  try {
    const noticeId = req.params.id;
    const userId = req.user.id;

    const notice = await Notice.findById(noticeId);

    if (!notice) {
      return res.status(404).json({
        success: false,
        message: "Notice not found",
      });
    }

    const member = await Group.findMember(notice.group_id, userId);

    if (!member) {
      return res.status(403).json({
        success: false,
        message: "You are not a member of this group",
      });
    }

    return res.status(200).json({
      success: true,
      notice,
    });
  } catch (error) {
    console.error("Get Notice Error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to fetch notice",
    });
  }
};

// 4. Update notice
const updateNotice = async (req, res) => {
  try {
    const noticeId = req.params.id;
    const userId = req.user.id;
    const { title, message } = req.body;

    const notice = await Notice.findById(noticeId);

    if (!notice) {
      return res.status(404).json({
        success: false,
        message: "Notice not found",
      });
    }

    const member = await Group.findMember(notice.group_id, userId);

    if (!member) {
      return res.status(403).json({
        success: false,
        message: "You are not a member of this group",
      });
    }

    const updateData = {};

    if (title !== undefined) {
      if (typeof title !== "string" || !title.trim()) {
        return res.status(400).json({
          success: false,
          message: "Invalid notice title",
        });
      }

      updateData.title = title.trim();
    }

    if (message !== undefined) {
      if (typeof message !== "string" || !message.trim()) {
        return res.status(400).json({
          success: false,
          message: "Invalid notice message",
        });
      }

      updateData.message = message.trim();
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        message: "Provide title or message to update",
      });
    }

    await Notice.updateNotice(noticeId, updateData);

    return res.status(200).json({
      success: true,
      message: "Notice updated successfully",
    });
  } catch (error) {
    console.error("Update Notice Error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to update notice",
    });
  }
};

// 5. Delete notice
const deleteNotice = async (req, res) => {
  try {
    const noticeId = req.params.id;
    const userId = req.user.id;

    const notice = await Notice.findById(noticeId);

    if (!notice) {
      return res.status(404).json({
        success: false,
        message: "Notice not found",
      });
    }

    const member = await Group.findMember(notice.group_id, userId);

    if (!member) {
      return res.status(403).json({
        success: false,
        message: "You are not a member of this group",
      });
    }

    await Notice.deleteNotice(noticeId);

    return res.status(200).json({
      success: true,
      message: "Notice deleted successfully",
    });
  } catch (error) {
    console.error("Delete Notice Error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to delete notice",
    });
  }
};

module.exports = {
  createNotice,
  getGroupNotices,
  getNoticeById,
  updateNotice,
  deleteNotice,
};
