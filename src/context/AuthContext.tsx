import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { api } from '@/services/api';

interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  isVerified: boolean;
  verificationCode?: string;
  addresses?: Address[];
  isAdmin?: boolean;
}

interface Address {
  id: string;
  name: string;
  phone: string;
  postalCode: string;
  address1: string;
  address2?: string;
  isDefault: boolean;
}

interface Order {
  orderId: string;
  userId: string;
  userEmail: string;
  userName: string;
  items: Array<{
    id: number;
    name: string;
    quantity: number;
    price: number;
  }>;
  address: {
    name: string;
    phone: string;
    postalCode: string;
    address1: string;
    address2?: string;
  };
  subtotal: number;
  shipping: number;
  total: number;
  status: 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: string;
  printed?: boolean;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string, phone: string) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  verifyEmail: (code: string) => boolean;
  resendVerificationCode: () => Promise<{ success: boolean }>;
  resetPassword: (email: string) => Promise<boolean>;
  updatePassword: (code: string, newPassword: string) => boolean;
  addAddress: (address: Omit<Address, 'id'>) => void;
  removeAddress: (id: string) => void;
  setDefaultAddress: (id: string) => void;
  // Admin functions
  getAllOrders: () => Order[];
  getPendingOrders: () => Order[];
  updateOrderStatus: (orderId: string, status: Order['status']) => void;
  markOrderAsPrinted: (orderId: string) => void;
  getAllSubscribers: () => string[];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Admin credentials
