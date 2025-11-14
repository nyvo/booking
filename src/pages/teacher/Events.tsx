/**
 * Teacher events management page
 */

import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Calendar, Clock, MapPin } from "lucide-react";
import TeacherLayout from "@/components/layout/TeacherLayout";
import { useAuthContext } from "@/contexts/AuthContext";
import { useEvents } from "@/hooks/useClasses";
import { formatDisplayDate } from "@/utils/date";
import { ROUTES, CURRENCY } from "@/config/constants";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function TeacherEvents() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuthContext();

  const teacherId = user?.id;

  // Create stable filter and pagination objects (only when teacherId is available)
  const classFilters = useMemo(
    () => (teacherId ? { teacherId } : undefined),
    [teacherId],
  );
  const classPagination = useMemo(() => ({ page: 1, pageSize: 20 }), []);

  const { data, loading, error } = useEvents(classFilters, classPagination);

  return (
    <TeacherLayout>
      <div className="space-y-6 max-w-5xl">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-foreground">
              Arrangementer
            </h1>
            <p className="mt-2 text-muted-foreground">
              Administrer dine yogaarrangementer
            </p>
          </div>
          <Button
            onClick={() => navigate(ROUTES.TEACHER.EVENTS_CREATE)}
            variant="default"
          >
            Opprett nytt arrangement
          </Button>
        </div>

        {/* Error Display */}
        {error && (
          <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-5 text-destructive/80">
            <p className="font-medium">Kunne ikke laste arrangementer</p>
            <p className="text-sm mt-1.5">{error.message}</p>
          </div>
        )}

        {/* Events List */}
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
            <p className="text-muted-foreground">
              Du har ingen arrangementer ennå
            </p>
            <Button
              onClick={() => navigate(ROUTES.TEACHER.EVENTS_CREATE)}
              className="mt-4"
              variant="default"
            >
              Opprett ditt første arrangement
            </Button>
          </Card>
        ) : (
          <div className="max-w-5xl space-y-4">
            {data?.data.map((event) => (
              <Card
                key={event.id}
                className="rounded-2xl border border-border bg-white shadow-sm px-6 py-5 cursor-pointer transition-all hover:bg-primary/5 hover:border-primary/30 hover:shadow"
                onClick={() =>
                  navigate(
                    ROUTES.TEACHER.EVENTS_DETAIL.replace(":id", event.id),
                  )
                }
              >
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="flex-1 min-w-0 space-y-2.5">
                    <h3 className="text-lg font-semibold text-foreground leading-tight">
                      {event.name}
                    </h3>

                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 text-sm text-foreground">
                        <Calendar className="h-4 w-4 text-primary shrink-0" />
                        <span>{formatDisplayDate(event.date)}</span>
                        <span className="text-muted-foreground/40 mx-1">|</span>
                        <Clock className="h-4 w-4 text-primary shrink-0" />
                        <span>
                          {event.startTime} ({event.duration} min)
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-sm text-foreground">
                        <MapPin className="h-4 w-4 text-primary shrink-0" />
                        <span>
                          {event.location}
                          {event.dropInAvailable && " • Drop-in tilgjengelig"}
                        </span>
                      </div>
                    </div>

                    {event.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed max-w-lg">
                        {event.description}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col items-start md:items-end shrink-0 md:w-[130px]">
                    <div className="flex md:flex-col gap-6 md:gap-2.5 w-full">
                      <div className="flex-1 md:flex-none text-left md:text-right">
                        <div className="text-xl font-semibold text-foreground leading-none">
                          {event.bookedCount}
                          <span className="text-base text-muted-foreground font-normal">
                            /{event.capacity}
                          </span>
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          påmeldte
                        </div>
                      </div>

                      <div className="flex-1 md:flex-none text-left md:text-right">
                        <div className="text-xl font-semibold text-foreground leading-none">
                          {event.price}
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
