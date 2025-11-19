/**
 * Course detail page for teachers
 * Shows course information with edit button + enrolled students
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
  AlertCircle,
  Mail,
  Phone,
  MoreVertical,
} from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import { format } from "date-fns";
import { nb } from "date-fns/locale";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import TeacherLayout from "@/components/layout/TeacherLayout";
import {
  useCourse,
  useCourseMutations,
  useCourseStudents,
} from "@/hooks/useClasses";
import { ROUTES, CURRENCY } from "@/config/constants";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { TimePicker } from "@/components/ui/time-picker";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
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
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { formatDisplayDate } from "@/utils/date";
import type { CourseSession } from "@/types";

// Form validation schema
const courseFormSchema = z.object({
  name: z
    .string()
    .min(3, "Navn må være minst 3 tegn")
    .max(100, "Navn kan ikke være mer enn 100 tegn"),
  description: z.string().optional(),
  numberOfWeeks: z
    .number()
    .min(1, "Antall uker må være minst 1")
    .max(52, "Antall uker kan ikke overstige 52"),
  startDate: z.date(),
  recurringTime: z
    .string()
    .regex(
      /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
      "Ugyldig tidsformat (bruk HH:MM)",
    ),
  duration: z
    .number()
    .min(15, "Varighet må være minst 15 minutter")
    .max(300, "Varighet kan ikke overstige 300 minutter"),
  capacity: z
    .number()
    .min(1, "Kapasitet må være minst 1")
    .max(100, "Kapasitet kan ikke overstige 100"),
  price: z.number().min(0, "Pris kan ikke være negativ"),
  location: z.string().min(2, "Lokasjon må være minst 2 tegn"),
});

type CourseFormValues = z.infer<typeof courseFormSchema>;

const WEEKDAY_NAMES: Record<number, string> = {
  0: "Søndag",
  1: "Mandag",
  2: "Tirsdag",
  3: "Onsdag",
  4: "Torsdag",
  5: "Fredag",
  6: "Lørdag",
};

type StudentFilter = "all" | "with-notes" | "archive";
type TabValue = "oversikt" | "kursplan" | "innstillinger";

export default function CourseDetail() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { data: course, loading, error } = useCourse(id);
  const { data: enrolledStudents, loading: loadingStudents } =
    useCourseStudents(id);
  const { update, remove, loading: deleting } = useCourseMutations();

  const [activeTab, setActiveTab] = useState<TabValue>("oversikt");
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form initialization
  const form = useForm<CourseFormValues>({
    resolver: zodResolver(courseFormSchema),
    defaultValues: {
      name: "",
      description: "",
      numberOfWeeks: 6,
      startDate: new Date(),
      recurringTime: "10:00",
      duration: 60,
      capacity: 15,
      price: 200,
      location: "",
    },
  });

  // Populate form when course data loads
  useEffect(() => {
    if (course) {
      form.reset({
        name: course.name,
        description: course.description || "",
        numberOfWeeks: course.numberOfWeeks,
        startDate: new Date(course.startDate),
        recurringTime: course.recurringTime,
        duration: course.duration,
        capacity: course.capacity,
        price: course.price,
        location: course.location,
      });
    }
  }, [course, form]);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [editingSession, setEditingSession] = useState<CourseSession | null>(
    null,
  );
  const [sessionDate, setSessionDate] = useState<Date | undefined>(undefined);
  const [sessionTime, setSessionTime] = useState<string>("");
  const [sessionDuration, setSessionDuration] = useState<number>(60);

  // Students section state
  const [studentFilter, setStudentFilter] = useState<StudentFilter>("all");
  const [selectedNote, setSelectedNote] = useState<{
    studentName: string;
    note: string;
  } | null>(null);

  // Filter students for the participants section (must be before early returns)
  const filteredStudents = useMemo(() => {
    if (!enrolledStudents) return [];
    if (studentFilter === "all") return enrolledStudents;
    if (studentFilter === "with-notes")
      return enrolledStudents.filter((s: any) => s.medicalNotes);
    if (studentFilter === "archive")
      return enrolledStudents.filter((s: any) => s.activeBookings === 0);
    return enrolledStudents;
  }, [enrolledStudents, studentFilter]);

  // Calculate enrollment percentage (must be before early returns)
  const enrollmentPercentage = useMemo(
    () =>
      course ? Math.round((course.enrolledCount / course.capacity) * 100) : 0,
    [course],
  );

  const onSubmit = async (values: CourseFormValues) => {
    try {
      setSubmitError(null);
      setIsSubmitting(true);

      if (!id) {
        setSubmitError("Mangler kurs-ID");
        return;
      }

      await update(id, {
        name: values.name,
        description: values.description || undefined,
        numberOfWeeks: values.numberOfWeeks,
        startDate: values.startDate,
        recurringDayOfWeek: values.startDate.getDay(),
        recurringTime: values.recurringTime,
        duration: values.duration,
        capacity: values.capacity,
        price: values.price,
        location: values.location,
      });

      // Success - changes are saved
      setSubmitError(null);
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : "Kunne ikke oppdatere kurs",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

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

        {/* Header */}
        <div>
          <h1 className="text-3xl font-normal text-foreground">
            {course.name}
          </h1>
        </div>

        {/* Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={(v) => setActiveTab(v as TabValue)}
          className="space-y-6"
        >
          <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:inline-grid">
            <TabsTrigger value="oversikt">Oversikt</TabsTrigger>
            <TabsTrigger value="kursplan">Kursplan</TabsTrigger>
            <TabsTrigger value="innstillinger">Innstillinger</TabsTrigger>
          </TabsList>

          {/* TAB 1: OVERSIKT */}
          <TabsContent value="oversikt" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="space-y-6"
            >
              {/* Overview Card */}
              <Card className="rounded-2xl border border-border/60 bg-background-surface shadow-md">
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
                        <span>
                          Starter {formatDisplayDate(course.startDate)}
                        </span>
                      </div>
                      <span className="text-muted-foreground">|</span>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-primary/60" />
                        <span>
                          {WEEKDAY_NAMES[course.recurringDayOfWeek]} kl.{" "}
                          {course.recurringTime} ({course.duration} min)
                        </span>
                      </div>
                      <span className="text-muted-foreground">|</span>
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
                        <span className="text-muted-foreground">|</span>
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
                        <div className="text-xs text-muted-foreground mb-1">
                          Pris
                        </div>
                        <div className="text-lg font-semibold text-foreground">
                          {course.price} {CURRENCY}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Påmeldte elever Card - moved from outside tabs */}
              <Card className="rounded-3xl border border-border/60 shadow-md bg-background-surface/80 backdrop-blur overflow-hidden">
                {/* Header */}
                <div className="px-8 py-6 border-b border-border/60">
                  <h2 className="text-2xl font-semibold text-foreground">
                    Påmeldte elever
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Oversikt over alle påmeldte til dette kurset
                  </p>
                </div>

                {/* Filter Pills */}
                <div className="px-8 py-4 border-b border-border/40 bg-muted/20">
                  <div className="flex gap-2 flex-wrap">
                    {[
                      { value: "all" as const, label: "Alle" },
                      { value: "with-notes" as const, label: "Med notater" },
                      { value: "archive" as const, label: "Arkiv" },
                    ].map((filter) => (
                      <button
                        key={filter.value}
                        onClick={() => setStudentFilter(filter.value)}
                        className={`
                        px-4 py-2 rounded-full text-sm font-medium transition-colors cursor-pointer
                        ${
                          studentFilter === filter.value
                            ? "bg-primary text-white"
                            : "bg-background-surface/60 text-muted-foreground hover:bg-background-surface hover:text-foreground border border-border/40"
                        }
                      `}
                      >
                        {filter.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Students Table */}
                {loadingStudents ? (
                  <div className="p-12 text-center">
                    <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
                    <p className="mt-4 text-sm text-muted-foreground">
                      Laster elever...
                    </p>
                  </div>
                ) : !enrolledStudents || enrolledStudents.length === 0 ? (
                  <div className="p-12 text-center">
                    <p className="text-sm text-muted-foreground">
                      Ingen påmeldte elever ennå
                    </p>
                  </div>
                ) : filteredStudents.length === 0 ? (
                  <div className="p-12 text-center">
                    <p className="text-sm text-muted-foreground">
                      {studentFilter === "with-notes"
                        ? "Ingen elever med notater"
                        : "Ingen arkiverte elever"}
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
                        {filteredStudents.map((student: any) => (
                          <TableRow
                            key={student.id}
                            className="border-border/40 hover:bg-muted/40 transition-colors"
                          >
                            {/* Student Name */}
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

                            {/* Medical Notes */}
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
                                  <span className="sr-only">
                                    Medisinsk notis
                                  </span>
                                </Button>
                              ) : (
                                <span className="text-sm text-muted-foreground">
                                  –
                                </span>
                              )}
                            </TableCell>

                            {/* Contact Info */}
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
                                <PopoverContent
                                  className="w-64 p-3"
                                  align="end"
                                >
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

                            {/* Booking Count */}
                            <TableCell>
                              <span className="text-sm text-muted-foreground">
                                1 booking
                              </span>
                            </TableCell>

                            {/* Actions */}
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
                                <DropdownMenuContent
                                  align="end"
                                  className="w-48"
                                >
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
                                    onClick={() => {
                                      // TODO: Implement messaging
                                      console.log(
                                        "Send message to:",
                                        student.id,
                                      );
                                    }}
                                  >
                                    Send melding
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => {
                                      // TODO: Implement remove from course
                                      console.log(
                                        "Remove from course:",
                                        student.id,
                                      );
                                    }}
                                  >
                                    Fjern fra kurs
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

                {/* Footer Summary */}
                {!loadingStudents && (
                  <div className="px-8 py-4 border-t border-border/60 bg-muted/20">
                    <div className="text-xs text-muted-foreground">
                      <span>
                        Viser {filteredStudents.length} av{" "}
                        {enrolledStudents?.length || 0}{" "}
                        {(enrolledStudents?.length || 0) === 1
                          ? "totale booking"
                          : "totale bookinger"}
                      </span>
                    </div>
                  </div>
                )}
              </Card>
            </motion.div>
          </TabsContent>

          {/* TAB 2: KURSPLAN */}
          <TabsContent value="kursplan" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              {/* Week-by-week overview */}
              {course.sessions && course.sessions.length > 0 && (
                <Card className="rounded-2xl border border-border/60 bg-background-surface shadow-md">
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
                          className="rounded-2xl border border-border/60 bg-background-surface/70 shadow-md px-4 py-3 cursor-pointer transition-all hover:bg-primary/5 hover:border-primary/30"
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
                              <span className="text-muted-foreground">|</span>
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
            </motion.div>
          </TabsContent>

          {/* TAB 3: INNSTILLINGER */}
          <TabsContent value="innstillinger" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              <Card className="rounded-3xl border border-border/60 shadow-md bg-background-surface/80">
                <div className="px-8 py-6 space-y-6">
                  <div>
                    <h2 className="text-lg font-semibold text-foreground mb-4">
                      Rediger kurs
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      Rediger kursdetaljer og administrer innstillinger
                    </p>
                  </div>

                  <div className="border-b border-border/30 my-6"></div>

                  <Form {...form}>
                    <form
                      onSubmit={form.handleSubmit(onSubmit)}
                      className="space-y-6"
                    >
                      {submitError && (
                        <div className="px-4 py-3 rounded-xl bg-destructive/10 border border-destructive/30">
                          <p className="text-sm text-destructive">
                            {submitError}
                          </p>
                        </div>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Kursnavn</FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  placeholder="F.eks. Morgenyoga"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="location"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Sted</FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  placeholder="F.eks. Studio A"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Beskrivelse</FormLabel>
                            <FormControl>
                              <Textarea
                                {...field}
                                placeholder="Beskriv kurset..."
                                className="min-h-24 resize-none"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <FormField
                          control={form.control}
                          name="numberOfWeeks"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Antall uker</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  {...field}
                                  onChange={(e) =>
                                    field.onChange(parseInt(e.target.value, 10))
                                  }
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="capacity"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Maks deltakere</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  {...field}
                                  onChange={(e) =>
                                    field.onChange(parseInt(e.target.value, 10))
                                  }
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="price"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Pris (kr)</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  {...field}
                                  onChange={(e) =>
                                    field.onChange(parseFloat(e.target.value))
                                  }
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <FormField
                          control={form.control}
                          name="startDate"
                          render={({ field }) => (
                            <FormItem className="flex flex-col">
                              <FormLabel>Startdato</FormLabel>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <FormControl>
                                    <Button
                                      variant="outline"
                                      className={cn(
                                        "pl-3 text-left font-normal",
                                        !field.value && "text-muted-foreground",
                                      )}
                                    >
                                      {field.value ? (
                                        format(field.value, "PPP", {
                                          locale: nb,
                                        })
                                      ) : (
                                        <span>Velg dato</span>
                                      )}
                                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                    </Button>
                                  </FormControl>
                                </PopoverTrigger>
                                <PopoverContent
                                  className="w-auto p-0"
                                  align="start"
                                >
                                  <CalendarComponent
                                    mode="single"
                                    selected={field.value}
                                    onSelect={field.onChange}
                                    disabled={(date) =>
                                      date <
                                      new Date(new Date().setHours(0, 0, 0, 0))
                                    }
                                    initialFocus
                                  />
                                </PopoverContent>
                              </Popover>
                              <FormDescription>
                                Første kursdag (ukedag brukes for alle økter)
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="recurringTime"
                          render={({ field }) => (
                            <FormItem className="flex flex-col">
                              <FormLabel>Tidspunkt</FormLabel>
                              <FormControl>
                                <TimePicker
                                  value={field.value}
                                  onChange={field.onChange}
                                  placeholder="Velg tidspunkt"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="duration"
                          render={({ field }) => (
                            <FormItem className="flex flex-col">
                              <FormLabel>Varighet (min)</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  {...field}
                                  onChange={(e) =>
                                    field.onChange(parseInt(e.target.value, 10))
                                  }
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="flex gap-3 flex-wrap pt-4">
                        <Button
                          type="submit"
                          disabled={isSubmitting}
                          className="gap-2"
                        >
                          {isSubmitting ? (
                            <>
                              <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                              Lagrer...
                            </>
                          ) : (
                            "Lagre endringer"
                          )}
                        </Button>
                      </div>
                    </form>
                  </Form>

                  <div className="border-b border-border/30 my-6"></div>

                  <div>
                    <h3 className="text-sm font-medium text-foreground mb-4">
                      Slett kurs
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Dette vil permanent slette kurset og alle tilhørende data.
                    </p>
                    <Button
                      variant="outline"
                      onClick={() => setShowDeleteDialog(true)}
                      className="gap-2 border-destructive/30 text-destructive hover:bg-destructive/5 hover:border-destructive/50"
                    >
                      <Trash2 className="h-4 w-4" />
                      Slett kurs
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Dialogs (outside tabs) */}

      {/* Medical Notes Dialog */}
      <Dialog
        open={selectedNote !== null}
        onOpenChange={(open) => !open && setSelectedNote(null)}
      >
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle>Medisinsk informasjon</DialogTitle>
            <DialogDescription>{selectedNote?.studentName}</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-foreground whitespace-pre-wrap">
              {selectedNote?.note}
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedNote(null)}>
              Lukk
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
                  <CalendarComponent
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
                onChange={(value) => setSessionTime(value || "")}
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
