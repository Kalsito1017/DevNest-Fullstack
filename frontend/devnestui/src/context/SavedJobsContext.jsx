/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { savedJobsService } from "../services/api/savedJobsService";
import { useAuth } from "./AuthContext";

export const SavedJobsContext = createContext(null);

export function SavedJobsProvider({ children }) {
  const [savedIds, setSavedIds] = useState(() => {
    try {
      const raw = localStorage.getItem("saved_job_ids_v1");
      const arr = raw ? JSON.parse(raw) : [];
      return Array.isArray(arr) ? arr : [];
    } catch {
      return [];
    }
  });

  const { user, isAuthLoading } = useAuth();
  const [isHydrating, setIsHydrating] = useState(true);
  const hydratedOnceRef = useRef(false);

  // local cache for instant UI
  useEffect(() => {
    try {
      localStorage.setItem("saved_job_ids_v1", JSON.stringify(savedIds));
    } catch {
      // ignore
    }
  }, [savedIds]);

  // hydrate once from backend (authoritative)
  useEffect(() => {
  let mounted = true;

  async function hydrate() {
    // чакаме auth да се изясни
    if (isAuthLoading) return;

    // ако няма user -> чистим server-saved и НЕ правим заявки
    if (!user) {
      if (mounted) {
        setSavedIds([]);
        setIsHydrating(false);
        hydratedOnceRef.current = true;
      }
      return;
    }

    setIsHydrating(true);
    try {
      // ✅ махаме ids() докато нямаш реален endpoint (при теб дава 405)
      const list = await savedJobsService.list();
      const ids = Array.isArray(list) ? list.map((x) => Number(x.id)).filter(Boolean) : [];

      if (!mounted) return;
      setSavedIds(ids);
      hydratedOnceRef.current = true;
    } catch (e) {
      // ако е 401 -> logout scenario -> чистим
      const status = e?.response?.status;
      if (mounted && status === 401) setSavedIds([]);
      hydratedOnceRef.current = true;
    } finally {
      if (mounted) setIsHydrating(false);
    }
  }

  hydrate();
  return () => {
    mounted = false;
  };
}, [user, isAuthLoading]);

  const isSaved = useCallback((jobId) => savedIds.includes(Number(jobId)), [savedIds]);

  const toggleSaved = useCallback(async (jobId) => {
    const id = Number(jobId);
    if (!id) return { saved: false };

    // optimistic
    setSavedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

    try {
      const res = await savedJobsService.toggle(id); // { saved: true/false }

      if (res && typeof res.saved === "boolean") {
        setSavedIds((prev) => {
          const has = prev.includes(id);
          if (res.saved && !has) return [...prev, id];
          if (!res.saved && has) return prev.filter((x) => x !== id);
          return prev;
        });
      }

      return res;
    } catch (e) {
      // rollback
      setSavedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
      throw e;
    }
  }, []);

  const clearSaved = useCallback(() => setSavedIds([]), []);

  const value = useMemo(
    () => ({
      savedIds,
      isHydrating,
      hydratedOnce: hydratedOnceRef.current,
      isSaved,
      toggleSaved,
      setSavedIds,
      clearSaved,
    }),
    [savedIds, isHydrating, isSaved, toggleSaved, clearSaved]
  );

  return <SavedJobsContext.Provider value={value}>{children}</SavedJobsContext.Provider>;
}

export function useSavedJobs() {
  const ctx = useContext(SavedJobsContext);
  if (!ctx) throw new Error("useSavedJobs must be used inside SavedJobsProvider");
  return ctx;
}
