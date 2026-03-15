import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI } from './api';

interface User {
    id: string;
    email: string;
    name: string;
    role: 'user' | 'admin';
}

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    isAdmin: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (email: string, code: string, password: string, name: string) => Promise<void>;
    logout: () => void;
    sendVerification: (email: string) => Promise<void>;
    refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Check for existing token on mount
    useEffect(() => {
        const initAuth = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    const data = await authAPI.getMe();
                    setUser(data.user);
                } catch (error) {
                    console.error('Token validation failed:', error);
                    localStorage.removeItem('token');
                }
            }
            setIsLoading(false);
        };

        initAuth();
    }, []);

    const sendVerification = useCallback(async (email: string) => {
        await authAPI.sendVerification(email);
    }, []);

    const register = useCallback(async (
        email: string,
        code: string,
        password: string,
        name: string
    ) => {
        const data = await authAPI.verifyAndRegister(email, code, password, name);
        localStorage.setItem('token', data.token);
        setUser(data.user);
    }, []);

    const login = useCallback(async (email: string, password: string) => {
        const data = await authAPI.login(email, password);
        localStorage.setItem('token', data.token);
        setUser(data.user);
    }, []);

    const logout = useCallback(() => {
        localStorage.removeItem('token');
        setUser(null);
    }, []);

    const refreshUser = useCallback(async () => {
        try {
            const data = await authAPI.getMe();
            setUser(data.user);
        } catch (error) {
            console.error('Failed to refresh user:', error);
        }
    }, []);

    const value: AuthContextType = {
        user,
        isLoading,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
        login,
        register,
        logout,
        sendVerification,
        refreshUser,
    };

    return (
        <AuthContext.Provider value={value}>
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

export default AuthContext;
