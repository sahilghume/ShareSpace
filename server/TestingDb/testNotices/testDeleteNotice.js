const { deleteNotice } = require("../../models/Notice");

async function testDeleteNotice() {

    try {

        const result = await deleteNotice(1);

        console.log(result);

    } catch (error) {

        console.log("Error:", error.message);
    }
}

testDeleteNotice();