import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import { AuthProvider } from "./contexts/AuthContext";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";

import Home from "./pages/Home";
import Analyze from "./pages/Analyze";
import Journey from "./pages/Journey";
import History from "./pages/History";
import Auth from "./pages/Auth";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import EmotionalChatbot from "./components/EmotionalChatbot";
import Fortune from "./pages/Fortune";
import Support from "./pages/support";
import MoodGarden from "./pages/MoodGarden";
import AutoSendInactiveEmails from "./components/AutoSendInactiveEmails";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AutoSendInactiveEmails />
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Layout>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route
                path="/analyze"
                element={
                  <ProtectedRoute>
                    <Analyze />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/journey"
                element={
                  <ProtectedRoute>
                    <Journey />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/history"
                element={
                  <ProtectedRoute>
                    <History />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/moodgarden"
                element={
                  <ProtectedRoute>
                    <MoodGarden />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/fortune"
                element={
                  <ProtectedRoute>
                    <Fortune />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />
              <Route path="/support" element={<Support />} />
               <Route path="/" element={<Home />} />
        <Route path="/login" element={<Auth />} />
        <Route path="/signup" element={<Auth />} />
              <Route path="/login" element={<Auth />} />
              <Route
                path="/emotionalchatbot"
                element={
                  <EmotionalChatbot onClose={() => console.log("EmotionalChatbot closed")} />
                }
              />
              <Route path="/support" element={<Support />} />
              {/* Catch-all route */}
              
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Layout>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
