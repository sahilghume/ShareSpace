const { deleteExpense } = require("../../models/Expense");

async function testDeleteExpense() {
    try {
        const result = await deleteExpense(1);
        console.log(result);
    } catch (error) {
        console.log("Error:", error.message);
    }
}

testDeleteExpense();