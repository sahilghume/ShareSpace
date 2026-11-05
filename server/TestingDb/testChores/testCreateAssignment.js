const { createAssignment } = require("../../models/Chore");

async function testCreateAssignment() {
    try {
        const data = {
            chore_id: 1,
            group_id: 1,
            assigned_to: 2,
            assigned_date: "2026-11-06"
        };

        const result = await createAssignment(data);
        console.log(result);

    } catch (error) {
        console.log("Error:", error.message);
    }
}

testCreateAssignment();