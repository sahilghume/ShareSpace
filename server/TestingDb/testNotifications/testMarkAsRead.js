const {
    markAsRead
} = require("../../models/Notification");

async function testMarkAsRead() {

    try {
        const result = await markAsRead(3, 1);

        console.log(result);

    } catch (error) {
        console.log("Error:", error.message);
    }
}

testMarkAsRead();