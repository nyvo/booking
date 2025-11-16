/**
 * Authentication context for managing user state across the app
 * Updated to support Supabase authentication
 */

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import type { User, UserRole } from "@/types";

// Import Supabase client (will be configured when you add your keys)
// import { supabase } from "@/lib/supabase";

// Temporarily keep mock auth for development
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
  register: (
    email: string,
    password: string,
    name: string,
    role: UserRole,
  ) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (newPassword: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const initAuth = async () => {
      try {
        // Check if Supabase is configured
        const supabaseConfigured =
          import.meta.env.VITE_SUPABASE_URL &&
          import.meta.env.VITE_SUPABASE_ANON_KEY &&
          import.meta.env.VITE_SUPABASE_URL !==
            "your_supabase_project_url_here";

        if (supabaseConfigured) {
          // TODO: Use Supabase auth when configured
          // const { data: { session } } = await supabase.auth.getSession();
          // if (session) {
          //   const { data: profile } = await supabase
          //     .from('profiles')
          //     .select('*')
          //     .eq('id', session.user.id)
          //     .single();
          //   setUser(profile);
          // }
        } else {
          // Use mock auth in development when Supabase is not configured
          if (import.meta.env.MODE === "development") {
            const currentUser = await getCurrentUser();
            setUser(currentUser);
          }
        }
      } catch (err) {
        console.error("Auth initialization error:", err);
        // Don't set error for initialization failures
        // This allows the app to still work without auth
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    // TODO: Set up Supabase auth listener when configured
    // const { data: { subscription } } = supabase.auth.onAuthStateChange(
    //   async (event, session) => {
    //     if (session) {
    //       const { data: profile } = await supabase
    //         .from('profiles')
    //         .select('*')
    //         .eq('id', session.user.id)
    //         .single();
    //       setUser(profile);
    //     } else {
    //       setUser(null);
    //     }
    //     setLoading(false);
    //   }
    // );
    // return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string): Promise<User> => {
    try {
      setLoading(true);
      setError(null);

      // Check if Supabase is configured
      const supabaseConfigured =
        import.meta.env.VITE_SUPABASE_URL &&
        import.meta.env.VITE_SUPABASE_ANON_KEY &&
        import.meta.env.VITE_SUPABASE_URL !== "your_supabase_project_url_here";

      if (supabaseConfigured) {
        // TODO: Use Supabase auth when configured
        // const { data, error } = await supabase.auth.signInWithPassword({
        //   email,
        //   password,
        // });
        // if (error) throw error;
        //
        // const { data: profile } = await supabase
        //   .from('profiles')
        //   .select('*')
        //   .eq('id', data.user.id)
        //   .single();
        //
        // setUser(profile);
        // return profile;

        // For now, throw error to indicate Supabase needs setup
        throw new Error(
          "Supabase authentication is being set up. Please check back soon.",
        );
      } else {
        // Use mock auth in development
        const loggedInUser = await apiLogin(email, password);
        setUser(loggedInUser);
        return loggedInUser;
      }
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

      // Check if Supabase is configured
      const supabaseConfigured =
        import.meta.env.VITE_SUPABASE_URL &&
        import.meta.env.VITE_SUPABASE_ANON_KEY &&
        import.meta.env.VITE_SUPABASE_URL !== "your_supabase_project_url_here";

      if (supabaseConfigured) {
        // TODO: Use Supabase auth when configured
        // await supabase.auth.signOut();
      } else {
        // Use mock auth
        await apiLogout();
      }

      setUser(null);
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to log out");
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (
    email: string,
    password: string,
    name: string,
    role: UserRole,
  ): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      // Check if Supabase is configured
      const supabaseConfigured =
        import.meta.env.VITE_SUPABASE_URL &&
        import.meta.env.VITE_SUPABASE_ANON_KEY &&
        import.meta.env.VITE_SUPABASE_URL !== "your_supabase_project_url_here";

      if (supabaseConfigured) {
        // TODO: Use Supabase auth when configured
        // const { data, error } = await supabase.auth.signUp({
        //   email,
        //   password,
        //   options: {
        //     data: {
        //       name,
        //       role,
        //     },
        //   },
        // });
        // if (error) throw error;

        throw new Error(
          "Supabase registration is being set up. Please check back soon.",
        );
      } else {
        throw new Error(
          "Registration requires Supabase configuration. Please set up your Supabase project.",
        );
      }
    } catch (err) {
      const error =
        err instanceof Error ? err : new Error("Failed to register");
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      // Check if Supabase is configured
      const supabaseConfigured =
        import.meta.env.VITE_SUPABASE_URL &&
        import.meta.env.VITE_SUPABASE_ANON_KEY &&
        import.meta.env.VITE_SUPABASE_URL !== "your_supabase_project_url_here";

      if (supabaseConfigured) {
        // TODO: Use Supabase auth when configured
        // const { error } = await supabase.auth.resetPasswordForEmail(email, {
        //   redirectTo: `${window.location.origin}/reset-password`,
        // });
        // if (error) throw error;

        throw new Error(
          "Password reset is being set up. Please check back soon.",
        );
      } else {
        // Mock success for development
        console.log("Password reset email would be sent to:", email);
      }
    } catch (err) {
      const error =
        err instanceof Error ? err : new Error("Failed to send reset email");
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updatePassword = async (newPassword: string): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      // Check if Supabase is configured
      const supabaseConfigured =
        import.meta.env.VITE_SUPABASE_URL &&
        import.meta.env.VITE_SUPABASE_ANON_KEY &&
        import.meta.env.VITE_SUPABASE_URL !== "your_supabase_project_url_here";

      if (supabaseConfigured) {
        // TODO: Use Supabase auth when configured
        // const { error } = await supabase.auth.updateUser({
        //   password: newPassword,
        // });
        // if (error) throw error;

        throw new Error(
          "Password update is being set up. Please check back soon.",
        );
      } else {
        throw new Error("Password update requires Supabase configuration.");
      }
    } catch (err) {
      const error =
        err instanceof Error ? err : new Error("Failed to update password");
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        logout,
        register,
        resetPassword,
        updatePassword,
      }}
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

// Export a helper to check if we're using mock auth
export const isUsingMockAuth = () => {
  const supabaseConfigured =
    import.meta.env.VITE_SUPABASE_URL &&
    import.meta.env.VITE_SUPABASE_ANON_KEY &&
    import.meta.env.VITE_SUPABASE_URL !== "your_supabase_project_url_here";

  return !supabaseConfigured && import.meta.env.MODE === "development";
};
