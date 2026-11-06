const { getUserGroups } = require("../../models/Group");

async function testGetUserGroups() {

    try {

        const result = await getUserGroups(1);

        console.log("User Groups:", result);

    } catch (error) {
        console.log("Error:", error.message);
    }
}

testGetUserGroups();