const ADMIN_EMAIL = 'admin@lumitea.kr';
const ADMIN_PASSWORD = 'LumiTea2025!';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('lumi_tea_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const generateVerificationCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    // Check admin login
    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      const adminUser: User = {
        id: 'admin',
        email: ADMIN_EMAIL,
        name: 'Admin',
        isVerified: true,
        isAdmin: true,
        addresses: []
      };
      setUser(adminUser);
      localStorage.setItem('lumi_tea_user', JSON.stringify(adminUser));
      return true;
    }

    // Regular user login
    const users = JSON.parse(localStorage.getItem('lumi_tea_users') || '[]');
    const foundUser = users.find((u: any) => u.email === email && u.password === password);
    
    if (foundUser) {
      if (!foundUser.isVerified) {
        return false;
      }
      const { password, ...userWithoutPassword } = foundUser;
      setUser(userWithoutPassword);
      localStorage.setItem('lumi_tea_user', JSON.stringify(userWithoutPassword));
      return true;
    }
    return false;
  };

  const register = async (name: string, email: string, password: string, phone: string): Promise<{ success: boolean; message: string }> => {
    const users = JSON.parse(localStorage.getItem('lumi_tea_users') || '[]');
    
    if (users.find((u: any) => u.email === email)) {
      return { success: false, message: 'Email already exists' };
    }

    const verificationCode = generateVerificationCode();
    
    const newUser = {
      id: Date.now().toString(),
      name,
      email,
      password,
      phone,
      isVerified: false,
      verificationCode,
      addresses: [],
      isAdmin: false
    };

    users.push(newUser);
    localStorage.setItem('lumi_tea_users', JSON.stringify(users));

    // Send verification email via API - MUST succeed before registration completes
    try {
      const result = await api.sendVerification(email, name, verificationCode);
      if (!result.success) {
        // Remove user if email failed to send
        const updatedUsers = JSON.parse(localStorage.getItem('lumi_tea_users') || '[]');
        const filteredUsers = updatedUsers.filter((u: any) => u.email !== email);
        localStorage.setItem('lumi_tea_users', JSON.stringify(filteredUsers));
        return { success: false, message: 'Failed to send verification email. Please try again.' };
      }
    } catch (error) {
      // Remove user if email failed to send
      const updatedUsers = JSON.parse(localStorage.getItem('lumi_tea_users') || '[]');
      const filteredUsers = updatedUsers.filter((u: any) => u.email !== email);
      localStorage.setItem('lumi_tea_users', JSON.stringify(filteredUsers));
      return { success: false, message: 'Failed to send verification email. Please check your email address and try again.' };
    }

    return { 
      success: true, 
      message: 'Registration successful! Please check your email for verification code.'
    };
  };

  const verifyEmail = (code: string): boolean => {
    const users = JSON.parse(localStorage.getItem('lumi_tea_users') || '[]');
    const userIndex = users.findIndex((u: any) => u.email === user?.email && u.verificationCode === code);
    
    if (userIndex !== -1) {
      users[userIndex].isVerified = true;
      users[userIndex].verificationCode = undefined;
      localStorage.setItem('lumi_tea_users', JSON.stringify(users));
      
      const { password, ...userWithoutPassword } = users[userIndex];
      setUser(userWithoutPassword);
      localStorage.setItem('lumi_tea_user', JSON.stringify(userWithoutPassword));
      return true;
    }
    return false;
  };

  const resendVerificationCode = async (): Promise<{ success: boolean }> => {
    if (!user) return { success: false };
    
    const users = JSON.parse(localStorage.getItem('lumi_tea_users') || '[]');
    const userIndex = users.findIndex((u: any) => u.email === user.email);
    
    if (userIndex !== -1) {
      const newCode = generateVerificationCode();
      users[userIndex].verificationCode = newCode;
      localStorage.setItem('lumi_tea_users', JSON.stringify(users));
      
      // Send via API - MUST succeed
      try {
        const result = await api.sendVerification(user.email, user.name, newCode);
        if (!result.success) {
          return { success: false };
        }
      } catch (error) {
        return { success: false };
      }
      
      return { success: true };
    }
    return { success: false };
  };

  const resetPassword = async (email: string): Promise<boolean> => {
    const users = JSON.parse(localStorage.getItem('lumi_tea_users') || '[]');
    const userIndex = users.findIndex((u: any) => u.email === email);
    
    if (userIndex !== -1) {
      const resetCode = generateVerificationCode();
      users[userIndex].resetCode = resetCode;
      localStorage.setItem('lumi_tea_users', JSON.stringify(users));
      
      // Send via API
      try {
        await api.sendResetCode(email, resetCode);
      } catch (error) {
        console.log('API not available');
      }
      
      return true;
    }
    return false;
  };

  const updatePassword = (code: string, newPassword: string): boolean => {
    const users = JSON.parse(localStorage.getItem('lumi_tea_users') || '[]');
    const userIndex = users.findIndex((u: any) => u.resetCode === code);
    
    if (userIndex !== -1) {
      users[userIndex].password = newPassword;
      users[userIndex].resetCode = undefined;
      localStorage.setItem('lumi_tea_users', JSON.stringify(users));
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('lumi_tea_user');
  };

  const addAddress = (address: Omit<Address, 'id'>) => {
    if (!user) return;
    
    const newAddress = { ...address, id: Date.now().toString() };
    const updatedUser = {
      ...user,
      addresses: [...(user.addresses || []), newAddress]
    };
    
    setUser(updatedUser);
    localStorage.setItem('lumi_tea_user', JSON.stringify(updatedUser));
    
    const users = JSON.parse(localStorage.getItem('lumi_tea_users') || '[]');
    const userIndex = users.findIndex((u: any) => u.id === user.id);
    if (userIndex !== -1) {
      users[userIndex] = { ...users[userIndex], addresses: updatedUser.addresses };
      localStorage.setItem('lumi_tea_users', JSON.stringify(users));
    }
  };

  const removeAddress = (id: string) => {
    if (!user) return;
    
    const updatedUser = {
      ...user,
      addresses: (user.addresses || []).filter(a => a.id !== id)
    };
    
    setUser(updatedUser);
    localStorage.setItem('lumi_tea_user', JSON.stringify(updatedUser));
  };

  const setDefaultAddress = (id: string) => {
    if (!user) return;
    
    const updatedAddresses = (user.addresses || []).map(a => ({
      ...a,
      isDefault: a.id === id
    }));
    
    const updatedUser = { ...user, addresses: updatedAddresses };
    setUser(updatedUser);
    localStorage.setItem('lumi_tea_user', JSON.stringify(updatedUser));
  };

  // Admin functions
  const getAllOrders = (): Order[] => {
    return JSON.parse(localStorage.getItem('lumi_tea_orders') || '[]');
  };

  const getPendingOrders = (): Order[] => {
    const orders = getAllOrders();
    return orders.filter(o => !o.printed && o.status === 'paid');
  };

  const updateOrderStatus = (orderId: string, status: Order['status']) => {
    const orders = getAllOrders();
    const orderIndex = orders.findIndex(o => o.orderId === orderId);
    if (orderIndex !== -1) {
      orders[orderIndex].status = status;
      localStorage.setItem('lumi_tea_orders', JSON.stringify(orders));
    }
  };

  const markOrderAsPrinted = (orderId: string) => {
    const orders = getAllOrders();
    const orderIndex = orders.findIndex(o => o.orderId === orderId);
    if (orderIndex !== -1) {
      orders[orderIndex].printed = true;
      localStorage.setItem('lumi_tea_orders', JSON.stringify(orders));
    }
  };

  const getAllSubscribers = (): string[] => {
    return JSON.parse(localStorage.getItem('lumi_tea_subscribers') || '[]');
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      isAdmin: user?.isAdmin || false,
      login,
      register,
      logout,
      verifyEmail,
      resendVerificationCode,
      resetPassword,
      updatePassword,
      addAddress,
      removeAddress,
      setDefaultAddress,
      getAllOrders,
      getPendingOrders,
      updateOrderStatus,
      markOrderAsPrinted,
      getAllSubscribers
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
