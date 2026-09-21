import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../api/endpoints';

export interface AuthUser {
    id: number | string;
    username: string;
    email: string;
    role: 'Admin' | 'Agent' | 'Seller' | 'Owner' | 'Tenant' | 'Buyer' | string;
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
    register: (data: { username?: string; email: string; password: string; role: 'Buyer' | 'Tenant'; full_name?: string }) => Promise<AuthUser>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
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
        const verifySession = async () => {
            const savedToken = localStorage.getItem('access_token');
            if (!savedToken) {
                setIsLoading(false);
                return;
            }

            try {
                const response = await api.auth.me();
                if (response.data?.user) {
                    setUser(response.data.user);
                    localStorage.setItem('urugwiro_user', JSON.stringify(response.data.user));
                    localStorage.setItem('user_role', response.data.user.role);
                }
            } catch (err: any) {
                console.warn('Session verification failed, clearing session:', err);
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
        const response = await api.auth.login(credentials);
        const { access, refresh, user: loggedUser } = response.data;

        localStorage.setItem('access_token', access);
        localStorage.setItem('refresh_token', refresh);
        localStorage.setItem('urugwiro_user', JSON.stringify(loggedUser));
        localStorage.setItem('user_role', loggedUser.role);

        setToken(access);
        setUser(loggedUser);
        return loggedUser;
    };

    const register = async (data: { username?: string; email: string; password: string; role: 'Buyer' | 'Tenant'; full_name?: string }): Promise<AuthUser> => {
        const response = await api.auth.register(data);
        const { access, refresh, user: registeredUser } = response.data;

        localStorage.setItem('access_token', access);
        localStorage.setItem('refresh_token', refresh);
        localStorage.setItem('urugwiro_user', JSON.stringify(registeredUser));
        localStorage.setItem('user_role', registeredUser.role);

        setToken(access);
        setUser(registeredUser);
        return registeredUser;
    };

    const logout = async () => {
        const refresh = localStorage.getItem('refresh_token');
        try {
            if (refresh) {
                await api.auth.logout(refresh);
            }
        } catch (e) {
            console.warn('Logout error ignored:', e);
        } finally {
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            localStorage.removeItem('urugwiro_user');
            localStorage.removeItem('user_role');
            setUser(null);
            setToken(null);
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
