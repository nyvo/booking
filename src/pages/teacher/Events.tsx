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
            <h1 className="text-3xl font-normal text-foreground">
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
            {data?.data.map((event) => {
              const fillPercentage = Math.round(
                (event.bookedCount / event.capacity) * 100,
              );

              return (
                <Card
                  key={event.id}
                  className="rounded-3xl border border-border/60 bg-background-surface/80 shadow-md backdrop-blur cursor-pointer transition-all hover:bg-primary/5 hover:border-primary/30 hover:shadow"
                  onClick={() =>
                    navigate(
                      ROUTES.TEACHER.EVENTS_DETAIL.replace(":id", event.id),
                    )
                  }
                >
                  <div className="flex flex-col md:flex-row gap-8 p-8">
                    {/* Left Side: Event Identity & Session Details (60%) */}
                    <div className="flex-1 md:max-w-[60%] space-y-4">
                      {/* Event Name */}
                      <h3 className="text-xl font-semibold text-foreground leading-tight">
                        {event.name}
                      </h3>

                      {/* Metadata Chips */}
                      <div className="flex flex-wrap gap-2">
                        <span className="rounded-full bg-accent/20 px-3 py-1 text-xs font-medium text-foreground">
                          {event.location}
                        </span>
                        <span className="rounded-full bg-accent/20 px-3 py-1 text-xs font-medium text-foreground">
                          {event.duration} min
                        </span>
                        {event.dropInAvailable && (
                          <span className="rounded-full bg-accent/20 px-3 py-1 text-xs font-medium text-foreground">
                            Drop-in
                          </span>
                        )}
                      </div>

                      {/* Session Details */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-foreground">
                          <Calendar className="h-4 w-4 text-primary shrink-0" />
                          <span>{formatDisplayDate(event.date)}</span>
                        </div>

                        <div className="flex items-center gap-2 text-sm text-foreground">
                          <Clock className="h-4 w-4 text-primary shrink-0" />
                          <span>Kl. {event.startTime}</span>
                        </div>
                      </div>

                      {/* Description */}
                      {event.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed pt-2">
                          {event.description}
                        </p>
                      )}
                    </div>

                    {/* Right Side: Stats & Action (40%) */}
                    <div className="flex flex-col items-start md:items-end justify-between gap-6 md:min-w-[40%]">
                      {/* Big Stats */}
                      <div className="flex md:flex-col gap-8 md:gap-4 w-full md:items-end">
                        {/* Booked Count - Large & Prominent */}
                        <div className="text-left md:text-right">
                          <div className="text-4xl font-normal text-foreground leading-none">
                            {event.bookedCount}
                            <span className="text-2xl text-muted-foreground font-normal">
                              /{event.capacity}
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
                            {event.price}
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
                            ROUTES.TEACHER.EVENTS_EDIT.replace(":id", event.id),
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
