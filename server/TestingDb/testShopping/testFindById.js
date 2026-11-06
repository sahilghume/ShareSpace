const { findById } = require("../../models/Shopping");

async function testFindById() {

    try {

        const result = await findById(1);

        console.log(result);

    } catch (error) {

        console.log("Error:", error.message);
    }
}

testFindById();