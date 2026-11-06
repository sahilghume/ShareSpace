const { removeMember } = require("../../models/Group");

async function testRemoveMember() {

    try {

        const result = await removeMember(1, 2);

        console.log(result);

    } catch (error) {

        console.log("Error:", error.message);

    }
}

testRemoveMember();