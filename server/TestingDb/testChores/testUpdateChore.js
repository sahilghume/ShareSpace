const { updateChore } = require("../../models/Chore");

async function testUpdateChore() {
    try {
        const data = {
            chore_name: "Kitchen Cleaning",
            description: "Clean kitchen and wash utensils",
            is_active: 1
        };

        const result = await updateChore(1, data);
        console.log(result);

    } catch (error) {
        console.log("Error:", error.message);
    }
}

testUpdateChore();