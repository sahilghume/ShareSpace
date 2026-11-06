const Expense = require("../models/Expense");
const Group = require("../models/Group");

const addExpense = async (req, res) => {
  try {
    const { groupId, title, amount, category, expenseDate, splitBetween } =
      req.body;

    const userId = req.user.id;

    // Validate required fields
    if (!groupId || !title || !amount || !expenseDate) {
      return res.status(400).json({
        success: false,
        message: "Group, title, amount and expense date are required",
      });
    }

    if (Number(groupId) <= 0 || !Number.isInteger(Number(groupId))) {
      return res.status(400).json({
        success: false,
        message: "Invalid group ID",
      });
    }

    if (!Number.isFinite(Number(amount)) || Number(amount) <= 0) {
      return res.status(400).json({
        success: false,
        message: "Amount must be greater than zero",
      });
    }

    if (title.trim().length > 150) {
      return res.status(400).json({
        success: false,
        message: "Title cannot exceed 150 characters",
      });
    }

    if (!Array.isArray(splitBetween) || splitBetween.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Select at least one member for expense splitting",
      });
    }

    // Check group membership
    const member = await Group.findMember(groupId, userId);

    if (!member) {
      return res.status(403).json({
        success: false,
        message: "You are not a member of this group",
      });
    }

    // Validate member IDs
    const uniqueMembers = [...new Set(splitBetween.map(Number))];

    if (
      uniqueMembers.length !== splitBetween.length ||
      uniqueMembers.some((id) => !Number.isInteger(id) || id <= 0)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid or duplicate member IDs",
      });
    }

    // Check whether selected members belong to the group
    for (const memberId of uniqueMembers) {
      const groupMember = await Group.findMember(groupId, memberId);

      if (!groupMember) {
        return res.status(400).json({
          success: false,
          message: `User ${memberId} is not a member of this group`,
        });
      }
    }

    // Calculate equal shares in paise to avoid rounding errors
    const totalPaise = Math.round(Number(amount) * 100);
    const baseShare = Math.floor(totalPaise / uniqueMembers.length);
    const remainder = totalPaise % uniqueMembers.length;

    const splits = uniqueMembers.map((memberId, index) => ({
      user_id: memberId,
      share_amount: (baseShare + (index < remainder ? 1 : 0)) / 100,
    }));

    // Prepare expense data
    const expenseData = {
      group_id: Number(groupId),
      paid_by: userId,
      title: title.trim(),
      amount: Number(amount),
      category: category || null,
      expense_date: expenseDate,
    };

    // Save expense and splits
    const expense = await Expense.createExpenseWithSplits(expenseData, splits);

    return res.status(201).json({
      success: true,
      message: "Expense added successfully",
      expense,
      splits,
    });
  } catch (error) {
    console.error("Add Expense Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to add expense",
    });
  }
};

const getGroupExpenses = async (req, res) => {
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

    const expenses = await Expense.getGroupExpenses(groupId);

    return res.status(200).json({
      success: true,
      count: expenses.length,
      expenses,
    });
  } catch (error) {
    console.error("Get Group Expenses Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch expenses",
    });
  }
};

const getExpenseById = async (req, res) => {
  try {
    const expenseId = req.params.id;
    const userId = req.user.id;

    const expense = await Expense.findById(expenseId);

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: "Expense not found",
      });
    }

    const member = await Group.findMember(expense.group_id, userId);

    if (!member) {
      return res.status(403).json({
        success: false,
        message: "You are not a member of this group",
      });
    }

    return res.status(200).json({
      success: true,
      expense,
    });
  } catch (error) {
    console.error("Get Expense Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch expense",
    });
  }
};

const updateExpense = async (req, res) => {
  try {
    const expenseId = req.params.id;
    const userId = req.user.id;

    const { title, amount, category, expenseDate } = req.body;

    const expense = await Expense.findById(expenseId);

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: "Expense not found",
      });
    }

    const member = await Group.findMember(expense.group_id, userId);

    if (!member) {
      return res.status(403).json({
        success: false,
        message: "You are not a member of this group",
      });
    }

    // Only payer or admin can update
    if (Number(expense.paid_by) !== Number(userId) && member.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Only the payer or group admin can update this expense",
      });
    }

    const updateData = {};

    if (title !== undefined) {
      if (!title.trim() || title.trim().length > 150) {
        return res.status(400).json({
          success: false,
          message: "Invalid expense title",
        });
      }

      updateData.title = title.trim();
    }

    if (amount !== undefined) {
      if (!Number.isFinite(Number(amount)) || Number(amount) <= 0) {
        return res.status(400).json({
          success: false,
          message: "Amount must be greater than zero",
        });
      }

      updateData.amount = Number(amount);
    }

    if (category !== undefined) {
      updateData.category = category || null;
    }

    if (expenseDate !== undefined) {
      updateData.expense_date = expenseDate;
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        message: "Provide at least one field to update",
      });
    }

    // Note: If amount changes, the model should also
    // recalculate and update the expense splits transactionally.

    await Expense.updateExpense(expenseId, updateData);

    return res.status(200).json({
      success: true,
      message: "Expense updated successfully",
    });
  } catch (error) {
    console.error("Update Expense Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to update expense",
    });
  }
};

const deleteExpense = async (req, res) => {
  try {
    const expenseId = req.params.id;
    const userId = req.user.id;

    const expense = await Expense.findById(expenseId);

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: "Expense not found",
      });
    }

    const member = await Group.findMember(expense.group_id, userId);

    if (!member) {
      return res.status(403).json({
        success: false,
        message: "You are not a member of this group",
      });
    }

    // Only payer or admin can delete
    if (Number(expense.paid_by) !== Number(userId) && member.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Only the payer or group admin can delete this expense",
      });
    }

    await Expense.deleteExpense(expenseId);

    return res.status(200).json({
      success: true,
      message: "Expense deleted successfully",
    });
  } catch (error) {
    console.error("Delete Expense Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to delete expense",
    });
  }
};

const getExpenseSplits = async (req, res) => {
  try {
    const expenseId = req.params.id;
    const userId = req.user.id;

    const expense = await Expense.findById(expenseId);

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: "Expense not found",
      });
    }

    const member = await Group.findMember(expense.group_id, userId);

    if (!member) {
      return res.status(403).json({
        success: false,
        message: "You are not a member of this group",
      });
    }

    const splits = await Expense.getExpenseSplits(expenseId);

    return res.status(200).json({
      success: true,
      splits,
    });
  } catch (error) {
    console.error("Get Expense Splits Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch expense splits",
    });
  }
};

const getMyExpenses = async (req, res) => {
  try {
    const userId = req.user.id;

    const expenses = await Expense.getUserExpenses(userId);

    return res.status(200).json({
      success: true,
      count: expenses.length,
      expenses,
    });
  } catch (error) {
    console.error("Get My Expenses Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch your expenses",
    });
  }
};

module.exports = {
  addExpense,
  getGroupExpenses,
  getExpenseById,
  updateExpense,
  deleteExpense,
  getExpenseSplits,
  getMyExpenses,
};
