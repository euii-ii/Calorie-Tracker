
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SignedIn, SignedOut, RedirectToSignIn } from "@clerk/clerk-react";
import AuthWrapper from "./components/AuthWrapper";
import CustomSignIn from "./components/CustomSignIn";
import CustomSignUp from "./components/CustomSignUpNew";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Results from "./pages/Results";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";
import MobileCameraTest from "./components/MobileCameraTest";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthWrapper>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/sign-in" element={<CustomSignIn />} />
            <Route path="/sign-up" element={<CustomSignUp />} />
            <Route
              path="/dashboard"
              element={
                <>
                  <SignedIn>
                    <Dashboard />
                  </SignedIn>
                  <SignedOut>
                    <RedirectToSignIn />
                  </SignedOut>
                </>
              }
            />
            <Route
              path="/results"
              element={
                <>
                  <SignedIn>
                    <Results />
                  </SignedIn>
                  <SignedOut>
                    <RedirectToSignIn />
                  </SignedOut>
                </>
              }
            />
            <Route
              path="/admin"
              element={
                <>
                  <SignedIn>
                    <Admin />
                  </SignedIn>
                  <SignedOut>
                    <RedirectToSignIn />
                  </SignedOut>
                </>
              }
            />
            <Route path="/mobile-camera-test" element={<MobileCameraTest />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthWrapper>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
