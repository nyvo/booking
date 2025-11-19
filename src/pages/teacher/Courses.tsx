/**
 * Teacher courses management page
 */

import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Calendar, Clock } from "lucide-react";
import TeacherLayout from "@/components/layout/TeacherLayout";
import { useAuthContext } from "@/contexts/AuthContext";
import { useCourses } from "@/hooks/useClasses";
import { formatDisplayDate } from "@/utils/date";
import { ROUTES, CURRENCY } from "@/config/constants";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const WEEKDAY_NAMES = [
  "Søndag",
  "Mandag",
  "Tirsdag",
  "Onsdag",
  "Torsdag",
  "Fredag",
  "Lørdag",
];

export default function TeacherCourses() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuthContext();

  const teacherId = user?.id;

  // Create stable filter and pagination objects (only when teacherId is available)
  const courseFilters = useMemo(
    () => (teacherId ? { teacherId } : undefined),
    [teacherId],
  );
  const coursePagination = useMemo(() => ({ page: 1, pageSize: 20 }), []);

  const { data, loading, error } = useCourses(courseFilters, coursePagination);

  return (
    <TeacherLayout>
      <div className="space-y-6 max-w-5xl">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-normal text-foreground">
              {t("nav.courses")}
            </h1>
            <p className="mt-2 text-muted-foreground">
              Administrer dine yogakurs
            </p>
          </div>
          <Button
            onClick={() => navigate(ROUTES.TEACHER.COURSES_CREATE)}
            variant="default"
          >
            Opprett nytt kurs
          </Button>
        </div>

        {/* Error Display */}
        {error && (
          <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-5 text-destructive/80">
            <p className="font-medium">Kunne ikke laste kurs</p>
            <p className="text-sm mt-1.5">{error.message}</p>
          </div>
        )}

        {/* Courses List */}
        {loading ? (
          <div className="grid gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="p-6">
                <div className="h-32 animate-pulse rounded bg-secondary"></div>
              </Card>
            ))}
          </div>
        ) : data?.data.length === 0 ? (
          <Card className="p-12 text-center">
            <p className="text-muted-foreground">Du har ingen kurs ennå</p>
            <Button
              onClick={() => navigate(ROUTES.TEACHER.COURSES_CREATE)}
              className="mt-4"
              variant="default"
            >
              Opprett ditt første kurs
            </Button>
          </Card>
        ) : (
          <div className="max-w-5xl space-y-4">
            {data?.data.map((course) => {
              const fillPercentage = Math.round(
                (course.enrolledCount / course.capacity) * 100,
              );

              return (
                <Card
                  key={course.id}
                  className="rounded-3xl border border-border/60 bg-background-surface/80 shadow-md backdrop-blur cursor-pointer transition-all hover:bg-primary/5 hover:border-primary/30 hover:shadow"
                  onClick={() =>
                    navigate(
                      ROUTES.TEACHER.COURSES_DETAIL.replace(":id", course.id),
                    )
                  }
                >
                  <div className="flex flex-col md:flex-row gap-8 p-8">
                    {/* Left Side: Course Identity & Session Details (60%) */}
                    <div className="flex-1 md:max-w-[60%] space-y-4">
                      {/* Course Name */}
                      <h3 className="text-xl font-semibold text-foreground leading-tight">
                        {course.name}
                      </h3>

                      {/* Metadata Chips */}
                      <div className="flex flex-wrap gap-2">
                        <span className="rounded-full bg-accent/20 px-3 py-1 text-xs font-medium text-foreground">
                          {course.numberOfWeeks} uker
                        </span>
                        <span className="rounded-full bg-accent/20 px-3 py-1 text-xs font-medium text-foreground">
                          {course.location}
                        </span>
                        <span className="rounded-full bg-accent/20 px-3 py-1 text-xs font-medium text-foreground">
                          {course.duration} min
                        </span>
                      </div>

                      {/* Session Details */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-foreground">
                          <Calendar className="h-4 w-4 text-primary shrink-0" />
                          <span>
                            Starter {formatDisplayDate(course.startDate)}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-sm text-foreground">
                          <Clock className="h-4 w-4 text-primary shrink-0" />
                          <span>
                            {WEEKDAY_NAMES[course.recurringDayOfWeek]}er kl.{" "}
                            {course.recurringTime}
                          </span>
                        </div>
                      </div>

                      {/* Description */}
                      {course.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed pt-2">
                          {course.description}
                        </p>
                      )}
                    </div>

                    {/* Right Side: Stats & Action (40%) */}
                    <div className="flex flex-col items-start md:items-end justify-between gap-6 md:min-w-[40%]">
                      {/* Big Stats */}
                      <div className="flex md:flex-col gap-8 md:gap-4 w-full md:items-end">
                        {/* Enrolled Count - Large & Prominent */}
                        <div className="text-left md:text-right">
                          <div className="text-4xl font-normal text-foreground leading-none">
                            {course.enrolledCount}
                            <span className="text-2xl text-muted-foreground font-normal">
                              /{course.capacity}
                            </span>
                          </div>
                          <div className="text-xs text-muted-foreground mt-2 uppercase tracking-wide">
                            Påmeldte
                          </div>
                          {/* Soft Pill Progress Indicator */}
                          <div className="mt-3">
                            <span className="inline-block rounded-full bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary">
                              {fillPercentage}% fylt
                            </span>
                          </div>
                        </div>

                        {/* Price - Large & Prominent */}
                        <div className="text-left md:text-right">
                          <div className="text-4xl font-normal text-foreground leading-none">
                            {course.price}
                          </div>
                          <div className="text-xs text-muted-foreground mt-2 uppercase tracking-wide">
                            {CURRENCY}
                          </div>
                        </div>
                      </div>

                      {/* Edit Button */}
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-full px-6 self-stretch md:self-end"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(
                            ROUTES.TEACHER.COURSES_EDIT.replace(
                              ":id",
                              course.id,
                            ),
                          );
                        }}
                      >
                        Rediger
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </TeacherLayout>
  );
}
