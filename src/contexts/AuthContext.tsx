import React, { createContext, useCallback, useMemo, useState } from 'react';
import { AuthResponse, LoginRequest, RegisterRequest } from '../types';
import { authService } from '../services/authService';
import { tokenStorage } from '../utils/tokenStorage';
import { roleLabel } from '../utils/roles';

interface AuthContextType {
  user: AuthResponse | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  canManageUsers: boolean;
  roleName: string;
  login: (credentials: LoginRequest) => Promise<void>;
  register: (payload: RegisterRequest) => Promise<void>;
  updateSession: (session: AuthResponse) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthResponse | null>(() => tokenStorage.getSession());

  const updateSession = useCallback((session: AuthResponse) => {
    tokenStorage.setSession(session);
    setUser(session);
  }, []);

  const login = useCallback(
    async (credentials: LoginRequest) => updateSession(await authService.login(credentials)),
    [updateSession]
  );

  const register = useCallback(
    async (payload: RegisterRequest) => updateSession(await authService.register(payload)),
    [updateSession]
  );

  const logout = useCallback(() => {
    tokenStorage.clearSession();
    setUser(null);
  }, []);

  const value = useMemo(() => {
    const roles = user?.roles ?? [];
    return {
      user,
      isAuthenticated: Boolean(user?.token),
      isAdmin: roles.includes('ROLE_ADMIN'),
      canManageUsers: roles.includes('ROLE_ADMIN') || roles.includes('ROLE_MANAGER'),
      roleName: roleLabel(roles),
      login,
      register,
      updateSession,
      logout,
    };
  }, [user, login, register, updateSession, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
