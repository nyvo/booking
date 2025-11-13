/**
 * Teacher courses management page
 */

import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Pencil } from "lucide-react";
import TeacherLayout from "@/components/layout/TeacherLayout";
import { useAuthContext } from "@/contexts/AuthContext";
import { useCourses } from "@/hooks/useClasses";
import { formatDisplayDate } from "@/utils/date";
import { ROUTES } from "@/config/constants";
import { Button } from "@/components/ui/button";

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
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-foreground">
              {t("nav.courses")}
            </h1>
            <p className="mt-2 text-muted-foreground">
              Administrer dine yogakurs
            </p>
          </div>
          <button
            onClick={() => navigate(ROUTES.TEACHER.COURSES_CREATE)}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Opprett ny kursrekke
          </button>
        </div>

        {/* Error Display */}
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">
            <p className="font-medium">Kunne ikke laste kurs</p>
            <p className="text-sm mt-1">{error.message}</p>
          </div>
        )}

        {/* Courses List */}
        <div className="rounded-lg border border-border bg-white">
          <div className="divide-y divide-border">
            {loading ? (
              <div className="p-6">
                <div className="space-y-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div
                      key={i}
                      className="h-24 animate-pulse rounded bg-secondary"
                    ></div>
                  ))}
                </div>
              </div>
            ) : data?.data.length === 0 ? (
              <div className="p-12 text-center">
                <p className="text-muted-foreground">Du har ingen kurs ennå</p>
                <button
                  onClick={() => navigate(ROUTES.TEACHER.COURSES_CREATE)}
                  className="mt-4 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
                >
                  Opprett ditt første kurs
                </button>
              </div>
            ) : (
              data?.data.map((course) => (
                <div
                  key={course.id}
                  className="p-6 transition-colors hover:bg-secondary/50"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <h3 className="text-lg font-semibold text-foreground">
                        {course.name}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {course.description}
                      </p>
                      <div className="flex items-center gap-6 text-sm text-muted-foreground">
                        <span>
                          Starter: {formatDisplayDate(course.startDate)}
                        </span>
                        <span>{course.numberOfWeeks} uker</span>
                        <span>
                          {WEEKDAY_NAMES[course.recurringDayOfWeek]} kl.{" "}
                          {course.recurringTime}
                        </span>
                        <span>{course.duration} min</span>
                        <span>{course.location}</span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{course.sessions.length} økter</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {course.tags?.map((tag) => (
                          <span
                            key={tag}
                            className="rounded-full bg-secondary px-3 py-1 text-xs font-medium text-foreground"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-3">
                      <div className="text-right">
                        <div className="text-sm font-medium text-foreground">
                          {course.enrolledCount}/{course.capacity} påmeldte
                        </div>
                        <div className="mt-1 text-lg font-semibold text-foreground">
                          {course.price} NOK
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          navigate(
                            ROUTES.TEACHER.COURSES_EDIT.replace(
                              ":id",
                              course.id,
                            ),
                          )
                        }
                      >
                        <Pencil className="mr-2 h-4 w-4" />
                        Rediger
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </TeacherLayout>
  );
}
