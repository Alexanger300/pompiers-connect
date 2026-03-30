import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import CalendarPage from "@/pages/CalendarPage";
import Skills from "@/pages/Skills";
import Notifications from "@/pages/Notifications";
import SupervisorSchedule from "@/pages/SupervisorSchedule";
import AdminUsers from "@/pages/AdminUsers";
import AdminTraining from "@/pages/AdminTraining";
import Profile from "@/pages/Profile";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children, roles }: { children: React.ReactNode; roles?: string[] }) => {
  const { user, isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (roles && user && !roles.includes(user.role)) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
};

const AppRoutes = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="mobile-shell bg-background">
      {isAuthenticated && <Navbar />}
      <main className={isAuthenticated ? "pb-20" : ""}>
        <Routes>
          <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />} />
          <Route path="/" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/calendrier" element={<ProtectedRoute><CalendarPage /></ProtectedRoute>} />
          <Route path="/competences" element={<ProtectedRoute roles={['stagiaire']}><Skills /></ProtectedRoute>} />
          <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
          <Route path="/superviseur" element={<ProtectedRoute roles={['superviseur']}><SupervisorSchedule /></ProtectedRoute>} />
          <Route path="/admin/utilisateurs" element={<ProtectedRoute roles={['administrateur']}><AdminUsers /></ProtectedRoute>} />
          <Route path="/admin/suivi" element={<ProtectedRoute roles={['administrateur']}><AdminTraining /></ProtectedRoute>} />
          <Route path="/profil" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </div>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
