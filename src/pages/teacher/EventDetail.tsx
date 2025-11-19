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
  useEvent,
  useEventMutations,
  useEventParticipants,
} from "@/hooks/useClasses";
import { ROUTES, CURRENCY } from "@/config/constants";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { TimePicker } from "@/components/ui/time-picker";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
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
import { formatDisplayDate } from "@/utils/date";

type ParticipantFilter = "all" | "with-notes" | "archive";
type TabValue = "oversikt" | "tidsplan" | "innstillinger";

// Form validation schema
const eventFormSchema = z.object({
  name: z
    .string()
    .min(3, "Navn må være minst 3 tegn")
    .max(100, "Navn kan ikke være mer enn 100 tegn"),
  description: z.string().optional(),
  date: z.date(),
  startTime: z
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
  dropInAvailable: z.boolean(),
});

type EventFormValues = z.infer<typeof eventFormSchema>;

export default function EventDetail() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { data: event, loading, error } = useEvent(id);
  const { data: registeredParticipants, loading: loadingParticipants } =
    useEventParticipants(id);
  const { update, remove, loading: deleting } = useEventMutations();

  const [activeTab, setActiveTab] = useState<TabValue>("oversikt");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form initialization
  const form = useForm<EventFormValues>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: {
      name: "",
      description: "",
      date: new Date(),
      startTime: "10:00",
      duration: 60,
      capacity: 15,
      price: 200,
      location: "",
      dropInAvailable: true,
    },
  });

  // Populate form when event data loads
  useEffect(() => {
    if (event) {
      form.reset({
        name: event.name,
        description: event.description || "",
        date: new Date(event.date),
        startTime: event.startTime,
        duration: event.duration,
        capacity: event.capacity,
        price: event.price,
        location: event.location,
        dropInAvailable: event.dropInAvailable,
      });
    }
  }, [event, form]);

  // Participants section state
  const [participantFilter, setParticipantFilter] =
    useState<ParticipantFilter>("all");
  const [selectedNote, setSelectedNote] = useState<{
    participantName: string;
    note: string;
  } | null>(null);

  // Filter participants (must be before early returns)
  const filteredParticipants = useMemo(() => {
    if (!registeredParticipants) return [];
    if (participantFilter === "all") return registeredParticipants;
    if (participantFilter === "with-notes")
      return registeredParticipants.filter((p: any) => p.medicalNotes);
    if (participantFilter === "archive")
      return registeredParticipants.filter((p: any) => p.activeBookings === 0);
    return registeredParticipants;
  }, [registeredParticipants, participantFilter]);

  // Calculate booking percentage (must be before early returns)
  const bookingPercentage = useMemo(
    () => (event ? Math.round((event.bookedCount / event.capacity) * 100) : 0),
    [event],
  );

  const onSubmit = async (values: EventFormValues) => {
    try {
      setSubmitError(null);
      setIsSubmitting(true);

      if (!id) {
        setSubmitError("Mangler arrangement-ID");
        return;
      }

      await update(id, {
        name: values.name,
        description: values.description || undefined,
        date: values.date,
        startTime: values.startTime,
        duration: values.duration,
        capacity: values.capacity,
        price: values.price,
        location: values.location,
        dropInAvailable: values.dropInAvailable,
      });

      setSubmitError(null);
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : "Kunne ikke oppdatere arrangement",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

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

        {/* Header */}
        <div>
          <h1 className="text-3xl font-normal text-foreground">{event.name}</h1>
        </div>

        {/* Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={(v) => setActiveTab(v as TabValue)}
          className="space-y-6"
        >
          <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:inline-grid">
            <TabsTrigger value="oversikt">Oversikt</TabsTrigger>
            <TabsTrigger value="tidsplan">Tidsplan</TabsTrigger>
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
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-foreground">
                      <div className="flex items-center gap-2">
                        <CalendarIcon className="h-4 w-4 text-primary/60" />
                        <span>{formatDisplayDate(event.date)}</span>
                      </div>
                      <span className="text-muted-foreground">|</span>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-primary/60" />
                        <span>
                          Kl. {event.startTime} ({event.duration} min)
                        </span>
                      </div>
                      <span className="text-muted-foreground">|</span>
                      <div className="flex items-center gap-2">
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
                        <span className="text-muted-foreground">|</span>
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
                        <div className="text-xs text-muted-foreground mb-1">
                          Type
                        </div>
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
                        <div className="text-xs text-muted-foreground mb-1">
                          Pris
                        </div>
                        <div className="text-lg font-semibold text-foreground">
                          {event.price} {CURRENCY}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Påmeldte deltakere Card */}
              <Card className="rounded-3xl border border-border/60 shadow-md bg-background-surface/80 backdrop-blur overflow-hidden">
                {/* Header */}
                <div className="px-8 py-6 border-b border-border/60">
                  <h2 className="text-2xl font-semibold text-foreground">
                    Påmeldte deltakere
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Oversikt over alle påmeldte til dette arrangementet
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
                        onClick={() => setParticipantFilter(filter.value)}
                        className={`
                    px-4 py-2 rounded-full text-sm font-medium transition-colors cursor-pointer
                    ${
                      participantFilter === filter.value
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

                {/* Participants Table */}
                {loadingParticipants ? (
                  <div className="p-12 text-center">
                    <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
                    <p className="mt-4 text-sm text-muted-foreground">
                      Laster deltakere...
                    </p>
                  </div>
                ) : !registeredParticipants ||
                  registeredParticipants.length === 0 ? (
                  <div className="p-12 text-center">
                    <p className="text-sm text-muted-foreground">
                      Ingen påmeldte deltakere ennå
                    </p>
                  </div>
                ) : filteredParticipants.length === 0 ? (
                  <div className="p-12 text-center">
                    <p className="text-sm text-muted-foreground">
                      {participantFilter === "with-notes"
                        ? "Ingen deltakere med notater"
                        : "Ingen arkiverte deltakere"}
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-border/40 hover:bg-transparent">
                          <TableHead className="pl-8 text-xs font-semibold text-muted-foreground">
                            Deltaker
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
                        {filteredParticipants.map((participant: any) => (
                          <TableRow
                            key={participant.id}
                            className="border-border/40 hover:bg-muted/40 transition-colors"
                          >
                            {/* Participant Name */}
                            <TableCell className="pl-8">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-foreground">
                                  {participant.name}
                                </span>
                                {participant.isNew && (
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
                              {participant.medicalNotes ? (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0 hover:bg-primary/10"
                                  onClick={() =>
                                    setSelectedNote({
                                      participantName: participant.name,
                                      note: participant.medicalNotes || "",
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
                                    {participant.email && (
                                      <div className="flex items-center gap-2 text-sm">
                                        <Mail className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                                        <span className="truncate">
                                          {participant.email}
                                        </span>
                                      </div>
                                    )}
                                    {participant.phone && (
                                      <div className="flex items-center gap-2 text-sm">
                                        <Phone className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                                        <span>{participant.phone}</span>
                                      </div>
                                    )}
                                  </div>
                                </PopoverContent>
                              </Popover>
                            </TableCell>

                            {/* Booking Count */}
                            <TableCell>
                              <span className="text-sm text-muted-foreground">
                                1 billett
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
                                          participant.id,
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
                                        participant.id,
                                      );
                                    }}
                                  >
                                    Send melding
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => {
                                      // TODO: Implement remove from event
                                      console.log(
                                        "Remove from event:",
                                        participant.id,
                                      );
                                    }}
                                  >
                                    Fjern fra arrangement
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
                {!loadingParticipants && (
                  <div className="px-8 py-4 border-t border-border/60 bg-muted/20">
                    <div className="text-xs text-muted-foreground">
                      <span>
                        Viser {filteredParticipants.length} av{" "}
                        {registeredParticipants?.length || 0}{" "}
                        {(registeredParticipants?.length || 0) === 1
                          ? "totale booking"
                          : "totale bookinger"}
                      </span>
                    </div>
                  </div>
                )}
              </Card>
            </motion.div>
          </TabsContent>

          {/* TAB 2: TIDSPLAN */}
          <TabsContent value="tidsplan" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              <Card className="rounded-2xl border border-border/60 bg-background-surface shadow-md">
                <div className="px-8 py-6">
                  <div className="mb-4">
                    <h2 className="text-lg font-semibold text-foreground">
                      Tidsplan
                    </h2>
                    <p className="text-xs text-muted-foreground mt-1">
                      Detaljer for dette arrangementet
                    </p>
                  </div>

                  <div className="space-y-6">
                    {/* Dato og tid */}
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-2">
                        Dato og tid
                      </h3>
                      <div className="space-y-2">
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
                  </div>
                </div>
              </Card>
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
                      Rediger arrangement
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      Rediger arrangementdetaljer og administrer innstillinger
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
                              <FormLabel>Arrangementnavn</FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  placeholder="F.eks. Yin Yoga Workshop"
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
                                placeholder="Beskriv arrangementet..."
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

                        <FormField
                          control={form.control}
                          name="duration"
                          render={({ field }) => (
                            <FormItem>
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

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="date"
                          render={({ field }) => (
                            <FormItem className="flex flex-col">
                              <FormLabel>Dato</FormLabel>
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
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="startTime"
                          render={({ field }) => (
                            <FormItem className="flex flex-col">
                              <FormLabel>Starttidspunkt</FormLabel>
                              <FormControl>
                                <TimePicker
                                  value={field.value}
                                  onChange={field.onChange}
                                  placeholder="Velg starttid"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="dropInAvailable"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-xl border border-border/40 p-4 bg-background/50">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>Drop-in tilgjengelig</FormLabel>
                              <FormDescription>
                                Tillat studenter å melde seg på uten
                                forhåndsreservasjon
                              </FormDescription>
                            </div>
                          </FormItem>
                        )}
                      />

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
                      Slett arrangement
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Dette vil permanent slette arrangementet og alle
                      tilhørende data.
                    </p>
                    <Button
                      variant="outline"
                      onClick={() => setShowDeleteDialog(true)}
                      className="gap-2 border-destructive/30 text-destructive hover:bg-destructive/5 hover:border-destructive/50"
                    >
                      <Trash2 className="h-4 w-4" />
                      Slett arrangement
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
            <DialogDescription>
              {selectedNote?.participantName}
            </DialogDescription>
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
