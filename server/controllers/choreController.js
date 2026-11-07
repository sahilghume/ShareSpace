const Chore = require("../models/Chore");
const Group = require("../models/Group");

// 1. Create chore
const createChore = async (req, res) => {
  try {
    const { groupId, choreName, description, verifierId } = req.body;
    const userId = req.user.id;

    if (!groupId || !choreName || !choreName.trim()) {
      return res.status(400).json({
        success: false,
        message: "Group ID and chore name are required",
      });
    }

    const member = await Group.findMember(groupId, userId);

    if (!member) {
      return res.status(403).json({
        success: false,
        message: "Only group members can create chores",
      });
    }
    let verifierIdValue = null;

    if (verifierId) {
      const verifier = await Group.findMember(groupId, verifierId);

      if (!verifier) {
        return res.status(400).json({
          success: false,
          message: "Verifier must be a member of this group",
        });
      }

      verifierIdValue = verifierId;
    }

    const chore = await Chore.createChore({
      group_id: groupId,
      chore_name: choreName.trim(),
      description: description || null,
      created_by: userId,
      verifier_id: verifierIdValue,
    });

    return res.status(201).json({
      success: true,
      message: "Chore created successfully",
      chore,
    });
  } catch (error) {
    console.error("Create Chore Error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to create chore",
    });
  }
};

// 2. Get group chores
const getGroupChores = async (req, res) => {
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

    const chores = await Chore.getGroupChores(groupId);

    return res.status(200).json({
      success: true,
      count: chores.length,
      chores,
    });
  } catch (error) {
    console.error("Get Chores Error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to fetch chores",
    });
  }
};

// 3. Get chore by ID
const getChoreById = async (req, res) => {
  try {
    const choreId = req.params.id;
    const userId = req.user.id;

    const chore = await Chore.findById(choreId);

    if (!chore) {
      return res.status(404).json({
        success: false,
        message: "Chore not found",
      });
    }

    const member = await Group.findMember(chore.group_id, userId);

    if (!member) {
      return res.status(403).json({
        success: false,
        message: "You are not a member of this group",
      });
    }

    return res.status(200).json({
      success: true,
      chore,
    });
  } catch (error) {
    console.error("Get Chore Error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to fetch chore",
    });
  }
};

// 4. Update chore
const updateChore = async (req, res) => {
  try {
    const choreId = req.params.id;
    const userId = req.user.id;
    const { choreName, description, isActive } = req.body;

    const chore = await Chore.findById(choreId);

    if (!chore) {
      return res.status(404).json({
        success: false,
        message: "Chore not found",
      });
    }

    const member = await Group.findMember(chore.group_id, userId);

    if (!member || member.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Only group admin can update chores",
      });
    }

    const updateData = {};

    if (choreName !== undefined) {
      if (typeof choreName !== "string" || !choreName.trim()) {
        return res.status(400).json({
          success: false,
          message: "Invalid chore name",
        });
      }

      updateData.chore_name = choreName.trim();
    }

    if (description !== undefined) {
      updateData.description = description;
    }

    if (isActive !== undefined) {
      if (typeof isActive !== "boolean") {
        return res.status(400).json({
          success: false,
          message: "isActive must be true or false",
        });
      }

      updateData.is_active = isActive;
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        message: "Provide at least one field to update",
      });
    }

    await Chore.updateChore(choreId, updateData);

    return res.status(200).json({
      success: true,
      message: "Chore updated successfully",
    });
  } catch (error) {
    console.error("Update Chore Error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to update chore",
    });
  }
};

// 5. Delete chore
const deleteChore = async (req, res) => {
  try {
    const choreId = req.params.id;
    const userId = req.user.id;

    const chore = await Chore.findById(choreId);

    if (!chore) {
      return res.status(404).json({
        success: false,
        message: "Chore not found",
      });
    }

    const member = await Group.findMember(chore.group_id, userId);

    if (!member || member.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Only group admin can delete chores",
      });
    }

    await Chore.deleteChore(choreId);

    return res.status(200).json({
      success: true,
      message: "Chore deleted successfully",
    });
  } catch (error) {
    console.error("Delete Chore Error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to delete chore",
    });
  }
};

