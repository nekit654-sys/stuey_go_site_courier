import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ScrollToTop from "@/components/ScrollToTop";
import GameButton from "@/components/GameButton";
import FallingCoins from "@/components/FallingCoins";

import Index from "./pages/Index";
import Vacancies from "./pages/Vacancies";
import Hiring from "./pages/Hiring";
import Culture from "./pages/Culture";
import Reviews from "./pages/Reviews";
import Contacts from "./pages/Contacts";
import NotFound from "./pages/NotFound";
import ChatWidgetStyles from "@/components/ChatWidgetStyles";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/vacancies" element={<Vacancies />} />
          <Route path="/hiring" element={<Hiring />} />
          <Route path="/culture" element={<Culture />} />
          <Route path="/reviews" element={<Reviews />} />
          <Route path="/contacts" element={<Contacts />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>

        <ScrollToTop />
        <GameButton
          onToggle={(isOpen) => console.log("Game toggle:", isOpen)}
        />
        <FallingCoins />
        <ChatWidgetStyles />

        {/* Магический эффект */}
        <div
          id="magic-overlay"
          className="fixed inset-0 pointer-events-none z-[9998] bg-gradient-radial from-yellow-300/80 via-yellow-300/20 to-transparent opacity-0 animate-magic-glow"
        />
        <div
          id="particles-container"
          className="fixed inset-0 pointer-events-none overflow-visible z-[9999]"
        />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;