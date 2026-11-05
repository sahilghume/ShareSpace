const Group = require("../models/Group");

const createGroup = async (req, res) => {
  try {
    const { groupName } = req.body;

    if (!groupName || !groupName.trim()) {
      return res.status(400).json({
        success: false,
        message: "Group name is required",
      });
    }

    const userId = req.user.id;

    // Generate a unique group code
    const crypto = require("crypto");
    const groupCode = crypto.randomBytes(4).toString("hex").toUpperCase();

    const group = await Group.createGroupWithAdmin({
      group_name: groupName.trim(),
      group_code: groupCode,
      created_by: userId,
    });

    return res.status(201).json({
      success: true,
      message: "Group created successfully",
      group,
    });
  } catch (error) {
    console.error("Create Group Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to create group",
    });
  }
};

const joinGroup = async (req, res) => {
  try {
    const { groupCode } = req.body;
    const userId = req.user.id;

    if (!groupCode || !groupCode.trim()) {
      return res.status(400).json({
        success: false,
        message: "Group code is required",
      });
    }

    const group = await Group.findByCode(groupCode.trim());

    if (!group) {
      return res.status(404).json({
        success: false,
        message: "Invalid group code",
      });
    }

    const existingMember = await Group.findMember(group.group_id, userId);

    if (existingMember) {
      return res.status(409).json({
        success: false,
        message: "You are already a member of this group",
      });
    }

    await Group.addMember({
      group_id: group.group_id,
      user_id: userId,
      admin: "member",
    });

    return res.status(200).json({
      success: true,
      message: "Joined group successfully",
      group,
    });
  } catch (error) {
    console.error("Join Group Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to join group",
    });
  }
};

const getMyGroups = async (req, res) => {
  try {
    const userId = req.user.id;

    const groups = await Group.getUserGroups(userId);

    return res.status(200).json({
      success: true,
      count: groups.length,
      groups,
    });
  } catch (error) {
    console.error("Get My Groups Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch groups",
    });
  }
};

const getGroupDetails = async (req, res) => {
  try {
    const groupId = req.params.id;
    const userId = req.user.id;

    const member = await Group.findMember(groupId, userId);

    if (!member) {
      return res.status(403).json({
        success: false,
        message: "You are not a member of this group",
      });
    }

    const group = await Group.findById(groupId);

    if (!group) {
      return res.status(404).json({
        success: false,
        message: "Group not found",
      });
    }

    return res.status(200).json({
      success: true,
      group,
    });
  } catch (error) {
    console.error("Get Group Details Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch group details",
    });
  }
};

const getGroupMembers = async (req, res) => {
  try {
    const groupId = req.params.id;
    const userId = req.user.id;

    const member = await Group.findMember(groupId, userId);

    if (!member) {
      return res.status(403).json({
        success: false,
        message: "You are not a member of this group",
      });
    }

    const members = await Group.getMembers(groupId);

    return res.status(200).json({
      success: true,
      count: members.length,
      members,
    });
  } catch (error) {
    console.error("Get Group Members Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch group members",
    });
  }
};

const removeMember = async (req, res) => {
  try {
    const groupId = req.params.id;
    const memberId = req.params.userId;
    const userId = req.user.id;

    // Check admin permission
    const admin = await Group.findMember(groupId, userId);

    if (!admin || admin.admin !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Only group admin can remove members",
      });
    }

    // Admin cannot remove themselves
    if (Number(memberId) === Number(userId)) {
      return res.status(400).json({
        success: false,
        message: "Admin cannot remove themselves using this operation",
      });
    }

    const member = await Group.findMember(groupId, memberId);

    if (!member) {
      return res.status(404).json({
        success: false,
        message: "Member not found",
      });
    }

    await Group.removeMember(groupId, memberId);

    return res.status(200).json({
      success: true,
      message: "Member removed successfully",
    });
  } catch (error) {
    console.error("Remove Member Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to remove member",
    });
  }
};

const leaveGroup = async (req, res) => {
  try {
    const groupId = req.params.id;
    const userId = req.user.id;

    const member = await Group.findMember(groupId, userId);

    if (!member) {
      return res.status(404).json({
        success: false,
        message: "You are not a member of this group",
      });
    }

    if (member.admin === "admin") {
      return res.status(400).json({
        success: false,
        message: "Admin must transfer admin rights before leaving",
      });
    }

    await Group.leaveGroup(groupId, userId);

    return res.status(200).json({
      success: true,
      message: "You left the group successfully",
    });
  } catch (error) {
    console.error("Leave Group Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to leave group",
    });
  }
};

module.exports = {
  createGroup,
  joinGroup,
  getMyGroups,
  getGroupDetails,
  getGroupMembers,
  removeMember,
  leaveGroup,
};
