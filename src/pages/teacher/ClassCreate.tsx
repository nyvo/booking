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
import { useClassMutations } from "@/hooks/useClasses";
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
const classFormSchema = z.object({
  name: z
    .string()
    .min(3, "Navn må være minst 3 tegn")
    .max(100, "Navn kan ikke være mer enn 100 tegn"),
  description: z.string().optional(),
  date: z.date({ required_error: "Dato er påkrevd" }),
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
  dropInAvailable: z.boolean().default(true),
  tags: z.string().optional(),
});

type ClassFormValues = z.infer<typeof classFormSchema>;

export default function ClassCreate() {
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const { create, loading, error } = useClassMutations();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const form = useForm<ClassFormValues>({
    resolver: zodResolver(classFormSchema),
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
      tags: "",
    },
  });

  const onSubmit = async (values: ClassFormValues) => {
    try {
      setSubmitError(null);

      if (!user?.id) {
        setSubmitError("Du må være innlogget for å opprette en time");
        return;
      }

      // Parse tags
      const tags = values.tags
        ? values.tags
            .split(",")
            .map((tag) => tag.trim())
            .filter(Boolean)
        : undefined;

      await create({
        teacherId: user.id,
        name: values.name,
        description: values.description || undefined,
        type: "single",
        date: values.date,
        startTime: values.startTime,
        duration: values.duration,
        capacity: values.capacity,
        price: values.price,
        location: values.location,
        dropInAvailable: values.dropInAvailable,
        tags,
      });

      // Navigate back to classes list on success
      navigate(ROUTES.TEACHER.CLASSES);
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : "Kunne ikke opprette time",
      );
    }
  };

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
              <BreadcrumbLink href={ROUTES.TEACHER.CLASSES}>
                Enkeltkurs
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
          <h1 className="text-3xl font-semibold text-foreground">
            Opprett nytt enkeltkurs
          </h1>
          <p className="mt-2 text-muted-foreground">
            Fyll ut skjemaet for å opprette en ny yogatime
          </p>
        </div>

        {/* Error Display */}
        {(submitError || error) && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">
            <p className="font-medium">Feil ved opprettelse:</p>
            <p className="text-sm mt-1">{submitError || error?.message}</p>
          </div>
        )}

        {/* Form */}
        <div className="rounded-lg border border-border bg-white p-6">
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
                        <Input type="time" {...field} />
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

              {/* Tags */}
              <FormField
                control={form.control}
                name="tags"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tags</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="F.eks. Hatha, Nybegynner, Meditasjon"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Kommaseparerte tags (valgfritt)
                    </FormDescription>
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
                  {loading ? "Oppretter..." : "Opprett time"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate(ROUTES.TEACHER.CLASSES)}
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
