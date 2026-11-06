const { getGroupItems } = require("../../models/Shopping");

async function testGetGroupItems() {

    try {

        const result = await getGroupItems(1);

        console.log(result);

    } catch (error) {

        console.log("Error:", error.message);
    }
}

testGetGroupItems();