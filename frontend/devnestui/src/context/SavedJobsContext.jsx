/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { savedJobsService } from "../services/api/savedJobsService";

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
      setIsHydrating(true);
      try {
        let ids = null;

        // Prefer /saved-jobs/ids if exists
        try {
          const got = await savedJobsService.ids();
          if (Array.isArray(got)) ids = got;
        } catch {
          // ids endpoint may not exist
        }

        // Fallback to list() -> ids
        if (!ids) {
          const list = await savedJobsService.list();
          ids = Array.isArray(list) ? list.map((x) => x.id).filter(Boolean) : [];
        }

        if (!mounted) return;
        setSavedIds(ids);
        hydratedOnceRef.current = true;
      } catch {
        hydratedOnceRef.current = true; // keep local cache
      } finally {
        if (mounted) setIsHydrating(false);
      }
    }

    hydrate();
    return () => {
      mounted = false;
    };
  }, []);

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
