const { createAssignment } = require("../../models/Chore");

async function testCreateAssignment() {

    try {
        const result = await createAssignment({
            chore_id: 1,
            group_id: 1,
            assigned_to: 2,
            assigned_date: "2026-11-09",
            due_date: "2026-11-10",
            priority: "High"
        });

        console.log(result);
   

    } catch (error) {
        console.log("Error:", error);
    }
}

testCreateAssignment();