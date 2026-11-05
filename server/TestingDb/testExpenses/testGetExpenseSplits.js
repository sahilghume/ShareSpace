const { getExpenseSplits } = require("../../models/Expense");

async function testGetExpenseSplits() {

    try {
        const result = await getExpenseSplits(1);
        console.log(result);

    } catch (error) {
        console.log("Error:", error.message);
    }
}

testGetExpenseSplits();