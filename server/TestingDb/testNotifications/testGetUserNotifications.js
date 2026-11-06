const {
    getUserNotifications
} = require("../../models/Notification");

async function testGetUserNotifications() {

    try {
        const result = await getUserNotifications(1);

        console.log(result);

    } catch (error) {
        console.log("Error:", error.message);
    }
}

testGetUserNotifications();