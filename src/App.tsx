import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SessionProvider } from "@/contexts/SessionContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { logger } from "@/lib/logger";
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import DemoLogin from "./pages/DemoLogin";
import Onboarding from "./pages/Onboarding";
import Dashboard from "./pages/Dashboard";
import Explore from "./pages/Explore";
import Transfer from "./pages/Transfer";
import Goals from "./pages/Goals";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import Security from "./pages/Security";
import Accounts from "./pages/Accounts";
import Investing from "./pages/Investing";
import Notifications from "./pages/Notifications";
import Support from "./pages/Support";
import ActivityLog from "./pages/ActivityLog";
import Documents from "./pages/Documents";
import Chat from "./pages/Chat";
import Inbox from "./pages/Inbox";
import ConversationView from "./pages/ConversationView";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Log app initialization
logger.info('App initializing', {
  mode: import.meta.env.MODE,
  dev: import.meta.env.DEV,
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <SessionProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Landing />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/login" element={<Auth />} />
            <Route path="/demo-login" element={<DemoLogin />} />
            
            {/* Protected routes - allow demo mode */}
            <Route 
              path="/onboarding" 
              element={
                <ProtectedRoute allowDemo={true}>
                  <Onboarding />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute allowDemo={true}>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/explore" 
              element={
                <ProtectedRoute allowDemo={true}>
                  <Explore />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/chat" 
              element={
                <ProtectedRoute allowDemo={true}>
                  <Chat />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/inbox" 
              element={
                <ProtectedRoute allowDemo={true}>
                  <Inbox />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/inbox/:conversationId" 
              element={
                <ProtectedRoute allowDemo={true}>
                  <ConversationView />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/transfer" 
              element={
                <ProtectedRoute allowDemo={true}>
                  <Transfer />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/goals" 
              element={
                <ProtectedRoute allowDemo={true}>
                  <Goals />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/profile" 
              element={
                <ProtectedRoute allowDemo={true}>
                  <Profile />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/settings" 
              element={
                <ProtectedRoute allowDemo={true}>
                  <Settings />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/security" 
              element={
                <ProtectedRoute allowDemo={false}>
                  <Security />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/accounts" 
              element={
                <ProtectedRoute allowDemo={true}>
                  <Accounts />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/investing" 
              element={
                <ProtectedRoute allowDemo={true}>
                  <Investing />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/notifications" 
              element={
                <ProtectedRoute allowDemo={true}>
                  <Notifications />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/support" 
              element={
                <ProtectedRoute allowDemo={true}>
                  <Support />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/activity-log" 
              element={
                <ProtectedRoute allowDemo={false}>
                  <ActivityLog />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/documents" 
              element={
                <ProtectedRoute allowDemo={false}>
                  <Documents />
                </ProtectedRoute>
              } 
            />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </SessionProvider>
  </QueryClientProvider>
);

export default App;
