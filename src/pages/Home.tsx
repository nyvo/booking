/**
 * Home page - shows landing page or redirects based on user role
 */

import { Navigate } from "react-router-dom";
import { useAuthContext } from "@/contexts/AuthContext";
import { ROUTES } from "@/config/constants";
import Landing from "./Landing";

export default function Home() {
  const { user, loading } = useAuthContext();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Laster...</p>
        </div>
      </div>
    );
  }

  // Show landing page for unauthenticated users
  if (!user) {
    return <Landing />;
  }

  // Redirect authenticated users to their respective dashboards
  if (user.role === "student") {
    return <Navigate to={ROUTES.STUDENT.BROWSE} replace />;
  }

  return <Navigate to={ROUTES.TEACHER.DASHBOARD} replace />;
}
