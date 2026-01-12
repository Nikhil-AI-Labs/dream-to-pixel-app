import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Suspense, useEffect } from "react";
import LoadingFallback from "@/components/LoadingFallback";
import OfflineIndicator from "@/components/Mobile/OfflineIndicator";
import InstallPrompt from "@/components/Mobile/InstallPrompt";
import { useViewportHeight } from "@/hooks/useViewportHeight";
import { notificationService } from "@/services/notifications";

// Lazy loaded pages for code splitting
import {
  LazyDashboard,
  LazyAccounts,
  LazyNewAccount,
  LazyEditAccount,
  LazyLogs,
  LazySettings,
  LazyLogin,
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

  // Initialize notification service
  useEffect(() => {
    notificationService.initialize();
  }, []);

  return (
    <>
      {/* PWA Components */}
      <OfflineIndicator />
      <InstallPrompt />

      {/* Routes */}
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          {/* Auth Routes */}
          <Route path="/login" element={<LazyLogin />} />
          <Route path="/setup" element={<LazySetup />} />

          {/* Main App Routes */}
          <Route path="/dashboard" element={<LazyDashboard />} />
          <Route path="/accounts" element={<LazyAccounts />} />
          <Route path="/accounts/new" element={<LazyNewAccount />} />
          <Route path="/accounts/:id/edit" element={<LazyEditAccount />} />
          <Route path="/logs" element={<LazyLogs />} />
          <Route path="/settings" element={<LazySettings />} />

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
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
