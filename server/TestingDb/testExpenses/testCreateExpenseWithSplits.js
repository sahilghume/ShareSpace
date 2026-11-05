const {
    createExpenseWithSplits
} = require("../../models/Expense");

async function testCreateExpenseWithSplits() {

    try {

        const expenseData = {
            group_id: 1,
            paid_by: 1,
            title: "Monthly Groceries",
            amount: 900,
            category: "Food",
            expense_date: "2026-11-05"
        };

        const splits = [
            { user_id: 1, share_amount: 450 },
            { user_id: 2, share_amount: 450 }
        ];

        const result = await createExpenseWithSplits(
            expenseData,
            splits
        );

        console.log(result);

    } catch (error) {

        console.log("Error:", error.message);

    }
}

testCreateExpenseWithSplits();