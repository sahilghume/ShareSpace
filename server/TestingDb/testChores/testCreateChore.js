const { createChore } = require("../../models/Chores");

async function testCreateChore() {

    try {

        const data = {
            group_id: 1,
            chore_name: "Cleaning Kitchen",
            description: "Clean kitchen and wash utensils"
        };

        const result = await createChore(data);

        console.log(result);

    } catch (error) {
        console.log("Error:", error.message);
    }
}

testCreateChore();