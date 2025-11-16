/**
 * Student bookings page
 * Shows all bookings for the logged-in student
 */

import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, Clock, MapPin, DollarSign, AlertCircle } from "lucide-react";
import StudentLayout from "@/components/layout/StudentLayout";
import { useAuthContext } from "@/contexts/AuthContext";
import { useStudentBookings } from "@/hooks/useBookings";
import { useCourses, useEvents } from "@/hooks/useClasses";
import { formatDate, formatCurrency } from "@/utils/date";
import { ROUTES } from "@/config/constants";
import { Badge } from "@/components/ui/badge";
import type { BookingStatus } from "@/types";
import { mockPayments } from "@/mock-data/bookings";

const STATUS_LABELS: Record<BookingStatus, string> = {
  confirmed: "Bekreftet",
  pending: "Venter",
  cancelled: "Kansellert",
  completed: "Fullført",
};

export default function Bookings() {
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const { data: bookings, loading: loadingBookings } = useStudentBookings(
    user?.id,
  );
  const { data: courses } = useCourses();
  const { data: events } = useEvents();

  // Enrich bookings with item details and payment info
  const enrichedBookings = useMemo(() => {
    if (!bookings || !courses?.data || !events?.data) return [];

    return bookings
      .map((booking) => {
        let itemDetails = null;
        let itemTypeName = "";
        let detailRoute = "";

        // Match by itemId and itemType
        if (booking.itemType === "course") {
          itemDetails = courses.data.find((c) => c.id === booking.itemId);
          itemTypeName = "Kurs";
          detailRoute = ROUTES.STUDENT.COURSE_DETAIL.replace(
            ":id",
            booking.itemId,
          );
        } else if (booking.itemType === "event") {
          itemDetails = events.data.find((e) => e.id === booking.itemId);
          itemTypeName = "Arrangement";
          detailRoute = ROUTES.STUDENT.EVENT_DETAIL.replace(
            ":id",
            booking.itemId,
          );
        }

        // Get payment info
        const payment = booking.paymentId
          ? mockPayments.find((p) => p.id === booking.paymentId)
          : null;

        return {
          ...booking,
          itemDetails,
          itemTypeName,
          detailRoute,
          payment,
        };
      })
      .sort(
        (a, b) =>
          new Date(b.bookingDate).getTime() - new Date(a.bookingDate).getTime(),
      );
  }, [bookings, classes, courses, events]);

  // Separate upcoming and past bookings
  const { upcomingBookings, pastBookings } = useMemo(() => {
    const now = new Date();
    const upcoming = enrichedBookings.filter((b) => {
      if (!b.itemDetails) return false;
      const itemDate = new Date(
        b.itemType === "course" ? b.itemDetails.startDate : b.itemDetails.date,
      );
      return itemDate >= now && b.status !== "cancelled";
    });
    const past = enrichedBookings.filter((b) => {
      if (!b.itemDetails) return false;
      const itemDate = new Date(
        b.itemType === "course" ? b.itemDetails.startDate : b.itemDetails.date,
      );
      return (
        itemDate < now || b.status === "cancelled" || b.status === "completed"
      );
    });
    return { upcomingBookings: upcoming, pastBookings: past };
  }, [enrichedBookings]);

  const loading = loadingBookings;

  const renderBookingCard = (booking: (typeof enrichedBookings)[0]) => {
    if (!booking.itemDetails) return null;

    return (
      <div
        key={booking.id}
        className="rounded-2xl border border-border bg-white p-6 hover:shadow-sm transition-shadow cursor-pointer"
        onClick={() => navigate(booking.detailRoute)}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex gap-2">
            <Badge variant="outline">{booking.itemTypeName}</Badge>
            <Badge variant="secondary">{STATUS_LABELS[booking.status]}</Badge>
          </div>
          {booking.payment && (
            <div className="text-right">
              <p className="text-sm font-medium text-foreground">
                {formatCurrency(booking.payment.amount)}
              </p>
              <p
                className={`text-xs ${
                  booking.payment.status === "paid"
                    ? "text-primary"
                    : booking.payment.status === "pending"
                      ? "text-accent"
                      : "text-destructive"
                }`}
              >
                {booking.payment.status === "paid" && "Betalt"}
                {booking.payment.status === "pending" && "Venter betaling"}
                {booking.payment.status === "overdue" && "Forfalt"}
                {booking.payment.status === "refunded" && "Refundert"}
              </p>
            </div>
          )}
        </div>

        {/* Title */}
        <h3 className="text-lg font-semibold text-foreground mb-2">
          {booking.itemDetails.name}
        </h3>

        {/* Details */}
        <div className="space-y-2">
          <div className="flex items-center text-sm text-muted-foreground">
            <Calendar className="h-4 w-4 mr-2 flex-shrink-0" />
            {booking.itemType === "course"
              ? `Starter ${formatDate(new Date(booking.itemDetails.startDate))}`
              : formatDate(new Date(booking.itemDetails.date))}
          </div>
          <div className="flex items-center text-sm text-muted-foreground">
            <Clock className="h-4 w-4 mr-2 flex-shrink-0" />
            {booking.itemType === "course"
              ? `${booking.itemDetails.recurringTime} (${booking.itemDetails.numberOfWeeks} uker)`
              : `${booking.itemDetails.startTime} (${booking.itemDetails.duration} min)`}
          </div>
          <div className="flex items-center text-sm text-muted-foreground">
            <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
            {booking.itemDetails.location}
          </div>
        </div>

        {/* Booking Date */}
        <div className="mt-4 pt-4 border-t border-border">
          <p className="text-xs text-muted-foreground">
            Booket {formatDate(new Date(booking.bookingDate))}
          </p>
        </div>
      </div>
    );
  };

  return (
    <StudentLayout>
      <div className="space-y-6 pb-20 md:pb-0">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-normal text-foreground">
            Mine bookinger
          </h1>
          <p className="mt-2 text-muted-foreground">
            Oversikt over alle dine bookinger og påmeldinger
          </p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex min-h-[400px] items-center justify-center">
            <div className="text-center">
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
              <p className="mt-4 text-muted-foreground">Laster...</p>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && enrichedBookings.length === 0 && (
          <div className="flex min-h-[400px] items-center justify-center">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg font-medium text-foreground">
                Ingen bookinger ennå
              </p>
              <p className="mt-2 text-muted-foreground mb-6">
                Utforsk våre enkeltkurs, kursrekker og arrangementer for å komme
                i gang!
              </p>
              <button
                onClick={() => navigate(ROUTES.STUDENT.BROWSE)}
                className="inline-flex items-center justify-center rounded-xl bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 transition-colors cursor-pointer"
              >
                Utforsk
              </button>
            </div>
          </div>
        )}

        {/* Bookings List */}
        {!loading && enrichedBookings.length > 0 && (
          <div className="space-y-8">
            {/* Upcoming Bookings */}
            {upcomingBookings.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold text-foreground mb-4">
                  Kommende ({upcomingBookings.length})
                </h2>
                <div className="grid gap-4 md:grid-cols-2">
                  {upcomingBookings.map(renderBookingCard)}
                </div>
              </div>
            )}

            {/* Past Bookings */}
            {pastBookings.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold text-foreground mb-4">
                  Tidligere ({pastBookings.length})
                </h2>
                <div className="grid gap-4 md:grid-cols-2">
                  {pastBookings.map(renderBookingCard)}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </StudentLayout>
  );
}
