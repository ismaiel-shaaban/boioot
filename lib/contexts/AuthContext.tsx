'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { jwtDecode } from 'jwt-decode';
import { apiClient } from '@/lib/core/http/client';
import { environment } from '@/lib/config/environment';

interface LoginResponse {
  Success: boolean;
  Data: {
    token: string;
    user: any;
  };
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: any | null;
  token: string | null;
  login: (Identifier: string, Password: string) => Promise<any>;
  logout: () => void;
  register: (phoneNumber: string, fullName: string, email: string, password: string, accountType: string) => Promise<any>;
  sendPhoneVerification: (email: string) => Promise<any>;
  verifyOTP: (Identifier: string, code: string) => Promise<any>;
  changePassword: (oldPassword: string, newPassword: string) => Promise<any>;
  getUserProfile: () => Promise<any>;
  updateUserProfile: (data: any) => Promise<any>;
  uploadUserProfile: (file: File) => Promise<any>;
  forgetPassword: (email: string) => Promise<any>;
  resetPassword: (Identifier: string, Token: string, NewPassword: string) => Promise<any>;
  hasRealEstateCompanyRole: () => boolean;
  getUserRole: () => string | null;
  getValidToken: () => Promise<string | null>;
  decodeToken: () => any;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<any | null>(null);

  useEffect(() => {
    // Initialize from localStorage
    if (typeof window !== 'undefined') {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        setToken(storedToken);
        const decoded = decodeToken(storedToken);
        setUser(decoded);
        // Sync token to cookie for middleware
        document.cookie = `token=${storedToken}; path=/; max-age=86400; SameSite=Lax`;
      }
    }
  }, []);

  const decodeToken = (tokenString?: string): any => {
    const tokenToDecode = tokenString || token;
    if (!tokenToDecode) return null;

    try {
      return jwtDecode(tokenToDecode);
    } catch (error) {
      console.error('Token decode error:', error);
      return null;
    }
  };

  const isTokenExpired = (tokenString?: string): boolean => {
    const tokenToCheck = tokenString || token;
    if (!tokenToCheck) return true;

    try {
      const decoded = jwtDecode<{ exp?: number }>(tokenToCheck);
      if (!decoded.exp) return true;

      const currentTime = Math.floor(Date.now() / 1000);
      return decoded.exp < currentTime;
    } catch {
      return true;
    }
  };

  const getValidToken = async (): Promise<string | null> => {
    if (typeof window === 'undefined') return null;

    const storedToken = localStorage.getItem('token');
    if (!storedToken) {
      return null;
    }

    if (isTokenExpired(storedToken)) {
      console.log('Token expired, logging out user');
      logout();
      return null;
    }

    return storedToken;
  };

  const login = async (Identifier: string, Password: string): Promise<any> => {
    const response = await apiClient.post<any>(
      `${environment.identityApiUrl}/Auth/login`,
      { Identifier, Password },
      { skipAuth: true }
    );

    if ((response.Success || response.IsSuccess) && response.Data) {
      const newToken = response.Data.AccessToken || response.Data.token;
      if (newToken) {
        setToken(newToken);
        if (typeof window !== 'undefined') {
          localStorage.setItem('token', newToken);
          if (response.Data.user) {
            localStorage.setItem('user', JSON.stringify(response.Data.user));
          }
          // Store token in cookie for middleware
          document.cookie = `token=${newToken}; path=/; max-age=86400; SameSite=Lax`;
        }
        const decoded = decodeToken(newToken);
        setUser(decoded);
      }
    }

    return response;
  };

  const register = async (
    phoneNumber: string,
    fullName: string,
    email: string,
    password: string,
    accountType: string
  ): Promise<any> => {
    const request = {
      FullName: fullName,
      Email: email,
      PhoneNumber: phoneNumber,
      Password: password,
      UserType: accountType,
    };

    return apiClient.post(
      `${environment.identityApiUrl}/Users/register`,
      { Request: request },
      { skipAuth: true }
    );
  };

  const sendPhoneVerification = async (email: string): Promise<any> => {
    return apiClient.post(
      `${environment.identityApiUrl}/Users/check-identifier`,
      { Identifier: email },
      { skipAuth: true }
    );
  };

  const verifyOTP = async (Identifier: string, code: string): Promise<any> => {
    return apiClient.post(
      `${environment.identityApiUrl}/Users/verify-otp`,
      { Identifier, code },
      { skipAuth: true }
    );
  };

  const changePassword = async (oldPassword: string, newPassword: string): Promise<any> => {
    const validToken = await getValidToken();
    if (!validToken) {
      throw new Error('Not authenticated');
    }

    const request = {
      CurrentPassword: oldPassword,
      NewPassword: newPassword,
      ConfirmPassword: newPassword,
    };

    return apiClient.post(
      `${environment.identityApiUrl}/Auth/change-password`,
      { Request: request }
    );
  };

  const getUserProfile = async (): Promise<any> => {
    return apiClient.get(`${environment.identityApiUrl}/Users`);
  };

  const updateUserProfile = async (data: any): Promise<any> => {
    return apiClient.put(`${environment.identityApiUrl}/Users`, data);
  };

  const uploadUserProfile = async (file: File): Promise<any> => {
    const formData = new FormData();
    formData.append('file', file);

    return apiClient.post(
      `${environment.identityApiUrl}/Users/upload-profile-image`,
      formData
    );
  };

  const forgetPassword = async (email: string): Promise<any> => {
    return apiClient.post(
      `${environment.identityApiUrl}/Auth/forgot-password`,
      { email },
      { skipAuth: true }
    );
  };

  const resetPassword = async (Identifier: string, Token: string, NewPassword: string): Promise<any> => {
    const request = {
      Identifier,
      Token,
      NewPassword,
    };

    return apiClient.post(
      `${environment.identityApiUrl}/Auth/reset-password`,
      { Request: request },
      { skipAuth: true }
    );
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('tokenExpireAt');
      // Clear token cookie
      document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax';
    }
  };

  const hasRealEstateCompanyRole = (): boolean => {
    const decoded = decodeToken();
    if (!decoded) return false;

    const role = decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
    return role === 'RealEstateCompany';
  };

  const getUserRole = (): string | null => {
    const decoded = decodeToken();
    if (!decoded) return null;

    return decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
  };

  const value: AuthContextType = {
    isAuthenticated: !!token && !isTokenExpired(token),
    user,
    token,
    login,
    logout,
    register,
    sendPhoneVerification,
    verifyOTP,
    changePassword,
    getUserProfile,
    updateUserProfile,
    uploadUserProfile,
    forgetPassword,
    resetPassword,
    hasRealEstateCompanyRole,
    getUserRole,
    getValidToken,
    decodeToken: () => decodeToken(),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

