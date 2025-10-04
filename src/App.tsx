import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import WhatsAppButton from "@/components/WhatsAppButton";

import WelcomeBanner from "@/components/WelcomeBanner";

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
  const [showBanner, setShowBanner] = useState(true);

  useEffect(() => {
    const script = document.createElement('script');
    script.innerHTML = `
      (function(m,e,t,r,i,k,a){
        m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
        m[i].l=1*new Date();
        for (var j = 0; j < document.scripts.length; j++) {if (document.scripts[j].src === r) { return; }}
        k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)
      })(window, document, 'script', 'https://mc.yandex.ru/metrika/tag.js?id=104067688', 'ym');
      
      ym(104067688, 'init', {
        clickmap: true,
        trackLinks: true,
        accurateTrackBounce: true,
        webvisor: true,
        ecommerce: "dataLayer"
      });
    `;
    document.head.appendChild(script);

    const noscript = document.createElement('noscript');
    noscript.innerHTML = '<div><img src="https://mc.yandex.ru/watch/104067688" style="position:absolute; left:-9999px;" alt="" /></div>';
    document.body.appendChild(noscript);

    return () => {
      document.head.removeChild(script);
      document.body.removeChild(noscript);
    };
  }, []);

  const handleCloseBanner = () => {
    setShowBanner(false);
  };



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


          
          {/* Приветственный баннер */}
          {showBanner && <WelcomeBanner onClose={handleCloseBanner} />}

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
};

export default App;