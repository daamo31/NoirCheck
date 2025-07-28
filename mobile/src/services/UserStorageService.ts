/**
 * Mobile User Storage Service
 * Manages user accounts in AsyncStorage for mobile application
 * Real user data management with AsyncStorage persistence
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

export interface ActivityEntry {
  id: string;
  type: 'registration' | 'verification' | 'login' | 'profile_update';
  description: string;
  timestamp: string;
  details?: any;
}

export interface User {
  id: string;
  email: string;
  password: string; // In production, this would be a hash
  username: string;
  firstName: string;
  lastName: string;
  registeredAt: string;
  totalRegistrations: number;
  totalVerifications: number;
  lastActivity: string;
  recentActivity: ActivityEntry[]; // Recent activity history
  address?: string;
  registrationMethod?: 'create' | 'xion' | 'wallet';
  isPending?: boolean; // True if wallet creation is pending
  xionWallet?: {
    address: string;
    publicKey: string;
    createdAt: string;
    isAutoCreated?: boolean;
    isNewlyCreated?: boolean;
  };
}

const USERS_STORAGE_KEY = 'noircheck_users';
const CURRENT_USER_KEY = 'noircheck_current_user';

export class UserStorageService {
  // Get all users
  static async getAllUsers(): Promise<User[]> {
    try {
      const usersJson = await AsyncStorage.getItem(USERS_STORAGE_KEY);
      const users = usersJson ? JSON.parse(usersJson) : [];
      
      // Migrate users that don't have recentActivity
      const migratedUsers = users.map((user: any) => {
        if (!user.recentActivity) {
          user.recentActivity = [];
        }
        return user;
      });
      
      // Save migrated users if needed
      if (migratedUsers.some((user: any, index: number) => !users[index]?.recentActivity)) {
        await this.saveAllUsers(migratedUsers);
      }
      
      return migratedUsers;
    } catch (error) {
      console.error('Error reading users from AsyncStorage:', error);
      return [];
    }
  }

  // Save all users
  static async saveAllUsers(users: User[]): Promise<void> {
    try {
      await AsyncStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
    } catch (error) {
      console.error('Error saving users to AsyncStorage:', error);
    }
  }

  // Register new user
  static async registerUser(userData: Omit<User, 'id' | 'registeredAt' | 'lastActivity' | 'recentActivity'>): Promise<User> {
    const users = await this.getAllUsers();
    
    // Check if email already exists
    if (users.some(user => user.email === userData.email)) {
      throw new Error('Email already registered');
    }

    const newUser: User = {
      ...userData,
      id: `user_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      registeredAt: new Date().toISOString(),
      lastActivity: new Date().toISOString(),
      recentActivity: [{
        id: `activity_${Date.now()}`,
        type: 'login',
        description: 'Account created',
        timestamp: new Date().toISOString()
      }]
    };

    users.push(newUser);
    await this.saveAllUsers(users);

    console.log('👤 User registered:', newUser.email);
    return newUser;
  }

  // Find user by email
  static async findUserByEmail(email: string): Promise<User | null> {
    const users = await this.getAllUsers();
    return users.find(user => user.email === email) || null;
  }

  // Find user by ID
  static async findUserById(id: string): Promise<User | null> {
    const users = await this.getAllUsers();
    return users.find(user => user.id === id) || null;
  }

  // Find user by XION address
  static async findUserByXionAddress(address: string): Promise<User | null> {
    const users = await this.getAllUsers();
    return users.find(user => 
      user.xionWallet?.address === address || 
      user.address === address
    ) || null;
  }

  // Authenticate user
  static async authenticateUser(email: string, password: string): Promise<User | null> {
    const user = await this.findUserByEmail(email);
    if (user && user.password === password) {
      await this.updateLastActivity(user.id);
      return user;
    }
    return null;
  }

  // Update user
  static async updateUser(userId: string, updates: Partial<User>): Promise<User | null> {
    const users = await this.getAllUsers();
    const userIndex = users.findIndex(user => user.id === userId);
    
    if (userIndex === -1) {
      return null;
    }

    const updatedUser = {
      ...users[userIndex],
      ...updates,
      lastActivity: new Date().toISOString()
    };

    users[userIndex] = updatedUser;
    await this.saveAllUsers(users);
    
    return updatedUser;
  }

  // Update last activity
  static async updateLastActivity(userId: string): Promise<void> {
    await this.updateUser(userId, {
      lastActivity: new Date().toISOString()
    });
  }

  // Add activity entry
  static async addActivity(userId: string, activity: Omit<ActivityEntry, 'id' | 'timestamp'>): Promise<void> {
    const user = await this.findUserById(userId);
    if (!user) return;

    const newActivity: ActivityEntry = {
      ...activity,
      id: `activity_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      timestamp: new Date().toISOString()
    };

    const updatedActivities = [newActivity, ...(user.recentActivity || [])].slice(0, 50); // Keep last 50 activities

    await this.updateUser(userId, {
      recentActivity: updatedActivities
    });
  }

  // Set current user
  static async setCurrentUser(user: User): Promise<void> {
    try {
      await AsyncStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
      console.log('✅ Current user set:', user.email);
    } catch (error) {
      console.error('Error setting current user:', error);
    }
  }

  // Get current user
  static async getCurrentUser(): Promise<User | null> {
    try {
      const userJson = await AsyncStorage.getItem(CURRENT_USER_KEY);
      return userJson ? JSON.parse(userJson) : null;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }

  // Clear current user
  static async clearCurrentUser(): Promise<void> {
    try {
      await AsyncStorage.removeItem(CURRENT_USER_KEY);
      console.log('🚪 Current user cleared');
    } catch (error) {
      console.error('Error clearing current user:', error);
    }
  }

  // Get user activity history
  static async getUserActivity(userId: string): Promise<ActivityEntry[]> {
    const user = await this.findUserById(userId);
    return user?.recentActivity || [];
  }

  // Connect XION wallet to user
  static async connectXionWallet(userId: string, walletData: {
    address: string;
    publicKey: string;
    isAutoCreated?: boolean;
    isNewlyCreated?: boolean;
  }): Promise<User | null> {
    const xionWallet = {
      ...walletData,
      createdAt: new Date().toISOString()
    };

    const updatedUser = await this.updateUser(userId, {
      xionWallet,
      address: walletData.address,
      registrationMethod: 'xion'
    });

    if (updatedUser) {
      await this.addActivity(userId, {
        type: 'profile_update',
        description: 'XION wallet connected'
      });
    }

    return updatedUser;
  }

  // Disconnect XION wallet
  static async disconnectXionWallet(userId: string): Promise<User | null> {
    const updatedUser = await this.updateUser(userId, {
      xionWallet: undefined,
      address: undefined
    });

    if (updatedUser) {
      await this.addActivity(userId, {
        type: 'profile_update',
        description: 'XION wallet disconnected'
      });
    }

    return updatedUser;
  }

  // Get user statistics
  static async getUserStatistics(userId: string): Promise<{
    totalRegistrations: number;
    totalVerifications: number;
    totalActivities: number;
    memberSince: string;
  } | null> {
    const user = await this.findUserById(userId);
    if (!user) return null;

    return {
      totalRegistrations: user.totalRegistrations,
      totalVerifications: user.totalVerifications,
      totalActivities: user.recentActivity?.length || 0,
      memberSince: user.registeredAt
    };
  }

  // Update user wallet and remove pending status
  static async updateUserWallet(userId: string, wallet: any): Promise<User | null> {
    const updatedUser = await this.updateUser(userId, {
      xionWallet: {
        address: wallet.address,
        publicKey: wallet.publicKey,
        createdAt: new Date().toISOString(),
        isAutoCreated: false,
        isNewlyCreated: true
      },
      address: wallet.address,
      isPending: false // Remove pending status
    });

    if (updatedUser) {
      await this.addActivity(userId, {
        type: 'profile_update',
        description: 'XION wallet successfully created'
      });
    }

    return updatedUser;
  }

  // Clear all data (for development/testing)
  static async clearAllData(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([USERS_STORAGE_KEY, CURRENT_USER_KEY]);
      console.log('🧹 All user data cleared');
    } catch (error) {
      console.error('Error clearing all data:', error);
    }
  }
}
