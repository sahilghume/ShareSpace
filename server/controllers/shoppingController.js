const ShoppingItem = require("../models/ShoppingItem");
const Group = require("../models/Group");

// 1. Add shopping item
const addShoppingItem = async (req, res) => {
  try {
    const { groupId, itemName, quantity } = req.body;
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

    const member = await Group.findMember(groupId, userId);

    if (!member) {
      return res.status(403).json({
        success: false,
        message: "You are not a member of this group",
      });
    }

    const item = await ShoppingItem.createItem({
      group_id: groupId,
      item_name: itemName.trim(),
      quantity: quantity || 1,
      added_by: userId,
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

// 4. Update shopping item status
const updateItemStatus = async (req, res) => {
  try {
    const itemId = req.params.id;
    const { status } = req.body;
    const userId = req.user.id;

    if (!["Needed", "Purchased"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status must be Needed or Purchased",
      });
    }

    const item = await ShoppingItem.findById(itemId);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Shopping item not found",
      });
    }

    const member = await Group.findMember(item.group_id, userId);

    if (!member) {
      return res.status(403).json({
        success: false,
        message: "You are not a member of this group",
      });
    }

    await ShoppingItem.updateStatus(itemId, status);

    return res.status(200).json({
      success: true,
      message: "Shopping item status updated successfully",
    });
  } catch (error) {
    console.error("Update Shopping Status Error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to update shopping status",
    });
  }
};

// 5. Delete shopping item
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

    const member = await Group.findMember(item.group_id, userId);

    if (!member || member.admin !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Only group admin can delete shopping items",
      });
    }

    await ShoppingItem.deleteItem(itemId);

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
  updateItemStatus,
  deleteShoppingItem,
};