// 6. Assign chore
const assignChore = async (req, res) => {
  try {
    const { choreId, assignedTo, assignedDate, dueDate, priority } = req.body;
    const userId = req.user.id;

    if (!choreId || !assignedTo || !assignedDate || !dueDate) {
      return res.status(400).json({
        success: false,
        message: "Chore, assigned member and date are required",
      });
    }

    const chore = await Chore.findById(choreId);

    if (!chore || !chore.is_active) {
      return res.status(404).json({
        success: false,
        message: "Active chore not found",
      });
    }

    const member = await Group.findMember(chore.group_id, userId);

    if (!member) {
      return res.status(403).json({
        success: false,
        message: "Only group members can assign chores",
      });
    }

    const assignedMember = await Group.findMember(chore.group_id, assignedTo);

    if (!assignedMember) {
      return res.status(400).json({
        success: false,
        message: "Assigned user is not a group member",
      });
    }

    const assignment = await Chore.createAssignment({
      chore_id: choreId,
      group_id: chore.group_id,
      assigned_to: assignedTo,
      assigned_date: assignedDate,
      due_date: dueDate,
      priority: priority || "Medium",
    });

    return res.status(201).json({
      success: true,
      message: "Chore assigned successfully",
      assignment,
    });
  } catch (error) {
    console.error("Assign Chore Error:", error);

    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({
        success: false,
        message: "This chore is already assigned for that date",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Unable to assign chore",
    });
  }
};

// 7. Get daily assignments
const getDailyAssignments = async (req, res) => {
  try {
    const groupId = req.params.groupId;
    const date = req.query.date;
    const userId = req.user.id;

    const member = await Group.findMember(groupId, userId);

    if (!member) {
      return res.status(403).json({
        success: false,
        message: "You are not a member of this group",
      });
    }

    const assignments = await Chore.getDailyAssignments(groupId, date);

    return res.status(200).json({
      success: true,
      count: assignments.length,
      assignments,
    });
  } catch (error) {
    console.error("Get Assignments Error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to fetch assignments",
    });
  }
};

// 8. Update assignment status
const updateChoreStatus = async (req, res) => {
  try {
    const assignmentId = req.params.id;
    const { status } = req.body;
    const userId = req.user.id;

    if (!["Pending", "Completed"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status must be Pending or Completed",
      });
    }

    const assignment = await Chore.findAssignment(assignmentId);

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: "Assignment not found",
      });
    }

    const member = await Group.findMember(assignment.group_id, userId);

    if (!member) {
      return res.status(403).json({
        success: false,
        message: "You are not a member of this group",
      });
    }

    // Only assigned member or admin can update status
    if (
      Number(assignment.assigned_to) !== Number(userId) &&
      member.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "You cannot update this assignment",
      });
    }

    await Chore.updateAssignmentStatus(assignmentId, status);

    return res.status(200).json({
      success: true,
      message: "Chore status updated successfully",
    });
  } catch (error) {
    console.error("Update Chore Status Error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to update chore status",
    });
  }
};

const submitChoreForVerification = async (req, res) => {
  try {
    const assignmentId = req.params.id;
    const userId = req.user.id;

    const assignment = await Chore.findAssignment(assignmentId);

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: "Assignment not found",
      });
    }

    if (Number(assignment.assigned_to) !== Number(userId)) {
      return res.status(403).json({
        success: false,
        message: "Only the assigned member can submit this chore",
      });
    }

    if (assignment.status !== "Pending") {
      return res.status(400).json({
        success: false,
        message: "Only pending chores can be submitted",
      });
    }

    await Chore.submitForVerification(assignmentId, userId);

    return res.status(200).json({
      success: true,
      message: "Chore submitted for verification",
    });
  } catch (error) {
    console.error("Submit Chore Error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to submit chore",
    });
  }
};

const approveChore = async (req, res) => {
  try {
    const assignmentId = req.params.id;
    const userId = req.user.id;

    const assignment = await Chore.findAssignment(assignmentId);

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: "Assignment not found",
      });
    }

    if (
      Number(assignment.created_by) !== Number(userId) &&
      Number(assignment.verifier_id) !== Number(userId)
    ) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to verify this chore",
      });
    }

    if (assignment.status !== "Awaiting Verification") {
      return res.status(400).json({
        success: false,
        message: "Chore is not awaiting verification",
      });
    }

    await Chore.approveChore(assignmentId, userId);

    return res.status(200).json({
      success: true,
      message: "Chore approved successfully",
    });
  } catch (error) {
    console.error("Approve Chore Error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to approve chore",
    });
  }
};
module.exports = {
  createChore,
  getGroupChores,
  getChoreById,
  updateChore,
  deleteChore,
  assignChore,
  getDailyAssignments,
  updateChoreStatus,
  submitChoreForVerification,
  approveChore,
};
