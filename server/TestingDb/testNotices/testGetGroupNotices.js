const { getGroupNotices } = require("../../models/Notice");

async function testGetGroupNotices() {

    try {

        const result = await getGroupNotices(1);

        console.log(result);

    } catch (error) {

        console.log("Error:", error.message);
    }
}

testGetGroupNotices();