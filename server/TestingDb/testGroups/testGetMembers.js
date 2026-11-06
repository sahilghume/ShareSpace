const { getMembers } = require("../../models/Group");

async function testGetMembers() {

    try {
        const result = await getMembers(1);

        console.log("Group Members:", result);

    } catch (error) {
        console.log("Error:", error.message);
    }
}

testGetMembers();