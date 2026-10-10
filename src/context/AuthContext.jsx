import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

import { api, getStoredToken, setStoredToken, clearStoredToken } from '../services/api.js';









































const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
  const [member, setMember] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshProfile = useCallback(async () => {
    const token = getStoredToken();
    if (!token) {
      setMember(null);
      setIsLoading(false);
      return;
    }

    try {
      const response = await api.getMe();
      if (response && response.member) {
        setMember(response.member);
      } else {
        clearStoredToken();
        setMember(null);
      }
    } catch {
      clearStoredToken();
      setMember(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshProfile();
  }, [refreshProfile]);

  const login = async (memberId, password) => {
    const res = await api.login({ memberId, password });
    // BUG-03 FIX: Never set member as authenticated without a valid token.
    if (!res.token) throw new Error('Authentication failed: server did not return a session token.');
    setStoredToken(res.token);
    setMember(res.member);
    return { success: true, member: res.member };
  };

  const adminLogin = async (memberId, password) => {
    const res = await api.adminLogin({ memberId, password });
    // BUG-03 FIX: Never set member as authenticated without a valid token.
    if (!res.token) throw new Error('Admin authentication failed: server did not return a session token.');
    setStoredToken(res.token);
    setMember(res.member);
    return { success: true, member: res.member };
  };

  const register = async (params) =>













  {
    const res = await api.register(params);
    if (res.token) {
      setStoredToken(res.token);
      setMember(res.member);
    }
    return {
      success: true,
      memberId: res.memberId,
      member: res.member,
      course: res.course,
      enrollment: res.enrollment,
      activationUrl: res.activationUrl || (res.activation ? res.activation.activationUrl : undefined),
      activationToken: res.activationToken || (res.activation ? res.activation.token : undefined),
      activationCode: res.activationCode || (res.activation ? res.activation.activationCode : undefined),
      telegramBotUsername: res.telegramBotUsername || 'ARXITCLUB_bot',
      telegramBotUrl: res.telegramBotUrl || 'https://t.me/ARXITCLUB_bot',
      telegramChannelUrl: res.telegramChannelUrl || 'https://t.me/arxitclub',
      telegramChannelName: res.telegramChannelName || '@arxitclub'
    };
  };

  const logout = () => {
    api.logout();
    setMember(null);
  };

  const updateMemberState = (updatedMember) => {
    setMember(updatedMember);
  };

  return (
    <AuthContext.Provider
      value={{
        member,
        isAuthenticated: !!member,
        isAdmin: member?.role === 'admin',
        isLoading,
        login,
        adminLogin,
        register,
        logout,
        refreshProfile,
        updateMemberState
      }}>
      
      {children}
    </AuthContext.Provider>);

};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}