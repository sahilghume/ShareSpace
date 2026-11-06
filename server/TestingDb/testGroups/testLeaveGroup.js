const { leaveGroup } = require("../../models/Group");

async function testLeaveGroup() {

    try {

        const result = await leaveGroup(1, 2);

        console.log(result);

    } catch (error) {

        console.log("Error:", error.message);

    }
}

testLeaveGroup();