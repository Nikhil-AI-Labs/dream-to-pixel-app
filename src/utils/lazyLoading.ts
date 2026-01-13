import { lazy, ComponentType } from 'react';

/**
 * Lazy loading utilities for route-based code splitting
 * This reduces initial bundle size by loading pages on demand
 */

// Wrapper to add artificial delay for loading states (development only)
const artificialDelay = <T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  delay: number = 0
): Promise<{ default: T }> => {
  if (delay === 0 || process.env.NODE_ENV === 'production') {
    return importFn();
  }
  return new Promise(resolve => {
    setTimeout(() => resolve(importFn()), delay);
  });
};

// Lazy loaded pages
export const LazyDashboard = lazy(() => 
  import('../pages/Dashboard')
);

export const LazyAccounts = lazy(() => 
  import('../pages/Accounts')
);

export const LazyNewAccount = lazy(() => 
  import('../pages/NewAccount')
);

export const LazyEditAccount = lazy(() => 
  import('../pages/EditAccount')
);

export const LazyLogs = lazy(() => 
  import('../pages/Logs')
);

export const LazySettings = lazy(() => 
  import('../pages/Settings')
);

export const LazyLogin = lazy(() => 
  import('../pages/Login')
);

export const LazySignup = lazy(() => 
  import('../pages/Signup')
);

export const LazyForgotPassword = lazy(() => 
  import('../pages/ForgotPassword')
);

export const LazySetup = lazy(() => 
  import('../pages/Setup')
);

export const LazyNotFound = lazy(() => 
  import('../pages/NotFound')
);

// Preload functions for route prefetching
export const preloadDashboard = () => import('../pages/Dashboard');
export const preloadAccounts = () => import('../pages/Accounts');
export const preloadLogs = () => import('../pages/Logs');
export const preloadSettings = () => import('../pages/Settings');
