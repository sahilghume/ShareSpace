const { updateItem } = require("../../models/Shopping");

async function testUpdateItem() {

    try {

        const data = {
            item_name: "Milk",
            quantity: 5
        };

        const result = await updateItem(1, data);

        console.log(result);

    } catch (error) {

        console.log("Error:", error.message);
    }
}

testUpdateItem();