const {
    approveChore
} = require("../../models/Chore");

async function testApproveChore() {
    try {
        const result = await approveChore(4, 1);
        console.log(result);
    } catch (error) {
        console.log("Error:", error.message);
    }
}

testApproveChore();