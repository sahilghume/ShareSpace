const { findMember } = require("../../models/Group");

async function testFindMember() {

    try {
        const member = await findMember(1, 1);

        console.log(member);

    } catch (error) {
        console.log("Error:", error.message);
    }
}

testFindMember();