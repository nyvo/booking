/**
 * Main layout for student interface
 */

import { type ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { ROUTES } from "@/config/constants";
import { useAuthContext } from "@/contexts/AuthContext";
import { BookOpen, Calendar, User, LogOut, Search } from "lucide-react";

interface StudentLayoutProps {
  children: ReactNode;
}

export default function StudentLayout({ children }: StudentLayoutProps) {
  const location = useLocation();
  const { user, logout, switchRole } = useAuthContext();

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    {
      path: ROUTES.STUDENT.BROWSE,
      label: "Utforsk",
      icon: Search,
    },
    {
      path: ROUTES.STUDENT.BOOKINGS,
      label: "Mine bookinger",
      icon: Calendar,
    },
    {
      path: ROUTES.STUDENT.PROFILE,
      label: "Profil",
      icon: User,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b border-border bg-white">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-8">
            <Link
              to={ROUTES.STUDENT.BROWSE}
              className="flex items-center gap-2"
            >
              <BookOpen className="h-6 w-6 text-primary" />
              <span className="text-xl font-semibold text-foreground">
                Yoga Booking
              </span>
            </Link>

            <nav className="hidden md:flex items-center gap-6">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary ${
                      isActive(item.path)
                        ? "text-primary"
                        : "text-muted-foreground"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="flex items-center gap-4">
            {/* Dev: Role Switcher */}
            {import.meta.env.MODE === "development" && (
              <button
                onClick={() => switchRole("teacher")}
                className="px-3 py-1.5 text-xs font-medium bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
              >
                Bytt til lærer
              </button>
            )}

            <div className="hidden sm:flex items-center gap-2 text-sm">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="text-foreground">{user?.name}</span>
            </div>
            <button
              onClick={logout}
              className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Logg ut</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {children}
      </main>

      {/* Mobile Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-white">
        <div className="flex items-center justify-around py-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center gap-1 px-3 py-2 ${
                  isActive(item.path) ? "text-primary" : "text-muted-foreground"
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="text-xs">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
