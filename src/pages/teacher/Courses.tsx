/**
 * Teacher courses management page
 */

import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Calendar, Clock, MapPin } from "lucide-react";
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
            <h1 className="text-3xl font-semibold text-foreground">
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
            {data?.data.map((course) => (
              <Card
                key={course.id}
                className="rounded-2xl border border-border bg-white shadow-sm px-6 py-5 cursor-pointer transition-all hover:bg-primary/5 hover:border-primary/30 hover:shadow"
                onClick={() =>
                  navigate(
                    ROUTES.TEACHER.COURSES_DETAIL.replace(":id", course.id),
                  )
                }
              >
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="flex-1 min-w-0 space-y-2.5">
                    <h3 className="text-lg font-semibold text-foreground leading-tight">
                      {course.name}
                    </h3>

                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 text-sm text-foreground">
                        <Calendar className="h-4 w-4 text-primary shrink-0" />
                        <span>{formatDisplayDate(course.startDate)}</span>
                        <span className="text-muted-foreground/40 mx-1">|</span>
                        <Clock className="h-4 w-4 text-primary shrink-0" />
                        <span>
                          {WEEKDAY_NAMES[course.recurringDayOfWeek]}{" "}
                          {course.recurringTime} ({course.duration} min)
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-sm text-foreground">
                        <MapPin className="h-4 w-4 text-primary shrink-0" />
                        <span>
                          {course.location} • {course.numberOfWeeks} uker
                        </span>
                      </div>
                    </div>

                    {course.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed max-w-lg">
                        {course.description}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col items-start md:items-end shrink-0 md:w-[130px]">
                    <div className="flex md:flex-col gap-6 md:gap-2.5 w-full">
                      <div className="flex-1 md:flex-none text-left md:text-right">
                        <div className="text-xl font-semibold text-foreground leading-none">
                          {course.enrolledCount}
                          <span className="text-base text-muted-foreground font-normal">
                            /{course.capacity}
                          </span>
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          påmeldte
                        </div>
                      </div>

                      <div className="flex-1 md:flex-none text-left md:text-right">
                        <div className="text-xl font-semibold text-foreground leading-none">
                          {course.price}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {CURRENCY}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </TeacherLayout>
  );
}
