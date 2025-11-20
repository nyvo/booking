/**
 * Teacher Dashboard - "Elevation Layers" Layout
 *
 * Visual hierarchy through elevation:
 * 1. Full-width toolbar (border-bottom, bg-white/80)
 * 2. Hero "Neste økt" (shadow-md, bg-white/95, text-2xl, rounded-3xl)
 * 3. "Timeplanen din" agenda (shadow-sm, bg-white/90, text-base, rounded-2xl)
 * 4. "Aktive kurs" grid (shadow-sm, bg-white/85, text-lg, rounded-3xl)
 *
 * Design: Elevation + backdrop-blur creates clear visual layers.
 * Typography: Strong hierarchy (text-4xl → text-2xl → text-lg → text-base).
 * Spacing: 16/24/32 vertical rhythm between sections.
 */

import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { MapPin, Clock, Plus, Users } from "lucide-react";
import TeacherLayout from "@/components/layout/TeacherLayout";
import { useAuthContext } from "@/contexts/AuthContext";
import { useCourses, useEvents } from "@/hooks/useClasses";
import { formatDisplayDate } from "@/utils/date";
import { ROUTES } from "@/config/constants";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  getDashboardState,
  getDateLabel,
  type DashboardItem,
} from "@/utils/dashboardState";
import { useScenario } from "@/contexts/ScenarioContext";
import {
  getScenarioDashboardData,
  shouldUseScenarioData,
} from "@/utils/scenarioDashboard";

// Weekday names for course metadata
const WEEKDAY_NAMES: Record<number, string> = {
  0: "Søndager",
  1: "Mandager",
  2: "Tirsdager",
  3: "Onsdager",
  4: "Torsdager",
  5: "Fredager",
  6: "Lørdager",
};

/**
 * Slim agenda row for upcoming sessions
 * Visual weight: shadow-sm, bg-white/90
 */
function UpcomingSessionRow({
  item,
  navigate,
}: {
  item: DashboardItem;
  navigate: (path: string) => void;
}) {
  const handleClick = () => {
    if (item.type === "course") {
      navigate(ROUTES.TEACHER.COURSES_DETAIL.replace(":id", item.data.id));
    } else {
      navigate(ROUTES.TEACHER.EVENTS_DETAIL.replace(":id", item.data.id));
    }
  };

  return (
    <button
      onClick={handleClick}
      className="group w-full flex items-center justify-between gap-6 rounded-2xl border border-border/60 bg-white/90 px-5 py-4 text-left shadow-sm backdrop-blur transition-all hover:border-border hover:bg-white hover:shadow cursor-pointer"
    >
      <div className="flex-1 space-y-1">
        <div className="flex items-center gap-2.5">
          <h3 className="text-base font-medium text-slate-900">
            {item.data.name}
          </h3>
          <Badge
            variant="secondary"
            className="bg-accent-lavender/10 text-accent-lavender border-transparent text-xs font-medium"
          >
            {item.type === "course" ? "Kurs" : "Event"}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          <span className="capitalize">{getDateLabel(item)}</span>
          <span className="mx-2">·</span>
          <span>{item.time}</span>
          <span className="mx-2">·</span>
          <span>{item.location}</span>
        </p>
      </div>
      <div className="flex flex-col items-end justify-center gap-0.5 shrink-0">
        <p className="text-sm font-medium text-slate-700">
          {item.enrolled}/{item.capacity}
        </p>
        <p className="text-xs text-muted-foreground">påmeldte</p>
      </div>
    </button>
  );
}

/**
 * Large course card for grid display
 * Visual weight: shadow-sm, bg-white/85
 */
function CourseCard({
  course,
  navigate,
}: {
  course: any;
  navigate: (path: string) => void;
}) {
  const handleClick = () => {
    navigate(ROUTES.TEACHER.COURSES_DETAIL.replace(":id", course.id));
  };

  return (
    <button
      onClick={handleClick}
      className="group rounded-3xl border border-border/60 bg-white/85 p-6 text-left shadow-sm backdrop-blur transition-all hover:border-border hover:bg-white hover:shadow-md cursor-pointer"
    >
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-lg font-semibold text-slate-900 leading-snug">
            {course.name}
          </h3>
          <Badge
            variant="outline"
            className="shrink-0 bg-accent-mint/10 text-accent-mint border-accent-mint/20 text-xs font-medium"
          >
            {course.numberOfWeeks} uker
          </Badge>
        </div>
        <div className="space-y-1.5">
          <p className="text-sm text-muted-foreground">
            Starter {formatDisplayDate(course.startDate)}
          </p>
          <p className="text-sm text-muted-foreground">
            {WEEKDAY_NAMES[course.recurringDayOfWeek]} · {course.recurringTime}
          </p>
        </div>
        <div className="flex items-center justify-between pt-3 border-t border-border/40">
          <span className="text-sm text-muted-foreground">Påmeldte</span>
          <span className="text-base font-medium text-slate-700">
            {course.enrolledCount}/{course.capacity}
          </span>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="w-full rounded-full mt-2"
          onClick={(e) => {
            e.stopPropagation();
            handleClick();
          }}
        >
          Administrer kurs
        </Button>
      </div>
    </button>
  );
}

