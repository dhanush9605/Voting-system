import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/lib/auth-context";
import { AppLayout } from "@/components/layout/AppLayout";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { MaintenanceGuard } from "@/components/auth/MaintenanceGuard";

// Public pages
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import PublicResults from "./pages/PublicResults";
import NotFound from "./pages/NotFound";
import CompleteProfile from "./pages/CompleteProfile";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

// Voter pages
import VoterDashboard from "./pages/voter/VoterDashboard";
import VoterProfile from "./pages/voter/VoterProfile";
import VotePage from "./pages/voter/VotePage";
import FaceVerification from "./pages/FaceVerification";
import BlockchainVerification from "./pages/BlockchainVerification";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <MaintenanceGuard>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Landing />} />
              <Route path="/results/public" element={<PublicResults />} />
              <Route path="/verify-vote" element={<BlockchainVerification />} />

              {/* Auth routes */}
              <Route element={<AuthLayout />}>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
              </Route>

              {/* Voter routes */}
              <Route element={
                <ProtectedRoute allowedRoles={['voter']}>
                  <AppLayout />
                </ProtectedRoute>
              }>
                <Route path="/voter/dashboard" element={<VoterDashboard />} />
                <Route path="/voter/profile" element={<VoterProfile />} />
                <Route path="/vote" element={<VotePage />} />
                <Route path="/verify-face" element={<FaceVerification />} />
                <Route path="/complete-profile" element={<CompleteProfile />} />
              </Route>

              {/* Catch-all */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </MaintenanceGuard>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
