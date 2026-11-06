const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
  addExpense,
  getGroupExpenses,
  getExpenseById,
  updateExpense,
  deleteExpense,
  getExpenseSplits,
  getMyExpenses,
} = require("../controllers/expenseController");

router.use(authMiddleware);

// Expense routes
router.post("/", addExpense);
router.get("/my-expenses", getMyExpenses);
router.get("/group/:groupId", getGroupExpenses);
router.get("/:id/splits", getExpenseSplits);
router.get("/:id", getExpenseById);
router.put("/:id", updateExpense);
router.delete("/:id", deleteExpense);

module.exports = router;
