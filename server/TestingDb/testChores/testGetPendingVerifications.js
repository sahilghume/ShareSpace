const {
    getPendingVerifications
} = require("../../models/Chore");

async function testGetPendingVerifications() {

    try {
        const result = await getPendingVerifications(1);

        console.log(result);

    } catch (error) {
        console.log("Error:", error.message);
    }
}

testGetPendingVerifications();