const {
    createNotification
} = require("../../models/Notification");

async function testCreateNotification() {

    try {
        const result = await createNotification({
            user_id: 1,
            assignment_id: 4,
            title: "Chore verification required",
            message: "Rahul submitted Clean Kitchen for verification."
        });

        console.log(result);

    } catch (error) {
        console.log("Error:", error.message);
    }
}

testCreateNotification();