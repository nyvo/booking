/**
 * Class creation page for teachers
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";

import TeacherLayout from "@/components/layout/TeacherLayout";
import { useAuthContext } from "@/contexts/AuthContext";
import { useEventMutations } from "@/hooks/useClasses";
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

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

export default function EventCreate() {
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const { create, loading, error } = useEventMutations();
  const [submitError, setSubmitError] = useState<string | null>(null);

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

  const onSubmit = async (values: EventFormValues) => {
    try {
      setSubmitError(null);

      if (!user?.id) {
        setSubmitError("Du må være innlogget for å opprette en event");
        return;
      }

      await create({
        teacherId: user.id,
        name: values.name,
        description: values.description || undefined,
        eventType: "Workshop",
        date: values.date,
        startTime: values.startTime,
        duration: values.duration,
        capacity: values.capacity,
        price: values.price,
        location: values.location,
        dropInAvailable: values.dropInAvailable,
      });

      // Navigate back to classes list on success
      navigate(ROUTES.TEACHER.EVENTS);
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : "Kunne ikke opprette event",
      );
    }
  };

  return (
    <TeacherLayout>
      <div className="space-y-6">
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
              <BreadcrumbPage>Opprett ny</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-normal text-foreground">
            Opprett nytt arrangement
          </h1>
          <p className="mt-2 text-muted-foreground">
            Fyll ut skjemaet for å opprette et nytt yogaarrangement
          </p>
        </div>

        {/* Error Display */}
        {(submitError || error) && (
          <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-5 text-destructive/80">
            <p className="font-medium">Noe gikk galt</p>
            <p className="text-sm mt-1.5">{submitError || error?.message}</p>
          </div>
        )}

        {/* Form */}
        <div className="rounded-2xl border border-border bg-background-surface p-6">
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
                      Navnet på eventn som vises til studentene
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
                        placeholder="Beskriv eventn..."
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      En detaljert beskrivelse av hva eventn innebærer
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Date and Time Row */}
              <div className="grid gap-4 md:grid-cols-2">
                {/* Date */}
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Dato *</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className="w-full justify-start text-left font-normal"
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {field.value ? (
                                format(field.value, "dd.MM.yyyy")
                              ) : (
                                <span>Velg dato</span>
                              )}
                            </Button>
                          </FormControl>
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
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Start Time */}
                <FormField
                  control={form.control}
                  name="startTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Starttid *</FormLabel>
                      <FormControl>
                        <Input type="event" {...field} />
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
                    <FormDescription>Hvor eventn finner sted</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Drop-in Available */}
              <FormField
                control={form.control}
                name="dropInAvailable"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Drop-in tilgjengelig</FormLabel>
                      <FormDescription>
                        Tillat studenter å melde seg på uten fast plass
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />

              {/* Form Actions */}
              <div className="flex gap-4">
                <Button type="submit" disabled={loading}>
                  {loading ? "Oppretter..." : "Opprett event"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate(ROUTES.TEACHER.EVENTS)}
                  disabled={loading}
                >
                  Avbryt
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </TeacherLayout>
  );
}
