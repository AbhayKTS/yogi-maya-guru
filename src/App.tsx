import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { ProtectedRoute } from "./components/layout/ProtectedRoute";
import { Dashboard } from "./components/dashboard/Dashboard";
import { OnboardingFlow } from "./components/onboarding/OnboardingFlow";
import { YogaStudio } from "./components/yoga/YogaStudio";
import { NutritionGuide } from "./components/nutrition/NutritionGuide";
import { PranayamaHub } from "./components/meditation/PranayamaHub";
import { DailyWisdomPage } from "./components/wisdom/DailyWisdomPage";
import { TodayInsights } from "./components/insights/TodayInsights";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const AppContent = () => {
  const { profile } = useAuth();
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    // Show onboarding if user doesn't have dosha assessment completed
    if (profile && !profile.dominant_dosha) {
      setShowOnboarding(true);
    }
  }, [profile]);

  if (showOnboarding) {
    return <OnboardingFlow onComplete={() => setShowOnboarding(false)} />;
  }

  return <Dashboard />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={
            <ProtectedRoute>
              <AppContent />
            </ProtectedRoute>
          } />
          <Route path="/yoga" element={
            <ProtectedRoute>
              <YogaStudio />
            </ProtectedRoute>
          } />
          <Route path="/nutrition" element={
            <ProtectedRoute>
              <NutritionGuide />
            </ProtectedRoute>
          } />
          <Route path="/pranayama" element={
            <ProtectedRoute>
              <PranayamaHub />
            </ProtectedRoute>
          } />
          <Route path="/wisdom" element={
            <ProtectedRoute>
              <DailyWisdomPage />
            </ProtectedRoute>
          } />
          <Route path="/insights" element={
            <ProtectedRoute>
              <TodayInsights />
            </ProtectedRoute>
          } />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
