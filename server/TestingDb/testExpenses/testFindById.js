const { findById } = require("../../models/Expense");

async function testFindById() {

    try {

        const result = await findById(1);

        console.log("Expense Details:", result);

    } catch (error) {

        console.log("Error:", error.message);

    }
}

testFindById();