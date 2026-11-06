const { getGroupExpenses } = require("../../models/Expense");

async function testGetGroupExpenses() {
    try {
        const result = await getGroupExpenses(1);
        console.log("Group Expenses:", result);
    } catch (error) {
        console.log("Error:", error.message);
    }
}

testGetGroupExpenses();