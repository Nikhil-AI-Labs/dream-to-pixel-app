import { useRef, useCallback, useEffect } from 'react';

/**
 * Hook to manage timeouts and intervals with automatic cleanup
 * Prevents memory leaks by cleaning up all timers on unmount
 */
export const useCleanup = () => {
  const timeoutsRef = useRef<Set<ReturnType<typeof setTimeout>>>(new Set());
  const intervalsRef = useRef<Set<ReturnType<typeof setInterval>>>(new Set());
  const abortControllersRef = useRef<Set<AbortController>>(new Set());

  /**
   * Add a timeout with automatic cleanup
   */
  const addTimeout = useCallback((fn: () => void, delay: number): ReturnType<typeof setTimeout> => {
    const id = setTimeout(() => {
      fn();
      timeoutsRef.current.delete(id);
    }, delay);
    timeoutsRef.current.add(id);
    return id;
  }, []);

  /**
   * Clear a specific timeout
   */
  const clearTimeoutById = useCallback((id: ReturnType<typeof setTimeout>) => {
    clearTimeout(id);
    timeoutsRef.current.delete(id);
  }, []);

  /**
   * Add an interval with automatic cleanup
   */
  const addInterval = useCallback((fn: () => void, delay: number): ReturnType<typeof setInterval> => {
    const id = setInterval(fn, delay);
    intervalsRef.current.add(id);
    return id;
  }, []);

  /**
   * Clear a specific interval
   */
  const clearIntervalById = useCallback((id: ReturnType<typeof setInterval>) => {
    clearInterval(id);
    intervalsRef.current.delete(id);
  }, []);

  /**
   * Create an abort controller with automatic cleanup
   */
  const createAbortController = useCallback((): AbortController => {
    const controller = new AbortController();
    abortControllersRef.current.add(controller);
    return controller;
  }, []);

  /**
   * Remove an abort controller from tracking (after it's been used)
   */
  const removeAbortController = useCallback((controller: AbortController) => {
    abortControllersRef.current.delete(controller);
  }, []);

  /**
   * Abort all pending requests
   */
  const abortAll = useCallback(() => {
    abortControllersRef.current.forEach(controller => {
      if (!controller.signal.aborted) {
        controller.abort();
      }
    });
    abortControllersRef.current.clear();
  }, []);

  /**
   * Clear all timeouts
   */
  const clearAllTimeouts = useCallback(() => {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current.clear();
  }, []);

  /**
   * Clear all intervals
   */
  const clearAllIntervals = useCallback(() => {
    intervalsRef.current.forEach(clearInterval);
    intervalsRef.current.clear();
  }, []);

  /**
   * Clear everything
   */
  const cleanupAll = useCallback(() => {
    clearAllTimeouts();
    clearAllIntervals();
    abortAll();
  }, [clearAllTimeouts, clearAllIntervals, abortAll]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      timeoutsRef.current.forEach(clearTimeout);
      intervalsRef.current.forEach(clearInterval);
      abortControllersRef.current.forEach(controller => {
        if (!controller.signal.aborted) {
          controller.abort();
        }
      });
      timeoutsRef.current.clear();
      intervalsRef.current.clear();
      abortControllersRef.current.clear();
    };
  }, []);

  return {
    addTimeout,
    clearTimeoutById,
    addInterval,
    clearIntervalById,
    createAbortController,
    removeAbortController,
    abortAll,
    clearAllTimeouts,
    clearAllIntervals,
    cleanupAll
  };
};

export default useCleanup;
