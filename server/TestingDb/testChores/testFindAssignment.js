const { findAssignment } = require("../../models/Chore");

async function testFindAssignment() {
    try {
        const result = await findAssignment(1);
        console.log(result);
    } catch (error) {
        console.log("Error:", error.message);
    }
}

testFindAssignment();