/**
 * Main layout for teacher dashboard with ShadCN responsive sidebar
 */

import { type ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ROUTES } from "@/config/constants";
import { useAuthContext } from "@/contexts/AuthContext";
import {
  LayoutDashboard,
  Calendar,
  BookOpen,
  CalendarDays,
  Users,
  CreditCard,
  User,
  Settings,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
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

interface TeacherLayoutProps {
  children: ReactNode;
}

export default function TeacherLayout({ children }: TeacherLayoutProps) {
  const { t } = useTranslation();
  const { user, switchRole } = useAuthContext();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    {
      title: t("nav.dashboard"),
      path: ROUTES.TEACHER.DASHBOARD,
      icon: LayoutDashboard,
    },
    {
      title: t("nav.classes"),
      path: ROUTES.TEACHER.CLASSES,
      icon: Calendar,
    },
    {
      title: t("nav.courses"),
      path: ROUTES.TEACHER.COURSES,
      icon: BookOpen,
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

  const accountItems = [
    {
      title: t("nav.profile"),
      path: ROUTES.TEACHER.PROFILE,
      icon: User,
    },
    {
      title: t("nav.settings"),
      path: ROUTES.TEACHER.SETTINGS,
      icon: Settings,
    },
  ];

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        {/* Sidebar */}
        <Sidebar>
          <SidebarHeader>
            <div className="flex items-center gap-2 px-2 py-4">
              <BookOpen className="h-6 w-6 text-primary" />
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
                      <SidebarMenuButton asChild isActive={isActive(item.path)}>
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

            {/* Account Section */}
            <SidebarGroup>
              <SidebarGroupLabel>Konto</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {accountItems.map((item) => (
                    <SidebarMenuItem key={item.path}>
                      <SidebarMenuButton asChild isActive={isActive(item.path)}>
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

          <SidebarFooter>
            <div className="px-2 py-2 text-sm text-muted-foreground">
              {user?.name}
            </div>
          </SidebarFooter>
        </Sidebar>

        {/* Main Content Area */}
        <div className="flex flex-1 flex-col">
          {/* Sticky Header */}
          <header className="sticky top-0 z-40 border-b border-border bg-white">
            <div className="flex h-16 items-center gap-4 px-4 sm:px-6">
              <SidebarTrigger />

              <div className="flex-1" />

              {/* Dev: Role Switcher */}
              {import.meta.env.MODE === "development" && (
                <button
                  onClick={() => switchRole("student")}
                  className="px-3 py-1.5 text-xs font-medium bg-purple-100 text-purple-700 rounded-md hover:bg-purple-200 transition-colors"
                >
                  Bytt til student
                </button>
              )}
            </div>
          </header>

          {/* Page Content */}
          <main className="flex-1">
            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
              {children}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
