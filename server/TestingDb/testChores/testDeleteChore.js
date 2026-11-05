const { deleteChore } = require("../../models/Chore");

async function testDeleteChore() {
    try {
        const result = await deleteChore(1);
        console.log(result);
    } catch (error) {
        console.log("Error:", error.message);
    }
}

testDeleteChore();