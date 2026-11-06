const API_URL = "http://localhost:5000/api/shopping";

const getHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

export const getShoppingItems = async (groupId) => {
  const response = await fetch(`${API_URL}/group/${groupId}`, {
    headers: getHeaders(),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to fetch shopping items");
  }

  return data.items;
};

export const addShoppingItem = async (itemData) => {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      ...getHeaders(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(itemData),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to add shopping item");
  }

  return data;
};

export const updateShoppingItem = async (itemId, itemData) => {
  const response = await fetch(`${API_URL}/${itemId}`, {
    method: "PUT",
    headers: {
      ...getHeaders(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(itemData),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to update shopping item");
  }

  return data;
};

export const submitItemForVerification = async (itemId) => {
  const response = await fetch(`${API_URL}/${itemId}/submit`, {
    method: "PATCH",
    headers: getHeaders(),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to submit item");
  }

  return data;
};

export const approveShoppingItem = async (itemId) => {
  const response = await fetch(`${API_URL}/${itemId}/approve`, {
    method: "PATCH",
    headers: getHeaders(),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to approve shopping item");
  }

  return data;
};

export const deleteShoppingItem = async (itemId) => {
  const response = await fetch(`${API_URL}/${itemId}`, {
    method: "DELETE",
    headers: getHeaders(),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to delete shopping item");
  }

  return data;
};
