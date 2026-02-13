import { createContext, useContext, useEffect, useMemo, useState, useCallback } from "react";
import authService from "../services/api/authService";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  // ✅ Auth modal global state
  const [authModal, setAuthModal] = useState({
    isOpen: false,
    mode: "login", // "login" | "register" | "forgot"
  });

  // ✅ optional: run something after login/register success
  const [postAuthAction, setPostAuthAction] = useState(null);

  const closeAuthModal = useCallback(() => {
    setAuthModal((m) => ({ ...m, isOpen: false }));
  }, []);

  const openAuthModal = useCallback((mode = "login", onSuccess = null) => {
    setPostAuthAction(() => (typeof onSuccess === "function" ? onSuccess : null));
    setAuthModal({ isOpen: true, mode });
  }, []);

  const runPostAuthAction = useCallback(async () => {
    if (!postAuthAction) return;
    const fn = postAuthAction;
    setPostAuthAction(null);
    try {
      await fn();
    } catch {
      // умишлено мълчим - UI си показва грешки където трябва
    }
  }, [postAuthAction]);

  const refreshMe = useCallback(async () => {
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
  }, []);

  useEffect(() => {
    refreshMe();
  }, [refreshMe]);

  const login = useCallback(
    async ({ email, password }) => {
      const me = await authService.login({ email, password });
      setUser(me);

      // ✅ close modal + run after-auth action
      closeAuthModal();
      await runPostAuthAction();

      return me;
    },
    [closeAuthModal, runPostAuthAction]
  );

  const register = useCallback(
    async ({ firstName, lastName, email, password }) => {
      const me = await authService.register({ firstName, lastName, email, password });
      setUser(me);

      // ✅ close modal + run after-auth action
      closeAuthModal();
      await runPostAuthAction();

      return me;
    },
    [closeAuthModal, runPostAuthAction]
  );

  const logout = useCallback(async () => {
    await authService.logout();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      isAuthLoading,
      login,
      register,
      logout,
      refreshMe,

      // ✅ modal API
      authModal,
      openAuthModal,
      closeAuthModal,
    }),
    [user, isAuthLoading, login, register, logout, refreshMe, authModal, openAuthModal, closeAuthModal]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
};