const { createUser } = require("../../models/User");

async function testCreateMultipleUsers() {

    const users = [
        {
            name: "Rahul",
            email: "rahul@gmail.com",
            password: "test123",
            phone: "9876543210"
        },
        {
            name: "Priya",
            email: "priya@gmail.com",
            password: "test123",
            phone: "9876543211"
        },
        {
            name: "Amit",
            email: "amit@gmail.com",
            password: "test123",
            phone: "9876543212"
        },
        {
            name: "Sneha",
            email: "sneha@gmail.com",
            password: "test123",
            phone: "9876543213"
        }
    ];

    for (const user of users) {

        try {
            const result = await createUser(
                user.name,
                user.email,
                user.password,
                user.phone
            );

            console.log(
                "Created:",
                user.name,
                "User ID:",
                result.insertId
            );

        } catch (error) {
            console.log(
                "Could not create",
                user.email,
                ":",
                error.message
            );
        }
    }
}

testCreateMultipleUsers();