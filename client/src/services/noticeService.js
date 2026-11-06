const API_URL = "http://localhost:5000/api/notices";

export const getGroupNotices = async (groupId) => {
  const token = localStorage.getItem("token");

  const response = await fetch(`${API_URL}/group/${groupId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to fetch notices");
  }

  return data.notices;
};

export const createNotice = async (noticeData) => {
  const token = localStorage.getItem("token");

  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(noticeData),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to create notice");
  }

  return data.notice;
};

export const updateNotice = async (noticeId, noticeData) => {
  const token = localStorage.getItem("token");

  const response = await fetch(`${API_URL}/${noticeId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(noticeData),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to update notice");
  }

  return data;
};

export const deleteNotice = async (noticeId) => {
  const token = localStorage.getItem("token");

  const response = await fetch(`${API_URL}/${noticeId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to delete notice");
  }

  return data;
};
