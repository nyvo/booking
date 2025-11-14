/**
 * Event detail page for teachers
 * Shows event information with edit button
 */

import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  Users,
  Pencil,
  Trash2,
} from "lucide-react";
import { useState } from "react";

import TeacherLayout from "@/components/layout/TeacherLayout";
import { useEvent, useEventMutations } from "@/hooks/useClasses";
import { ROUTES, CURRENCY } from "@/config/constants";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatDisplayDate } from "@/utils/date";

export default function EventDetail() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { data: event, loading, error } = useEvent(id);
  const { remove, loading: deleting } = useEventMutations();

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleDelete = async () => {
    if (!id) return;

    try {
      await remove(id);
      navigate(ROUTES.TEACHER.EVENTS);
    } catch (err) {
      console.error("Failed to delete event:", err);
    }
  };

  // Loading state
  if (loading) {
    return (
      <TeacherLayout>
        <div className="flex min-h-[400px] items-center justify-center">
          <div className="text-center">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Laster arrangement...</p>
          </div>
        </div>
      </TeacherLayout>
    );
  }

  // Error or not found
  if (error || !event) {
    return (
      <TeacherLayout>
        <div className="space-y-6">
          <Button
            variant="ghost"
            onClick={() => navigate(ROUTES.TEACHER.EVENTS)}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Tilbake til arrangementer
          </Button>
          <Card className="rounded-2xl border-destructive/20 bg-destructive/5 p-6">
            <p className="text-destructive/80">
              Arrangementet ble ikke funnet eller kunne ikke lastes.
            </p>
          </Card>
        </div>
      </TeacherLayout>
    );
  }

  const bookingPercentage = Math.round(
    (event.bookedCount / event.capacity) * 100,
  );

  return (
    <TeacherLayout>
      <div className="max-w-4xl space-y-6">
        {/* Breadcrumbs */}
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href={ROUTES.TEACHER.DASHBOARD}>
                Hjem
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href={ROUTES.TEACHER.EVENTS}>
                Arrangementer
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{event.name}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Header with actions */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold text-foreground">
              {event.name}
            </h1>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() =>
                navigate(ROUTES.TEACHER.EVENTS_EDIT.replace(":id", event.id))
              }
              className="gap-2"
            >
              <Pencil className="h-4 w-4" />
              Rediger
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(true)}
              className="gap-2 border-destructive/30 text-destructive hover:bg-destructive/5 hover:border-destructive/50"
            >
              <Trash2 className="h-4 w-4" />
              Slett
            </Button>
          </div>
        </div>

        {/* Event Details Card */}
        <Card className="rounded-2xl border border-border/60 bg-white shadow-sm">
          <div className="px-8 py-6 space-y-8">
            {/* Small label */}
            <div>
              <span className="inline-block px-3 py-1 text-xs font-medium text-primary bg-primary/10 rounded-full">
                Arrangementdetaljer
              </span>
            </div>

            {/* Beskrivelse */}
            {event.description && (
              <div className="mb-6">
                <h3 className="text-sm font-medium text-muted-foreground mb-2">
                  Beskrivelse
                </h3>
                <p className="text-sm text-foreground leading-relaxed max-w-2xl">
                  {event.description}
                </p>
              </div>
            )}

            {/* Subtle divider */}
            <div className="border-b border-border/30 my-6"></div>

            {/* Tidspunkt */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-muted-foreground mb-2">
                Tidspunkt
              </h3>
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 text-sm text-foreground">
                  <CalendarIcon className="h-4 w-4 text-primary/60" />
                  <span>{formatDisplayDate(event.date)}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-foreground">
                  <Clock className="h-4 w-4 text-primary/60" />
                  <span>
                    Kl. {event.startTime} ({event.duration} min)
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-foreground">
                  <MapPin className="h-4 w-4 text-primary/60" />
                  <span>{event.location}</span>
                </div>
              </div>
            </div>

            {/* Subtle divider */}
            <div className="border-b border-border/30 my-6"></div>

            {/* Påmeldinger */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-muted-foreground mb-2">
                Påmeldinger
              </h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-foreground">
                  <Users className="h-4 w-4 text-primary/60" />
                  <span>
                    {event.bookedCount} av {event.capacity} plasser
                  </span>
                  <span className="text-muted-foreground">·</span>
                  <Badge
                    variant="secondary"
                    className="bg-primary/5 text-primary border-0 rounded-full"
                  >
                    {bookingPercentage}% fylt
                  </Badge>
                </div>
                {/* Ultra-thin progress bar */}
                <div className="w-full h-0.5 bg-muted/30 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary/40 transition-all rounded-full"
                    style={{ width: `${bookingPercentage}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Subtle divider */}
            <div className="border-b border-border/30 my-6"></div>

            {/* Nøkkeltall */}
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-3">
                Nøkkeltall
              </h3>
              <div className="grid grid-cols-3 gap-6">
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Type</div>
                  <div className="text-lg font-semibold text-foreground">
                    {event.eventType}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1">
                    Drop-in
                  </div>
                  <div className="text-lg font-semibold text-foreground">
                    {event.dropInAvailable
                      ? "Tilgjengelig"
                      : "Ikke tilgjengelig"}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Pris</div>
                  <div className="text-lg font-semibold text-foreground">
                    {event.price} {CURRENCY}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle>Bekreft sletting</DialogTitle>
            <DialogDescription>
              Er du sikker på at du vil slette dette arrangementet? Dette kan
              ikke angres.
              {event.bookedCount > 0 && (
                <span className="block mt-2 font-medium text-destructive">
                  Advarsel: {event.bookedCount} påmeldte på dette arrangementet!
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
              disabled={deleting}
            >
              Avbryt
            </Button>
            <Button
              variant="outline"
              onClick={handleDelete}
              disabled={deleting}
              className="border-destructive/30 text-destructive hover:bg-destructive/5 hover:border-destructive/50"
            >
              {deleting ? "Sletter..." : "Ja, slett arrangement"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </TeacherLayout>
  );
}
