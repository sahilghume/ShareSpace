const Group = require("../models/Group");
const crypto = require("crypto");
const Chore = require("../models/Chore");

const createGroup = async (req, res) => {
  try {
    const { groupName } = req.body;
    const userId = req.user.id;

    if (!groupName || !groupName.trim()) {
      return res.status(400).json({
        success: false,
        message: "Group name is required",
      });
    }

    const existingGroups = await Group.getUserGroups(userId);

    if (existingGroups.length > 0) {
      return res.status(409).json({
        success: false,
        message:
          "You already belong to a group. Leave your current group before creating another.",
      });
    }

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

    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({
        success: false,
        message: "You already belong to a group.",
      });
    }

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

    const existingGroups = await Group.getUserGroups(userId);

    if (existingGroups.length > 0) {
      const alreadyMember = existingGroups.some(
        (item) => Number(item.group_id) === Number(group.group_id),
      );

      return res.status(409).json({
        success: false,
        message: alreadyMember
          ? "You are already a member of this group"
          : "You already belong to another group. Leave your current group before joining another.",
      });
    }

    await Group.addMember({
      group_id: group.group_id,
      user_id: userId,
      role: "member",
    });
    await Chore.resetGroupChoreRotation(group.group_id);

    return res.status(200).json({
      success: true,
      message: "Joined group successfully",
      group,
    });
  } catch (error) {
    console.error("Join Group Error:", error);

    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({
        success: false,
        message: "You already belong to a group.",
      });
    }

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

    const group = await Group.findById(groupId);

    if (!group) {
      return res.status(404).json({
        success: false,
        message: "Group not found",
      });
    }

    const member = await Group.findMember(groupId, userId);

    if (!member) {
      return res.status(403).json({
        success: false,
        message: "You are not a member of this group",
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
    const memberId = req.params.memberId;
    const userId = req.user.id;

    // Check admin permission
    const admin = await Group.findMember(groupId, userId);

    if (!admin || admin.role !== "admin") {
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
    await Chore.resetGroupChoreRotation(groupId);

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

    if (member.role === "admin") {
      return res.status(400).json({
        success: false,
        message: "Admin must transfer admin rights before leaving",
      });
    }

    await Group.leaveGroup(groupId, userId);
    await Chore.resetGroupChoreRotation(groupId);

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
const transferAdminAndLeave = async (req, res) => {
  try {
    const groupId = req.params.id;
    const currentAdminId = req.user.id;
    const { newAdminId } = req.body;

    if (!newAdminId || !Number.isInteger(Number(newAdminId))) {
      return res.status(400).json({
        success: false,
        message: "Please select a valid member",
      });
    }

    const admin = await Group.findMember(groupId, currentAdminId);

    if (!admin || admin.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Only the group admin can transfer admin rights",
      });
    }

    await Group.transferAdminAndLeave(
      groupId,
      currentAdminId,
      Number(newAdminId),
    );
    await Chore.resetGroupChoreRotation(groupId);

    return res.status(200).json({
      success: true,
      message: "Admin rights transferred and you left the group",
    });
  } catch (error) {
    console.error("Transfer Admin Error:", error);

    return res.status(400).json({
      success: false,
      message: error.message || "Unable to transfer admin rights",
    });
  }
};

const deleteGroup = async (req, res) => {
  try {
    const groupId = req.params.id;
    const adminId = req.user.id;

    const admin = await Group.findMember(groupId, adminId);

    if (!admin || admin.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Only the group admin can delete this group",
      });
    }

    await Group.deleteGroup(groupId, adminId);

    return res.status(200).json({
      success: true,
      message: "Group and all associated data deleted successfully",
    });
  } catch (error) {
    console.error("Delete Group Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Unable to delete group",
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
  transferAdminAndLeave,
  deleteGroup,
};
