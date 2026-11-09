
export const CURRENT_USER = "Rohit";

const STORAGE_KEY = 'sharespace_shopping_items';

const initialItems = [
  {
    id: 1,
    name: 'Milk',
    quantity: '2 Litres',
    category: 'Dairy',
    assignedTo: 'Rahul',
    createdBy: 'Rohit',
    secondaryVerifier: 'Priya',
    status: 'Pending',
    submittedBy: '',
    approvedBy: ''
  },
  {
    id: 2,
    name: 'Rice',
    quantity: '5 Kg',
    category: 'Groceries',
    assignedTo: 'Amit',
    createdBy: 'Rohit',
    secondaryVerifier: '',
    status: 'Pending',
    submittedBy: '',
    approvedBy: ''
  },
  {
    id: 3,
    name: 'Dishwashing Liquid',
    quantity: '2 Bottles',
    category: 'Cleaning',
    assignedTo: 'Priya',
    createdBy: 'Rahul',
    secondaryVerifier: 'Amit',
    status: 'Pending',
    submittedBy: '',
    approvedBy: ''
  }
];

export function getShoppingItems() {
  const savedItems = localStorage.getItem(STORAGE_KEY);

  if (savedItems) {
    try {
      const items = JSON.parse(savedItems);

      return items.map(item => ({
        ...item,
        title: item.title ?? item.name
      }));

    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
  }

  const items = initialItems.map(item => ({
    ...item,
    title: item.name
  }));

  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));

  return items;
}

export function saveShoppingItems(items) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));

  window.dispatchEvent(new Event('sharespaceShoppingUpdated'));
}
