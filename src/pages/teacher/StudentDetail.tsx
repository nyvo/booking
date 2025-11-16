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
import { useCourses, useEvents } from "@/hooks/useClasses";
import { ROUTES } from "@/config/constants";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  confirmed: "bg-primary/10 text-primary",
  pending: "bg-accent/10 text-accent",
  cancelled: "bg-muted/10 text-muted-foreground",
  completed: "bg-primary/5 text-primary/80",
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
        <Card className="flex min-h-[400px] items-center justify-center p-12">
          <div className="text-center">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Laster student...</p>
          </div>
        </Card>
      </TeacherLayout>
    );
  }

  // Error state
  if (studentError || !student) {
    return (
      <TeacherLayout>
        <div className="space-y-6">
          <div className="space-y-2">
            <h1 className="text-4xl font-normal text-foreground">
              Feil ved lasting
            </h1>
          </div>
          <Card className="border-destructive/20 bg-destructive/5 rounded-2xl p-6">
            <p className="font-medium text-destructive/80">
              Kunne ikke laste student
            </p>
            <p className="text-sm mt-2 text-destructive/70">
              {studentError?.message || "Studenten ble ikke funnet"}
            </p>
          </Card>
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
        <Card className="p-8">
          <h1 className="text-4xl font-normal text-foreground mb-6">
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
            <div className="mt-6 pt-6 border-t border-border/60">
              <div className="flex items-start gap-3 p-4 rounded-2xl bg-accent/5 border border-accent/20">
                <AlertCircle className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-medium text-foreground mb-2">
                    Medisinsk informasjon
                  </h3>
                  <p className="text-sm text-accent/80">
                    {student.medicalNotes}
                  </p>
                </div>
              </div>
            </div>
          )}
        </Card>

        {/* Payment Stats */}
        <div className="grid gap-6 md:grid-cols-4">
          <Card className="p-6">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">
                Totalt betalt
              </p>
              <p className="text-3xl font-bold text-foreground">
                {formatCurrency(paymentStats.paid)}
              </p>
            </div>
          </Card>
          <Card className="p-6">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">
                Venter betaling
              </p>
              <p className="text-3xl font-bold text-accent">
                {formatCurrency(paymentStats.pending)}
              </p>
            </div>
          </Card>
          <Card className="p-6">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">
                Refundert
              </p>
              <p className="text-3xl font-bold text-muted-foreground">
                {formatCurrency(paymentStats.refunded)}
              </p>
            </div>
          </Card>
          <Card className="p-6">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">
                Antall bookinger
              </p>
              <p className="text-3xl font-bold text-foreground">
                {bookings?.length || 0}
              </p>
            </div>
          </Card>
        </div>

        {/* Bookings List */}
        <Card className="p-0 gap-0 overflow-hidden">
          <div className="px-8 py-6 border-b border-border/60">
            <h2 className="text-2xl font-semibold text-foreground">
              Bookinghistorikk
            </h2>
          </div>

          {enrichedBookings.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-muted-foreground">Ingen bookinger funnet</p>
            </div>
          ) : (
            <div className="divide-y divide-border/60">
              {enrichedBookings.map((booking) => (
                <div key={booking.id} className="px-8 py-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-semibold text-foreground">
                          {booking.itemDetails?.name || "Ukjent"}
                        </h3>
                        <Badge variant="secondary" className="text-xs">
                          {booking.itemTypeName}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Booket {formatDate(new Date(booking.bookingDate))}
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge
                        variant={
                          booking.status === "confirmed" ||
                          booking.status === "completed"
                            ? "default"
                            : "secondary"
                        }
                        className={`${
                          booking.status === "cancelled"
                            ? "bg-muted text-muted-foreground"
                            : booking.status === "pending"
                              ? "bg-accent/10 text-accent border-accent/20"
                              : ""
                        }`}
                      >
                        {STATUS_LABELS[booking.status]}
                      </Badge>
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
                    <div className="flex items-center justify-between pt-4 mt-4 border-t border-border/60">
                      <div className="flex items-center gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">
                            Betalingsstatus:{" "}
                          </span>
                          <span
                            className={
                              booking.payment.status === "paid"
                                ? "text-primary font-medium"
                                : booking.payment.status === "pending"
                                  ? "text-accent font-medium"
                                  : booking.payment.status === "refunded"
                                    ? "text-muted-foreground font-medium"
                                    : "text-destructive font-medium"
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
                      <div className="flex items-center text-xl font-bold text-foreground">
                        {formatCurrency(booking.payment.amount)}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </TeacherLayout>
  );
}
