const {
    submitForVerification
} = require("../../models/Chore");

async function testSubmitForVerification() {
    try {
        const result = await submitForVerification(4, 2);
        console.log(result);
    } catch (error) {
        console.log("Error:", error.message);
    }
}

testSubmitForVerification();