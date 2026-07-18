import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/lib/auth-context";
import { AppLayout } from "@/components/layout/AppLayout";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

// Public pages
import AdminLogin from "./pages/admin/AdminLogin";
import PublicResults from "./pages/PublicResults";
import NotFound from "./pages/NotFound";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

// Admin pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminSettings from "./pages/admin/AdminSettings";
import CandidateManagement from "./pages/admin/CandidateManagement";
import VoterManagement from "./pages/admin/VoterManagement";
import ResultsManagement from "./pages/admin/ResultsManagement";
import ElectionManagement from "./pages/admin/ElectionManagement";

import BlockchainVerification from "./pages/BlockchainVerification";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <Routes>
            {/* Public routes */}
            <Route path="/results/public" element={<PublicResults />} />
            <Route path="/verify-vote" element={<BlockchainVerification />} />

            {/* Auth routes */}
            <Route element={<AuthLayout />}>
              <Route path="/" element={<AdminLogin />} />
              <Route path="/login" element={<Navigate to="/" replace />} />
              <Route path="/admin/login" element={<Navigate to="/" replace />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
            </Route>

            {/* Admin routes */}
            <Route element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AppLayout />
              </ProtectedRoute>
            }>
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/candidates" element={<CandidateManagement />} />
              <Route path="/admin/voters" element={<VoterManagement />} />
              <Route path="/admin/verify" element={<VoterManagement />} />
              <Route path="/admin/results" element={<ResultsManagement />} />
              <Route path="/admin/elections" element={<ElectionManagement />} />
              <Route path="/admin/settings" element={<AdminSettings />} />
            </Route>

            {/* Catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
