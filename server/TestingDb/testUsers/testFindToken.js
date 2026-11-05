const { findToken } = require("../../models/User.js");

async function testFindToken() {
    try {
        const token = await findToken("test-jti-12345");

        if (token) {
            console.log("Token found!");
            console.log(token);
        } else {
            console.log("Token not found!");
        }

    } catch (error) {
        console.log("Error:", error.message);
    }
}

testFindToken();