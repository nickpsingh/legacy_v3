export interface NavigationItem {
  name: string;
  path: string;
  icon: string;
  description: string;
}

export const LAYOUT_NAVIGATION_ITEMS: NavigationItem[] = [
  { 
    name: 'Get Started', 
    path: '/get-started', 
    icon: '🚀',
    description: 'Begin your legacy journey with our guided questionnaire'
  },
  { 
    name: 'Dashboard', 
    path: '/dashboard', 
    icon: '📊',
    description: 'Overview of your estate portfolio'
  },
  {
    name: 'Notifications',
    path: '/notifications',
    icon: '🔔',
    description: 'View your notifications and updates'
  },
  {
    name: 'My Documents',
    path: '/documents',
    icon: '📄',
    description: 'Manage all your estate planning documents'
  },
  { 
    name: 'Assets', 
    path: '/assets', 
    icon: '💰',
    description: 'Manage your assets and property'
  },
  { 
    name: 'Liabilities', 
    path: '/liabilities', 
    icon: '📊',
    description: 'Track your debts and obligations'
  },
  { 
    name: 'People', 
    path: '/people', 
    icon: '👥',
    description: 'Manage your contacts, beneficiaries, trustees, and executors'
  },
  { 
    name: 'My Profile',
    path: '/profile', 
    icon: '👤',
    description: 'View and edit your profile'
  }
]; 