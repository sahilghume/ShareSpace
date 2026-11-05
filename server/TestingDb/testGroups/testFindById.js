const { findById } = require("../../models/Group");

async function testFindById() {

    try {
        const group = await findById(1);

        console.log(group);

    } catch (error) {
        console.log("Error:", error.message);
    }
}

testFindById();