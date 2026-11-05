const { createChore } = require("../../models/Chore");

async function testCreateChore() {
    try {
        const result = await createChore({
            group_id: 1,
            chore_name: "Clean Kitchen",
            description: "Clean the kitchen floor",
            created_by: 1,
            verifier_id: 2
        });

        console.log(result);

    } catch (error) {
        console.log("Error:", error);
    }
}

testCreateChore();