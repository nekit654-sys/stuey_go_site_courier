import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import WhatsAppButton from "@/components/WhatsAppButton";
import FeedbackTab from "@/components/FeedbackTab";

import Index from "./pages/Index";
import Vacancies from "./pages/Vacancies";
import Hiring from "./pages/Hiring";
import Culture from "./pages/Culture";
import Reviews from "./pages/Reviews";
import Contacts from "./pages/Contacts";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";

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

const App = () => {



  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <YandexMetrika />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/vacancies" element={<Vacancies />} />
            <Route path="/hiring" element={<Hiring />} />
            <Route path="/culture" element={<Culture />} />
            <Route path="/reviews" element={<Reviews />} />
            <Route path="/contacts" element={<Contacts />} />

            <Route path="/login" element={<Login />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>

          <WhatsAppButton />
          <FeedbackTab />
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;