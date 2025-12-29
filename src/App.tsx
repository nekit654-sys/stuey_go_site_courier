import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { useState, useEffect, lazy, Suspense } from "react";
import { AuthProvider } from "@/contexts/AuthContext";
import { GameProvider } from "@/contexts/GameContext";
import WhatsAppButton from "@/components/WhatsAppButton";
import FeedbackTab from "@/components/FeedbackTab";
import VisitTracker from "@/components/VisitTracker";
import BackgroundMusic from "@/components/BackgroundMusic";

import Index from "./pages/Index";
import Career from "./pages/Career";
import Reviews from "./pages/Reviews";
import Contacts from "./pages/Contacts";
import Login from "./pages/Login";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import TelegramLink from "./pages/TelegramLink";

import NotFound from "./pages/NotFound";
import ResetAdminPassword from "./pages/ResetAdminPassword";
import ResetAdminPasswordPage from "./pages/ResetAdminPasswordPage";
import GameSelect from "./pages/GameSelect";

const Game = lazy(() => import("./pages/Game"));
const Game3D = lazy(() => import("./pages/Game3D"));
const CourierGamePage = lazy(() => import("./pages/CourierGamePage"));

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

const AppRoutes = () => {
  const location = useLocation();

  return (
    <>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/career" element={<Career />} />
        <Route path="/reviews" element={<Reviews />} />
        <Route path="/contacts" element={<Contacts />} />
        <Route path="/games" element={<GameSelect />} />
        <Route path="/game" element={
          <Suspense fallback={
            <div className="w-full h-screen bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <div className="text-white text-2xl">Загрузка игры...</div>
            </div>
          }>
            <Game />
          </Suspense>
        } />
        <Route path="/game-3d" element={
          <Suspense fallback={
            <div className="w-full h-screen bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <div className="text-white text-2xl">Загрузка 3D игры...</div>
            </div>
          }>
            <Game3D />
          </Suspense>
        } />
        <Route path="/courier-game" element={
          <Suspense fallback={
            <div className="w-full h-screen bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center">
              <div className="text-white text-2xl">Загрузка игры...</div>
            </div>
          }>
            <CourierGamePage />
          </Suspense>
        } />

        <Route path="/ask" element={<Login />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/auth/telegram-link" element={<TelegramLink />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/reset-admin-password" element={<ResetAdminPassword />} />
        <Route path="/admin-reset" element={<ResetAdminPasswordPage />} />
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>

      {location.pathname !== '/ask' && location.pathname !== '/game' && location.pathname !== '/game-3d' && location.pathname !== '/games' && location.pathname !== '/courier-game' && (
        <>
          <VisitTracker cooldownMinutes={30} />
          <WhatsAppButton />
          <FeedbackTab />
          <BackgroundMusic />
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
              <AppRoutes />
            </GameProvider>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;