export default function TeacherDashboard() {
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const teacherId = user?.id;

  // DEV ONLY: Scenario support
  const { scenario, isEnabled: scenarioEnabled } = useScenario();

  // Date reference
  const today = useMemo(() => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    return date;
  }, []);

  // Filters
  const upcomingFilters = useMemo(
    () => (teacherId ? { teacherId, dateFrom: today } : undefined),
    [teacherId, today],
  );

  const pagination = useMemo(() => ({ page: 1, pageSize: 20 }), []);

  // Data fetching (real API data)
  const { data: upcomingCourses, loading: loadingUpcoming } = useCourses(
    upcomingFilters,
    pagination,
  );
  const { data: upcomingEvents } = useEvents(upcomingFilters, pagination);

  // All courses (for "Aktive kurs" section)
  const allCoursesFilters = useMemo(
    () => (teacherId ? { teacherId } : undefined),
    [teacherId],
  );
  const { data: allCourses } = useCourses(allCoursesFilters, pagination);

  // ========================================
  // DEV ONLY: Override data with scenario data if enabled
  // ========================================
  const { courses: displayCourses, events: displayEvents } = useMemo(() => {
    if (scenarioEnabled && shouldUseScenarioData()) {
      const scenarioData = getScenarioDashboardData(scenario);
      return {
        courses: scenarioData.courses,
        events: scenarioData.events,
      };
    }
    // Production: use real API data
    return {
      courses: upcomingCourses?.data || [],
      events: upcomingEvents?.data || [],
    };
  }, [scenarioEnabled, scenario, upcomingCourses, upcomingEvents]);

  // ========================================
  // Dashboard State
  // ========================================
  const dashboardState = useMemo(() => {
    return getDashboardState(displayCourses, displayEvents, today);
  }, [displayCourses, displayEvents, today]);

  return (
    <TeacherLayout>
      {/* Page wrapper with bg-canvas + subtle gradient */}
      <div className="min-h-screen">
        {/* Subtle ambient gradient background */}
        <div
          className="fixed inset-0 -z-10"
          style={{
            background: `
              radial-gradient(circle at top left, rgba(78, 149, 255, 0.06), transparent 50%),
              radial-gradient(circle at bottom right, rgba(165, 180, 252, 0.05), transparent 50%),
              #F5F4F1
            `,
          }}
        />

        {/* ============================= */}
        {/* TOP TOOLBAR (NON-STICKY, CLEAN BAR) */}
        {/* ============================= */}
        <div className="mb-12">
          <div className="mx-auto flex max-w-5xl items-center justify-between gap-6 px-6 md:px-8">
            <div className="space-y-1">
              <h1 className="text-3xl font-semibold tracking-tight text-slate-900 md:text-4xl">
                Timeplan og kurs
              </h1>
              <p className="text-sm text-muted-foreground">
                Hei, {user?.name?.split(" ")[0] || user?.name}
              </p>
            </div>
            <div className="flex items-center gap-2 md:gap-3">
              <Button
                onClick={() => navigate(ROUTES.TEACHER.STUDENTS)}
                variant="outline"
                size="sm"
                className="hidden rounded-full md:inline-flex"
              >
                Påmeldinger
              </Button>
              <Button
                onClick={() => navigate(ROUTES.TEACHER.EVENTS_CREATE)}
                variant="outline"
                size="sm"
                className="rounded-full"
              >
                <span className="hidden sm:inline">Nytt event</span>
                <span className="sm:hidden">Event</span>
              </Button>
              <Button
                onClick={() => navigate(ROUTES.TEACHER.COURSES_CREATE)}
                variant="outline"
                size="sm"
                className="rounded-full"
              >
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">Nytt kurs</span>
                <span className="sm:hidden">Kurs</span>
              </Button>
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-5xl space-y-16 px-6 pb-16 md:px-8">
          {/* ============================= */}
          {/* HERO: NESTE ØKT (shadow-md, bg-white/95, text-2xl) */}
          {/* ============================= */}
          {loadingUpcoming ? (
            <div className="h-56 animate-pulse rounded-3xl bg-white/70 shadow-sm" />
          ) : !dashboardState.hasUpcoming ? (
            // Empty state
            <Card className="rounded-3xl border border-border/60 bg-white/95 shadow-md backdrop-blur">
              <CardContent className="space-y-6 py-16">
                <div className="space-y-3 text-center">
                  <h2 className="text-2xl font-semibold text-slate-900">
                    Du har ingen planlagte økter
                  </h2>
                  <p className="text-base text-muted-foreground">
                    Opprett ditt første kurs eller arrangement for å komme i
                    gang.
                  </p>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-3">
                  <Button
                    onClick={() => navigate(ROUTES.TEACHER.COURSES_CREATE)}
                    variant="default"
                    className="rounded-full"
                  >
                    <Plus className="h-4 w-4" />
                    Opprett kurs
                  </Button>
                  <Button
                    onClick={() => navigate(ROUTES.TEACHER.EVENTS_CREATE)}
                    variant="outline"
                    className="rounded-full"
                  >
                    Opprett event
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : dashboardState.nextSession ? (
            // Hero card for next session
            <Card className="rounded-3xl border border-border/60 bg-white/95 shadow-md backdrop-blur">
              <CardContent className="space-y-6 p-6 md:p-8">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                      Neste økt
                    </p>
                    <Badge
                      variant="secondary"
                      className="border-transparent bg-accent-lavender/10 text-accent-lavender"
                    >
                      {dashboardState.nextSession.type === "course"
                        ? "Kurs"
                        : "Event"}
                    </Badge>
                  </div>
                  <h2 className="text-2xl font-semibold leading-tight tracking-tight text-slate-900 md:text-3xl">
                    {dashboardState.nextSession.data.name}
                  </h2>
                </div>
                <div className="space-y-2 text-base text-slate-700">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium capitalize">
                      {getDateLabel(dashboardState.nextSession)}
                    </span>
                    <span className="text-muted-foreground">·</span>
                    <span className="font-semibold">
                      {dashboardState.nextSession.time}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{dashboardState.nextSession.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>
                      {dashboardState.nextSession.enrolled} av{" "}
                      {dashboardState.nextSession.capacity} påmeldte
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : null}

          {/* ============================= */}
          {/* TIMEPLANEN DIN (shadow-sm, bg-white/90, text-base) */}
          {/* ============================= */}
          {dashboardState.remainingUpcoming.length > 0 && (
            <div className="space-y-6">
              <div className="space-y-1">
                <h2 className="text-2xl font-medium text-slate-900">
                  Timeplanen din
                </h2>
                <p className="text-sm text-muted-foreground">
                  Neste økter de kommende dagene
                </p>
              </div>
              <div className="space-y-3">
                {dashboardState.remainingUpcoming.slice(0, 6).map((item) => (
                  <UpcomingSessionRow
                    key={`${item.type}-${item.data.id}`}
                    item={item}
                    navigate={navigate}
                  />
                ))}
              </div>
              {dashboardState.remainingUpcoming.length > 6 && (
                <div className="text-right">
                  <button
                    onClick={() => navigate(ROUTES.TEACHER.COURSES)}
                    className="cursor-pointer text-sm text-muted-foreground underline-offset-4 transition-all hover:text-slate-900 hover:underline"
                  >
                    Se full kalender →
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ============================= */}
          {/* AKTIVE KURS (shadow-sm, bg-white/85, text-lg) */}
          {/* ============================= */}
          {allCourses && allCourses.data.length > 0 && (
            <div className="space-y-8 border-t border-border/40 pt-16">
              <div className="space-y-1">
                <h2 className="text-2xl font-medium text-slate-900">
                  Aktive kurs
                </h2>
                <p className="text-sm text-muted-foreground">
                  Kursforløp du underviser denne sesongen
                </p>
              </div>
              <div className="grid gap-6 sm:grid-cols-2">
                {allCourses.data.slice(0, 4).map((course) => (
                  <CourseCard
                    key={course.id}
                    course={course}
                    navigate={navigate}
                  />
                ))}
              </div>
              {allCourses.data.length > 4 && (
                <div className="flex justify-center pt-4">
                  <Button
                    onClick={() => navigate(ROUTES.TEACHER.COURSES)}
                    variant="outline"
                    className="rounded-full"
                  >
                    Se alle kurs →
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </TeacherLayout>
  );
}
