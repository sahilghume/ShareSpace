const { deleteToken } = require("../../models/User.js");

async function testDeleteToken() {
    try {
        const result = await deleteToken("test-jti-12345");

        if (result.affectedRows > 0) {
            console.log("Token deleted successfully!");
        } else {
            console.log("Token not found!");
        }

    } catch (error) {
        console.log("Error:", error.message);
    }
}

testDeleteToken();