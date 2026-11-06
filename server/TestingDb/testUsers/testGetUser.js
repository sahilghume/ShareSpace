const { findByEmail } = require("../../models/User.js");

async function testGetUser() {
    try {
        const user = await findByEmail("arya_test@gmail.com");

        if (user) {
            console.log("User found!");
            console.log("ID:", user.user_id);
            console.log("Name:", user.name);
            console.log("Email:", user.email);
        } else {
            console.log("User not found!");
        }

    } catch (error) {
        console.log("Error:", error.message);
    }
}


testGetUser();