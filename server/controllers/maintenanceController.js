const Maintenance = require("../models/Maintenance");
const Group = require("../models/Group");

// 1. Create maintenance request
const createRequest = async (req, res) => {
  try {
    const { groupId, title, description } = req.body;
    const userId = req.user.id;

    if (!groupId || typeof title !== "string" || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: "Group ID and title are required",
      });
    }

    const member = await Group.findMember(groupId, userId);

    if (!member) {
      return res.status(403).json({
        success: false,
        message: "You are not a member of this group",
      });
    }

    const request = await Maintenance.createRequest({
      group_id: groupId,
      reported_by: userId,
      title: title.trim(),
      description: description || null,
    });

    return res.status(201).json({
      success: true,
      message: "Maintenance request created successfully",
      request,
    });
  } catch (error) {
    console.error("Create Maintenance Request Error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to create maintenance request",
    });
  }
};

// 2. Get group maintenance requests
const getGroupRequests = async (req, res) => {
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

    const requests = await Maintenance.getGroupRequests(groupId);

    return res.status(200).json({
      success: true,
      count: requests.length,
      requests,
    });
  } catch (error) {
    console.error("Get Maintenance Requests Error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to fetch maintenance requests",
    });
  }
};

// 3. Get request by ID
const getRequestById = async (req, res) => {
  try {
    const requestId = req.params.id;
    const userId = req.user.id;

    const request = await Maintenance.findById(requestId);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Maintenance request not found",
      });
    }

    const member = await Group.findMember(request.group_id, userId);

    if (!member) {
      return res.status(403).json({
        success: false,
        message: "You are not a member of this group",
      });
    }

    return res.status(200).json({
      success: true,
      request,
    });
  } catch (error) {
    console.error("Get Maintenance Request Error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to fetch maintenance request",
    });
  }
};

// 4. Update request details
const updateRequest = async (req, res) => {
  try {
    const requestId = req.params.id;
    const userId = req.user.id;
    const { title, description } = req.body;

    const request = await Maintenance.findById(requestId);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Maintenance request not found",
      });
    }

    const member = await Group.findMember(request.group_id, userId);

    if (
      !member ||
      (Number(request.reported_by) !== Number(userId) &&
        member.admin !== "admin")
    ) {
      return res.status(403).json({
        success: false,
        message: "Only the reporter or group admin can update this request",
      });
    }

    const updateData = {};

    if (title !== undefined) {
      if (typeof title !== "string" || !title.trim()) {
        return res.status(400).json({
          success: false,
          message: "Invalid title",
        });
      }

      updateData.title = title.trim();
    }

    if (description !== undefined) {
      updateData.description = description;
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        message: "Provide at least one field to update",
      });
    }

    await Maintenance.updateRequest(requestId, updateData);

    return res.status(200).json({
      success: true,
      message: "Maintenance request updated successfully",
    });
  } catch (error) {
    console.error("Update Maintenance Request Error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to update maintenance request",
    });
  }
};

// 5. Update request status
const updateRequestStatus = async (req, res) => {
  try {
    const requestId = req.params.id;
    const { status } = req.body;
    const userId = req.user.id;

    if (!["Pending", "In Progress", "Resolved"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid maintenance request status",
      });
    }

    const request = await Maintenance.findById(requestId);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Maintenance request not found",
      });
    }

    const member = await Group.findMember(request.group_id, userId);

    if (!member || member.admin !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Only group admin can update request status",
      });
    }

    await Maintenance.updateStatus(requestId, status);

    return res.status(200).json({
      success: true,
      message: "Maintenance request status updated successfully",
    });
  } catch (error) {
    console.error("Update Maintenance Status Error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to update maintenance status",
    });
  }
};

// 6. Delete request
const deleteRequest = async (req, res) => {
  try {
    const requestId = req.params.id;
    const userId = req.user.id;

    const request = await Maintenance.findById(requestId);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Maintenance request not found",
      });
    }

    const member = await Group.findMember(request.group_id, userId);

    if (
      !member ||
      (Number(request.reported_by) !== Number(userId) &&
        member.admin !== "admin")
    ) {
      return res.status(403).json({
        success: false,
        message: "Only the reporter or group admin can delete this request",
      });
    }

    await Maintenance.deleteRequest(requestId);

    return res.status(200).json({
      success: true,
      message: "Maintenance request deleted successfully",
    });
  } catch (error) {
    console.error("Delete Maintenance Request Error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to delete maintenance request",
    });
  }
};

module.exports = {
  createRequest,
  getGroupRequests,
  getRequestById,
  updateRequest,
  updateRequestStatus,
  deleteRequest,
};
