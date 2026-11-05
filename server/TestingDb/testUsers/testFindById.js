const { findById } = require("../../models/User.js");

async function testFindById() {
    try {
        console.log("Testing findById...");

        const user = await findById(1);

        console.log("Result:", user);

        if (!user) {
            console.log("User not found!");
        }

    } catch (error) {
        console.log("Error:", error.message);
    }
}

testFindById();