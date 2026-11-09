
const GROUPS_KEY = "sharespace_groups";

// Get all groups from localStorage
export function getGroups() {
  return JSON.parse(localStorage.getItem(GROUPS_KEY)) || [];
}

// Save groups in localStorage
function saveGroups(groups) {
  localStorage.setItem(GROUPS_KEY, JSON.stringify(groups));
}

// Find the group to which a user belongs
export function getUserGroup(email) {
  if (!email) return null;

  const groups = getGroups();

  return groups.find(group =>
    group.members.some(
      member => member.email === email.toLowerCase()
    )
  ) || null;
}

// Generate a unique invite code
function generateInviteCode(groups) {
  let code;

  do {
    code = "SHARE" + Math.random().toString(36).substring(2, 7).toUpperCase();
  } while (groups.some(group => group.inviteCode === code));

  return code;
}

// Create a new group
export function createGroup(user, groupData) {
  if (!user || !user.email || !user.name) {
    throw new Error("User information is missing. Please log in again.");
  }

  if (getUserGroup(user.email)) {
    throw new Error("You already belong to a group.");
  }

  const groups = getGroups();

  const newGroup = {
    id: Date.now().toString(),
    name: groupData.name.trim(),
    description: groupData.description.trim(),
    address: groupData.address.trim(),
    inviteCode: generateInviteCode(groups),
    createdOn: new Date().toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric"
    }),
    createdBy: user.email.toLowerCase(),
    members: [
      {
        name: user.name,
        email: user.email.toLowerCase(),
        role: "Admin"
      }
    ]
  };

  groups.push(newGroup);
  saveGroups(groups);

  return newGroup;
}

// Join an existing group using an invite code
export function joinGroup(user, inviteCode) {
  if (!user || !user.email || !user.name) {
    throw new Error("User information is missing. Please log in again.");
  }

  if (getUserGroup(user.email)) {
    throw new Error("You already belong to a group.");
  }

  const groups = getGroups();

  const group = groups.find(
    item => item.inviteCode === inviteCode.trim().toUpperCase()
  );

  if (!group) {
    throw new Error("Invalid invite code. Please check and try again.");
  }

  group.members.push({
    name: user.name,
    email: user.email.toLowerCase(),
    role: "Member"
  });

  saveGroups(groups);

  return group;
}

// Get a group using its ID
export function getGroupById(groupId) {
  const groups = getGroups();

  return groups.find(group => group.id === groupId) || null;
}

// Leave a group
export function leaveGroup(email) {
  if (!email) return false;

  const groups = getGroups();
  const normalizedEmail = email.toLowerCase();

  const groupIndex = groups.findIndex(group =>
    group.members.some(member => member.email === normalizedEmail)
  );

  if (groupIndex === -1) return false;

  const group = groups[groupIndex];

  // Do not allow the admin to leave while other members remain
  if (
    group.createdBy === normalizedEmail &&
    group.members.length > 1
  ) {
    throw new Error("Transfer admin responsibility before leaving the group.");
  }

  group.members = group.members.filter(
    member => member.email !== normalizedEmail
  );

  // Delete the group if its last member leaves
  if (group.members.length === 0) {
    groups.splice(groupIndex, 1);
  }

  saveGroups(groups);

  return true;
}
