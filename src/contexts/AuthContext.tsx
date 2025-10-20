import React, { createContext, useContext, useState, useEffect } from 'react';
import { API_URL } from '@/config/api';

interface User {
  id: number;
  oauth_provider: string;
  oauth_id: string;
  full_name: string;
  email?: string;
  phone?: string;
  city?: string;
  avatar_url?: string;
  referral_code: string;
  total_orders: number;
  total_earnings: number;
  referral_earnings: number;
  is_verified: boolean;
  vehicle_type?: string;
  created_at?: string;
  invited_by_user_id?: number;
  inviter_name?: string;
  inviter_avatar?: string;
  inviter_code?: string;
  self_orders_count?: number;
  self_bonus_paid?: boolean;
  nickname?: string;
  game_high_score?: number;
  game_total_plays?: number;
  game_achievements?: string[];
  agreed_to_terms?: boolean;
  sbp_phone?: string;
  sbp_bank_name?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string, userData: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
  updateUser: (userData: Partial<User>) => void;
  refreshUserData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const savedToken = localStorage.getItem('auth_token');
    const savedUser = localStorage.getItem('user_data');

    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
      
      verifyToken(savedToken);
    }
  }, []);

  const verifyToken = async (authToken: string) => {
    try {
      const response = await fetch(`${API_URL}?route=auth`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'verify',
          token: authToken
        })
      });

      const data = await response.json();

      if (data.success && data.valid && data.user) {
        setUser(data.user);
        localStorage.setItem('user_data', JSON.stringify(data.user));
      } else {
        logout();
      }
    } catch (error) {
      console.error('Token verification failed:', error);
      logout();
    }
  };

  const login = (authToken: string, userData: User) => {
    setToken(authToken);
    setUser(userData);
    localStorage.setItem('auth_token', authToken);
    localStorage.setItem('user_data', JSON.stringify(userData));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      localStorage.setItem('user_data', JSON.stringify(updatedUser));
    }
  };

  const refreshUserData = async () => {
    if (!token) return;
    
    try {
      const response = await fetch(`${API_URL}?route=auth`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'verify',
          token: token
        })
      });

      const data = await response.json();

      if (data.success && data.valid && data.user) {
        setUser(data.user);
        localStorage.setItem('user_data', JSON.stringify(data.user));
      }
    } catch (error) {
      console.error('Failed to refresh user data:', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        logout,
        isAuthenticated: !!token && !!user,
        updateUser,
        refreshUserData
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};