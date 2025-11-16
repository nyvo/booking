/**
 * Course editing page for teachers
 */

import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useTranslation } from "react-i18next";
import { format } from "date-fns";
import { CalendarIcon, Trash2 } from "lucide-react";

import TeacherLayout from "@/components/layout/TeacherLayout";
import { useAuthContext } from "@/contexts/AuthContext";
import { useCourse, useCourseMutations } from "@/hooks/useClasses";
import { ROUTES } from "@/config/constants";

import { Button } from "@/components/ui/button";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { TimePicker } from "@/components/ui/time-picker";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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
  startDate: z.date({ required_error: "Startdato er påkrevd" }),
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

export default function CourseEdit() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { user } = useAuthContext();

  const {
    data: courseData,
    loading: loadingCourse,
    error: loadError,
  } = useCourse(id);
  const { update, remove, loading, error } = useCourseMutations();

  const [submitError, setSubmitError] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

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
    if (courseData) {
      form.reset({
        name: courseData.name,
        description: courseData.description || "",
        numberOfWeeks: courseData.numberOfWeeks,
        startDate: new Date(courseData.startDate),
        recurringTime: courseData.recurringTime,
        duration: courseData.duration,
        capacity: courseData.capacity,
        price: courseData.price,
        location: courseData.location,
      });
    }
  }, [courseData, form]);

  const onSubmit = async (values: CourseFormValues) => {
    try {
      setSubmitError(null);

      if (!id) {
        setSubmitError("Mangler time-ID");
        return;
      }

      if (!user?.id) {
        setSubmitError("Du må være innlogget for å redigere et kurs");
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

      // Navigate back to classes list on success
      navigate(ROUTES.TEACHER.COURSES);
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : "Kunne ikke oppdatere kurs",
      );
    }
  };

  const handleDelete = async () => {
    try {
      setIsDeleting(true);

      if (!id) {
        return;
      }

      await remove(id);

      // Navigate back to classes list on success
      navigate(ROUTES.TEACHER.COURSES);
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : "Kunne ikke slette kurs",
      );
      setShowDeleteDialog(false);
      setIsDeleting(false);
    }
  };

  // Loading state
  if (loadingCourse) {
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

  // Error state
  if (loadError || !courseData) {
    return (
      <TeacherLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-normal text-foreground">
              Feil ved lasting
            </h1>
          </div>
          <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-5 text-destructive/80">
            <p className="font-medium">Kunne ikke laste kurs</p>
            <p className="text-sm mt-1.5">
              {loadError?.message || "Kurset ble ikke funnet"}
            </p>
          </div>
          <Button onClick={() => navigate(ROUTES.TEACHER.COURSES)}>
            Tilbake til timer
          </Button>
        </div>
      </TeacherLayout>
    );
  }

  return (
    <TeacherLayout>
      <div className="space-y-6">
        {/* Breadcrumb */}
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
                Kursrekker
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Rediger</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Page Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-normal text-foreground">
              Rediger kurs
            </h1>
            <p className="mt-2 text-muted-foreground">
              Oppdater informasjon om timen
            </p>
          </div>
          <Button
            variant="destructive"
            onClick={() => setShowDeleteDialog(true)}
            disabled={loading || isDeleting}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Slett kurs
          </Button>
        </div>

        {/* Error Display */}
        {(submitError || error) && (
          <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-5 text-destructive/80">
            <p className="font-medium">Noe gikk galt</p>
            <p className="text-sm mt-1.5">{submitError || error?.message}</p>
          </div>
        )}

        {/* Form */}
        <div className="rounded-2xl border border-border bg-white p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Name */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Navn *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="F.eks. Morgen Hatha Yoga"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Navnet på timen som vises til studentene
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Description */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Beskrivelse</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Beskriv timen..."
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      En detaljert beskrivelse av hva timen innebærer
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Number of Weeks */}
              <FormField
                control={form.control}
                name="numberOfWeeks"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Antall uker *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) =>
                          field.onChange(parseInt(e.target.value))
                        }
                      />
                    </FormControl>
                    <FormDescription>
                      Hvor mange uker kurset varer
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Start Date and Time Row */}
              <div className="grid gap-4 md:grid-cols-2">
                {/* Start Date */}
                <FormField
                  control={form.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Startdato *</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full h-10 justify-start text-left font-normal"
                            type="button"
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {field.value ? (
                              format(field.value, "dd.MM.yyyy")
                            ) : (
                              <span>Velg dato</span>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) =>
                              date < new Date(new Date().setHours(0, 0, 0, 0))
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormDescription>
                        Kurset gjentas hver uke på samme ukedag
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Recurring Time */}
                <FormField
                  control={form.control}
                  name="recurringTime"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Tidspunkt *</FormLabel>
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
              </div>

              {/* Duration, Capacity, Price Row */}
              <div className="grid gap-4 md:grid-cols-3">
                {/* Duration */}
                <FormField
                  control={form.control}
                  name="duration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Varighet (min) *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          onChange={(e) =>
                            field.onChange(parseInt(e.target.value))
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Capacity */}
                <FormField
                  control={form.control}
                  name="capacity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Kapasitet *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          onChange={(e) =>
                            field.onChange(parseInt(e.target.value))
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Price */}
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pris (NOK) *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          onChange={(e) =>
                            field.onChange(parseInt(e.target.value))
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Location */}
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Lokasjon *</FormLabel>
                    <FormControl>
                      <Input placeholder="F.eks. Yoga Studio Oslo" {...field} />
                    </FormControl>
                    <FormDescription>Hvor timen finner sted</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Enrollment Info */}
              {courseData.enrolledCount > 0 && (
                <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4">
                  <p className="text-sm text-primary">
                    <strong>Info:</strong> {courseData.enrolledCount}{" "}
                    {courseData.enrolledCount === 1 ? "påmeldt" : "påmeldte"} på
                    dette kurset. Endringer i pris, dato eller tid blir
                    automatisk sendt på e-post til alle påmeldte.
                  </p>
                </div>
              )}

              {/* Form Actions */}
              <div className="flex gap-4">
                <Button type="submit" disabled={loading || isDeleting}>
                  {loading ? "Lagrer..." : "Lagre endringer"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate(ROUTES.TEACHER.COURSES)}
                  disabled={loading || isDeleting}
                >
                  Avbryt
                </Button>
              </div>
            </form>
          </Form>
        </div>

        {/* Delete Confirmation Dialog */}
        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Bekreft sletting</DialogTitle>
              <DialogDescription>
                Er du sikker på at du vil slette dette kurset? Dette kan ikke
                angres.
                {courseData.enrolledCount > 0 && (
                  <span className="block mt-2 font-medium text-destructive">
                    Advarsel: {courseData.enrolledCount} påmeldte på dette
                    kurset!
                  </span>
                )}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowDeleteDialog(false)}
                disabled={isDeleting}
              >
                Avbryt
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={isDeleting}
              >
                {isDeleting ? "Sletter..." : "Ja, slett kurs"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </TeacherLayout>
  );
}
