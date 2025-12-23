import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/lib/auth-context";
import { AppLayout } from "@/components/layout/AppLayout";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

// Public pages
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import PublicResults from "./pages/PublicResults";
import NotFound from "./pages/NotFound";

// Admin pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminSettings from "./pages/admin/AdminSettings";
import CandidateManagement from "./pages/admin/CandidateManagement";
import VoterManagement from "./pages/admin/VoterManagement";
import ResultsManagement from "./pages/admin/ResultsManagement";

// Voter pages
import VoterDashboard from "./pages/voter/VoterDashboard";
import VotePage from "./pages/voter/VotePage";
import FaceVerification from "./pages/FaceVerification";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Landing />} />
            <Route path="/results/public" element={<PublicResults />} />

            {/* Auth routes */}
            <Route element={<AuthLayout />}>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
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
              <Route path="/admin/settings" element={<AdminSettings />} />
            </Route>

            {/* Voter routes */}
            <Route element={
              <ProtectedRoute allowedRoles={['voter']}>
                <AppLayout />
              </ProtectedRoute>
            }>
              <Route path="/voter/dashboard" element={<VoterDashboard />} />
              <Route path="/voter/profile" element={<VoterDashboard />} />
              <Route path="/vote" element={<VotePage />} />
              <Route path="/verify-face" element={<FaceVerification />} />
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
