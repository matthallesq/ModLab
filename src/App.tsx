import { Suspense, lazy } from "react";
import { Navigate, Route, Routes, useRoutes } from "react-router-dom";
import routes from "tempo-routes";
const LoginForm = lazy(() => import("./components/auth/LoginForm"));
const SignUpForm = lazy(() => import("./components/auth/SignUpForm"));
const ForgotPasswordForm = lazy(
  () => import("./components/auth/ForgotPasswordForm"),
);
const ResetPasswordForm = lazy(
  () => import("./components/auth/ResetPasswordForm"),
);
import Dashboard from "./components/pages/dashboard";
import Success from "./components/pages/success";
import LandingPage from "./components/pages/home";
import ProjectsPageWrapper from "./components/pages/ProjectsPageWrapper";
import TeamPage from "./components/pages/team";
import ProfilePage from "./components/pages/profile";
import SubscriptionPageWrapper from "./components/pages/SubscriptionPageWrapper";
import { AuthProvider, useAuth } from "../supabase/auth";
import { ProjectProvider } from "./contexts/ProjectContext";
import { ExperimentProvider } from "./contexts/ExperimentContext";
import { Toaster } from "./components/ui/toaster";
import { LoadingScreen, LoadingSpinner } from "./components/ui/loading-spinner";

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingScreen text="Authenticating..." />;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  return <>{children}</>;
}

function AppRoutes() {
  return (
    <>
      {/* Tempo routes need to be before other routes */}
      {import.meta.env.VITE_TEMPO === "true" && useRoutes(routes)}

      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginForm />} />
        <Route path="/signup" element={<SignUpForm />} />
        <Route path="/forgot-password" element={<ForgotPasswordForm />} />
        <Route path="/reset-password" element={<ResetPasswordForm />} />
        <Route
          path="/projects"
          element={
            <PrivateRoute>
              <ProjectsPageWrapper />
            </PrivateRoute>
          }
        />
        <Route
          path="/projects/:projectId"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/team"
          element={
            <PrivateRoute>
              <TeamPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <PrivateRoute>
              <ProfilePage />
            </PrivateRoute>
          }
        />
        <Route
          path="/subscription"
          element={
            <PrivateRoute>
              <SubscriptionPageWrapper />
            </PrivateRoute>
          }
        />
        <Route path="/success" element={<Success />} />
        {/* Add a catch-all route that doesn't interfere with Tempo routes */}
        {import.meta.env.VITE_TEMPO === "true" && <Route path="/tempobook/*" />}
      </Routes>
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <ProjectProvider>
        <ExperimentProvider>
          <Suspense fallback={<LoadingScreen text="Loading application..." />}>
            <AppRoutes />
          </Suspense>
          <Toaster />
        </ExperimentProvider>
      </ProjectProvider>
    </AuthProvider>
  );
}

export default App;
