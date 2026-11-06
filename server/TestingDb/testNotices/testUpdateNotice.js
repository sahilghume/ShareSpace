const { updateNotice } = require("../../models/Notice");

async function testUpdateNotice() {

    try {

        const data = {
            title: "Water Supply Maintenance",
            message: "Water supply will be unavailable tomorrow from 10 AM to 12 PM."
        };

        const result = await updateNotice(1, data);

        console.log(result);

    } catch (error) {

        console.log("Error:", error.message);
    }
}

testUpdateNotice();