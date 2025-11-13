/**
 * Student detail page for teachers
 * Shows student information, bookings, and payment history
 */

import { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Mail,
  Phone,
  AlertCircle,
  Calendar,
  Clock,
  MapPin,
  DollarSign,
} from "lucide-react";

import TeacherLayout from "@/components/layout/TeacherLayout";
import { useStudent } from "@/hooks/useAuth";
import { useStudentBookings } from "@/hooks/useBookings";
import { useClasses, useCourses, useEvents } from "@/hooks/useClasses";
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
import { formatDate, formatTime, formatCurrency } from "@/utils/date";
import type { Booking, BookingStatus, Payment } from "@/types";
import { mockPayments } from "@/mock-data/bookings";

const STATUS_LABELS: Record<BookingStatus, string> = {
  confirmed: "Bekreftet",
  pending: "Venter",
  cancelled: "Kansellert",
  completed: "Fullført",
};

const STATUS_COLORS: Record<BookingStatus, string> = {
  confirmed: "bg-green-100 text-green-800",
  pending: "bg-yellow-100 text-yellow-800",
  cancelled: "bg-gray-100 text-gray-800",
  completed: "bg-blue-100 text-blue-800",
};

export default function StudentDetail() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const {
    data: student,
    loading: loadingStudent,
    error: studentError,
  } = useStudent(id);
  const { data: bookings, loading: loadingBookings } = useStudentBookings(id);
  const { data: classes } = useClasses();
  const { data: courses } = useCourses();
  const { data: events } = useEvents();

  // Enrich bookings with class/course/event details and payment info
  const enrichedBookings = useMemo(() => {
    if (!bookings || !classes || !courses || !events) return [];

    return bookings
      .map((booking) => {
        let itemDetails = null;
        let itemTypeName = "";

        // Match by itemId and itemType
        if (booking.itemType === "single") {
          itemDetails = classes.find((c) => c.id === booking.itemId);
          itemTypeName = "Enkelttime";
        } else if (booking.itemType === "course") {
          itemDetails = courses.find((c) => c.id === booking.itemId);
          itemTypeName = "Kurs";
        } else if (booking.itemType === "event") {
          itemDetails = events.find((e) => e.id === booking.itemId);
          itemTypeName = "Event";
        }

        // Get payment info
        const payment = booking.paymentId
          ? mockPayments.find((p) => p.id === booking.paymentId)
          : null;

        return {
          ...booking,
          itemDetails,
          itemTypeName,
          payment,
        };
      })
      .sort(
        (a, b) =>
          new Date(b.bookingDate).getTime() - new Date(a.bookingDate).getTime(),
      );
  }, [bookings, classes, courses, events]);

  // Calculate payment stats
  const paymentStats = useMemo(() => {
    if (!enrichedBookings)
      return { total: 0, paid: 0, pending: 0, refunded: 0 };

    return enrichedBookings.reduce(
      (acc, booking) => {
        if (booking.payment) {
          acc.total += booking.payment.amount;
          if (booking.payment.status === "paid")
            acc.paid += booking.payment.amount;
          if (booking.payment.status === "pending")
            acc.pending += booking.payment.amount;
          if (booking.payment.status === "refunded")
            acc.refunded += booking.payment.amount;
        }
        return acc;
      },
      { total: 0, paid: 0, pending: 0, refunded: 0 },
    );
  }, [enrichedBookings]);

  const loading = loadingStudent || loadingBookings;

  // Loading state
  if (loading) {
    return (
      <TeacherLayout>
        <div className="flex min-h-[400px] items-center justify-center">
          <div className="text-center">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Laster student...</p>
          </div>
        </div>
      </TeacherLayout>
    );
  }

  // Error state
  if (studentError || !student) {
    return (
      <TeacherLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-semibold text-foreground">
              Feil ved lasting
            </h1>
          </div>
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">
            <p className="font-medium">Kunne ikke laste student</p>
            <p className="text-sm mt-1">
              {studentError?.message || "Studenten ble ikke funnet"}
            </p>
          </div>
          <Button onClick={() => navigate(ROUTES.TEACHER.STUDENTS)}>
            Tilbake til påmeldinger
          </Button>
        </div>
      </TeacherLayout>
    );
  }

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
              <BreadcrumbLink href={ROUTES.TEACHER.STUDENTS}>
                Påmeldinger
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{student.name}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Back Button */}
        <Button
          variant="outline"
          onClick={() => navigate(ROUTES.TEACHER.STUDENTS)}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Tilbake til påmeldinger
        </Button>

        {/* Student Header */}
        <div className="rounded-lg border border-border bg-white p-6">
          <h1 className="text-3xl font-semibold text-foreground mb-4">
            {student.name}
          </h1>

          <div className="grid gap-4 md:grid-cols-2">
            {/* Contact Info */}
            <div className="space-y-3">
              <h3 className="font-medium text-foreground">
                Kontaktinformasjon
              </h3>
              {student.email && (
                <div className="flex items-center text-sm text-muted-foreground">
                  <Mail className="h-4 w-4 mr-2 flex-shrink-0" />
                  <a
                    href={`mailto:${student.email}`}
                    className="hover:text-primary"
                  >
                    {student.email}
                  </a>
                </div>
              )}
              {student.phone && (
                <div className="flex items-center text-sm text-muted-foreground">
                  <Phone className="h-4 w-4 mr-2 flex-shrink-0" />
                  <a
                    href={`tel:${student.phone}`}
                    className="hover:text-primary"
                  >
                    {student.phone}
                  </a>
                </div>
              )}
            </div>

            {/* Emergency Contact */}
            {student.emergencyContact && (
              <div className="space-y-3">
                <h3 className="font-medium text-foreground">Nødkontakt</h3>
                <div className="text-sm text-muted-foreground">
                  <p className="font-medium">{student.emergencyContact.name}</p>
                  <p>{student.emergencyContact.relation}</p>
                  <p>{student.emergencyContact.phone}</p>
                </div>
              </div>
            )}
          </div>

          {/* Medical Notes */}
          {student.medicalNotes && (
            <div className="mt-6 pt-6 border-t border-border">
              <div className="flex items-start gap-3 p-4 rounded-lg bg-orange-50 border border-orange-200">
                <AlertCircle className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-medium text-orange-900 mb-1">
                    Medisinsk informasjon
                  </h3>
                  <p className="text-sm text-orange-800">
                    {student.medicalNotes}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Payment Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <div className="rounded-lg border border-border bg-white p-4">
            <p className="text-sm text-muted-foreground">Totalt betalt</p>
            <p className="text-2xl font-semibold text-foreground mt-1">
              {formatCurrency(paymentStats.paid)}
            </p>
          </div>
          <div className="rounded-lg border border-border bg-white p-4">
            <p className="text-sm text-muted-foreground">Venter betaling</p>
            <p className="text-2xl font-semibold text-yellow-600 mt-1">
              {formatCurrency(paymentStats.pending)}
            </p>
          </div>
          <div className="rounded-lg border border-border bg-white p-4">
            <p className="text-sm text-muted-foreground">Refundert</p>
            <p className="text-2xl font-semibold text-muted-foreground mt-1">
              {formatCurrency(paymentStats.refunded)}
            </p>
          </div>
          <div className="rounded-lg border border-border bg-white p-4">
            <p className="text-sm text-muted-foreground">Antall bookinger</p>
            <p className="text-2xl font-semibold text-foreground mt-1">
              {bookings?.length || 0}
            </p>
          </div>
        </div>

        {/* Bookings List */}
        <div className="rounded-lg border border-border bg-white">
          <div className="p-6 border-b border-border">
            <h2 className="text-xl font-semibold text-foreground">
              Bookinghistorikk
            </h2>
          </div>

          {enrichedBookings.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-muted-foreground">Ingen bookinger funnet</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {enrichedBookings.map((booking) => (
                <div key={booking.id} className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-foreground">
                          {booking.itemDetails?.name || "Ukjent"}
                        </h3>
                        <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700">
                          {booking.itemTypeName}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Booket {formatDate(new Date(booking.bookingDate))}
                      </p>
                    </div>
                    <div className="text-right">
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${STATUS_COLORS[booking.status]}`}
                      >
                        {STATUS_LABELS[booking.status]}
                      </span>
                    </div>
                  </div>

                  {booking.itemDetails && (
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-3">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1.5" />
                        {formatDate(new Date(booking.itemDetails.date))}
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1.5" />
                        {booking.itemDetails.startTime}
                      </div>
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-1.5" />
                        {booking.itemDetails.location}
                      </div>
                    </div>
                  )}

                  {booking.payment && (
                    <div className="flex items-center justify-between pt-3 border-t border-border">
                      <div className="flex items-center gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">
                            Betalingsstatus:{" "}
                          </span>
                          <span
                            className={
                              booking.payment.status === "paid"
                                ? "text-green-600 font-medium"
                                : booking.payment.status === "pending"
                                  ? "text-yellow-600 font-medium"
                                  : booking.payment.status === "refunded"
                                    ? "text-gray-600 font-medium"
                                    : "text-red-600 font-medium"
                            }
                          >
                            {booking.payment.status === "paid" && "Betalt"}
                            {booking.payment.status === "pending" && "Venter"}
                            {booking.payment.status === "refunded" &&
                              "Refundert"}
                            {booking.payment.status === "overdue" && "Forfalt"}
                          </span>
                        </div>
                        {booking.payment.paymentMethod && (
                          <div className="text-muted-foreground">
                            via {booking.payment.paymentMethod}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center text-lg font-semibold text-foreground">
                        {formatCurrency(booking.payment.amount)}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </TeacherLayout>
  );
}
