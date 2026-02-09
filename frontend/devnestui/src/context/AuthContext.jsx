import { createContext, useContext, useEffect, useMemo, useState } from "react";
import authService from "../services/api/authService";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  const refreshMe = async () => {
    try {
      const me = await authService.me();
      setUser(me);
      return me;
    } catch {
      setUser(null);
      return null;
    } finally {
      setIsAuthLoading(false);
    }
  };

  useEffect(() => {
    refreshMe();
  }, []);

  const login = async ({ email, password }) => {
    const me = await authService.login({ email, password });
    setUser(me);
    return me;
  };

  const register = async ({ firstName, lastName, email, password }) => {
    const me = await authService.register({ firstName, lastName, email, password });
    setUser(me);
    return me;
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
  };

  const value = useMemo(
    () => ({ user, isAuthLoading, login, register, logout, refreshMe }),
    [user, isAuthLoading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
};
