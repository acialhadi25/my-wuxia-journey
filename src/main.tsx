import { StrictMode, useEffect } from 'react';
import { createRoot } from "react-dom/client";
import { BrowserRouter, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HelmetProvider } from 'react-helmet-async';
import { ErrorBoundary } from './components/ErrorBoundary';
import { initGA, trackPageView } from './lib/analytics';
import { perf } from './lib/performance';
import App from "./App.tsx";
import "./index.css";

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
  },
});

// Analytics wrapper component
function AnalyticsWrapper({ children }: { children: React.ReactNode }) {
  const location = useLocation();

  useEffect(() => {
    // Track page views
    trackPageView(location.pathname + location.search);
  }, [location]);

  return <>{children}</>;
}

// Initialize analytics and performance monitoring
if (import.meta.env.PROD) {
  initGA();
}

// Log performance summary in development
if (import.meta.env.DEV) {
  window.addEventListener('load', () => {
    setTimeout(() => perf.logSummary(), 1000);
  });
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <HelmetProvider>
          <BrowserRouter>
            <AnalyticsWrapper>
              <App />
            </AnalyticsWrapper>
          </BrowserRouter>
        </HelmetProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  </StrictMode>
);
