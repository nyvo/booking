/**
 * Settings page for teachers
 * App preferences and configuration
 */

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Bell, Calendar, Mail } from 'lucide-react';

import TeacherLayout from '@/components/layout/TeacherLayout';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';

// Form validation schema
const settingsFormSchema = z.object({
  emailNotifications: z.boolean(),
  bookingNotifications: z.boolean(),
  paymentNotifications: z.boolean(),
  weeklyReports: z.boolean(),
  reminderNotifications: z.boolean(),
});

type SettingsFormValues = z.infer<typeof settingsFormSchema>;

export default function Settings() {
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsFormSchema),
    defaultValues: {
      emailNotifications: true,
      bookingNotifications: true,
      paymentNotifications: true,
      weeklyReports: false,
      reminderNotifications: true,
    },
  });

  const onSubmit = async (values: SettingsFormValues) => {
    // In a real app, this would save to backend/localStorage
    console.log('Settings saved:', values);
    setSubmitSuccess(true);
    setTimeout(() => setSubmitSuccess(false), 3000);
  };

  return (
    <TeacherLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-semibold text-foreground">Innstillinger</h1>
          <p className="mt-2 text-muted-foreground">
            Administrer varslinger og preferanser
          </p>
        </div>

        {/* Success Message */}
        {submitSuccess && (
          <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-green-800">
            <p className="font-medium">Innstillingene ble lagret!</p>
          </div>
        )}

        {/* Settings Form */}
        <div className="rounded-lg border border-border bg-white">
          <div className="p-6 border-b border-border">
            <h2 className="text-lg font-semibold text-foreground">Varslinger</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Velg hvilke varslinger du vil motta
            </p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="p-6 space-y-6">
              {/* Email Notifications */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Mail className="h-5 w-5 text-muted-foreground" />
                  <h3 className="font-medium text-foreground">E-postvarslinger</h3>
                </div>

                <FormField
                  control={form.control}
                  name="emailNotifications"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Aktiver e-postvarslinger</FormLabel>
                        <FormDescription>
                          Motta generelle oppdateringer på e-post
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
              </div>

              <Separator />

              {/* Booking Notifications */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  <h3 className="font-medium text-foreground">Bookingvarslinger</h3>
                </div>

                <FormField
                  control={form.control}
                  name="bookingNotifications"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Nye bookinger</FormLabel>
                        <FormDescription>
                          Få beskjed når noen booker en time
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="reminderNotifications"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Påminnelser om kommende timer</FormLabel>
                        <FormDescription>
                          Motta påminnelser 24 timer før time
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
              </div>

              <Separator />

              {/* Payment Notifications */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Bell className="h-5 w-5 text-muted-foreground" />
                  <h3 className="font-medium text-foreground">Betalingsvarslinger</h3>
                </div>

                <FormField
                  control={form.control}
                  name="paymentNotifications"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Betalingsbekreftelser</FormLabel>
                        <FormDescription>
                          Få beskjed når betalinger mottas
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
              </div>

              <Separator />

              {/* Reports */}
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="weeklyReports"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Ukentlige rapporter</FormLabel>
                        <FormDescription>
                          Motta ukentlig oppsummering av aktivitet og inntekter
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
              </div>

              {/* Form Actions */}
              <div className="pt-4">
                <Button type="submit">
                  Lagre innstillinger
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </TeacherLayout>
  );
}
