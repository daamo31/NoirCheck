/**
 * Local User Storage Service
 * Manages user accounts in localStorage for demo/development
 * In production, this would be replaced with API calls to backend
 */

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
  address?: string;
  registrationMethod?: 'create' | 'xion' | 'metamask';
  xionWallet?: {
    address: string;
    publicKey: string;
    createdAt: string;
    isAutoCreated?: boolean;
    isNewlyCreated?: boolean;
  };
  metaMaskWallet?: {
    address: string;
    createdAt: string;
  };
}

const USERS_STORAGE_KEY = 'noircheck_users';

export class UserStorageService {
  // Get all users
  static getAllUsers(): User[] {
    try {
      const usersJson = localStorage.getItem(USERS_STORAGE_KEY);
      return usersJson ? JSON.parse(usersJson) : [];
    } catch (error) {
      console.error('Error reading users from localStorage:', error);
      return [];
    }
  }

  // Save all users
  static saveAllUsers(users: User[]): void {
    try {
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
    } catch (error) {
      console.error('Error saving users to localStorage:', error);
    }
  }

  // Registrar nuevo usuario
  static registerUser(userData: Omit<User, 'id' | 'registeredAt' | 'lastActivity'>): User {
    const users = this.getAllUsers();
    
    // Verificar si el email ya existe
    if (users.some(user => user.email === userData.email)) {
      throw new Error('Email already registered');
    }

    const newUser: User = {
      ...userData,
      id: `user_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      registeredAt: new Date().toISOString(),
      lastActivity: new Date().toISOString()
    };

    users.push(newUser);
    this.saveAllUsers(users);
    
    console.log('User registered successfully:', { email: newUser.email, id: newUser.id });
    return newUser;
  }

  // Autenticar usuario
  static authenticateUser(email: string, password: string): User | null {
    const users = this.getAllUsers();
    const user = users.find(u => u.email === email && u.password === password);
    
    if (user) {
      // Actualizar última actividad
      user.lastActivity = new Date().toISOString();
      this.saveAllUsers(users);
      console.log('User authenticated successfully:', { email: user.email, id: user.id });
    } else {
      console.log('Authentication failed for email:', email);
    }
    
    return user || null;
  }

  // Buscar usuario por email
  static findUserByEmail(email: string): User | null {
    const users = this.getAllUsers();
    return users.find(user => user.email === email) || null;
  }

  // Buscar usuario por dirección de wallet
  static findUserByWalletAddress(address: string): User | null {
    const users = this.getAllUsers();
    return users.find(user => 
      user.xionWallet?.address === address || 
      user.metaMaskWallet?.address === address ||
      user.address === address
    ) || null;
  }

  // Actualizar usuario
  static updateUser(userId: string, updates: Partial<User>): boolean {
    const users = this.getAllUsers();
    const userIndex = users.findIndex(user => user.id === userId);
    
    if (userIndex === -1) {
      return false;
    }

    users[userIndex] = { ...users[userIndex], ...updates, lastActivity: new Date().toISOString() };
    this.saveAllUsers(users);
    return true;
  }

  // Eliminar usuario
  static deleteUser(userId: string): boolean {
    const users = this.getAllUsers();
    const filteredUsers = users.filter(user => user.id !== userId);
    
    if (filteredUsers.length === users.length) {
      return false; // Usuario no encontrado
    }

    this.saveAllUsers(filteredUsers);
    return true;
  }

  // Obtener estadísticas de usuarios
  static getUserStats(): { totalUsers: number; recentUsers: number } {
    const users = this.getAllUsers();
    const now = new Date();
    const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    
    const recentUsers = users.filter(user => 
      new Date(user.registeredAt) > last24Hours
    ).length;

    return {
      totalUsers: users.length,
      recentUsers
    };
  }

  // Limpiar todos los usuarios (solo para desarrollo)
  static clearAllUsers(): void {
    localStorage.removeItem(USERS_STORAGE_KEY);
    console.log('All users cleared from localStorage');
  }

  // Exportar usuarios (para backup)
  static exportUsers(): string {
    return JSON.stringify(this.getAllUsers(), null, 2);
  }

  // Importar usuarios (desde backup)
  static importUsers(usersJson: string): boolean {
    try {
      const users = JSON.parse(usersJson);
      if (Array.isArray(users)) {
        this.saveAllUsers(users);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error importing users:', error);
      return false;
    }
  }
}
