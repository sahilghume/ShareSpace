let users = [];

const getAllUsers = () => {
  return users;
};

const addUser = (user) => {
  users.push(user);
};

module.exports = {
  getAllUsers,
  addUser,
};
