import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SessionProvider } from "@/contexts/SessionContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { logger } from "@/lib/logger";
import Landing from "./pages/Landing";
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
import Waitlist from "./pages/Waitlist";
import DemoLogin from "./pages/DemoLogin";
import DemoOnlyRedirect from "./components/DemoOnlyRedirect";
import { WaitlistShortcut } from "./components/WaitlistShortcut";

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
          <WaitlistShortcut />
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Landing />} />
            {/* Demo-only: Block non-demo authentication routes */}
            <Route path="/auth" element={<DemoOnlyRedirect />} />
            <Route path="/signup" element={<DemoOnlyRedirect />} />
            <Route path="/login" element={<DemoOnlyRedirect />} />
            <Route path="/demo-login" element={<DemoLogin />} />
            <Route path="/waitlist" element={<Waitlist />} />
            
            <Route 
              path="/onboarding" 
              element={
                <ProtectedRoute>
                  <Onboarding />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/explore" 
              element={
                <ProtectedRoute>
                  <Explore />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/chat" 
              element={
                <ProtectedRoute>
                  <Chat />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/inbox" 
              element={
                <ProtectedRoute>
                  <Inbox />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/inbox/:conversationId" 
              element={
                <ProtectedRoute>
                  <ConversationView />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/transfer" 
              element={
                <ProtectedRoute>
                  <Transfer />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/goals" 
              element={
                <ProtectedRoute>
                  <Goals />
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
            <Route 
              path="/settings" 
              element={
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/security" 
              element={
                <ProtectedRoute>
                  <Security />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/accounts" 
              element={
                <ProtectedRoute>
                  <Accounts />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/investing" 
              element={
                <ProtectedRoute>
                  <Investing />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/notifications" 
              element={
                <ProtectedRoute>
                  <Notifications />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/support" 
              element={
                <ProtectedRoute>
                  <Support />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/activity-log" 
              element={
                <ProtectedRoute>
                  <ActivityLog />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/documents" 
              element={
                <ProtectedRoute>
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
