/**
 * Unified Account (Konto) page for teachers
 * Combines Profile and Settings into one coherent account hub
 * Refactored with responsive layout, scroll-to-section, and unified save
 */

import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Mail,
  Phone,
  Globe,
  User,
  Bell,
  Calendar,
  CreditCard,
  BarChart3,
} from "lucide-react";

import TeacherLayout from "@/components/layout/TeacherLayout";
import { useAuthContext } from "@/contexts/AuthContext";
import { useTeacherMutations } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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

// Combined form schema for both profile and settings
const profileFormSchema = z.object({
  name: z
    .string()
    .min(2, "Navn må være minst 2 tegn")
    .max(100, "Navn kan ikke være mer enn 100 tegn"),
  email: z.string().email("Ugyldig e-postadresse"),
  phone: z
    .string()
    .regex(/^[0-9\s]*$/, "Kun tall og mellomrom tillatt")
    .optional()
    .or(z.literal("")),
  bio: z.string().max(500, "Bio kan ikke være mer enn 500 tegn").optional(),
  specialties: z.string().optional(),
  website: z.string().url("Ugyldig URL").optional().or(z.literal("")),
});

const settingsFormSchema = z.object({
  emailNotifications: z.boolean(),
  bookingNotifications: z.boolean(),
  paymentNotifications: z.boolean(),
  weeklyReports: z.boolean(),
  reminderNotifications: z.boolean(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;
type SettingsFormValues = z.infer<typeof settingsFormSchema>;

type ActiveSection = "profil" | "varsler";

export default function Account() {
  const { user } = useAuthContext();
  const { update, loading: profileLoading } = useTeacherMutations();

  const [activeSection, setActiveSection] = useState<ActiveSection>("profil");
  const [hasProfileChanges, setHasProfileChanges] = useState(false);
  const [hasSettingsChanges, setHasSettingsChanges] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const profilRef = useRef<HTMLDivElement>(null);
  const varslerRef = useRef<HTMLDivElement>(null);

  // Profile form
  const profileForm = useForm<ProfileFormValues>({
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

  // Settings form
  const settingsForm = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsFormSchema),
    defaultValues: {
      emailNotifications: true,
      bookingNotifications: true,
      paymentNotifications: true,
      weeklyReports: false,
      reminderNotifications: true,
    },
  });

  // Track form changes separately for each section
  useEffect(() => {
    const subscription = profileForm.watch(() => setHasProfileChanges(true));
    return () => subscription.unsubscribe();
  }, [profileForm]);

  useEffect(() => {
    const subscription = settingsForm.watch(() => setHasSettingsChanges(true));
    return () => subscription.unsubscribe();
  }, [settingsForm]);

  // Scroll to section with active tracking
  const scrollToSection = (section: ActiveSection) => {
    setActiveSection(section);
    const ref = section === "profil" ? profilRef : varslerRef;
    ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // Intersection observer for active section tracking
  useEffect(() => {
    const options = {
      root: null,
      rootMargin: "-50% 0px -50% 0px",
      threshold: 0,
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          if (entry.target === profilRef.current) {
            setActiveSection("profil");
          } else if (entry.target === varslerRef.current) {
            setActiveSection("varsler");
          }
        }
      });
    }, options);

    if (profilRef.current) observer.observe(profilRef.current);
    if (varslerRef.current) observer.observe(varslerRef.current);

    return () => observer.disconnect();
  }, []);

  // Save profile handler
  const handleSaveProfile = async () => {
    try {
      setSaveSuccess(false);
      setSaveError(null);

      // Validate profile form
      const isValid = await profileForm.trigger();
      if (!isValid) {
        setSaveError("Vennligst sjekk alle feltene og prøv igjen.");
        return;
      }

      if (!user?.id) {
        setSaveError("Du må være innlogget for å lagre endringer.");
        return;
      }

      // Get form values
      const profile = profileForm.getValues();

      // Save profile
      const specialties = profile.specialties
        ? profile.specialties
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
        : undefined;

      await update(user.id, {
        name: profile.name,
        email: profile.email,
        phone: profile.phone || undefined,
        bio: profile.bio || undefined,
        specialties,
        website: profile.website || undefined,
      });

      setHasProfileChanges(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      setSaveError(
        err instanceof Error ? err.message : "Kunne ikke lagre profil.",
      );
    }
  };

  // Save settings handler
  const handleSaveSettings = async () => {
    try {
      setSaveSuccess(false);
      setSaveError(null);

      // Validate settings form
      const isValid = await settingsForm.trigger();
      if (!isValid) {
        setSaveError("Vennligst sjekk alle feltene og prøv igjen.");
        return;
      }

      // Get form values
      const settings = settingsForm.getValues();

      // Save settings (in a real app, this would call an API)
      console.log("Settings saved:", settings);

      setHasSettingsChanges(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      setSaveError(
        err instanceof Error ? err.message : "Kunne ikke lagre innstillinger.",
      );
    }
  };

  // Warn on navigation with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasProfileChanges || hasSettingsChanges) {
        e.preventDefault();
        e.returnValue = "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasProfileChanges, hasSettingsChanges]);

  // Generate initials for avatar
  const getInitials = (name?: string) => {
    if (!name) return "?";
    const parts = name.split(" ");
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <TeacherLayout>
      <div className="mx-auto max-w-3xl px-4 space-y-6">
        {/* Page Header */}
        <div className="space-y-2">
          <h1 className="text-4xl font-normal text-foreground">Konto</h1>
          <p className="text-base text-muted-foreground">
            Administrer profil og varslinger
          </p>
        </div>

        {/* Section Toggle Pills */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => scrollToSection("profil")}
            className={`
              px-4 py-2 rounded-full text-sm font-medium transition-colors cursor-pointer
              ${
                activeSection === "profil"
                  ? "bg-primary text-white"
                  : "bg-background-surface/60 text-muted-foreground hover:bg-background-surface hover:text-foreground border border-border/40"
              }
            `}
          >
            Profil
          </button>
          <button
            onClick={() => scrollToSection("varsler")}
            className={`
              px-4 py-2 rounded-full text-sm font-medium transition-colors cursor-pointer
              ${
                activeSection === "varsler"
                  ? "bg-primary text-white"
                  : "bg-background-surface/60 text-muted-foreground hover:bg-background-surface hover:text-foreground border border-border/40"
              }
            `}
          >
            Varsler
          </button>
        </div>

        {/* Single-column stacked layout */}
        <div className="space-y-6">
          {/* === PROFIL CARD === */}
          <div ref={profilRef}>
            <Card className="rounded-3xl border border-border/60 shadow-md bg-background-surface/80 backdrop-blur overflow-hidden h-fit">
              {/* Card Header */}
              <div className="px-6 py-5 border-b border-border/60">
                <h2 className="text-xl font-semibold text-foreground">
                  Profil
                </h2>
                <p className="text-sm text-muted-foreground mt-1.5">
                  Administrer profilinformasjonen din
                </p>
              </div>

              <CardContent className="px-6 py-8">
                {/* Avatar Section */}
                <div className="flex items-center gap-6 mb-8 pb-6 border-b border-border/40">
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold text-xl">
                    {getInitials(user?.name)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground mb-2.5">
                      Profilbilde
                    </p>
                    <Button variant="outline" size="sm">
                      Last opp bilde
                    </Button>
                  </div>
                </div>

                {/* Profile Form */}
                <Form {...profileForm}>
                  <form className="space-y-6">
                    {/* Personlig informasjon */}
                    <div className="space-y-4">
                      <h3 className="text-sm font-semibold text-foreground mb-4">
                        Personlig informasjon
                      </h3>

                      <FormField
                        control={profileForm.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm mb-1.5">
                              Navn *
                            </FormLabel>
                            <FormControl>
                              <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input className="pl-10" {...field} />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={profileForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm mb-1.5">
                              E-post *
                            </FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                  type="email"
                                  className="pl-10"
                                  {...field}
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={profileForm.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm mb-1.5">
                              Telefon
                            </FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                  type="tel"
                                  className="pl-10"
                                  placeholder="XXX XX XXX"
                                  {...field}
                                />
                              </div>
                            </FormControl>
                            <FormDescription className="text-xs">
                              Valgfritt
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Profesjonell informasjon */}
                    <div className="space-y-4 pt-6 border-t border-border/40">
                      <h3 className="text-sm font-semibold text-foreground mb-4">
                        Profesjonell informasjon
                      </h3>

                      <FormField
                        control={profileForm.control}
                        name="bio"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm mb-1.5">
                              Bio
                            </FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Fortell kort om din yogapraksis..."
                                className="min-h-[80px] resize-none"
                                {...field}
                              />
                            </FormControl>
                            <FormDescription className="text-xs">
                              Maks 500 tegn
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={profileForm.control}
                        name="specialties"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm mb-1.5">
                              Spesialiteter
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Hatha, Vinyasa, Meditasjon"
                                {...field}
                              />
                            </FormControl>
                            <FormDescription className="text-xs">
                              Kommadelt liste
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={profileForm.control}
                        name="website"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm mb-1.5">
                              Nettside
                            </FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                  type="url"
                                  className="pl-10"
                                  placeholder="https://example.com"
                                  {...field}
                                />
                              </div>
                            </FormControl>
                            <FormDescription className="text-xs">
                              Valgfritt
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Save Button for Profile */}
                    <div className="flex justify-end pt-6 border-t border-border/40">
                      <Button
                        type="button"
                        onClick={handleSaveProfile}
                        disabled={profileLoading || !hasProfileChanges}
                        size="lg"
                      >
                        {profileLoading ? "Lagrer..." : "Lagre endringer"}
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>

          {/* === VARSLER CARD === */}
          <div ref={varslerRef}>
            <Card className="rounded-3xl border border-border/60 shadow-md bg-background-surface/80 backdrop-blur overflow-hidden h-fit">
              {/* Card Header */}
              <div className="px-6 py-5 border-b border-border/60">
                <h2 className="text-xl font-semibold text-foreground">
                  Varsler
                </h2>
                <p className="text-sm text-muted-foreground mt-1.5">
                  Velg varslinger du vil motta
                </p>
              </div>

              <CardContent className="px-6 py-8">
                {/* Settings Form */}
                <Form {...settingsForm}>
                  <form className="space-y-6">
                    {/* E-postvarslinger */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2.5">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <h3 className="text-sm font-medium text-muted-foreground">
                          E-postvarslinger
                        </h3>
                      </div>

                      <FormField
                        control={settingsForm.control}
                        name="emailNotifications"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0 pl-6 py-2">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel className="text-sm font-normal">
                                Aktiver e-postvarslinger
                              </FormLabel>
                              <FormDescription className="text-xs">
                                Motta oppdateringer på e-post
                              </FormDescription>
                            </div>
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Bookingvarslinger */}
                    <div className="space-y-4 pt-4 border-t border-border/40">
                      <div className="flex items-center gap-2.5">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <h3 className="text-sm font-medium text-muted-foreground">
                          Bookingvarslinger
                        </h3>
                      </div>

                      <FormField
                        control={settingsForm.control}
                        name="bookingNotifications"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0 pl-6 py-2">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel className="text-sm font-normal">
                                Nye bookinger
                              </FormLabel>
                              <FormDescription className="text-xs">
                                Varsling ved nye bookinger
                              </FormDescription>
                            </div>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={settingsForm.control}
                        name="reminderNotifications"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0 pl-6 py-2">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel className="text-sm font-normal">
                                Påminnelser
                              </FormLabel>
                              <FormDescription className="text-xs">
                                24 timer før time
                              </FormDescription>
                            </div>
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Betalingsvarslinger */}
                    <div className="space-y-4 pt-4 border-t border-border/40">
                      <div className="flex items-center gap-2.5">
                        <CreditCard className="h-4 w-4 text-muted-foreground" />
                        <h3 className="text-sm font-medium text-muted-foreground">
                          Betalingsvarslinger
                        </h3>
                      </div>

                      <FormField
                        control={settingsForm.control}
                        name="paymentNotifications"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0 pl-6 py-2">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel className="text-sm font-normal">
                                Betalingsbekreftelser
                              </FormLabel>
                              <FormDescription className="text-xs">
                                Varsling ved mottatte betalinger
                              </FormDescription>
                            </div>
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Rapporter */}
                    <div className="space-y-4 pt-4 border-t border-border/40">
                      <div className="flex items-center gap-2.5">
                        <BarChart3 className="h-4 w-4 text-muted-foreground" />
                        <h3 className="text-sm font-medium text-muted-foreground">
                          Rapporter
                        </h3>
                      </div>

                      <FormField
                        control={settingsForm.control}
                        name="weeklyReports"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0 pl-6 py-2">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel className="text-sm font-normal">
                                Ukentlige rapporter
                              </FormLabel>
                              <FormDescription className="text-xs">
                                Oppsummering av aktivitet
                              </FormDescription>
                            </div>
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Save Button for Settings */}
                    <div className="flex justify-end pt-6 border-t border-border/40">
                      <Button
                        type="button"
                        onClick={handleSaveSettings}
                        disabled={!hasSettingsChanges}
                        size="lg"
                      >
                        Lagre endringer
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Success/Error Messages */}
        {(saveSuccess || saveError) && (
          <div className="space-y-4 pb-8">
            {/* Success Message */}
            {saveSuccess && (
              <Card className="rounded-2xl border-primary/20 bg-primary/5 p-4">
                <p className="text-sm font-medium text-primary">
                  Endringer lagret! Profil og varslinger er oppdatert.
                </p>
              </Card>
            )}

            {/* Error Message */}
            {saveError && (
              <Card className="rounded-2xl border-destructive/20 bg-destructive/5 p-4">
                <p className="text-sm font-medium text-destructive">
                  {saveError}
                </p>
              </Card>
            )}
          </div>
        )}
      </div>
    </TeacherLayout>
  );
}
