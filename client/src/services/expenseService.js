const API_URL = "http://localhost:5000/api/expenses";

const getHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

export const getGroupExpenses = async (groupId) => {
  const response = await fetch(`${API_URL}/group/${groupId}`, {
    headers: getHeaders(),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to fetch group expenses");
  }

  return data.expenses;
};

export const getMyExpenses = async () => {
  const response = await fetch(`${API_URL}/my-expenses`, {
    headers: getHeaders(),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to fetch your expenses");
  }

  return data.expenses;
};

export const getExpenseSplits = async (expenseId) => {
  const response = await fetch(`${API_URL}/${expenseId}/splits`, {
    headers: getHeaders(),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to fetch expense splits");
  }

  return data.splits;
};
export const createExpense = async (expenseData) => {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      ...getHeaders(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(expenseData),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to create expense");
  }

  return data;
};
