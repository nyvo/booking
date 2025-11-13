/**
 * Students list page for teachers
 * Shows all students who have bookings with this teacher
 */

import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Phone, Calendar, CreditCard } from "lucide-react";

import TeacherLayout from "@/components/layout/TeacherLayout";
import { useAuthContext } from "@/contexts/AuthContext";
import { useStudents } from "@/hooks/useAuth";
import { useBookings } from "@/hooks/useBookings";
import { useClasses, useCourses, useEvents } from "@/hooks/useClasses";
import { ROUTES } from "@/config/constants";
import { Button } from "@/components/ui/button";

export default function Students() {
  const navigate = useNavigate();
  const { user } = useAuthContext();

  const {
    data: allStudents,
    loading: loadingStudents,
    error: studentsError,
  } = useStudents();
  const { data: bookingsResponse, loading: loadingBookings } = useBookings();
  const { data: classes, loading: loadingClasses } = useClasses();
  const { data: courses, loading: loadingCourses } = useCourses();
  const { data: events, loading: loadingEvents } = useEvents();

  const allBookings = bookingsResponse?.data || [];

  // Filter students who have bookings with this teacher
  const studentsWithBookings = useMemo(() => {
    if (
      !allStudents ||
      !allBookings.length ||
      !classes ||
      !courses ||
      !events ||
      !user?.id
    )
      return [];

    // Get all item IDs that belong to this teacher
    const teacherItemIds = new Set([
      ...classes.filter((c) => c.teacherId === user.id).map((c) => c.id),
      ...courses.filter((c) => c.teacherId === user.id).map((c) => c.id),
      ...events.filter((e) => e.teacherId === user.id).map((e) => e.id),
    ]);

    // Filter bookings for this teacher's items
    const teacherBookings = allBookings.filter((booking) =>
      teacherItemIds.has(booking.itemId),
    );

    // Get unique student IDs from these bookings
    const studentIds = new Set(
      teacherBookings.map((booking) => booking.studentId),
    );

    // Return students with their booking count
    return allStudents
      .filter((student) => studentIds.has(student.id))
      .map((student) => {
        const studentTeacherBookings = teacherBookings.filter(
          (b) => b.studentId === student.id,
        );
        const bookingCount = studentTeacherBookings.length;
        const activeBookings = studentTeacherBookings.filter(
          (b) => b.status !== "cancelled",
        ).length;

        return {
          ...student,
          bookingCount,
          activeBookings,
        };
      })
      .sort((a, b) => b.bookingCount - a.bookingCount); // Sort by most bookings
  }, [allStudents, allBookings, classes, courses, events, user?.id]);

  const loading =
    loadingStudents ||
    loadingBookings ||
    loadingClasses ||
    loadingCourses ||
    loadingEvents;

  return (
    <TeacherLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-semibold text-foreground">
            Påmeldinger
          </h1>
          <p className="mt-2 text-muted-foreground">
            Oversikt over alle påmeldte som har booket timer hos deg
          </p>
        </div>

        {/* Error Display */}
        {studentsError && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">
            <p className="font-medium">Feil ved lasting:</p>
            <p className="text-sm mt-1">{studentsError.message}</p>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="rounded-lg border border-border bg-white p-6 animate-pulse"
              >
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                  <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Students Grid */}
        {!loading && studentsWithBookings.length === 0 && (
          <div className="rounded-lg border border-border bg-white p-12 text-center">
            <p className="text-lg text-muted-foreground">
              Ingen påmeldinger ennå
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Når noen booker timer vil de vises her
            </p>
          </div>
        )}

        {!loading && studentsWithBookings.length > 0 && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {studentsWithBookings.map((student) => (
              <div
                key={student.id}
                className="rounded-lg border border-border bg-white p-6 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() =>
                  navigate(
                    ROUTES.TEACHER.STUDENTS_DETAIL.replace(":id", student.id),
                  )
                }
              >
                {/* Student Name */}
                <h3 className="text-lg font-semibold text-foreground mb-3">
                  {student.name}
                </h3>

                {/* Contact Info */}
                <div className="space-y-2 mb-4">
                  {student.email && (
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Mail className="h-4 w-4 mr-2 flex-shrink-0" />
                      <span className="truncate">{student.email}</span>
                    </div>
                  )}
                  {student.phone && (
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Phone className="h-4 w-4 mr-2 flex-shrink-0" />
                      <span>{student.phone}</span>
                    </div>
                  )}
                </div>

                {/* Booking Stats */}
                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4 mr-1.5" />
                    <span>{student.activeBookings} aktive</span>
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <CreditCard className="h-4 w-4 mr-1.5" />
                    <span>{student.bookingCount} totalt</span>
                  </div>
                </div>

                {/* Medical Notes Indicator */}
                {student.medicalNotes && (
                  <div className="mt-3 pt-3 border-t border-border">
                    <p className="text-xs text-orange-600 font-medium">
                      ⚕️ Har medisinsk informasjon
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Summary Stats */}
        {!loading && studentsWithBookings.length > 0 && (
          <div className="rounded-lg border border-border bg-blue-50 p-4">
            <p className="text-sm text-blue-800">
              <strong>{studentsWithBookings.length}</strong>{" "}
              {studentsWithBookings.length === 1 ? "påmeldt" : "påmeldte"}{" "}
              totalt
              {" • "}
              <strong>
                {studentsWithBookings.reduce(
                  (sum, s) => sum + s.activeBookings,
                  0,
                )}
              </strong>{" "}
              aktive bookinger
            </p>
          </div>
        )}
      </div>
    </TeacherLayout>
  );
}
