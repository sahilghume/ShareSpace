const { updateStatus } = require("../../models/Shopping");

async function testUpdateStatus() {

    try {

        const result = await updateStatus(1, "Purchased");

        console.log(result);

    } catch (error) {

        console.log("Error:", error.message);
    }
}

testUpdateStatus();