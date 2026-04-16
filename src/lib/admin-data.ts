export const PLATFORM_STATS = {
  totalStudents: 1284,
  activeThisWeek: 347,
  lessonsCompleted: 4821,
  totalXP: 284500,
  badgesAwarded: 962,
  avgCompletionRate: 68,
}

export const SIGNUP_TREND = [
  { date: 'Mar 18', students: 12 },
  { date: 'Mar 19', students: 18 },
  { date: 'Mar 20', students: 15 },
  { date: 'Mar 21', students: 22 },
  { date: 'Mar 22', students: 19 },
  { date: 'Mar 23', students: 28 },
  { date: 'Mar 24', students: 35 },
  { date: 'Mar 25', students: 31 },
  { date: 'Mar 26', students: 42 },
  { date: 'Mar 27', students: 38 },
  { date: 'Mar 28', students: 45 },
  { date: 'Mar 29', students: 52 },
  { date: 'Mar 30', students: 48 },
  { date: 'Mar 31', students: 61 },
  { date: 'Apr 1', students: 58 },
  { date: 'Apr 2', students: 72 },
  { date: 'Apr 3', students: 68 },
  { date: 'Apr 4', students: 81 },
  { date: 'Apr 5', students: 75 },
  { date: 'Apr 6', students: 89 },
  { date: 'Apr 7', students: 95 },
]

export const MODULE_POPULARITY = [
  { module: 'Stock Market', completions: 892 },
  { module: 'Money Basics', completions: 654 },
  { module: 'Crypto', completions: 421 },
  { module: 'ETFs', completions: 312 },
  { module: 'Bonds', completions: 287 },
  { module: 'Forex', completions: 198 },
  { module: 'Personal Finance', completions: 176 },
  { module: 'Economics', completions: 145 },
  { module: 'Options', completions: 98 },
  { module: 'Big Simulation', completions: 42 },
]

export const COMPLETION_FUNNEL = [
  { step: 'Hook', completed: 4821 },
  { step: 'Concept', completed: 4102 },
  { step: 'Chart', completed: 3654 },
  { step: 'Quiz', completed: 3201 },
  { step: 'Badge', completed: 2891 },
]

export const AGE_BREAKDOWN = [
  { group: '7-10', count: 312, color: '#639922' },
  { group: '11-13', count: 548, color: '#3B6D11' },
  { group: '14-17', count: 424, color: '#97C459' },
]

export const USERS = [
  { id: 1, name: 'Alex Johnson', avatar: 'AJ', ageGroup: '14-17', modulesCompleted: 1, xp: 350, badges: 4, lastActive: '2 hours ago', status: 'active' },
  { id: 2, name: 'Sarah Mitchell', avatar: 'SM', ageGroup: '11-13', modulesCompleted: 2, xp: 1250, badges: 8, lastActive: '1 day ago', status: 'active' },
  { id: 3, name: 'James Kim', avatar: 'JK', ageGroup: '14-17', modulesCompleted: 1, xp: 980, badges: 6, lastActive: '3 days ago', status: 'active' },
  { id: 4, name: 'Priya Rajan', avatar: 'PR', ageGroup: '11-13', modulesCompleted: 1, xp: 870, badges: 5, lastActive: '1 day ago', status: 'active' },
  { id: 5, name: 'Omar Hassan', avatar: 'OH', ageGroup: '7-10', modulesCompleted: 1, xp: 280, badges: 3, lastActive: '5 days ago', status: 'inactive' },
  { id: 6, name: 'Emma Wilson', avatar: 'EW', ageGroup: '7-10', modulesCompleted: 1, xp: 210, badges: 2, lastActive: '1 week ago', status: 'inactive' },
  { id: 7, name: 'Lucas Brown', avatar: 'LB', ageGroup: '14-17', modulesCompleted: 0, xp: 180, badges: 2, lastActive: '2 days ago', status: 'active' },
  { id: 8, name: 'Aisha Tanaka', avatar: 'AT', ageGroup: '11-13', modulesCompleted: 0, xp: 150, badges: 1, lastActive: '4 days ago', status: 'active' },
  { id: 9, name: 'Noah Chen', avatar: 'NC', ageGroup: '7-10', modulesCompleted: 0, xp: 120, badges: 1, lastActive: '1 week ago', status: 'inactive' },
  { id: 10, name: 'Mia Lopez', avatar: 'ML', ageGroup: '11-13', modulesCompleted: 0, xp: 90, badges: 1, lastActive: '2 weeks ago', status: 'inactive' },
]

export const CONTENT = [
  {
    moduleId: 2,
    moduleTitle: 'Stock Market',
    lessons: [
      { id: 1, title: 'What is a stock?', content_7_10: 'A stock is like owning a tiny slice of a pizza...', content_11_13: 'A stock is a share of ownership in a company...', content_14_17: 'A stock represents equity in a company...' },
      { id: 2, title: 'How to buy a stock?', content_7_10: 'A broker is like a shopkeeper for stocks...', content_11_13: 'A broker is a platform where you buy stocks...', content_14_17: 'A broker is a licensed intermediary...' },
      { id: 3, title: 'What happens after?', content_7_10: 'A portfolio is like your sticker collection...', content_11_13: 'A portfolio is all the stocks you own...', content_14_17: 'A portfolio is the total collection of investments...' },
      { id: 4, title: 'The Simulation', content_7_10: 'Lets try investing with fake money...', content_11_13: 'Pick a stock and see what happens...', content_14_17: 'Simulate a real investment decision...' },
    ]
  }
]

