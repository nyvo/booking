/**
 * Main layout for teacher dashboard with ShadCN responsive sidebar
 * Account section redesigned with compact card at bottom per .cursorrules
 */

import { type ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ROUTES } from "@/config/constants";
import { useAuthContext } from "@/contexts/AuthContext";
import {
  Home,
  Calendar,
  Leaf,
  CalendarDays,
  Users,
  CreditCard,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { AccountCard } from "./AccountCard";

interface TeacherLayoutProps {
  children: ReactNode;
}

export default function TeacherLayout({ children }: TeacherLayoutProps) {
  const { t } = useTranslation();
  const { switchRole } = useAuthContext();
  const location = useLocation();

  const isActive = (path: string) => {
    // Special case: Dashboard should only match exactly
    if (path === ROUTES.TEACHER.DASHBOARD) {
      return location.pathname === path;
    }
    // For other routes, check if current path starts with the nav item path
    return location.pathname.startsWith(path);
  };

  const navItems = [
    {
      title: t("nav.dashboard"),
      path: ROUTES.TEACHER.DASHBOARD,
      icon: Home,
    },
    {
      title: t("nav.courses"),
      path: ROUTES.TEACHER.COURSES,
      icon: Leaf,
    },
    {
      title: t("nav.events"),
      path: ROUTES.TEACHER.EVENTS,
      icon: CalendarDays,
    },
    {
      title: t("nav.students"),
      path: ROUTES.TEACHER.STUDENTS,
      icon: Users,
    },
    {
      title: t("nav.payments"),
      path: ROUTES.TEACHER.PAYMENTS,
      icon: CreditCard,
    },
  ];

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        {/* Sidebar with flex layout */}
        <Sidebar className="flex h-full flex-col">
          {/* Logo + Navigation - Flex grow */}
          <div className="flex-1 flex flex-col">
            <SidebarHeader>
              <div className="flex items-center gap-2 px-2 py-4">
                <Leaf className="h-6 w-6 text-primary" />
                <span className="text-lg font-semibold">Yoga Booking</span>
              </div>
            </SidebarHeader>

            <SidebarContent>
              {/* Main Navigation */}
              <SidebarGroup>
                <SidebarGroupLabel>Navigasjon</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {navItems.map((item) => (
                      <SidebarMenuItem key={item.path}>
                        <SidebarMenuButton
                          asChild
                          isActive={isActive(item.path)}
                        >
                          <Link to={item.path}>
                            <item.icon className="h-4 w-4" />
                            <span>{item.title}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            </SidebarContent>
          </div>

          {/* Account Card - Pinned to bottom */}
          <div className="mt-auto px-4 pb-4">
            <AccountCard />
          </div>
        </Sidebar>

        {/* Main Content Area */}
        <div className="flex flex-1 flex-col">
          {/* Sticky Header */}
          <header className="sticky top-0 z-40 border-b border-border/60 bg-white/80 backdrop-blur">
            <div className="flex h-16 items-center gap-4 px-6">
              {/* Mobile: Icon + "Meny" label */}
              <div className="md:hidden flex items-center gap-2 rounded-full bg-muted/50 px-3 py-2">
                <SidebarTrigger />
                <span className="text-sm font-medium text-foreground">
                  Meny
                </span>
              </div>

              {/* Desktop: Icon only */}
              <div className="hidden md:block">
                <SidebarTrigger />
              </div>

              <div className="flex-1" />

              {/* Dev: Role Switcher */}
              {import.meta.env.MODE === "development" && (
                <Button
                  onClick={() => switchRole("student")}
                  size="sm"
                  className="bg-accent/20 text-accent-foreground hover:bg-accent/30"
                >
                  Bytt til student
                </Button>
              )}
            </div>
          </header>

          {/* Page Content */}
          <main className="flex-1">
            <div className="mx-auto max-w-7xl px-6 py-8 lg:px-8">
              {children}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
