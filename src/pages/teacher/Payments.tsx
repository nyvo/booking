/**
 * Payments page for teachers
 * Shows payment history and revenue statistics
 * Compact layout with integrated stats per .cursorrules
 */

import { useMemo, useState } from "react";
import { Banknote, RotateCcw, Clock, CheckCircle } from "lucide-react";

import TeacherLayout from "@/components/layout/TeacherLayout";
import { useAuthContext } from "@/contexts/AuthContext";
import { useTeacherPayments, useBookings } from "@/hooks/useBookings";
import { useCourses, useEvents } from "@/hooks/useClasses";
import { useStudents } from "@/hooks/useAuth";
import { formatDate, formatCurrency } from "@/utils/date";
import type { PaymentStatus } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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

  const { data: paymentsData, loading: loadingPayments } = useTeacherPayments(
    user?.id,
  );
  const { data: students } = useStudents();
  const { data: courses } = useCourses();
  const { data: events } = useEvents();
  const { data: bookingsData } = useBookings();

  const payments = paymentsData || [];
  const bookings = bookingsData?.data || [];

  // Enrich payments with student and item details
  const enrichedPayments = useMemo(() => {
    if (!payments || !students || !courses || !events || !bookings) return [];

    return payments.map((payment) => {
      const student = students.find((s) => s.id === payment.studentId);

      // Find the booking using bookingId
      const booking = bookings.find((b) => b.id === payment.bookingId);

      let itemName = "Ukjent";
      if (booking) {
        if (booking.itemType === "course") {
          const course = courses?.data?.find((c) => c.id === booking.itemId);
          itemName = course?.name || "Ukjent kurs";
        } else if (booking.itemType === "event") {
          const event = events?.data?.find((e) => e.id === booking.itemId);
          itemName = event?.name || "Ukjent event";
        }
      }

      return {
        ...payment,
        studentName: student?.name || "Ukjent student",
        itemName,
      };
    });
  }, [payments, students, courses, events, bookings]);

  // Filter payments by status
  const filteredPayments = useMemo(() => {
    if (statusFilter === "all") return enrichedPayments;
    return enrichedPayments.filter((p) => p.status === statusFilter);
  }, [enrichedPayments, statusFilter]);

  // Calculate current month revenue (for main headline)
  const currentMonthRevenue = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    return enrichedPayments
      .filter((p) => {
        if (!p.paidAt) return false;
        const paymentDate = new Date(p.paidAt);
        return (
          paymentDate.getMonth() === currentMonth &&
          paymentDate.getFullYear() === currentYear &&
          p.status === "paid"
        );
      })
      .reduce((sum, p) => sum + p.amount, 0);
  }, [enrichedPayments]);

  // Calculate previous month revenue
  const previousMonthRevenue = useMemo(() => {
    const now = new Date();
    const previousMonth = now.getMonth() === 0 ? 11 : now.getMonth() - 1;
    const previousYear =
      now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();

    return enrichedPayments
      .filter((p) => {
        if (!p.paidAt) return false;
        const paymentDate = new Date(p.paidAt);
        return (
          paymentDate.getMonth() === previousMonth &&
          paymentDate.getFullYear() === previousYear &&
          p.status === "paid"
        );
      })
      .reduce((sum, p) => sum + p.amount, 0);
  }, [enrichedPayments]);

  // Calculate monthly statistics (current calendar month) - counts only
  const monthlyStats = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const thisMonthPayments = enrichedPayments.filter((p) => {
      // Check if payment belongs to current month
      const paymentDate = p.paidAt
        ? new Date(p.paidAt)
        : p.dueDate
          ? new Date(p.dueDate)
          : null;

      if (!paymentDate) return false;

      return (
        paymentDate.getMonth() === currentMonth &&
        paymentDate.getFullYear() === currentYear
      );
    });

    const paidCount = thisMonthPayments.filter(
      (p) => p.status === "paid",
    ).length;

    const pendingCount = thisMonthPayments.filter(
      (p) => p.status === "pending" || p.status === "overdue",
    ).length;

    const refundedCount = thisMonthPayments.filter(
      (p) => p.status === "refunded",
    ).length;

    return {
      paid: paidCount,
      pending: pendingCount,
      refunded: refundedCount,
    };
  }, [enrichedPayments]);

  // Count payment statuses (for status message - all time)
  const paymentCounts = useMemo(() => {
    const pending = enrichedPayments.filter(
      (p) => p.status === "pending",
    ).length;
    const overdue = enrichedPayments.filter(
      (p) => p.status === "overdue",
    ).length;
    return { pending, overdue };
  }, [enrichedPayments]);

  // Generate dynamic status message with color
  const statusInfo = useMemo(() => {
    const { pending, overdue } = paymentCounts;

    // Failed/overdue payments take priority
    if (overdue > 0 && pending > 0) {
      return {
        message: `${pending} ${pending === 1 ? "ventende" : "ventende"} | ${overdue} ${overdue === 1 ? "krever oppmerksomhet" : "krever oppmerksomhet"}`,
        color: "text-destructive",
      };
    }

    if (overdue > 0) {
      return {
        message: `${overdue} ${overdue === 1 ? "betaling krever" : "betalinger krever"} oppmerksomhet.`,
        color: "text-destructive",
      };
    }

    if (pending > 0) {
      return {
        message: `Du har ${pending} ${pending === 1 ? "ventende betaling" : "ventende betalinger"}.`,
        color: "text-amber-600",
      };
    }

    // All clear
    return {
      message: "Alt er betalt – ingen utestående betalinger.",
      color: "text-muted-foreground",
    };
  }, [paymentCounts]);

  const loading = loadingPayments;

  return (
    <TeacherLayout>
      {/* Page Header */}
      <div className="mx-auto max-w-4xl px-4 space-y-2 mb-8">
        <h1 className="text-4xl font-normal text-foreground">Betalinger</h1>
        <p className="text-base text-muted-foreground">
          Oversikt over inntekter og betalingshistorikk
        </p>
      </div>

      {/* Shared container for aligned cards */}
      <div className="mx-auto max-w-4xl px-4 space-y-8">
        {/* Single Summary Card with Integrated Stats */}
        {loading ? (
          <Card className="h-56 animate-pulse rounded-3xl border border-border/60 shadow-md bg-background-surface/80 backdrop-blur" />
        ) : (
          <Card className="rounded-3xl border border-border/60 shadow-md bg-background-surface/80 backdrop-blur overflow-hidden">
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: `
                  radial-gradient(circle at top left, rgba(78, 149, 255, 0.08), transparent 55%),
                  radial-gradient(circle at bottom right, rgba(165, 180, 252, 0.12), transparent 55%)
                `,
              }}
            />
            <CardContent className="relative px-8 py-8 space-y-4">
              {/* Main Summary - Tightened spacing */}
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">
                  Du har tjent
                </p>
                <p className="text-5xl font-semibold text-foreground">
                  {formatCurrency(currentMonthRevenue)}
                </p>
                <p className="text-sm text-muted-foreground">denne måneden</p>
              </div>

              {/* Dynamic Status Message with Color */}
              <div>
                <p className={`text-sm font-medium ${statusInfo.color}`}>
                  {statusInfo.message}
                </p>
              </div>

              {/* Integrated Mini Stats Row - Supporting Metrics */}
              <div className="pt-4 mt-4 border-t border-border/40">
                <div className="grid grid-cols-4 gap-4">
                  {/* Fullførte bookinger */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5">
                      <CheckCircle className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">
                        Fullførte bookinger
                      </span>
                    </div>
                    <p
                      className={`text-base font-semibold ${
                        monthlyStats.paid > 0
                          ? "text-primary"
                          : "text-muted-foreground"
                      }`}
                    >
                      {monthlyStats.paid}
                    </p>
                  </div>

                  {/* Venter betaling */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">
                        Venter betaling
                      </span>
                    </div>
                    <p
                      className={`text-base font-semibold ${
                        monthlyStats.pending > 0
                          ? "text-accent"
                          : "text-muted-foreground"
                      }`}
                    >
                      {monthlyStats.pending}
                    </p>
                  </div>

                  {/* Refusjoner */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5">
                      <RotateCcw className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">
                        Refusjoner
                      </span>
                    </div>
                    <p
                      className={`text-base font-semibold ${
                        monthlyStats.refunded > 0
                          ? "text-destructive"
                          : "text-muted-foreground"
                      }`}
                    >
                      {monthlyStats.refunded}
                    </p>
                  </div>

                  {/* Forrige måned */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5">
                      <Banknote className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">
                        Forrige måned
                      </span>
                    </div>
                    <p
                      className={`text-base font-semibold ${
                        previousMonthRevenue > 0
                          ? "text-foreground"
                          : "text-muted-foreground"
                      }`}
                    >
                      {formatCurrency(previousMonthRevenue)}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Payments History Card - Directly Below */}
        <Card className="rounded-3xl border border-border/60 shadow-md bg-background-surface/80 backdrop-blur overflow-hidden">
          {/* Header */}
          <div className="px-8 py-6 border-b border-border/60">
            <h2 className="text-2xl font-semibold text-foreground">
              Betalingshistorikk
            </h2>
          </div>

          {/* Filter Tabs - Improved spacing */}
          <div className="px-8 py-4 border-b border-border/40 bg-muted/20">
            <div className="flex gap-2 flex-wrap">
              {[
                { value: "all", label: "Alle" },
                { value: "paid", label: "Betalt" },
                { value: "pending", label: "Venter" },
                { value: "refunded", label: "Refundert" },
              ].map((filter) => (
                <button
                  key={filter.value}
                  onClick={() =>
                    setStatusFilter(filter.value as PaymentStatus | "all")
                  }
                  className={`
                    px-4 py-2 rounded-full text-sm font-medium transition-colors cursor-pointer
                    ${
                      statusFilter === filter.value
                        ? "bg-primary text-white"
                        : "bg-background-surface/60 text-muted-foreground hover:bg-background-surface hover:text-foreground border border-border/40"
                    }
                  `}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>

          {/* Table */}
          {loading ? (
            <div className="p-12 text-center">
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
              <p className="mt-4 text-sm text-muted-foreground">
                Laster betalinger...
              </p>
            </div>
          ) : filteredPayments.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-sm text-muted-foreground">
                {statusFilter === "all"
                  ? "Ingen betalinger funnet"
                  : `Ingen betalinger med status "${STATUS_LABELS[statusFilter as PaymentStatus]}"`}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-border/40 hover:bg-transparent">
                    <TableHead className="pl-8 text-xs font-semibold text-muted-foreground">
                      Dato
                    </TableHead>
                    <TableHead className="text-xs font-semibold text-muted-foreground">
                      Student
                    </TableHead>
                    <TableHead className="text-xs font-semibold text-muted-foreground">
                      Beløp
                    </TableHead>
                    <TableHead className="text-xs font-semibold text-muted-foreground">
                      Betalingsmetode
                    </TableHead>
                    <TableHead className="pr-8 text-xs font-semibold text-muted-foreground">
                      Status
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPayments.map((payment) => (
                    <TableRow
                      key={payment.id}
                      className="border-border/40 hover:bg-muted/40 transition-colors"
                    >
                      <TableCell className="pl-8 text-sm text-muted-foreground">
                        {payment.paidAt
                          ? formatDate(new Date(payment.paidAt))
                          : payment.dueDate
                            ? `Forfaller ${formatDate(new Date(payment.dueDate))}`
                            : "-"}
                      </TableCell>
                      <TableCell className="text-sm font-medium text-foreground">
                        {payment.studentName}
                      </TableCell>
                      <TableCell className="text-sm font-semibold text-foreground">
                        {formatCurrency(payment.amount)}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {payment.paymentMethod || "-"}
                      </TableCell>
                      <TableCell className="pr-8">
                        <Badge
                          variant={STATUS_VARIANTS[payment.status]}
                          className="rounded-full px-3"
                        >
                          {STATUS_LABELS[payment.status]}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Summary Footer - Reduced visual weight */}
          {!loading && filteredPayments.length > 0 && (
            <div className="px-8 py-4 border-t border-border/60 bg-muted/20">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>
                  Viser {filteredPayments.length}{" "}
                  {filteredPayments.length === 1 ? "betaling" : "betalinger"}
                </span>
                <span className="font-semibold">
                  Total:{" "}
                  {formatCurrency(
                    filteredPayments.reduce((sum, p) => sum + p.amount, 0),
                  )}
                </span>
              </div>
            </div>
          )}
        </Card>
      </div>
    </TeacherLayout>
  );
}
