import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { Toaster } from "sonner";

import { useEffect } from "react";

import { useThemeStore } from "@/store/themeStore";

import { useAuthStore } from "@/store/authStore";

import { ProtectedRoute } from "@/routes/ProtectedRoute";

import LandingPage from "@/pages/LandingPage";

import LoginPage from "@/pages/auth/LoginPage";

import RegisterPage from "@/pages/auth/RegisterPage";

import ForgotPasswordPage from "@/pages/auth/ForgotPasswordPage";

import DashboardPage from "@/pages/dashboard/DashboardPage";

import MeetingsPage from "@/pages/meetings/MeetingsPage";

import MeetingDetailPage from "@/pages/meetings/MeetingDetailPage";

import CreateSummaryPage from "@/pages/meetings/CreateSummaryPage";

import CreditsPage from "@/pages/credits/CreditsPage";

import SettingsPage from "@/pages/settings/SettingsPage";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 30,

      retry: 1,

      refetchOnWindowFocus: false,
    },
  },
});

function ThemeInit() {
  const { theme } = useThemeStore();

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  return null;
}

function AuthInit() {
  const initializeAuth = useAuthStore((state) => state.initializeAuth);

  useEffect(() => {
    initializeAuth();
  }, []);

  return null;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter
        basename={(import.meta as any).env.BASE_URL?.replace(/\/$/, "") || ""}
      >
        <ThemeInit />

        <AuthInit />

        <Toaster position="top-right" richColors closeButton />

        <Routes>
          {/* PUBLIC ROUTES */}

          <Route path="/" element={<LandingPage />} />

          <Route path="/login" element={<LoginPage />} />

          <Route path="/register" element={<RegisterPage />} />

          <Route path="/forgot-password" element={<ForgotPasswordPage />} />

          {/* PROTECTED ROUTES */}

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/meetings"
            element={
              <ProtectedRoute>
                <MeetingsPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/meetings/new"
            element={
              <ProtectedRoute>
                <CreateSummaryPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/meetings/:id"
            element={
              <ProtectedRoute>
                <MeetingDetailPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/credits"
            element={
              <ProtectedRoute>
                <CreditsPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <SettingsPage />
              </ProtectedRoute>
            }
          />

          {/* FALLBACK */}

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
