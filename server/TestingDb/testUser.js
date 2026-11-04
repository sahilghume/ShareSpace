const { createUser } = require("../models/User.js");

console.log(createUser);

async function testCreateUser() {

    try {
        const result = await createUser(
            "Arya",
            "arya_test@gmail.com",
            "Test@123",
            "9876543210"
        );

        console.log("User created successfully!");
        console.log("Inserted User ID:", result.insertId);

    } catch (error) {
        console.log("Error:", error.message);
    }

    process.exit();
}

testCreateUser();