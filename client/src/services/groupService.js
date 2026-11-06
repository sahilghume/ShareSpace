const API_URL = "http://localhost:5000/api/groups";

const getHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

export const getMyGroups = async () => {
  const response = await fetch(`${API_URL}/my-groups`, {
    headers: getHeaders(),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to fetch groups");
  }

  return data.groups;
};

export const getGroupDetails = async (groupId) => {
  const response = await fetch(`${API_URL}/${groupId}`, {
    headers: getHeaders(),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to fetch group details");
  }

  return data.group;
};

export const getGroupMembers = async (groupId) => {
  const response = await fetch(`${API_URL}/${groupId}/members`, {
    headers: getHeaders(),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to fetch group members");
  }

  return data.members;
};

export const leaveGroup = async (groupId) => {
  const response = await fetch(`${API_URL}/${groupId}/leave`, {
    method: "DELETE",
    headers: getHeaders(),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to leave group");
  }

  return data;
};
export const transferAdminAndLeave = async (groupId, newAdminId) => {
  const response = await fetch(`${API_URL}/${groupId}/transfer-admin`, {
    method: "PUT",
    headers: {
      ...getHeaders(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ newAdminId }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to transfer admin rights");
  }

  return data;
};

export const deleteGroup = async (groupId) => {
  const response = await fetch(`${API_URL}/${groupId}`, {
    method: "DELETE",
    headers: getHeaders(),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to delete group");
  }

  return data;
};

export const createGroup = async (groupName) => {
  const response = await fetch(`${API_URL}/create`, {
    method: "POST",
    headers: {
      ...getHeaders(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ groupName }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to create group");
  }

  return data;
};

export const joinGroup = async (groupCode) => {
  const response = await fetch(`${API_URL}/join`, {
    method: "POST",
    headers: {
      ...getHeaders(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ groupCode }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to join group");
  }

  return data;
};
