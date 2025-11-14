/**
 * Teacher dashboard - refined calm, premium yoga instructor experience
 * Unified design with primary blue accent and improved visual hierarchy
 */

import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Calendar,
  Leaf,
  CalendarDays,
  CalendarPlus,
  Users,
  Banknote,
  MapPin,
  Clock,
  TrendingUp,
  Plus,
  ChevronRight,
} from "lucide-react";
import TeacherLayout from "@/components/layout/TeacherLayout";
import { useAuthContext } from "@/contexts/AuthContext";
import { useTeacherRevenue, useBookings } from "@/hooks/useBookings";
import { useCourses, useEvents } from "@/hooks/useClasses";
import { formatDisplayDate } from "@/utils/date";
import { CURRENCY, ROUTES } from "@/config/constants";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function TeacherDashboard() {
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const teacherId = user?.id;

  // Date references
  const today = useMemo(() => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    return date;
  }, []);

  const startOfWeek = useMemo(() => {
    const date = new Date(today);
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1);
    date.setDate(diff);
    return date;
  }, [today]);

  const endOfWeek = useMemo(() => {
    const date = new Date(startOfWeek);
    date.setDate(date.getDate() + 6);
    return date;
  }, [startOfWeek]);

  const tomorrow = useMemo(() => {
    const date = new Date(today);
    date.setDate(date.getDate() + 1);
    return date;
  }, [today]);

  // Filters
  const thisWeekFilters = useMemo(
    () => (teacherId ? { teacherId, dateFrom: startOfWeek } : undefined),
    [teacherId, startOfWeek],
  );

  const upcomingFilters = useMemo(
    () => (teacherId ? { teacherId, dateFrom: today } : undefined),
    [teacherId, today],
  );

  const pagination = useMemo(() => ({ page: 1, pageSize: 20 }), []);

  // Data fetching
  const { data: revenue } = useTeacherRevenue(teacherId);
  const { data: allBookingsData } = useBookings();

  const { data: thisWeekCourses } = useCourses(thisWeekFilters, pagination);
  const { data: thisWeekEvents } = useEvents(thisWeekFilters, pagination);

  const { data: upcomingCourses, loading: loadingUpcoming } = useCourses(
    upcomingFilters,
    pagination,
  );
  const { data: upcomingEvents } = useEvents(upcomingFilters, pagination);

  const allBookings = allBookingsData?.data || [];

  // Calculate upcoming classes grouped by date
  const upcomingClassesGrouped = useMemo(() => {
    const courses = (upcomingCourses?.data || []).map((item) => ({
      type: "course" as const,
      data: item,
      date: new Date(item.startDate),
    }));
    const events = (upcomingEvents?.data || []).map((item) => ({
      type: "event" as const,
      data: item,
      date: new Date(item.date),
    }));

    const combined = [...courses, ...events];
    combined.sort((a, b) => a.date.getTime() - b.date.getTime());

    const todayItems = combined.filter((item) => {
      const itemDate = new Date(item.date);
      itemDate.setHours(0, 0, 0, 0);
      return itemDate.getTime() === today.getTime();
    });

    const tomorrowItems = combined.filter((item) => {
      const itemDate = new Date(item.date);
      itemDate.setHours(0, 0, 0, 0);
      return itemDate.getTime() === tomorrow.getTime();
    });

    const laterThisWeek = combined.filter((item) => {
      const itemDate = new Date(item.date);
      itemDate.setHours(0, 0, 0, 0);
      return itemDate > tomorrow && itemDate <= endOfWeek;
    });

    const groups = [];
    if (todayItems.length > 0)
      groups.push({
        label: "I dag",
        items: todayItems,
        color: "border-l-primary",
      });
    if (tomorrowItems.length > 0)
      groups.push({
        label: "I morgen",
        items: tomorrowItems,
        color: "border-l-primary/70",
      });
    if (laterThisWeek.length > 0)
      groups.push({
        label: "Senere denne uken",
        items: laterThisWeek,
        color: "border-l-primary/50",
      });

    return groups;
  }, [upcomingCourses, upcomingEvents, today, tomorrow, endOfWeek]);

  // Weekly stats
  const weeklyStats = useMemo(() => {
    const weekCourses = thisWeekCourses?.data || [];
    const weekEvents = thisWeekEvents?.data || [];

    const totalClasses = weekCourses.length + weekEvents.length;

    const totalEnrollments = [
      ...weekCourses.map((c) => c.enrolledCount || 0),
      ...weekEvents.map((e) => e.bookedCount || 0),
    ].reduce((sum, count) => sum + count, 0);

    const weeklyRevenue = [
      ...weekCourses.map((c) => (c.enrolledCount || 0) * c.price),
      ...weekEvents.map((e) => (e.bookedCount || 0) * e.price),
    ].reduce((sum, rev) => sum + rev, 0);

    return { totalClasses, totalEnrollments, weeklyRevenue };
  }, [thisWeekCourses, thisWeekEvents]);

  return (
    <TeacherLayout>
      <div className="max-w-5xl space-y-6">
        {/* Personal Greeting */}
        <div className="mb-8">
          <h1 className="text-4xl font-medium text-foreground mb-2">
            Hei, {user?.name?.split(" ")[0] || user?.name} 🌿
          </h1>
          <p className="text-base text-muted-foreground">
            Her er hva som skjer i praksisen din denne uken.
          </p>
        </div>

        {/* Weekly Overview */}
        <div className="rounded-2xl bg-white border border-border shadow-sm px-6 py-5">
          <div className="grid grid-cols-3 gap-6">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-primary/10 p-2.5">
                <CalendarDays className="h-5 w-5 text-primary" />
              </div>
              <div>
                <div className="text-xs font-medium text-muted-foreground mb-0.5">
                  Timer denne uken
                </div>
                <div className="text-2xl font-semibold text-foreground">
                  {weeklyStats.totalClasses}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-primary/10 p-2.5">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <div className="text-xs font-medium text-muted-foreground mb-0.5">
                  Påmeldinger
                </div>
                <div className="text-2xl font-semibold text-foreground">
                  {weeklyStats.totalEnrollments}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-primary/10 p-2.5">
                <Banknote className="h-5 w-5 text-primary" />
              </div>
              <div>
                <div className="text-xs font-medium text-muted-foreground mb-0.5">
                  Inntekter
                </div>
                <div className="text-2xl font-semibold text-foreground">
                  {weeklyStats.weeklyRevenue.toLocaleString("nb-NO")} {CURRENCY}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => navigate(ROUTES.TEACHER.COURSES_CREATE)}
            className="group flex items-center justify-between gap-3 rounded-2xl bg-white border border-border shadow-sm px-4 py-3.5 text-left transition-all hover:bg-primary/5 hover:border-primary/40 hover:shadow-sm cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-primary/10 p-2.5 group-hover:bg-primary/20 transition-colors">
                <Plus className="h-5 w-5 text-primary" />
              </div>
              <div className="text-sm font-semibold text-foreground">
                Nytt kurs
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>

          <button
            onClick={() => navigate(ROUTES.TEACHER.EVENTS_CREATE)}
            className="group flex items-center justify-between gap-3 rounded-2xl bg-white border border-border shadow-sm px-4 py-3.5 text-left transition-all hover:bg-primary/5 hover:border-primary/40 hover:shadow cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-primary/10 p-2.5 group-hover:bg-primary/20 transition-colors">
                <CalendarPlus className="h-5 w-5 text-primary" />
              </div>
              <div className="text-sm font-semibold text-foreground">
                Nytt arrangement
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>

          <button
            onClick={() => navigate(ROUTES.TEACHER.STUDENTS)}
            className="group flex items-center justify-between gap-3 rounded-2xl bg-white border border-border shadow-sm px-4 py-3.5 text-left transition-all hover:bg-primary/5 hover:border-primary/40 hover:shadow cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-primary/10 p-2.5 group-hover:bg-primary/20 transition-colors">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div className="text-sm font-semibold text-foreground">
                Påmeldinger
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>

          <button
            onClick={() => navigate(ROUTES.TEACHER.PAYMENTS)}
            className="group flex items-center justify-between gap-3 rounded-2xl bg-white border border-border shadow-sm px-4 py-3.5 text-left transition-all hover:bg-primary/5 hover:border-primary/40 hover:shadow cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-primary/10 p-2.5 group-hover:bg-primary/20 transition-colors">
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
              <div className="text-sm font-semibold text-foreground">
                Betalinger
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
        </div>

        {/* Dine neste timer */}
        <div>
          <h2 className="text-xl font-semibold text-foreground mb-4">
            Dine neste timer
          </h2>

          {loadingUpcoming ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-20 animate-pulse rounded-xl bg-secondary"
                ></div>
              ))}
            </div>
          ) : upcomingClassesGrouped.length === 0 ? (
            <div className="flex items-center gap-3 rounded-2xl border border-border bg-muted/30 px-4 py-3.5 shadow-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                Ingen kommende timer
              </span>
              <Button
                onClick={() => navigate(ROUTES.TEACHER.COURSES_CREATE)}
                size="sm"
                variant="outline"
                className="ml-auto cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5 mr-1.5" />
                Opprett kurs
              </Button>
            </div>
          ) : (
            <div className="space-y-5">
              {upcomingClassesGrouped.map((group) => (
                <div key={group.label} className="space-y-2">
                  <div className="text-xs font-bold text-foreground/70">
                    {group.label}
                  </div>

                  <div className="space-y-2">
                    {group.items.map((item) => {
                      const { type, data } = item;
                      const displayDate =
                        type === "course" ? data.startDate : data.date;
                      const displayTime =
                        type === "course" ? data.recurringTime : data.startTime;
                      const enrolled =
                        type === "course"
                          ? data.enrolledCount
                          : data.bookedCount;
                      const capacity = data.capacity;
                      const percentage = Math.round(
                        (enrolled / capacity) * 100,
                      );

                      return (
                        <div
                          key={`${type}-${data.id}`}
                          className={`group relative pl-4 pr-5 py-4 rounded-2xl bg-white border-l-[3px] ${group.color} border-r border-t border-b border-border shadow-sm hover:shadow transition-all cursor-pointer`}
                          onClick={() => {
                            if (type === "course") {
                              navigate(
                                ROUTES.TEACHER.COURSES_EDIT.replace(
                                  ":id",
                                  data.id,
                                ),
                              );
                            } else {
                              navigate(
                                ROUTES.TEACHER.EVENTS_EDIT.replace(
                                  ":id",
                                  data.id,
                                ),
                              );
                            }
                          }}
                        >
                          <div className="flex items-center justify-between gap-6">
                            <div className="flex-1 space-y-1.5">
                              <div className="flex items-center gap-2.5">
                                <Badge
                                  variant="secondary"
                                  className="text-xs px-2 py-0.5"
                                >
                                  {type === "course" ? "Kurs" : "Arrangement"}
                                </Badge>
                                <h3 className="font-semibold text-foreground text-sm">
                                  {data.name}
                                </h3>
                              </div>

                              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                <div className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  <span>{formatDisplayDate(displayDate)}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  <span>kl. {displayTime}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <MapPin className="h-3 w-3" />
                                  <span>{data.location}</span>
                                </div>
                              </div>
                            </div>

                            <div className="flex flex-col items-end gap-1.5 shrink-0">
                              <div className="text-right">
                                <div className="text-base font-semibold text-foreground">
                                  {enrolled}/{capacity}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  påmeldte
                                </div>
                              </div>

                              <div className="w-20 h-1.5 bg-muted/50 rounded-full overflow-hidden">
                                <div
                                  className={`h-full transition-all ${
                                    percentage >= 90
                                      ? "bg-primary"
                                      : percentage >= 60
                                        ? "bg-primary/70"
                                        : "bg-primary/40"
                                  }`}
                                  style={{ width: `${percentage}%` }}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </TeacherLayout>
  );
}
