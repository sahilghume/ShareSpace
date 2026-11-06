const API_URL = "http://localhost:5000/api/chores";

const getHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

const sendRequest = async (url, options = {}) => {
  const response = await fetch(url, {
    ...options,
    headers: {
      ...getHeaders(),
      ...(options.body && { "Content-Type": "application/json" }),
      ...options.headers,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Chore request failed");
  }

  return data;
};

export const getGroupChores = async (groupId) => {
  const data = await sendRequest(`${API_URL}/group/${groupId}`);
  return data.chores;
};

export const getDailyAssignments = async (groupId, date = null) => {
  const url = date
    ? `${API_URL}/assignments/${groupId}?date=${date}`
    : `${API_URL}/assignments/${groupId}`;

  const data = await sendRequest(url);
  return data.assignments;
};

export const createChore = async (choreData) => {
  return sendRequest(API_URL, {
    method: "POST",
    body: JSON.stringify(choreData),
  });
};

export const assignChore = async (assignmentData) => {
  return sendRequest(`${API_URL}/assign`, {
    method: "POST",
    body: JSON.stringify(assignmentData),
  });
};

export const submitChoreForVerification = async (assignmentId) => {
  return sendRequest(`${API_URL}/assignments/${assignmentId}/submit`, {
    method: "PATCH",
  });
};

export const approveChore = async (assignmentId) => {
  return sendRequest(`${API_URL}/assignments/${assignmentId}/approve`, {
    method: "PATCH",
  });
};
