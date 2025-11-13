/**
 * Teacher dashboard home page with overview stats
 */

import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import TeacherLayout from "@/components/layout/TeacherLayout";
import { useAuthContext } from "@/contexts/AuthContext";
import { useTeacherRevenue, useBookings } from "@/hooks/useBookings";
import { useClasses, useCourses, useEvents } from "@/hooks/useClasses";
import { useStudents } from "@/hooks/useAuth";
import { formatDisplayDate, formatTime } from "@/utils/date";
import { CURRENCY, ROUTES } from "@/config/constants";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function TeacherDashboard() {
  const { t } = useTranslation();
  const { user } = useAuthContext();

  const teacherId = user?.id;

  // Create stable date reference (today at midnight for consistent filtering)
  const today = useMemo(() => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    return date;
  }, []);

  // Create stable filter and pagination objects (only when teacherId is available)
  const classFilters = useMemo(
    () => (teacherId ? { teacherId, dateFrom: today } : undefined),
    [teacherId, today],
  );
  const courseFilters = useMemo(
    () => (teacherId ? { teacherId, dateFrom: today } : undefined),
    [teacherId, today],
  );
  const eventFilters = useMemo(
    () => (teacherId ? { teacherId, dateFrom: today } : undefined),
    [teacherId, today],
  );
  const classPagination = useMemo(() => ({ page: 1, pageSize: 5 }), []);

  // Fetch revenue stats
  const {
    data: revenue,
    loading: revenueLoading,
    error: revenueError,
  } = useTeacherRevenue(teacherId);

  // Fetch upcoming classes, courses, and events (only when we have a teacherId)
  const {
    data: classesData,
    loading: classesLoading,
    error: classesError,
  } = useClasses(classFilters, classPagination);

  const {
    data: coursesData,
    loading: coursesLoading,
    error: coursesError,
  } = useCourses(courseFilters, classPagination);

  const {
    data: eventsData,
    loading: eventsLoading,
    error: eventsError,
  } = useEvents(eventFilters, classPagination);

  // Combine upcoming items from all three sources
  const upcomingItems = useMemo(() => {
    const classes = (classesData?.data || []).map((item) => ({
      type: "class" as const,
      data: item,
      date: new Date(item.date),
    }));
    const courses = (coursesData?.data || []).map((item) => ({
      type: "course" as const,
      data: item,
      date: new Date(item.startDate),
    }));
    const events = (eventsData?.data || []).map((item) => ({
      type: "event" as const,
      data: item,
      date: new Date(item.date),
    }));

    const combined = [...classes, ...courses, ...events];

    // Sort by date
    combined.sort((a, b) => a.date.getTime() - b.date.getTime());

    // Return max 5 items
    return combined.slice(0, 5);
  }, [classesData, coursesData, eventsData]);

  const upcomingLoading = classesLoading || coursesLoading || eventsLoading;

  // Fetch all data for stats
  const { data: allBookingsData, loading: loadingBookings } = useBookings();
  const { data: allStudents, loading: loadingStudents } = useStudents();
  const { data: allClasses, loading: loadingClasses } = useClasses();
  const { data: allCourses, loading: loadingCourses } = useCourses();
  const { data: allEvents, loading: loadingEvents } = useEvents();

  const statsLoading =
    loadingBookings ||
    loadingStudents ||
    loadingClasses ||
    loadingCourses ||
    loadingEvents;

  const allBookings = allBookingsData?.data || [];

  // Calculate recent bookings (last 7 days)
  const recentBookingsCount = useMemo(() => {
    if (
      !allBookings.length ||
      !teacherId ||
      !allClasses ||
      !allCourses ||
      !allEvents
    )
      return 0;

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Get all item IDs that belong to this teacher
    const teacherItemIds = new Set([
      ...allClasses.filter((c) => c.teacherId === teacherId).map((c) => c.id),
      ...allCourses.filter((c) => c.teacherId === teacherId).map((c) => c.id),
      ...allEvents.filter((e) => e.teacherId === teacherId).map((e) => e.id),
    ]);

    // Count bookings from last 7 days for this teacher's items
    return allBookings.filter((booking) => {
      const bookingDate = new Date(booking.bookingDate);
      return bookingDate >= sevenDaysAgo && teacherItemIds.has(booking.itemId);
    }).length;
  }, [allBookings, teacherId, allClasses, allCourses, allEvents]);

  // Calculate total unique students
  const totalStudentsCount = useMemo(() => {
    if (
      !allBookings.length ||
      !teacherId ||
      !allClasses ||
      !allCourses ||
      !allEvents
    )
      return 0;

    // Get all item IDs that belong to this teacher
    const teacherItemIds = new Set([
      ...allClasses.filter((c) => c.teacherId === teacherId).map((c) => c.id),
      ...allCourses.filter((c) => c.teacherId === teacherId).map((c) => c.id),
      ...allEvents.filter((e) => e.teacherId === teacherId).map((e) => e.id),
    ]);

    // Get unique student IDs from bookings for this teacher's items
    const uniqueStudentIds = new Set(
      allBookings
        .filter((booking) => teacherItemIds.has(booking.itemId))
        .map((booking) => booking.studentId),
    );

    return uniqueStudentIds.size;
  }, [allBookings, teacherId, allClasses, allCourses, allEvents]);

  return (
    <TeacherLayout>
      <div className="space-y-8">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-semibold text-foreground">
            {t("teacher.welcome")}, {user?.name}
          </h1>
          <p className="mt-2 text-muted-foreground">
            {t("teacher.dashboard.title")}
          </p>
        </div>

        {/* Error Display */}
        {(revenueError || classesError) && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">
            <p className="font-medium">Det oppstod en feil:</p>
            {revenueError && (
              <p className="text-sm mt-1">
                Inntektsdata: {revenueError.message}
              </p>
            )}
            {classesError && (
              <p className="text-sm mt-1">Timer: {classesError.message}</p>
            )}
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {/* Total Revenue */}
          <div className="rounded-lg border border-border bg-white p-6 transition-shadow hover:shadow-md">
            <div className="text-sm font-medium text-muted-foreground">
              {t("teacher.dashboard.revenue")}
            </div>
            {revenueLoading ? (
              <div className="mt-2 h-8 w-24 animate-pulse rounded bg-secondary"></div>
            ) : revenueError ? (
              <div className="mt-2 text-sm text-red-600">Feil ved lasting</div>
            ) : (
              <div className="mt-2 text-3xl font-semibold text-foreground">
                {revenue?.paid.toLocaleString("nb-NO")} {CURRENCY}
              </div>
            )}
            <div className="mt-1 text-xs text-muted-foreground">
              {t("teacher.payment.pending")}:{" "}
              {revenue?.pending.toLocaleString("nb-NO")} {CURRENCY}
            </div>
          </div>

          {/* Upcoming Classes */}
          <div className="rounded-lg border border-border bg-white p-6 transition-shadow hover:shadow-md">
            <div className="text-sm font-medium text-muted-foreground">
              {t("teacher.dashboard.upcomingClasses")}
            </div>
            {upcomingLoading ? (
              <div className="mt-2 h-8 w-16 animate-pulse rounded bg-secondary"></div>
            ) : (
              <div className="mt-2 text-3xl font-semibold text-foreground">
                {(classesData?.total || 0) +
                  (coursesData?.total || 0) +
                  (eventsData?.total || 0)}
              </div>
            )}
            <div className="mt-1 text-xs text-muted-foreground">
              Neste 30 dager
            </div>
          </div>

          {/* Recent Bookings */}
          <div className="rounded-lg border border-border bg-white p-6 transition-shadow hover:shadow-md">
            <div className="text-sm font-medium text-muted-foreground">
              {t("teacher.dashboard.recentBookings")}
            </div>
            {statsLoading ? (
              <div className="mt-2 h-8 w-16 animate-pulse rounded bg-secondary"></div>
            ) : (
              <div className="mt-2 text-3xl font-semibold text-foreground">
                {recentBookingsCount}
              </div>
            )}
            <div className="mt-1 text-xs text-muted-foreground">
              Siste 7 dager
            </div>
          </div>

          {/* Total Students */}
          <div className="rounded-lg border border-border bg-white p-6 transition-shadow hover:shadow-md">
            <div className="text-sm font-medium text-muted-foreground">
              {t("teacher.dashboard.totalStudents")}
            </div>
            {statsLoading ? (
              <div className="mt-2 h-8 w-16 animate-pulse rounded bg-secondary"></div>
            ) : (
              <div className="mt-2 text-3xl font-semibold text-foreground">
                {totalStudentsCount}
              </div>
            )}
            <div className="mt-1 text-xs text-muted-foreground">
              Aktive påmeldinger
            </div>
          </div>
        </div>

        {/* Upcoming Classes List */}
        <div className="rounded-lg border border-border bg-white">
          <div className="border-b border-border p-6">
            <h2 className="text-lg font-semibold text-foreground">
              {t("teacher.dashboard.upcomingClasses")}
            </h2>
          </div>

          <div className="divide-y divide-border">
            {upcomingLoading ? (
              <div className="p-6">
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="h-16 animate-pulse rounded bg-secondary"
                    ></div>
                  ))}
                </div>
              </div>
            ) : upcomingItems.length === 0 ? (
              <div className="p-6 text-center text-muted-foreground">
                Ingen kommende timer
              </div>
            ) : (
              upcomingItems.map((item) => {
                const { type, data } = item;
                const displayDate =
                  type === "course" ? data.startDate : data.date;
                const displayTime =
                  type === "course" ? data.recurringTime : data.startTime;
                const bookedCount =
                  type === "course" ? data.enrolledCount : data.bookedCount;

                const typeLabel =
                  type === "class"
                    ? "Enkeltkurs"
                    : type === "course"
                      ? "Kursrekke"
                      : "Arrangement";

                return (
                  <div
                    key={`${type}-${data.id}`}
                    className="p-6 transition-colors hover:bg-secondary/50"
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{typeLabel}</Badge>
                          <h3 className="font-medium text-foreground">
                            {data.name}
                          </h3>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>{formatDisplayDate(displayDate)}</span>
                          <span>kl. {displayTime}</span>
                          <span>{data.location}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-foreground">
                          {bookedCount}/{data.capacity}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          påmeldte
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid gap-4 md:grid-cols-3">
          <Link
            to={ROUTES.TEACHER.CLASSES_CREATE}
            className="rounded-lg border border-border bg-white p-6 text-left transition-all hover:shadow-md hover:bg-secondary/50 cursor-pointer"
          >
            <div className="text-lg font-semibold text-foreground">
              Opprett nytt enkeltkurs
            </div>
            <div className="mt-1 text-sm text-muted-foreground">
              Legg til et enkeltkurs
            </div>
          </Link>

          <Link
            to={ROUTES.TEACHER.COURSES_CREATE}
            className="rounded-lg border border-border bg-white p-6 text-left transition-all hover:shadow-md hover:bg-secondary/50 cursor-pointer"
          >
            <div className="text-lg font-semibold text-foreground">
              Start ny kursrekke
            </div>
            <div className="mt-1 text-sm text-muted-foreground">
              Opprett en kursrekke
            </div>
          </Link>

          <Link
            to={ROUTES.TEACHER.STUDENTS}
            className="rounded-lg border border-border bg-white p-6 text-left transition-all hover:shadow-md hover:bg-secondary/50 cursor-pointer"
          >
            <div className="text-lg font-semibold text-foreground">
              Se påmeldinger
            </div>
            <div className="mt-1 text-sm text-muted-foreground">
              Administrer påmeldte
            </div>
          </Link>
        </div>
      </div>
    </TeacherLayout>
  );
}
