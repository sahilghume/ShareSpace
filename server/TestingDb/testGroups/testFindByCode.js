const { findByCode } = require("../../models/Group");

async function testFindByCode() {

    try {
        const group = await findByCode("SUN123");

        console.log(group);

    } catch (error) {
        console.log("Error:", error.message);
    }
}

testFindByCode();