const { updateAssignmentStatus } = require("../../models/Chore");

async function testUpdateAssignmentStatus() {
    try {
        const result = await updateAssignmentStatus(1, "Completed");
        console.log(result);
    } catch (error) {
        console.log("Error:", error.message);
    }
}

testUpdateAssignmentStatus();