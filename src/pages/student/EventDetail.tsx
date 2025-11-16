/**
 * Single class detail page for students
 * Shows class information and allows booking
 */

import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Users,
  User as UserIcon,
} from "lucide-react";
import StudentLayout from "@/components/layout/StudentLayout";
import { useEvent } from "@/hooks/useClasses";
import { useBookingMutations } from "@/hooks/useBookings";
import { useAuthContext } from "@/contexts/AuthContext";
import { formatDate, formatCurrency } from "@/utils/date";
import { ROUTES } from "@/config/constants";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function EventDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const { data: eventData, loading } = useEvent(id);
  const { create: createBooking, loading: booking } = useBookingMutations();

  const [showBookingDialog, setShowBookingDialog] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  const availableSpots = eventData
    ? eventData.capacity - eventData.bookedCount
    : 0;

  const handleBooking = async () => {
    if (!user?.id || !eventData) return;

    try {
      setBookingError(null);

      await createBooking({
        studentId: user.id,
        itemId: eventData.id,
        itemType: "single",
        status: "confirmed",
        bookingDate: new Date(),
        price: eventData.price,
      });

      setBookingSuccess(true);
      setTimeout(() => {
        navigate(ROUTES.STUDENT.BOOKINGS);
      }, 2000);
    } catch (err) {
      setBookingError(
        err instanceof Error ? err.message : "Kunne ikke opprette booking",
      );
    }
  };

  // Loading state
  if (loading) {
    return (
      <StudentLayout>
        <div className="flex min-h-[400px] items-center justify-center">
          <div className="text-center">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Laster...</p>
          </div>
        </div>
      </StudentLayout>
    );
  }

  // Error state
  if (!eventData) {
    return (
      <StudentLayout>
        <div className="space-y-6">
          <Button
            variant="outline"
            onClick={() => navigate(ROUTES.STUDENT.BROWSE)}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Tilbake
          </Button>
          <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-5 text-destructive/80">
            <p className="font-medium">Arrangementet ble ikke funnet</p>
          </div>
        </div>
      </StudentLayout>
    );
  }

  return (
    <StudentLayout>
      <div className="space-y-6 max-w-4xl mx-auto pb-20 md:pb-0">
        {/* Back Button */}
        <Button
          variant="outline"
          onClick={() => navigate(ROUTES.STUDENT.BROWSE)}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Tilbake til utforsk
        </Button>

        {/* Main Card */}
        <div className="rounded-2xl border border-border bg-white p-8">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <Badge variant="outline">Arrangement</Badge>
              </div>
              {availableSpots <= 3 && availableSpots > 0 && (
                <Badge variant="secondary">Få plasser igjen!</Badge>
              )}
              {availableSpots === 0 && (
                <Badge variant="outline" className="text-muted-foreground">
                  Fullt
                </Badge>
              )}
            </div>

            <h1 className="text-4xl font-normal text-foreground">
              {eventData.name}
            </h1>
          </div>

          {/* Description */}
          {eventData.description && (
            <div className="mb-8">
              <h2 className="text-lg font-medium text-foreground mb-2">
                Om arrangementet
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                {eventData.description}
              </p>
            </div>
          )}

          {/* Details Grid */}
          <div className="grid gap-6 md:grid-cols-2 mb-8">
            <div className="space-y-4">
              <h3 className="font-medium text-foreground">Detaljer</h3>
              <div className="space-y-3">
                <div className="flex items-center text-muted-foreground">
                  <Calendar className="h-5 w-5 mr-3 flex-shrink-0" />
                  <div>
                    <p className="text-sm">Dato</p>
                    <p className="font-medium text-foreground">
                      {formatDate(new Date(eventData.date))}
                    </p>
                  </div>
                </div>

                <div className="flex items-center text-muted-foreground">
                  <Clock className="h-5 w-5 mr-3 flex-shrink-0" />
                  <div>
                    <p className="text-sm">Tid</p>
                    <p className="font-medium text-foreground">
                      {eventData.startTime} ({eventData.duration} minutter)
                    </p>
                  </div>
                </div>

                <div className="flex items-center text-muted-foreground">
                  <MapPin className="h-5 w-5 mr-3 flex-shrink-0" />
                  <div>
                    <p className="text-sm">Lokasjon</p>
                    <p className="font-medium text-foreground">
                      {eventData.location}
                    </p>
                  </div>
                </div>

                <div className="flex items-center text-muted-foreground">
                  <Users className="h-5 w-5 mr-3 flex-shrink-0" />
                  <div>
                    <p className="text-sm">Tilgjengelighet</p>
                    <p className="font-medium text-foreground">
                      {availableSpots} ledige av {eventData.capacity} plasser
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-medium text-foreground">Pris & Booking</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">Pris</p>
                  <p className="text-3xl font-normal text-foreground">
                    {formatCurrency(eventData.price)}
                  </p>
                </div>

                {eventData.dropInAvailable && (
                  <div className="flex items-center gap-2 text-sm text-primary bg-primary/10 px-3 py-2 rounded-full">
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    Drop-in velkommen
                  </div>
                )}
              </div>

              <Button
                onClick={() => setShowBookingDialog(true)}
                disabled={availableSpots === 0 || booking}
                className="w-full"
                size="lg"
              >
                {availableSpots === 0
                  ? "Fullt booket"
                  : "Book dette arrangementet"}
              </Button>
            </div>
          </div>

          {/* Teacher Info */}
          {eventData.teacher && (
            <div className="pt-6 border-t border-border mt-6">
              <h3 className="font-medium text-foreground mb-3">Instruktør</h3>
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <UserIcon className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-foreground">
                    {eventData.teacher.name}
                  </p>
                  {eventData.teacher.bio && (
                    <p className="text-sm text-muted-foreground">
                      {eventData.teacher.bio}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Booking Confirmation Dialog */}
        <Dialog open={showBookingDialog} onOpenChange={setShowBookingDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {bookingSuccess ? "Booking bekreftet!" : "Bekreft booking"}
              </DialogTitle>
              <DialogDescription>
                {bookingSuccess ? (
                  <div className="py-4 text-center">
                    <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                      <svg
                        className="h-8 w-8 text-primary"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                    <p className="text-foreground">
                      Din booking er bekreftet! Du blir videresendt til Mine
                      bookinger...
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4 py-4">
                    <p>Er du sikker på at du vil booke dette arrangementet?</p>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Arrangement:
                        </span>
                        <span className="font-medium text-foreground">
                          {eventData.name}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Dato:</span>
                        <span className="font-medium text-foreground">
                          {formatDate(new Date(eventData.date))}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Tid:</span>
                        <span className="font-medium text-foreground">
                          {eventData.startTime}
                        </span>
                      </div>
                      <div className="flex justify-between border-t border-border pt-2">
                        <span className="text-muted-foreground">Totalt:</span>
                        <span className="text-lg font-semibold text-foreground">
                          {formatCurrency(eventData.price)}
                        </span>
                      </div>
                    </div>

                    {bookingError && (
                      <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-4 text-destructive/80 text-sm">
                        {bookingError}
                      </div>
                    )}
                  </div>
                )}
              </DialogDescription>
            </DialogHeader>
            {!bookingSuccess && (
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setShowBookingDialog(false)}
                  disabled={booking}
                >
                  Avbryt
                </Button>
                <Button onClick={handleBooking} disabled={booking}>
                  {booking ? "Booker..." : "Bekreft booking"}
                </Button>
              </DialogFooter>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </StudentLayout>
  );
}
