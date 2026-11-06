const { getDailyAssignments } = require("../../models/Chore");

async function testGetDailyAssignments() {
    try {
        const result = await getDailyAssignments(1, "2026-11-06");
        console.log(result);
    } catch (error) {
        console.log("Error:", error.message);
    }
}

testGetDailyAssignments();