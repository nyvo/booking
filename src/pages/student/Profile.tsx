/**
 * Student profile page
 * Allows students to view and edit their profile information
 */

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import StudentLayout from "@/components/layout/StudentLayout";
import { useAuthContext } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
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
  name: z.string().min(2, "Navn må være minst 2 tegn").max(100),
  email: z.string().email("Ugyldig e-postadresse"),
  phone: z.string().optional(),
  emergencyContactName: z.string().optional(),
  emergencyContactRelation: z.string().optional(),
  emergencyContactPhone: z.string().optional(),
  medicalNotes: z.string().max(500).optional(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

export default function Profile() {
  const { user } = useAuthContext();
  const [isEditing, setIsEditing] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: user?.name || "",
      email: user?.email || "",
      phone: user?.phone || "",
      emergencyContactName: user?.emergencyContact?.name || "",
      emergencyContactRelation: user?.emergencyContact?.relation || "",
      emergencyContactPhone: user?.emergencyContact?.phone || "",
      medicalNotes: user?.medicalNotes || "",
    },
  });

  const onSubmit = async (values: ProfileFormValues) => {
    try {
      // In a real app, this would call an API to update the profile
      console.log("Profile update:", values);

      setSubmitSuccess(true);
      setIsEditing(false);

      setTimeout(() => {
        setSubmitSuccess(false);
      }, 3000);
    } catch (err) {
      console.error("Failed to update profile:", err);
    }
  };

  return (
    <StudentLayout>
      <div className="space-y-6 max-w-3xl mx-auto pb-20 md:pb-0">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-foreground">
              Min profil
            </h1>
            <p className="mt-2 text-muted-foreground">
              Administrer din personlige informasjon
            </p>
          </div>
          {!isEditing && (
            <Button onClick={() => setIsEditing(true)}>Rediger profil</Button>
          )}
        </div>

        {/* Success Message */}
        {submitSuccess && (
          <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4 text-primary">
            <p className="font-medium">Profilen din er oppdatert!</p>
          </div>
        )}

        {/* Profile Form */}
        <div className="rounded-2xl border border-border bg-white p-8">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Basic Information */}
              <div>
                <h2 className="text-lg font-semibold text-foreground mb-4">
                  Grunnleggende informasjon
                </h2>
                <div className="space-y-4">
                  {/* Name */}
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Navn *</FormLabel>
                        <FormControl>
                          <Input {...field} disabled={!isEditing} />
                        </FormControl>
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
                          <Input
                            type="email"
                            {...field}
                            disabled={!isEditing}
                          />
                        </FormControl>
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
                          <Input type="tel" {...field} disabled={!isEditing} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Emergency Contact */}
              <div className="pt-6 border-t border-border">
                <h2 className="text-lg font-semibold text-foreground mb-4">
                  Nødkontakt
                </h2>
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="emergencyContactName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Navn</FormLabel>
                        <FormControl>
                          <Input {...field} disabled={!isEditing} />
                        </FormControl>
                        <FormDescription>
                          Navn på person vi kan kontakte i nødstilfelle
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid gap-4 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="emergencyContactRelation"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Relasjon</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="F.eks. Ektefelle, Forelder"
                              {...field}
                              disabled={!isEditing}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="emergencyContactPhone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Telefon</FormLabel>
                          <FormControl>
                            <Input
                              type="tel"
                              {...field}
                              disabled={!isEditing}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>

              {/* Medical Notes */}
              <div className="pt-6 border-t border-border">
                <h2 className="text-lg font-semibold text-foreground mb-4">
                  Medisinsk informasjon
                </h2>
                <FormField
                  control={form.control}
                  name="medicalNotes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Medisinske notater</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Skader, allergier, eller annen viktig informasjon for instruktøren..."
                          className="min-h-[100px]"
                          {...field}
                          disabled={!isEditing}
                        />
                      </FormControl>
                      <FormDescription>
                        Valgfri informasjon som kan være viktig for instruktøren
                        å vite om
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Form Actions */}
              {isEditing && (
                <div className="flex gap-4 pt-6">
                  <Button type="submit">Lagre endringer</Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsEditing(false);
                      form.reset();
                    }}
                  >
                    Avbryt
                  </Button>
                </div>
              )}
            </form>
          </Form>
        </div>
      </div>
    </StudentLayout>
  );
}
