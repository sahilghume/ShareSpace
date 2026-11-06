const { createNotice } = require("../../models/Notice");

async function testCreateNotice() {

    try {

        const data = {
            group_id: 1,
            posted_by: 1,
            title: "Electricity Maintenance",
            message: "Electricity will be unavailable tomorrow from 10 AM to 12 PM."
        };

        const result = await createNotice(data);

        console.log(result);

    } catch (error) {

        console.log("Error:", error.message);
    }
}

testCreateNotice();