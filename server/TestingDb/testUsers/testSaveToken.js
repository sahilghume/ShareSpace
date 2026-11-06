const { saveToken } = require("../../models/User.js");

async function testSaveToken() {
    try {
        const result = await saveToken(
            1,
            "test-jti-12345",
            "2026-11-06 10:00:00"
        );

        console.log("Token saved successfully!");
        console.log("Inserted ID:", result.insertId);

    } catch (error) {
        console.log("Error:", error.message);
    }
}

testSaveToken();