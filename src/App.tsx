import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Suspense, useEffect } from "react";
import LoadingFallback from "@/components/LoadingFallback";
import OfflineIndicator from "@/components/Mobile/OfflineIndicator";
import InstallPrompt from "@/components/Mobile/InstallPrompt";
import ProtectedRoute from "@/components/ProtectedRoute";
import ErrorBoundary from "@/components/ErrorBoundary";
import { useViewportHeight } from "@/hooks/useViewportHeight";
import { notificationService } from "@/services/notifications";
import { setupGlobalErrorHandlers } from "@/services/errorLogging";
import { AuthProvider } from "@/contexts/AuthContext";

// Lazy loaded pages for code splitting
import {
  LazyDashboard,
  LazyAccounts,
  LazyNewAccount,
  LazyEditAccount,
  LazyLogs,
  LazySettings,
  LazyLogin,
  LazySignup,
  LazyForgotPassword,
  LazySetup,
  LazyNotFound,
} from "@/utils/lazyLoading";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 2,
    },
  },
});

// App content with hooks
const AppContent = () => {
  // Handle mobile viewport height
  useViewportHeight();

  // Initialize notification service and global error handlers
  useEffect(() => {
    notificationService.initialize();
    setupGlobalErrorHandlers();
  }, []);

  return (
    <>
      {/* PWA Components */}
      <OfflineIndicator />
      <InstallPrompt />

      {/* Routes */}
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          {/* Public Auth Routes */}
          <Route path="/login" element={<LazyLogin />} />
          <Route path="/signup" element={<LazySignup />} />
          <Route path="/forgot-password" element={<LazyForgotPassword />} />

          {/* Setup Route (protected but different flow) */}
          <Route path="/setup" element={<LazySetup />} />

          {/* Protected Main App Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <LazyDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/accounts"
            element={
              <ProtectedRoute>
                <LazyAccounts />
              </ProtectedRoute>
            }
          />
          <Route
            path="/accounts/new"
            element={
              <ProtectedRoute>
                <LazyNewAccount />
              </ProtectedRoute>
            }
          />
          <Route
            path="/accounts/:id/edit"
            element={
              <ProtectedRoute>
                <LazyEditAccount />
              </ProtectedRoute>
            }
          />
          <Route
            path="/logs"
            element={
              <ProtectedRoute>
                <LazyLogs />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <LazySettings />
              </ProtectedRoute>
            }
          />

          {/* Redirects */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          {/* 404 */}
          <Route path="*" element={<LazyNotFound />} />
        </Routes>
      </Suspense>
    </>
  );
};

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AppContent />
          </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
