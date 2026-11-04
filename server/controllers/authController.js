const User = require("../models/User");

const registerUser = (req, res) => {
  const { fullName, email, password, mobile } = req.body;

  // Check required fields
  if (!fullName || !email || !password || !mobile) {
    return res.status(400).json({
      success: false,
      message: "All fields are required",
    });
  }

  // Check whether email already exists
  const existingUser = User.getAllUsers().find((user) => user.email === email);

  if (existingUser) {
    return res.status(409).json({
      success: false,
      message: "Email already registered",
    });
  }

  // Create new user
  const newUser = {
    id: User.getAllUsers().length + 1,
    fullName,
    email,
    password,
    mobile,
  };

  User.addUser(newUser);

  return res.status(201).json({
    success: true,
    message: "User registered successfully",
    user: {
      id: newUser.id,
      fullName: newUser.fullName,
      email: newUser.email,
      mobile: newUser.mobile,
    },
  });
};

module.exports = { registerUser };
