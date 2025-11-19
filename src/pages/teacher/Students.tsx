/**
 * Students page for teachers - Redesigned to match Payments page design system
 * Prioritizes information hierarchy based on yoga teacher workflows
 */

import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Phone, AlertCircle, MoreVertical } from "lucide-react";

import TeacherLayout from "@/components/layout/TeacherLayout";
import { useAuthContext } from "@/contexts/AuthContext";
import { useStudents } from "@/hooks/useAuth";
import { useBookings } from "@/hooks/useBookings";
import { useCourses, useEvents } from "@/hooks/useClasses";
import { ROUTES } from "@/config/constants";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/utils/date";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

type StudentFilter = "all" | "active" | "with-notes" | "archive";

export default function Students() {
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const [selectedNote, setSelectedNote] = useState<{
    studentName: string;
    note: string;
  } | null>(null);
  const [filter, setFilter] = useState<StudentFilter>("all");

  // Create stable filter object to avoid infinite re-renders
  const bookingFilters = useMemo(() => ({}), []);

  const {
    data: allStudents,
    loading: loadingStudents,
    error: studentsError,
  } = useStudents();
  const { data: bookingsResponse, loading: loadingBookings } =
    useBookings(bookingFilters);
  const { data: courses, loading: loadingCourses } = useCourses();
  const { data: events, loading: loadingEvents } = useEvents();

  const allBookings = bookingsResponse?.data || [];

  // Filter students who have bookings with this teacher
  const studentsWithBookings = useMemo(() => {
    if (!allStudents || !allBookings.length || !courses || !events || !user?.id)
      return [];

    // Get all item IDs that belong to this teacher
    const teacherItemIds = new Set([
      ...courses.data.filter((c) => c.teacherId === user.id).map((c) => c.id),
      ...events.data.filter((e) => e.teacherId === user.id).map((e) => e.id),
    ]);

    // Filter bookings for this teacher's items
    const teacherBookings = allBookings.filter((booking) =>
      teacherItemIds.has(booking.itemId),
    );

    // Get unique student IDs from these bookings
    const studentIds = new Set(
      teacherBookings.map((booking) => booking.studentId),
    );

    // Return students with their booking count and recent signup check
    return allStudents
      .filter((student) => studentIds.has(student.id))
      .map((student) => {
        const studentTeacherBookings = teacherBookings.filter(
          (b) => b.studentId === student.id,
        );
        const bookingCount = studentTeacherBookings.length;
        const activeBookings = studentTeacherBookings.filter(
          (b) => b.status !== "cancelled",
        ).length;

        // Get latest booking with item details
        const latestBooking = studentTeacherBookings.sort(
          (a, b) =>
            new Date(b.bookingDate || 0).getTime() -
            new Date(a.bookingDate || 0).getTime(),
        )[0];
        const latestBookingDate = latestBooking?.bookingDate;

        // Get the course/event name for latest booking
        let latestItemName = "";
        if (latestBooking) {
          if (latestBooking.itemType === "course") {
            const course = courses.data.find(
              (c) => c.id === latestBooking.itemId,
            );
            latestItemName = course?.name || "Ukjent kurs";
          } else if (latestBooking.itemType === "event") {
            const event = events.data.find(
              (e) => e.id === latestBooking.itemId,
            );
            latestItemName = event?.name || "Ukjent event";
          }
        }

        // Check if student is new (first booking within last 7 days)
        const firstBooking = studentTeacherBookings.sort(
          (a, b) =>
            new Date(a.createdAt || 0).getTime() -
            new Date(b.createdAt || 0).getTime(),
        )[0];
        const isNew =
          firstBooking &&
          firstBooking.createdAt &&
          new Date().getTime() - new Date(firstBooking.createdAt).getTime() <
            7 * 24 * 60 * 60 * 1000;

        return {
          ...student,
          bookingCount,
          activeBookings,
          latestBookingDate,
          latestItemName,
          isNew,
        };
      })
      .sort((a, b) => b.bookingCount - a.bookingCount); // Sort by most bookings
  }, [allStudents, allBookings, courses, events, user?.id]);

  // Apply filters
  const filteredStudents = useMemo(() => {
    if (filter === "all") return studentsWithBookings;
    if (filter === "active")
      return studentsWithBookings.filter((s) => s.activeBookings > 0);
    if (filter === "with-notes")
      return studentsWithBookings.filter((s) => s.medicalNotes);
    if (filter === "archive")
      return studentsWithBookings.filter((s) => s.activeBookings === 0);
    return studentsWithBookings;
  }, [studentsWithBookings, filter]);

  const loading =
    loadingStudents || loadingBookings || loadingCourses || loadingEvents;

  // Count new students
  const newStudentsCount = studentsWithBookings.filter((s) => s.isNew).length;

  return (
    <TeacherLayout>
      {/* Page Header - Matching Payments page */}
      <div className="mx-auto max-w-4xl px-4 space-y-2 mb-8">
        <div className="flex items-center gap-3">
          <h1 className="text-4xl font-normal text-foreground">Påmeldinger</h1>
          {newStudentsCount > 0 && (
            <Badge variant="secondary" className="text-xs px-2 py-1">
              {newStudentsCount} {newStudentsCount === 1 ? "ny" : "nye"}
            </Badge>
          )}
        </div>
        <p className="text-base text-muted-foreground">
          Oversikt over alle påmeldte som har booket timer hos deg
        </p>
      </div>

      {/* Shared container for aligned cards */}
      <div className="mx-auto max-w-4xl px-4 space-y-8">
        {/* Error Display */}
        {studentsError && (
          <Card className="rounded-3xl border border-destructive/20 bg-destructive/5 p-6">
            <p className="font-medium text-destructive">Feil ved lasting:</p>
            <p className="text-sm mt-2 text-destructive/80">
              {studentsError.message}
            </p>
          </Card>
        )}

        {/* Students List Card - Matching Payments page structure */}
        <Card className="rounded-3xl border border-border/60 shadow-md bg-background-surface/80 backdrop-blur overflow-hidden">
          {/* Header */}
          <div className="px-8 py-6 border-b border-border/60">
            <h2 className="text-2xl font-semibold text-foreground">
              Påmeldte studenter
            </h2>
          </div>

          {/* Filter Pills - Matching Payments page */}
          <div className="px-8 py-4 border-b border-border/40 bg-muted/20">
            <div className="flex gap-2 flex-wrap">
              {[
                { value: "all" as const, label: "Alle" },
                { value: "active" as const, label: "Aktive" },
                { value: "with-notes" as const, label: "Med notater" },
                { value: "archive" as const, label: "Arkiv" },
              ].map((filterOption) => (
                <button
                  key={filterOption.value}
                  onClick={() => setFilter(filterOption.value)}
                  className={`
                    px-4 py-2 rounded-full text-sm font-medium transition-colors cursor-pointer
                    ${
                      filter === filterOption.value
                        ? "bg-primary text-white"
                        : "bg-background-surface/60 text-muted-foreground hover:bg-background-surface hover:text-foreground border border-border/40"
                    }
                  `}
                >
                  {filterOption.label}
                </button>
              ))}
            </div>
          </div>

          {/* Table - Matching Payments page */}
          {loading ? (
            <div className="p-12 text-center">
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
              <p className="mt-4 text-sm text-muted-foreground">
                Laster studenter...
              </p>
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-sm text-muted-foreground">
                {filter === "all"
                  ? "Ingen påmeldinger ennå"
                  : filter === "active"
                    ? "Ingen aktive studenter"
                    : filter === "with-notes"
                      ? "Ingen studenter med notater"
                      : "Ingen arkiverte studenter"}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-border/40 hover:bg-transparent">
                    <TableHead className="pl-8 text-xs font-semibold text-muted-foreground">
                      Student
                    </TableHead>
                    <TableHead className="text-xs font-semibold text-muted-foreground">
                      Kurs / Time
                    </TableHead>
                    <TableHead className="text-xs font-semibold text-muted-foreground">
                      Notater
                    </TableHead>
                    <TableHead className="text-xs font-semibold text-muted-foreground">
                      Kontakt
                    </TableHead>
                    <TableHead className="text-xs font-semibold text-muted-foreground">
                      Bookinger
                    </TableHead>
                    <TableHead className="pr-8 text-xs font-semibold text-muted-foreground">
                      <span className="sr-only">Handlinger</span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStudents.map((student) => (
                    <TableRow
                      key={student.id}
                      className={`
                        border-border/40 hover:bg-muted/40 transition-colors
                        ${student.isNew ? "bg-primary/5" : ""}
                      `}
                    >
                      {/* Student Column */}
                      <TableCell className="pl-8">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-foreground">
                            {student.name}
                          </span>
                          {student.isNew && (
                            <Badge
                              variant="secondary"
                              className="text-xs px-2 py-0.5"
                            >
                              Ny
                            </Badge>
                          )}
                        </div>
                      </TableCell>

                      {/* Course / Class Column - REDESIGNED */}
                      <TableCell>
                        <div className="flex flex-col gap-0.5">
                          <span className="text-sm font-medium text-foreground">
                            {student.latestItemName || "-"}
                          </span>
                          {student.latestBookingDate && (
                            <span className="text-xs text-muted-foreground">
                              {formatDate(new Date(student.latestBookingDate))}
                            </span>
                          )}
                        </div>
                      </TableCell>

                      {/* Notes Column - UPGRADED */}
                      <TableCell>
                        {student.medicalNotes ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 hover:bg-primary/10"
                            onClick={() =>
                              setSelectedNote({
                                studentName: student.name,
                                note: student.medicalNotes || "",
                              })
                            }
                          >
                            <AlertCircle className="h-5 w-5 text-orange-500" />
                            <span className="sr-only">Medisinsk notis</span>
                          </Button>
                        ) : (
                          <span className="text-sm text-muted-foreground">
                            –
                          </span>
                        )}
                      </TableCell>

                      {/* Contact Column - REDUCED FOOTPRINT */}
                      <TableCell>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                            >
                              <Mail className="h-4 w-4 text-muted-foreground" />
                              <span className="sr-only">Kontaktinfo</span>
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-64 p-3" align="end">
                            <div className="space-y-2">
                              {student.email && (
                                <div className="flex items-center gap-2 text-sm">
                                  <Mail className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                                  <span className="truncate">
                                    {student.email}
                                  </span>
                                </div>
                              )}
                              {student.phone && (
                                <div className="flex items-center gap-2 text-sm">
                                  <Phone className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                                  <span>{student.phone}</span>
                                </div>
                              )}
                            </div>
                          </PopoverContent>
                        </Popover>
                      </TableCell>

                      {/* Booking Count Column - FULLY MUTED */}
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {student.activeBookings}{" "}
                          {student.activeBookings === 1
                            ? "booking"
                            : "bookinger"}
                        </span>
                      </TableCell>

                      {/* Actions Column */}
                      <TableCell className="pr-8">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                            >
                              <MoreVertical className="h-4 w-4" />
                              <span className="sr-only">Åpne meny</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem
                              onClick={() =>
                                navigate(
                                  ROUTES.TEACHER.STUDENTS_DETAIL.replace(
                                    ":id",
                                    student.id,
                                  ),
                                )
                              }
                            >
                              Se detaljer
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                navigate(
                                  `${ROUTES.TEACHER.PAYMENTS}?student=${student.id}`,
                                )
                              }
                            >
                              Se betaling
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                // TODO: Implement receipt viewing
                                console.log("View receipt for:", student.id);
                              }}
                            >
                              Vis kvittering
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                // TODO: Implement receipt sending
                                console.log("Send receipt to:", student.id);
                              }}
                            >
                              Send kvittering
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Summary Footer */}
          {!loading && (
            <div className="px-8 py-4 border-t border-border/60 bg-muted/20">
              <div className="text-xs text-muted-foreground">
                <span>
                  Viser {filteredStudents.length} av{" "}
                  {studentsWithBookings.length}{" "}
                  {studentsWithBookings.length === 1
                    ? "totale booking"
                    : "totale bookinger"}
                </span>
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Medical Notes Dialog */}
      <Dialog
        open={selectedNote !== null}
        onOpenChange={(open) => !open && setSelectedNote(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Medisinsk informasjon</DialogTitle>
            <DialogDescription>{selectedNote?.studentName}</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-foreground whitespace-pre-wrap">
              {selectedNote?.note}
            </p>
          </div>
          <div className="flex justify-end">
            <Button variant="outline" onClick={() => setSelectedNote(null)}>
              Lukk
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </TeacherLayout>
  );
}
