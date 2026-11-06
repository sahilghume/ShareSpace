const { getGroupChores } = require("../../models/Chore");

async function testGetGroupChores() {
    try {
        const result = await getGroupChores(1);
        console.log(result);
    } catch (error) {
        console.log("Error:", error.message);
    }
}

testGetGroupChores();