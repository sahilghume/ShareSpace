const { createGroupWithAdmin } = require("../../models/Group");

async function testCreateGroup() {

    try {

        const data = {
            group_name: "Sunshine PG",
            group_code: "SUN123",
            created_by: 1
        };

        const result = await createGroupWithAdmin(data);

        console.log(result);

    } catch (error) {
        console.log("Error:", error.message);
    }
}

testCreateGroup();