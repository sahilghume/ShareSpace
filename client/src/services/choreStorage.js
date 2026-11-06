export const CURRENT_USER = 'Rohit'

const STORAGE_KEY = 'sharespace_chores'

const initialChores = [
  {
    id: 1,
    title: 'Clean Kitchen',
    description: 'Clean the kitchen counter and wash utensils.',
    assignedTo: 'Rohit',
    createdBy: 'Rahul',
    secondaryVerifier: 'Priya',
    dueDate: '2026-11-06',
    priority: 'High',
    status: 'Pending',
    submittedBy: '',
    submittedAt: '',
    approvedBy: '',
    approvedAt: ''
  },
  {
    id: 2,
    title: 'Take Out Garbage',
    description: 'Collect and dispose of household garbage.',
    assignedTo: 'Rahul',
    createdBy: 'Rohit',
    secondaryVerifier: '',
    dueDate: '2026-11-05',
    priority: 'Medium',
    status: 'Completed',
    submittedBy: 'Rahul',
    submittedAt: '2026-11-04',
    approvedBy: 'Rohit',
    approvedAt: '2026-11-04'
  },
  {
    id: 3,
    title: 'Clean Living Room',
    description: 'Sweep and mop the living room floor.',
    assignedTo: 'Amit',
    createdBy: 'Rohit',
    secondaryVerifier: '',
    dueDate: '2026-11-07',
    priority: 'Medium',
    status: 'Pending',
    submittedBy: '',
    submittedAt: '',
    approvedBy: '',
    approvedAt: ''
  },
  {
    id: 4,
    title: 'Buy Cleaning Supplies',
    description: 'Purchase floor cleaner and other cleaning items.',
    assignedTo: 'Priya',
    createdBy: 'Amit',
    secondaryVerifier: 'Rahul',
    dueDate: '2026-11-08',
    priority: 'Low',
    status: 'Pending',
    submittedBy: '',
    submittedAt: '',
    approvedBy: '',
    approvedAt: ''
  },
  {
    id: 5,
    title: 'Wash Bathroom',
    description: 'Clean the bathroom and wash basin.',
    assignedTo: 'Sahil',
    createdBy: 'Priya',
    secondaryVerifier: '',
    dueDate: '2026-11-04',
    priority: 'High',
    status: 'Completed',
    submittedBy: 'Sahil',
    submittedAt: '2026-11-03',
    approvedBy: 'Priya',
    approvedAt: '2026-11-03'
  }
]

// Get chores from localStorage
export function getChores() {
  const savedChores = localStorage.getItem(STORAGE_KEY)

  if (savedChores) {
    try {
      return JSON.parse(savedChores)
    } catch {
      localStorage.removeItem(STORAGE_KEY)
    }
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(initialChores))

  return initialChores
}

// Save chores and notify other pages
export function saveChores(chores) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(chores))

  window.dispatchEvent(new Event('sharespaceChoresUpdated'))
}
