const { deleteItem } = require("../../models/Shopping");

async function testDeleteItem() {

    try {

        const result = await deleteItem(1);

        console.log(result);

    } catch (error) {

        console.log("Error:", error.message);
    }
}

testDeleteItem();