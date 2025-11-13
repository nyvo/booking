/**
 * Protected route wrapper that checks authentication and authorization
 */

import { type ReactNode } from "react";
import { Navigate } from "react-router-dom";
import type { UserRole } from "@/types";
import { useAuthContext } from "@/contexts/AuthContext";
import { ROUTES } from "@/config/constants";

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: UserRole[];
}

export default function ProtectedRoute({
  children,
  allowedRoles,
}: ProtectedRouteProps) {
  const { user, loading } = useAuthContext();

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="mt-4 text-muted-foreground">Laster...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to={ROUTES.AUTH.LOGIN} replace />;
  }

  // Check if user's role is allowed to access this route
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to appropriate home based on user role
    const redirectTo =
      user.role === "teacher"
        ? ROUTES.TEACHER.DASHBOARD
        : ROUTES.STUDENT.BROWSE;
    return <Navigate to={redirectTo} replace />;
  }

  return <>{children}</>;
}
