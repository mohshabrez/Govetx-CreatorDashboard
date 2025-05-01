import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/use-auth";
import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/auth-page";
import { ProtectedRoute } from "./lib/protected-route";
import FeedPage from "@/pages/feed";
import DashboardPage from "@/pages/dashboard";
import SavedContentPage from "@/pages/saved-content";
import ProfilePage from "@/pages/profile";
import UserManagementPage from "@/pages/admin/user-management";
import CreditManagementPage from "@/pages/admin/credit-management";
// import SettingsPage from "@/pages/settings";
import RedditApiTest from "./components/test-reddit-api";
import TwitterApiTest from "./components/test-twitter-api";

function Router() {
  return (
    <Switch>
      <ProtectedRoute path="/" component={DashboardPage} />
      <ProtectedRoute path="/feed" component={FeedPage} />
      <ProtectedRoute path="/saved" component={SavedContentPage} />
      <ProtectedRoute path="/profile" component={ProfilePage} />
      <ProtectedRoute path="/admin/users" component={UserManagementPage} />
      <ProtectedRoute path="/admin/credits" component={CreditManagementPage} />
      <Route path="/auth" component={AuthPage} />
      <Route path="/test-reddit-api" component={RedditApiTest} />
      <Route path="/test-twitter-api" component={TwitterApiTest} />
      {/* <Route path="/settings" component={SettingsPage} /> */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
