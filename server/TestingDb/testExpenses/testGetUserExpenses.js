const { getUserExpenses } = require("../../models/Expense");

async function testGetUserExpenses() {

    try {
        const result = await getUserExpenses(1);
        console.log(result);

    } catch (error) {
        console.log("Error:", error.message);
    }
}

testGetUserExpenses();