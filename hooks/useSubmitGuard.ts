import { useRef, useCallback } from "react";

/**
 * Prevents double-submission without showing loading states on buttons.
 * Call `guard()` — if it returns true, run async work and `release()` in onSettled/finally.
 */
export function useSubmitGuard() {
  const locked = useRef(false);
  const guard = useCallback((): boolean => {
    if (locked.current) return false;
    locked.current = true;
    return true;
  }, []);
  const release = useCallback(() => {
    locked.current = false;
  }, []);
  return { guard, release };
}
