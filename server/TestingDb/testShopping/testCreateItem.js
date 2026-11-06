const { createItem } = require("../../models/Shopping");

async function testCreateItem() {
    try {
        const data = {
            group_id: 1,
            item_name: "Milk",
            quantity: 2,
            added_by: 1
        };

        const result = await createItem(data);
        console.log(result);

    } catch (error) {
        console.log("Error:", error.message);
    }
}

testCreateItem();