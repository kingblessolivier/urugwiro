import React, { createContext, useContext, useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { api } from '../api/endpoints';
import { logWarn } from '../lib/utils';

export interface AuthUser {
    id: number | string;
    username: string;
    email: string;
    role: 'customer' | 'seller' | 'staff' | 'admin' | 'finance' | 'owner' | string;
    first_name?: string;
    last_name?: string;
    full_name?: string;
    is_staff?: boolean;
}

interface AuthContextType {
    user: AuthUser | null;
    token: string | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    login: (credentials: { username?: string; email?: string; password: string }) => Promise<AuthUser>;
    register: (data: { username?: string; email: string; password: string; role: 'customer' | 'buyer' | 'tenant'; full_name?: string }) => Promise<AuthUser>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const queryClient = useQueryClient();
    const [user, setUser] = useState<AuthUser | null>(() => {
        try {
            const cached = localStorage.getItem('urugwiro_user');
            return cached ? JSON.parse(cached) : null;
        } catch {
            return null;
        }
    });
    const [token, setToken] = useState<string | null>(() => localStorage.getItem('access_token'));
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
        const handleExpiredSession = () => {
            setUser(null);
            setToken(null);
            queryClient.clear();
        };
        window.addEventListener('urugwiro:auth-expired', handleExpiredSession);
        return () => window.removeEventListener('urugwiro:auth-expired', handleExpiredSession);
    }, [queryClient]);

    useEffect(() => {
        const verifySession = async () => {
            const savedToken = localStorage.getItem('access_token');
            const hasValidToken = savedToken && savedToken !== 'undefined' && savedToken !== 'null';
            const cachedUser = localStorage.getItem('urugwiro_user');

            if (!hasValidToken && !cachedUser) {
                setIsLoading(false);
                return;
            }

            try {
                const response = await api.auth.me();
                const userData = response.data?.user || response.data;
                if (userData && (userData.username || userData.id)) {
                    setUser(userData);
                    localStorage.setItem('urugwiro_user', JSON.stringify(userData));
                    if (userData.role) {
                        localStorage.setItem('user_role', userData.role);
                    }
                }
            } catch (err: any) {
                logWarn('Session verification failed, clearing session:', err);
                if (err.response?.status === 401) {
                    localStorage.removeItem('access_token');
                    localStorage.removeItem('refresh_token');
                    localStorage.removeItem('urugwiro_user');
                    localStorage.removeItem('user_role');
                    setUser(null);
                    setToken(null);
                }
            } finally {
                setIsLoading(false);
            }
        };

        verifySession();
    }, []);

    const login = async (credentials: { username?: string; email?: string; password: string }): Promise<AuthUser> => {
        queryClient.clear();
        const response = await api.auth.login(credentials);
        const loggedUser = response.data?.user || response.data;
        const access = response.data?.access || '';
        const refresh = response.data?.refresh || '';

        if (access) {
            localStorage.setItem('access_token', access);
            setToken(access);
        }
        if (refresh) {
            localStorage.setItem('refresh_token', refresh);
        }
        if (loggedUser) {
            localStorage.setItem('urugwiro_user', JSON.stringify(loggedUser));
            if (loggedUser.role) {
                localStorage.setItem('user_role', loggedUser.role);
            }
            setUser(loggedUser);
        }
        return loggedUser;
    };

    const register = async (data: { username?: string; email: string; password: string; role: string; full_name?: string }): Promise<AuthUser> => {
        queryClient.clear();
        const response = await api.auth.register(data);
        const registeredUser = response.data?.user || response.data;
        const access = response.data?.access || '';
        const refresh = response.data?.refresh || '';

        if (access) {
            localStorage.setItem('access_token', access);
            setToken(access);
        }
        if (refresh) {
            localStorage.setItem('refresh_token', refresh);
        }
        if (registeredUser) {
            localStorage.setItem('urugwiro_user', JSON.stringify(registeredUser));
            if (registeredUser.role) {
                localStorage.setItem('user_role', registeredUser.role);
            }
            setUser(registeredUser);
        }
        return registeredUser;
    };

    const logout = async () => {
        const refresh = localStorage.getItem('refresh_token');
        try {
            if (refresh) {
                await api.auth.logout(refresh);
            }
        } catch (e) {
            logWarn('Logout error ignored:', e);
        } finally {
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            localStorage.removeItem('urugwiro_user');
            localStorage.removeItem('user_role');
            setUser(null);
            setToken(null);
            queryClient.clear();
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                isLoading,
                isAuthenticated: !!user && !!token,
                login,
                register,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
