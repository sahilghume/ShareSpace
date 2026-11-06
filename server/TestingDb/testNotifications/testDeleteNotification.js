const {
    deleteNotification
} = require("../../models/Notification");

async function testDeleteNotification() {

    try {
        const result = await deleteNotification(3, 1);

        console.log(result);

    } catch (error) {
        console.log("Error:", error.message);
    }
}

testDeleteNotification();