export const RECENT_ACTIVITY = [
  { id: 1, student: 'Alex Johnson', action: 'Completed Lesson 4 — The Simulation', time: '2 hours ago', type: 'completion' },
  { id: 2, student: 'Sarah Mitchell', action: 'Earned "Junior Investor" badge', time: '3 hours ago', type: 'badge' },
  { id: 3, student: 'Lucas Brown', action: 'Started Stock Market Module', time: '5 hours ago', type: 'start' },
  { id: 4, student: 'Priya Rajan', action: 'Completed Lesson 3 — Your Portfolio', time: '6 hours ago', type: 'completion' },
  { id: 5, student: 'James Kim', action: 'Earned "Portfolio Pro" badge', time: '8 hours ago', type: 'badge' },
]

export const ALL_MODULES = [
  { id: 1, title: 'Money Basics' },
  { id: 2, title: 'Stock Market' },
  { id: 3, title: 'Bonds' },
  { id: 4, title: 'Crypto' },
  { id: 5, title: 'ETFs & Funds' },
  { id: 6, title: 'Forex' },
  { id: 7, title: 'Options & Futures' },
  { id: 8, title: 'Personal Finance' },
  { id: 9, title: 'Economics' },
  { id: 10, title: 'Big Simulation' },
]

export const BILLING_STATS = {
  totalRevenue: 128400,
  mrr: 12800,
  activeSubscriptions: 284,
  cancelledThisMonth: 12,
  refundsIssued: 8,
  avgRevenuePerUser: 45,
  churnRate: 4.2,
  ltv: 187,
  failedPayments: 6,
}

export const REVENUE_TREND = [
  { month: 'May', revenue: 2100 },
  { month: 'Jun', revenue: 3400 },
  { month: 'Jul', revenue: 4200 },
  { month: 'Aug', revenue: 3800 },
  { month: 'Sep', revenue: 5100 },
  { month: 'Oct', revenue: 6200 },
  { month: 'Nov', revenue: 7800 },
  { month: 'Dec', revenue: 9100 },
  { month: 'Jan', revenue: 8400 },
  { month: 'Feb', revenue: 10200 },
  { month: 'Mar', revenue: 11400 },
  { month: 'Apr', revenue: 12800 },
]

export const SUBSCRIPTION_PLANS = [
  { plan: 'Free', students: 842, revenue: 0, color: '#888780' },
  { plan: 'Basic', students: 198, revenue: 5940, color: '#639922' },
  { plan: 'Premium', students: 86, revenue: 6880, color: '#3B6D11' },
]

export const TRANSACTIONS = [
  { id: 'TXN001', student: 'Sarah Mitchell', avatar: 'SM', plan: 'Premium', amount: 79, date: 'Apr 15, 2026', status: 'paid' },
  { id: 'TXN002', student: 'James Kim', avatar: 'JK', plan: 'Basic', amount: 29, date: 'Apr 15, 2026', status: 'paid' },
  { id: 'TXN003', student: 'Priya Rajan', avatar: 'PR', plan: 'Premium', amount: 79, date: 'Apr 14, 2026', status: 'paid' },
  { id: 'TXN004', student: 'Omar Hassan', avatar: 'OH', plan: 'Basic', amount: 29, date: 'Apr 14, 2026', status: 'refunded' },
  { id: 'TXN005', student: 'Emma Wilson', avatar: 'EW', plan: 'Basic', amount: 29, date: 'Apr 13, 2026', status: 'failed' },
  { id: 'TXN006', student: 'Lucas Brown', avatar: 'LB', plan: 'Premium', amount: 79, date: 'Apr 13, 2026', status: 'paid' },
  { id: 'TXN007', student: 'Aisha Tanaka', avatar: 'AT', plan: 'Basic', amount: 29, date: 'Apr 12, 2026', status: 'paid' },
  { id: 'TXN008', student: 'Noah Chen', avatar: 'NC', plan: 'Basic', amount: 29, date: 'Apr 12, 2026', status: 'refunded' },
  { id: 'TXN009', student: 'Mia Lopez', avatar: 'ML', plan: 'Premium', amount: 79, date: 'Apr 11, 2026', status: 'failed' },
  { id: 'TXN010', student: 'Alex Johnson', avatar: 'AJ', plan: 'Basic', amount: 29, date: 'Apr 11, 2026', status: 'paid' },
]

export const REFUNDS = [
  { id: 'REF001', student: 'Omar Hassan', avatar: 'OH', amount: 29, reason: 'Not satisfied with content', date: 'Apr 14, 2026', status: 'approved' },
  { id: 'REF002', student: 'Noah Chen', avatar: 'NC', amount: 29, reason: 'Accidental purchase', date: 'Apr 12, 2026', status: 'approved' },
  { id: 'REF003', student: 'Emma Wilson', avatar: 'EW', amount: 79, reason: 'Technical issues', date: 'Apr 10, 2026', status: 'pending' },
  { id: 'REF004', student: 'Lucas Brown', avatar: 'LB', amount: 29, reason: 'Duplicate charge', date: 'Apr 8, 2026', status: 'pending' },
  { id: 'REF005', student: 'Mia Lopez', avatar: 'ML', amount: 79, reason: 'Did not use service', date: 'Apr 6, 2026', status: 'rejected' },
]
