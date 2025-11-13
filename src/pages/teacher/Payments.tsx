/**
 * Payments page for teachers
 * Shows payment history and revenue statistics
 */

import { useMemo, useState } from "react";
import { DollarSign, TrendingUp, Clock, CheckCircle } from "lucide-react";

import TeacherLayout from "@/components/layout/TeacherLayout";
import { useAuthContext } from "@/contexts/AuthContext";
import {
  useTeacherPayments,
  useTeacherRevenue,
  useBookings,
} from "@/hooks/useBookings";
import { useClasses, useCourses, useEvents } from "@/hooks/useClasses";
import { useStudents } from "@/hooks/useAuth";
import { formatDate, formatCurrency } from "@/utils/date";
import type { PaymentStatus } from "@/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const STATUS_LABELS: Record<PaymentStatus, string> = {
  paid: "Betalt",
  pending: "Venter",
  overdue: "Forfalt",
  refunded: "Refundert",
};

const STATUS_VARIANTS: Record<
  PaymentStatus,
  "default" | "secondary" | "destructive" | "outline"
> = {
  paid: "default",
  pending: "secondary",
  overdue: "destructive",
  refunded: "outline",
};

export default function Payments() {
  const { user } = useAuthContext();
  const [statusFilter, setStatusFilter] = useState<PaymentStatus | "all">(
    "all",
  );

  const { data: revenueData, loading: loadingRevenue } = useTeacherRevenue(
    user?.id,
  );
  const { data: paymentsData, loading: loadingPayments } = useTeacherPayments(
    user?.id,
  );
  const { data: students } = useStudents();
  const { data: classes } = useClasses();
  const { data: courses } = useCourses();
  const { data: events } = useEvents();
  const { data: bookingsData } = useBookings();

  const payments = paymentsData || [];
  const bookings = bookingsData?.data || [];

  // Enrich payments with student and item details
  const enrichedPayments = useMemo(() => {
    if (!payments || !students || !classes || !courses || !events || !bookings)
      return [];

    return payments.map((payment) => {
      const student = students.find((s) => s.id === payment.studentId);

      // Find the booking using bookingId
      const booking = bookings.find((b) => b.id === payment.bookingId);

      let itemName = "Ukjent";
      if (booking) {
        if (booking.itemType === "single") {
          const classItem = classes.find((c) => c.id === booking.itemId);
          itemName = classItem?.name || "Ukjent time";
        } else if (booking.itemType === "course") {
          const course = courses.find((c) => c.id === booking.itemId);
          itemName = course?.name || "Ukjent kurs";
        } else if (booking.itemType === "event") {
          const event = events.find((e) => e.id === booking.itemId);
          itemName = event?.name || "Ukjent event";
        }
      }

      return {
        ...payment,
        studentName: student?.name || "Ukjent student",
        itemName,
      };
    });
  }, [payments, students, classes, courses, events, bookings]);

  // Filter payments by status
  const filteredPayments = useMemo(() => {
    if (statusFilter === "all") return enrichedPayments;
    return enrichedPayments.filter((p) => p.status === statusFilter);
  }, [enrichedPayments, statusFilter]);

  const loading = loadingRevenue || loadingPayments;

  return (
    <TeacherLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-semibold text-foreground">Betalinger</h1>
          <p className="mt-2 text-muted-foreground">
            Oversikt over inntekter og betalingshistorikk
          </p>
        </div>

        {/* Revenue Stats */}
        {loading ? (
          <div className="grid gap-4 md:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="rounded-lg border border-border bg-white p-6 animate-pulse"
              >
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-4">
            <div className="rounded-lg border border-border bg-white p-6">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                <DollarSign className="h-4 w-4" />
                <span>Total inntekt</span>
              </div>
              <p className="text-3xl font-bold text-foreground">
                {formatCurrency(revenueData?.total || 0)}
              </p>
            </div>

            <div className="rounded-lg border border-border bg-white p-6">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                <CheckCircle className="h-4 w-4" />
                <span>Betalt</span>
              </div>
              <p className="text-3xl font-bold text-green-600">
                {formatCurrency(revenueData?.paid || 0)}
              </p>
            </div>

            <div className="rounded-lg border border-border bg-white p-6">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                <Clock className="h-4 w-4" />
                <span>Venter betaling</span>
              </div>
              <p className="text-3xl font-bold text-yellow-600">
                {formatCurrency(revenueData?.pending || 0)}
              </p>
            </div>

            <div className="rounded-lg border border-border bg-white p-6">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                <TrendingUp className="h-4 w-4" />
                <span>Antall betalinger</span>
              </div>
              <p className="text-3xl font-bold text-foreground">
                {payments.length}
              </p>
            </div>
          </div>
        )}

        {/* Payments Table */}
        <div className="rounded-lg border border-border bg-white">
          <div className="p-6 border-b border-border flex items-center justify-between">
            <h2 className="text-xl font-semibold text-foreground">
              Betalingshistorikk
            </h2>

            {/* Status Filter */}
            <Select
              value={statusFilter}
              onValueChange={(value) =>
                setStatusFilter(value as PaymentStatus | "all")
              }
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filtrer status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle betalinger</SelectItem>
                <SelectItem value="paid">Betalt</SelectItem>
                <SelectItem value="pending">Venter</SelectItem>
                <SelectItem value="overdue">Forfalt</SelectItem>
                <SelectItem value="refunded">Refundert</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {loading ? (
            <div className="p-12 text-center">
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
              <p className="mt-4 text-muted-foreground">Laster betalinger...</p>
            </div>
          ) : filteredPayments.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-muted-foreground">
                {statusFilter === "all"
                  ? "Ingen betalinger funnet"
                  : `Ingen betalinger med status "${STATUS_LABELS[statusFilter as PaymentStatus]}"`}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Dato</TableHead>
                    <TableHead>Student</TableHead>
                    <TableHead>Produkt</TableHead>
                    <TableHead>Beløp</TableHead>
                    <TableHead>Betalingsmetode</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPayments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell className="font-medium">
                        {payment.paidAt
                          ? formatDate(new Date(payment.paidAt))
                          : payment.dueDate
                            ? `Forfaller ${formatDate(new Date(payment.dueDate))}`
                            : "-"}
                      </TableCell>
                      <TableCell>{payment.studentName}</TableCell>
                      <TableCell className="max-w-[200px] truncate">
                        {payment.itemName}
                      </TableCell>
                      <TableCell className="font-semibold">
                        {formatCurrency(payment.amount)}
                      </TableCell>
                      <TableCell>{payment.paymentMethod || "-"}</TableCell>
                      <TableCell>
                        <Badge variant={STATUS_VARIANTS[payment.status]}>
                          {STATUS_LABELS[payment.status]}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Summary Footer */}
          {!loading && filteredPayments.length > 0 && (
            <div className="p-4 border-t border-border bg-gray-50">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  Viser {filteredPayments.length}{" "}
                  {filteredPayments.length === 1 ? "betaling" : "betalinger"}
                </span>
                <span className="font-semibold text-foreground">
                  Total:{" "}
                  {formatCurrency(
                    filteredPayments.reduce((sum, p) => sum + p.amount, 0),
                  )}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </TeacherLayout>
  );
}
