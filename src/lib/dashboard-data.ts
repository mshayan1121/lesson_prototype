export const STUDENT = {
  name: 'Alex Johnson',
  age: 14,
  ageGroup: '14-17',
  avatar: 'AJ',
  level: 'Junior Investor',
  xp: 350,
  xpToNextLevel: 500,
  streak: 5,
  joinedDate: '2024-01-15',
}

export const MODULES = [
  { id: 1, title: 'Money Basics', icon: 'Wallet', lessons: 4, completed: 0, locked: true, xpReward: 400, description: 'Learn what money is and how it works' },
  { id: 2, title: 'Stock Market', icon: 'TrendingUp', lessons: 4, completed: 4, locked: false, xpReward: 400, description: 'Understand stocks, buying, and investing' },
  { id: 3, title: 'Bonds', icon: 'FileText', lessons: 4, completed: 0, locked: true, xpReward: 400, description: 'Learn about bonds and fixed income' },
  { id: 4, title: 'Crypto', icon: 'Coins', lessons: 4, completed: 0, locked: true, xpReward: 400, description: 'Explore cryptocurrency and blockchain' },
  { id: 5, title: 'ETFs & Funds', icon: 'PieChart', lessons: 4, completed: 0, locked: true, xpReward: 400, description: 'Diversify with funds and ETFs' },
  { id: 6, title: 'Forex', icon: 'Globe', lessons: 4, completed: 0, locked: true, xpReward: 400, description: 'Understand currency exchange' },
  { id: 7, title: 'Options & Futures', icon: 'BarChart2', lessons: 4, completed: 0, locked: true, xpReward: 400, description: 'Advanced trading instruments' },
  { id: 8, title: 'Personal Finance', icon: 'CreditCard', lessons: 4, completed: 0, locked: true, xpReward: 400, description: 'Budgeting, tax, and life money skills' },
  { id: 9, title: 'Economics', icon: 'Building', lessons: 4, completed: 0, locked: true, xpReward: 400, description: 'How economies and markets work' },
  { id: 10, title: 'Big Simulation', icon: 'Rocket', lessons: 4, completed: 0, locked: true, xpReward: 500, description: 'Manage a real virtual portfolio' },
]

export const BADGES = [
  { id: 1, name: 'Stock Explorer', icon: 'Star', earned: true, description: 'Completed Lesson 1 — What is a stock?', earnedDate: '2024-01-20' },
  { id: 2, name: 'First Buyer', icon: 'ShoppingCart', earned: true, description: 'Completed Lesson 2 — How to buy a stock', earnedDate: '2024-01-22' },
  { id: 3, name: 'Portfolio Pro', icon: 'BarChart3', earned: true, description: 'Completed Lesson 3 — What happens after?', earnedDate: '2024-01-25' },
  { id: 4, name: 'Junior Investor', icon: 'TrendingUp', earned: true, description: 'Completed the Stock Market module', earnedDate: '2024-01-28' },
  { id: 5, name: 'Money Master', icon: 'Wallet', earned: false, description: 'Complete the Money Basics module', earnedDate: null },
  { id: 6, name: 'Crypto Kid', icon: 'Coins', earned: false, description: 'Complete the Crypto module', earnedDate: null },
  { id: 7, name: 'Bond Boss', icon: 'FileText', earned: false, description: 'Complete the Bonds module', earnedDate: null },
  { id: 8, name: 'Grand Investor', icon: 'Trophy', earned: false, description: 'Complete all 10 modules', earnedDate: null },
]

export const LEADERBOARD = [
  { rank: 1, name: 'Sarah M.', avatar: 'SM', xp: 1250, badges: 8, isCurrentUser: false },
  { rank: 2, name: 'James K.', avatar: 'JK', xp: 980, badges: 6, isCurrentUser: false },
  { rank: 3, name: 'Priya R.', avatar: 'PR', xp: 870, badges: 5, isCurrentUser: false },
  { rank: 4, name: 'Alex J.', avatar: 'AJ', xp: 350, badges: 4, isCurrentUser: true },
  { rank: 5, name: 'Omar H.', avatar: 'OH', xp: 280, badges: 3, isCurrentUser: false },
  { rank: 6, name: 'Emma W.', avatar: 'EW', xp: 210, badges: 2, isCurrentUser: false },
  { rank: 7, name: 'Lucas B.', avatar: 'LB', xp: 180, badges: 2, isCurrentUser: false },
  { rank: 8, name: 'Aisha T.', avatar: 'AT', xp: 150, badges: 1, isCurrentUser: false },
  { rank: 9, name: 'Noah C.', avatar: 'NC', xp: 120, badges: 1, isCurrentUser: false },
  { rank: 10, name: 'Mia L.', avatar: 'ML', xp: 90, badges: 1, isCurrentUser: false },
]

export const ACTIVITY = [
  { id: 1, type: 'badge', message: 'Earned "Junior Investor" badge', time: '2 days ago', icon: 'Trophy' },
  { id: 2, type: 'lesson', message: 'Completed Lesson 4 — The Simulation', time: '2 days ago', icon: 'CheckCircle' },
  { id: 3, type: 'lesson', message: 'Completed Lesson 3 — Your Portfolio', time: '4 days ago', icon: 'CheckCircle' },
  { id: 4, type: 'xp', message: 'Earned 100 XP', time: '4 days ago', icon: 'Zap' },
  { id: 5, type: 'lesson', message: 'Completed Lesson 2 — How to buy a stock', time: '6 days ago', icon: 'CheckCircle' },
]
