/**
 * Teacher profile page - View and edit profile information
 */

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Mail, Phone, Globe, User } from "lucide-react";

import TeacherLayout from "@/components/layout/TeacherLayout";
import { useAuthContext } from "@/contexts/AuthContext";
import { useTeacherMutations } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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

// Form validation schema
const profileFormSchema = z.object({
  name: z
    .string()
    .min(2, "Navn må være minst 2 tegn")
    .max(100, "Navn kan ikke være mer enn 100 tegn"),
  email: z.string().email("Ugyldig e-postadresse"),
  phone: z.string().optional(),
  bio: z.string().max(500, "Bio kan ikke være mer enn 500 tegn").optional(),
  specialties: z.string().optional(),
  website: z.string().url("Ugyldig URL").optional().or(z.literal("")),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

export default function TeacherProfile() {
  const { user } = useAuthContext();
  const { update, loading, error } = useTeacherMutations();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: user?.name || "",
      email: user?.email || "",
      phone: user?.phone || "",
      bio: (user as any)?.bio || "",
      specialties: (user as any)?.specialties?.join(", ") || "",
      website: (user as any)?.website || "",
    },
  });

  const onSubmit = async (values: ProfileFormValues) => {
    try {
      setSubmitError(null);
      setSubmitSuccess(false);

      if (!user?.id) {
        setSubmitError("Du må være innlogget for å oppdatere profilen");
        return;
      }

      // Parse specialties
      const specialties = values.specialties
        ? values.specialties
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
        : undefined;

      await update(user.id, {
        name: values.name,
        email: values.email,
        phone: values.phone || undefined,
        bio: values.bio || undefined,
        specialties,
        website: values.website || undefined,
      });

      setSubmitSuccess(true);
      setTimeout(() => setSubmitSuccess(false), 3000);
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : "Kunne ikke oppdatere profil",
      );
    }
  };

  return (
    <TeacherLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="space-y-2">
          <h1 className="text-4xl font-semibold text-foreground">Min profil</h1>
          <p className="text-muted-foreground">
            Administrer profilinformasjonen din
          </p>
        </div>

        {/* Success Message */}
        {submitSuccess && (
          <Card className="border-primary/20 bg-primary/5 p-6">
            <p className="font-medium text-primary">Profilen ble oppdatert!</p>
          </Card>
        )}

        {/* Error Display */}
        {(submitError || error) && (
          <Card className="border-destructive/20 bg-destructive/5 p-6">
            <p className="font-medium text-destructive">
              Feil ved oppdatering:
            </p>
            <p className="text-sm mt-2 text-destructive/80">
              {submitError || error?.message}
            </p>
          </Card>
        )}

        {/* Profile Form */}
        <Card className="p-8">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              {/* Name */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Navn *</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input className="pl-10" {...field} />
                      </div>
                    </FormControl>
                    <FormDescription>Ditt fulle navn</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Email */}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>E-post *</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input type="email" className="pl-10" {...field} />
                      </div>
                    </FormControl>
                    <FormDescription>Din e-postadresse</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Phone */}
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefon</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          type="tel"
                          className="pl-10"
                          placeholder="+47 XXX XX XXX"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormDescription>
                      Ditt telefonnummer (valgfritt)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Bio */}
              <FormField
                control={form.control}
                name="bio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bio</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Fortell litt om deg selv og din yogapraksis..."
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      En kort beskrivelse om deg (maks 500 tegn)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Specialties */}
              <FormField
                control={form.control}
                name="specialties"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Spesialiteter</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="F.eks. Hatha Yoga, Vinyasa, Meditasjon"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Kommaseparerte spesialiteter (valgfritt)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Website */}
              <FormField
                control={form.control}
                name="website"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nettside</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Globe className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          type="url"
                          className="pl-10"
                          placeholder="https://example.com"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormDescription>
                      Din personlige nettside (valgfritt)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Form Actions */}
              <div className="flex gap-4">
                <Button type="submit" disabled={loading}>
                  {loading ? "Lagrer..." : "Lagre endringer"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => form.reset()}
                  disabled={loading}
                >
                  Tilbakestill
                </Button>
              </div>
            </form>
          </Form>
        </Card>
      </div>
    </TeacherLayout>
  );
}
