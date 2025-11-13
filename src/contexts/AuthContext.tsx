/**
 * Authentication context for managing user state across the app
 */

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import type { User, UserRole } from "@/types";
import {
  getCurrentUser,
  login as apiLogin,
  logout as apiLogout,
} from "@/services/userService";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: Error | null;
  login: (email: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
  switchRole: (role: UserRole) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error("Failed to initialize auth"),
        );
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string): Promise<User> => {
    try {
      setLoading(true);
      setError(null);
      const loggedInUser = await apiLogin(email, password);
      setUser(loggedInUser);
      return loggedInUser;
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to log in");
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      await apiLogout();
      setUser(null);
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to log out");
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const switchRole = (role: UserRole): void => {
    // Mock function to switch between teacher and student roles for development
    // SECURITY: Only allow in development mode
    if (import.meta.env.MODE !== "development") {
      console.error("Role switching is only available in development mode");
      return;
    }

    // Set role preference and reload to trigger new auto-login
    sessionStorage.setItem("yoga_booking_role_preference", role);
    sessionStorage.removeItem("yoga_booking_user");
    window.location.reload();
  };

  // Expose switchRole globally for development testing
  useEffect(() => {
    if (import.meta.env.MODE === "development") {
      (window as any).switchRole = switchRole;
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, loading, error, login, logout, switchRole }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return context;
};
