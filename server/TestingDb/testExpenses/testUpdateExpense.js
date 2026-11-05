const { updateExpense } = require("../../models/Expense");

async function testUpdateExpense() {

    try {
        const expenseId = 1;

        const data = {
            title: "Monthly Groceries Updated",
            amount: 1000,
            category: "Food",
            expense_date: "2026-11-05"
        };

        const result = await updateExpense(expenseId, data);

        console.log(result);

    } catch (error) {
        console.log("Error:", error.message);
    }
}

testUpdateExpense();