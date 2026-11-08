const ShoppingItem = require("../models/ShoppingItem");
const Group = require("../models/Group");

// 1. Add shopping item
const addShoppingItem = async (req, res) => {
  try {
    const { groupId, itemName, quantity, assignedTo, verifierId } = req.body;

    const userId = req.user.id;

    if (!groupId || typeof itemName !== "string" || !itemName.trim()) {
      return res.status(400).json({
        success: false,
        message: "Group ID and item name are required",
      });
    }

    if (
      quantity !== undefined &&
      (!Number.isInteger(Number(quantity)) || Number(quantity) < 1)
    ) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be a positive integer",
      });
    }

    if (!assignedTo) {
      return res.status(400).json({
        success: false,
        message: "Assigned member is required",
      });
    }

    const member = await Group.findMember(groupId, userId);

    if (!member) {
      return res.status(403).json({
        success: false,
        message: "You are not a member of this group",
      });
    }

    const assignedMember = await Group.findMember(groupId, assignedTo);

    if (!assignedMember) {
      return res.status(400).json({
        success: false,
        message: "Assigned user must be a group member",
      });
    }

    if (Number(assignedTo) === Number(userId)) {
      return res.status(400).json({
        success: false,
        message: "You cannot assign the item to yourself",
      });
    }

    let verifierIdValue = null;

    if (verifierId) {
      const verifier = await Group.findMember(groupId, verifierId);

      if (!verifier) {
        return res.status(400).json({
          success: false,
          message: "Verifier must be a group member",
        });
      }

      if (
        Number(verifierId) === Number(assignedTo) ||
        Number(verifierId) === Number(userId)
      ) {
        return res.status(400).json({
          success: false,
          message: "Verifier must be different from creator and assignee",
        });
      }

      verifierIdValue = verifierId;
    }

    const item = await ShoppingItem.createItem({
      group_id: groupId,
      item_name: itemName.trim(),
      quantity: quantity ?? 1,
      added_by: userId,
      assigned_to: assignedTo,
      verifier_id: verifierIdValue,
    });

    return res.status(201).json({
      success: true,
      message: "Shopping item added successfully",
      item,
    });
  } catch (error) {
    console.error("Add Shopping Item Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to add shopping item",
    });
  }
};

// 2. Get group shopping items
const getShoppingItems = async (req, res) => {
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

    const items = await ShoppingItem.getGroupItems(groupId);

    return res.status(200).json({
      success: true,
      count: items.length,
      items,
    });
  } catch (error) {
    console.error("Get Shopping Items Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch shopping items",
    });
  }
};

// 3. Update shopping item
const updateShoppingItem = async (req, res) => {
  try {
    const itemId = req.params.id;
    const { itemName, quantity } = req.body;
    const userId = req.user.id;

    const item = await ShoppingItem.findById(itemId);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Shopping item not found",
      });
    }

    if (Number(item.added_by) !== Number(userId)) {
      return res.status(403).json({
        success: false,
        message: "Only the creator can update this item",
      });
    }

    const member = await Group.findMember(item.group_id, userId);

    if (!member) {
      return res.status(403).json({
        success: false,
        message: "You are not a member of this group",
      });
    }

    const updateData = {};

    if (itemName !== undefined) {
      if (typeof itemName !== "string" || !itemName.trim()) {
        return res.status(400).json({
          success: false,
          message: "Invalid item name",
        });
      }

      updateData.item_name = itemName.trim();
    }

    if (quantity !== undefined) {
      if (!Number.isInteger(Number(quantity)) || Number(quantity) < 1) {
        return res.status(400).json({
          success: false,
          message: "Quantity must be a positive integer",
        });
      }

      updateData.quantity = Number(quantity);
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        message: "Provide item name or quantity to update",
      });
    }

    await ShoppingItem.updateItem(itemId, updateData);

    return res.status(200).json({
      success: true,
      message: "Shopping item updated successfully",
    });
  } catch (error) {
    console.error("Update Shopping Item Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to update shopping item",
    });
  }
};

// 4. Submit item for verification
const submitItemForVerification = async (req, res) => {
  try {
    const itemId = req.params.id;
    const userId = req.user.id;

    const item = await ShoppingItem.findById(itemId);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Shopping item not found",
      });
    }

    if (Number(item.assigned_to) !== Number(userId)) {
      return res.status(403).json({
        success: false,
        message: "Only the assigned member can submit this item",
      });
    }

    if (item.status !== "Pending") {
      return res.status(400).json({
        success: false,
        message: "Only pending items can be submitted",
      });
    }

    await ShoppingItem.submitForVerification(itemId, userId);

    return res.status(200).json({
      success: true,
      message: "Item submitted for verification successfully",
    });
  } catch (error) {
    console.error("Submit Shopping Item Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to submit item for verification",
    });
  }
};

// 5. Approve shopping item
const approveShoppingItem = async (req, res) => {
  try {
    const itemId = req.params.id;
    const userId = req.user.id;

    const item = await ShoppingItem.findById(itemId);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Shopping item not found",
      });
    }

    if (
      Number(item.added_by) !== Number(userId) &&
      Number(item.verifier_id) !== Number(userId)
    ) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to verify this item",
      });
    }

    if (item.status !== "Awaiting Verification") {
      return res.status(400).json({
        success: false,
        message: "Item is not awaiting verification",
      });
    }

    await ShoppingItem.approveItem(itemId, userId);

    return res.status(200).json({
      success: true,
      message: "Shopping item approved successfully",
    });
  } catch (error) {
    console.error("Approve Shopping Item Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to approve shopping item",
    });
  }
};

// 6. Delete shopping item
const deleteShoppingItem = async (req, res) => {
  try {
    const itemId = req.params.id;
    const userId = req.user.id;

    const item = await ShoppingItem.findById(itemId);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Shopping item not found",
      });
    }

    if (Number(item.added_by) !== Number(userId)) {
      return res.status(403).json({
        success: false,
        message: "Only the creator can delete this item",
      });
    }

    await ShoppingItem.deleteItem(itemId, userId);

    return res.status(200).json({
      success: true,
      message: "Shopping item deleted successfully",
    });
  } catch (error) {
    console.error("Delete Shopping Item Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to delete shopping item",
    });
  }
};

module.exports = {
  addShoppingItem,
  getShoppingItems,
  updateShoppingItem,
  submitItemForVerification,
  approveShoppingItem,
  deleteShoppingItem,
};
