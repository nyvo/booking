/**
 * Course detail page for teachers
 * Shows course information with edit button
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
import { format } from "date-fns";

import TeacherLayout from "@/components/layout/TeacherLayout";
import { useCourse, useCourseMutations } from "@/hooks/useClasses";
import { ROUTES, CURRENCY } from "@/config/constants";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { TimePicker } from "@/components/ui/time-picker";
import { Input } from "@/components/ui/input";
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { formatDisplayDate } from "@/utils/date";
import type { CourseSession } from "@/types";

const WEEKDAY_NAMES: Record<number, string> = {
  0: "Søndag",
  1: "Mandag",
  2: "Tirsdag",
  3: "Onsdag",
  4: "Torsdag",
  5: "Fredag",
  6: "Lørdag",
};

export default function CourseDetail() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { data: course, loading, error } = useCourse(id);
  const { remove, loading: deleting } = useCourseMutations();

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [editingSession, setEditingSession] = useState<CourseSession | null>(
    null,
  );
  const [sessionDate, setSessionDate] = useState<Date | undefined>(undefined);
  const [sessionTime, setSessionTime] = useState<string>("");
  const [sessionDuration, setSessionDuration] = useState<number>(60);

  const handleDelete = async () => {
    if (!id) return;

    try {
      await remove(id);
      navigate(ROUTES.TEACHER.COURSES);
    } catch (err) {
      console.error("Failed to delete course:", err);
    }
  };

  const handleEditSession = (session: CourseSession) => {
    setEditingSession(session);
    setSessionDate(new Date(session.date));
    setSessionTime(session.startTime);
    setSessionDuration(session.duration);
  };

  const handleSaveSession = async () => {
    if (!editingSession || !sessionDate) return;

    // TODO: Add API call to update session
    console.log("Saving session:", {
      sessionId: editingSession.id,
      date: sessionDate,
      startTime: sessionTime,
      duration: sessionDuration,
    });

    setEditingSession(null);
  };

  // Loading state
  if (loading) {
    return (
      <TeacherLayout>
        <div className="flex min-h-[400px] items-center justify-center">
          <div className="text-center">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Laster kurs...</p>
          </div>
        </div>
      </TeacherLayout>
    );
  }

  // Error or not found
  if (error || !course) {
    return (
      <TeacherLayout>
        <div className="space-y-6">
          <Button
            variant="ghost"
            onClick={() => navigate(ROUTES.TEACHER.COURSES)}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Tilbake til kurs
          </Button>
          <Card className="rounded-2xl border-destructive/20 bg-destructive/5 p-6">
            <p className="text-destructive/80">
              Kurset ble ikke funnet eller kunne ikke lastes.
            </p>
          </Card>
        </div>
      </TeacherLayout>
    );
  }

  const enrollmentPercentage = Math.round(
    (course.enrolledCount / course.capacity) * 100,
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
              <BreadcrumbLink href={ROUTES.TEACHER.COURSES}>
                Kurs
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{course.name}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Header with actions */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-normal text-foreground">
              {course.name}
            </h1>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() =>
                navigate(ROUTES.TEACHER.COURSES_EDIT.replace(":id", course.id))
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

        {/* Course Details Card */}
        <Card className="rounded-2xl border border-border/60 bg-white shadow-sm">
          <div className="px-8 py-6">
            {/* Small label pill */}
            <div className="mb-6">
              <span className="inline-block px-3 py-1 text-xs font-medium text-primary bg-primary/10 rounded-full">
                Kursdetaljer
              </span>
            </div>

            {/* Beskrivelse */}
            {course.description && (
              <div className="mb-6">
                <h3 className="text-sm font-medium text-muted-foreground mb-2">
                  Beskrivelse
                </h3>
                <p className="text-sm text-foreground leading-relaxed max-w-2xl">
                  {course.description}
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
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-foreground">
                <div className="flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4 text-primary/60" />
                  <span>Starter {formatDisplayDate(course.startDate)}</span>
                </div>
                <span className="text-muted-foreground">·</span>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-primary/60" />
                  <span>
                    {WEEKDAY_NAMES[course.recurringDayOfWeek]} kl.{" "}
                    {course.recurringTime} ({course.duration} min)
                  </span>
                </div>
                <span className="text-muted-foreground">·</span>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-primary/60" />
                  <span>{course.location}</span>
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
                    {course.enrolledCount} av {course.capacity} plasser
                  </span>
                  <span className="text-muted-foreground">·</span>
                  <Badge
                    variant="secondary"
                    className="bg-primary/5 text-primary border-0 rounded-full"
                  >
                    {enrollmentPercentage}% fylt
                  </Badge>
                </div>
                {/* Ultra-thin progress bar */}
                <div className="w-full h-0.5 bg-muted/30 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary/40 transition-all rounded-full"
                    style={{ width: `${enrollmentPercentage}%` }}
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
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <div className="text-xs text-muted-foreground mb-1">
                    Antall uker
                  </div>
                  <div className="text-lg font-semibold text-foreground">
                    {course.numberOfWeeks}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Pris</div>
                  <div className="text-lg font-semibold text-foreground">
                    {course.price} {CURRENCY}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Week-by-week overview */}
        {course.sessions && course.sessions.length > 0 && (
          <Card className="rounded-2xl border border-border/60 bg-white shadow-sm">
            <div className="px-8 py-6">
              <div className="mb-2">
                <h2 className="text-lg font-semibold text-foreground">
                  Kursplan uke for uke
                </h2>
                <p className="text-xs text-muted-foreground mt-1">
                  Oversikt over alle {course.sessions.length} økter
                </p>
              </div>

              <div className="mt-6 space-y-3">
                {course.sessions.map((session) => (
                  <div
                    key={session.id}
                    className="rounded-2xl border border-border/60 bg-white/70 shadow-sm px-4 py-3 cursor-pointer transition-all hover:bg-primary/5 hover:border-primary/30"
                    onClick={() => handleEditSession(session)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <Badge
                        variant="secondary"
                        className="bg-primary/10 text-primary border-0 rounded-full"
                      >
                        Uke {session.sessionNumber}
                      </Badge>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="secondary"
                          className="bg-muted/30 text-muted-foreground border-0 rounded-full"
                        >
                          Planlagt
                        </Badge>
                        <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                          <Pencil className="h-3 w-3" />
                          <span>Rediger</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm text-foreground">
                        <CalendarIcon className="h-3.5 w-3.5 text-primary/60" />
                        <span>{formatDisplayDate(session.date)}</span>
                        <span className="text-muted-foreground">·</span>
                        <Clock className="h-3.5 w-3.5 text-primary/60" />
                        <span>
                          {session.startTime} ({session.duration} min)
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-3.5 w-3.5 text-primary/60" />
                        <span>{course.location}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle>Bekreft sletting</DialogTitle>
            <DialogDescription>
              Er du sikker på at du vil slette dette kurset? Dette kan ikke
              angres.
              {course.enrolledCount > 0 && (
                <span className="block mt-2 font-medium text-destructive">
                  Advarsel: {course.enrolledCount} påmeldte på dette kurset!
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
              {deleting ? "Sletter..." : "Ja, slett kurs"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Session Dialog */}
      <Dialog
        open={!!editingSession}
        onOpenChange={(open) => !open && setEditingSession(null)}
      >
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle>Rediger økt</DialogTitle>
            <DialogDescription>
              Endre dato, tid eller varighet for denne økten. Påmeldte får
              beskjed automatisk.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Date Picker */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Dato
              </label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {sessionDate ? (
                      format(sessionDate, "dd.MM.yyyy")
                    ) : (
                      <span>Velg dato</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={sessionDate}
                    onSelect={setSessionDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Time Picker */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Tidspunkt
              </label>
              <TimePicker
                value={sessionTime}
                onChange={setSessionTime}
                placeholder="Velg tidspunkt"
              />
            </div>

            {/* Duration */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Varighet (minutter)
              </label>
              <Input
                type="number"
                value={sessionDuration}
                onChange={(e) => setSessionDuration(parseInt(e.target.value))}
                min={15}
                max={300}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingSession(null)}>
              Avbryt
            </Button>
            <Button onClick={handleSaveSession}>Lagre endringer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </TeacherLayout>
  );
}
