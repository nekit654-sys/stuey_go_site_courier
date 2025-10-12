import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { AuthProvider } from "@/contexts/AuthContext";
import { GameProvider } from "@/contexts/GameContext";
import WhatsAppButton from "@/components/WhatsAppButton";
import FeedbackTab from "@/components/FeedbackTab";

import Index from "./pages/Index";
import Career from "./pages/Career";
import Reviews from "./pages/Reviews";
import Contacts from "./pages/Contacts";
import Login from "./pages/Login";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Leaderboard from "./pages/Leaderboard";
import NotFound from "./pages/NotFound";
import Maintenance from "./pages/Maintenance";
import ResetAdminPassword from "./pages/ResetAdminPassword";

const queryClient = new QueryClient();

declare global {
  interface Window {
    ym?: (id: number, action: string, ...args: any[]) => void;
  }
}

const YandexMetrika = () => {
  const location = useLocation();

  useEffect(() => {
    if (typeof window.ym !== 'undefined') {
      window.ym(104067688, 'hit', location.pathname);
    }
  }, [location]);

  return null;
};

const MaintenanceWrapper = () => {
  const [isMaintenanceMode, setIsMaintenanceMode] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const bypass = localStorage.getItem('maintenance_bypass');
    const authToken = localStorage.getItem('auth_token');
    
    if (bypass === 'true' || authToken) {
      setIsMaintenanceMode(false);
    }
  }, []);

  const isAdminRoute = location.pathname === '/login' || location.pathname === '/auth' || location.pathname === '/dashboard';

  if (isMaintenanceMode && !isAdminRoute) {
    return <Maintenance onUnlock={() => setIsMaintenanceMode(false)} />;
  }

  return (
    <>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/career" element={<Career />} />
        <Route path="/reviews" element={<Reviews />} />
        <Route path="/contacts" element={<Contacts />} />

        <Route path="/login" element={<Login />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/reset-admin-password" element={<ResetAdminPassword />} />
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>

      {!isMaintenanceMode && (
        <>
          <WhatsAppButton />
          <FeedbackTab />
        </>
      )}
    </>
  );
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <BrowserRouter>
          <AuthProvider>
            <GameProvider>
              <Toaster />
              <Sonner />
              <YandexMetrika />
              <MaintenanceWrapper />
            </GameProvider>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;