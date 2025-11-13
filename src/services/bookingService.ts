/**
 * Mock API service for bookings and payments
 */

import type {
  Booking,
  Payment,
  FilterOptions,
  PaginatedResponse,
  PaginationParams,
  User,
} from "@/types";
import { mockBookings, mockPayments } from "@/mock-data/bookings";
import { mockApiCall, paginate, MockApiError } from "./api";
import { generateId } from "@/utils/id";
import { CURRENCY } from "@/config/constants";

// In-memory storage
let bookings = [...mockBookings];
let payments = [...mockPayments];

const SESSION_KEY = "yoga_booking_user";

/**
 * Get current authenticated user from session (for authorization checks)
 */
const getCurrentAuthUser = (): User | null => {
  const stored = sessionStorage.getItem(SESSION_KEY);
  if (stored) {
    try {
      return JSON.parse(stored) as User;
    } catch {
      return null;
    }
  }
  return null;
};

/**
 * Get all bookings with optional filtering and pagination
 */
export const getBookings = async (
  filters?: FilterOptions,
  pagination?: PaginationParams,
): Promise<PaginatedResponse<Booking>> => {
  return mockApiCall(() => {
    let filtered = [...bookings];

    if (filters?.status) {
      filtered = filtered.filter((b) => b.status === filters.status);
    }

    if (filters?.dateFrom) {
      filtered = filtered.filter(
        (b) => new Date(b.bookingDate) >= filters.dateFrom!,
      );
    }

    if (filters?.dateTo) {
      filtered = filtered.filter(
        (b) => new Date(b.bookingDate) <= filters.dateTo!,
      );
    }

    if (pagination) {
      return paginate(filtered, pagination);
    }

    return {
      data: filtered,
      total: filtered.length,
      page: 1,
      pageSize: filtered.length,
      totalPages: 1,
    };
  });
};

/**
 * Get bookings by student ID
 */
export const getBookingsByStudentId = async (
  studentId: string,
): Promise<Booking[]> => {
  return mockApiCall(() => {
    const currentUser = getCurrentAuthUser();

    // Authorization: Users can only see their own bookings (or teachers can see all)
    if (!currentUser) {
      throw new MockApiError("Unauthorized: Authentication required", 401);
    }

    if (currentUser.role === "student" && currentUser.id !== studentId) {
      throw new MockApiError(
        "Unauthorized: You can only view your own bookings",
        403,
      );
    }

    return bookings.filter((b) => b.studentId === studentId);
  });
};

/**
 * Get booking by ID
 */
export const getBookingById = async (id: string): Promise<Booking> => {
  return mockApiCall(() => {
    const booking = bookings.find((b) => b.id === id);
    if (!booking) {
      throw new MockApiError("Booking not found", 404);
    }
    return booking;
  });
};

/**
 * Create a new booking
 */
export const createBooking = async (
  data: Omit<
    Booking,
    "id" | "createdAt" | "updatedAt" | "status" | "paymentId"
  >,
): Promise<Booking> => {
  return mockApiCall(() => {
    const currentUser = getCurrentAuthUser();

    // Authorization: Students can only create bookings for themselves
    if (!currentUser) {
      throw new MockApiError("Unauthorized: Authentication required", 401);
    }

    if (currentUser.role === "student" && currentUser.id !== data.studentId) {
      throw new MockApiError(
        "Unauthorized: You can only create bookings for yourself",
        403,
      );
    }

    const newBooking: Booking = {
      ...data,
      id: generateId(),
      status: "pending",
      paymentId: undefined,
      bookingDate: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    bookings.push(newBooking);
    return newBooking;
  });
};

/**
 * Update a booking
 */
export const updateBooking = async (
  id: string,
  data: Partial<Booking>,
): Promise<Booking> => {
  return mockApiCall(() => {
    const currentUser = getCurrentAuthUser();

    if (!currentUser) {
      throw new MockApiError("Unauthorized: Authentication required", 401);
    }

    const index = bookings.findIndex((b) => b.id === id);
    if (index === -1) {
      throw new MockApiError("Booking not found", 404);
    }

    const booking = bookings[index];

    // Authorization: Students can only update their own bookings, teachers can update any
    if (
      currentUser.role === "student" &&
      currentUser.id !== booking.studentId
    ) {
      throw new MockApiError(
        "Unauthorized: You can only update your own bookings",
        403,
      );
    }

    bookings[index] = {
      ...bookings[index],
      ...data,
      id,
      updatedAt: new Date(),
    };

    return bookings[index];
  });
};

/**
 * Cancel a booking
 */
export const cancelBooking = async (id: string): Promise<Booking> => {
  return updateBooking(id, { status: "cancelled" });
};

/**
 * Delete a booking
 */
export const deleteBooking = async (id: string): Promise<void> => {
  return mockApiCall(() => {
    const currentUser = getCurrentAuthUser();

    if (!currentUser) {
      throw new MockApiError("Unauthorized: Authentication required", 401);
    }

    const index = bookings.findIndex((b) => b.id === id);
    if (index === -1) {
      throw new MockApiError("Booking not found", 404);
    }

    const booking = bookings[index];

    // Authorization: Students can only delete their own bookings, teachers can delete any
    if (
      currentUser.role === "student" &&
      currentUser.id !== booking.studentId
    ) {
      throw new MockApiError(
        "Unauthorized: You can only delete your own bookings",
        403,
      );
    }

    bookings.splice(index, 1);
  });
};

// ========== PAYMENTS ==========

/**
 * Get all payments with optional filtering and pagination
 */
export const getPayments = async (
  filters?: FilterOptions,
  pagination?: PaginationParams,
): Promise<PaginatedResponse<Payment>> => {
  return mockApiCall(() => {
    let filtered = [...payments];

    if (filters?.status) {
      filtered = filtered.filter((p) => p.status === filters.status);
    }

    if (filters?.teacherId) {
      filtered = filtered.filter((p) => p.teacherId === filters.teacherId);
    }

    if (filters?.dateFrom) {
      filtered = filtered.filter(
        (p) => p.createdAt && new Date(p.createdAt) >= filters.dateFrom!,
      );
    }

    if (filters?.dateTo) {
      filtered = filtered.filter(
        (p) => p.createdAt && new Date(p.createdAt) <= filters.dateTo!,
      );
    }

    if (pagination) {
      return paginate(filtered, pagination);
    }

    return {
      data: filtered,
      total: filtered.length,
      page: 1,
      pageSize: filtered.length,
      totalPages: 1,
    };
  });
};

/**
 * Get payments by teacher ID
 */
export const getPaymentsByTeacherId = async (
  teacherId: string,
): Promise<Payment[]> => {
  return mockApiCall(() => {
    const currentUser = getCurrentAuthUser();

    // Authorization: Only the teacher themselves can view their payments
    if (!currentUser) {
      throw new MockApiError("Unauthorized: Authentication required", 401);
    }

    if (currentUser.role === "teacher" && currentUser.id !== teacherId) {
      throw new MockApiError(
        "Unauthorized: You can only view your own payments",
        403,
      );
    }

    if (currentUser.role === "student") {
      throw new MockApiError(
        "Unauthorized: Students cannot view teacher payments",
        403,
      );
    }

    return payments.filter((p) => p.teacherId === teacherId);
  });
};

/**
 * Get payment by ID
 */
export const getPaymentById = async (id: string): Promise<Payment> => {
  return mockApiCall(() => {
    const payment = payments.find((p) => p.id === id);
    if (!payment) {
      throw new MockApiError("Payment not found", 404);
    }
    return payment;
  });
};

/**
 * Create a new payment
 */
export const createPayment = async (
  data: Omit<
    Payment,
    "id" | "createdAt" | "updatedAt" | "status" | "paidAt" | "transactionId"
  >,
): Promise<Payment> => {
  return mockApiCall(() => {
    const newPayment: Payment = {
      ...data,
      id: generateId(),
      currency: CURRENCY,
      status: "pending",
      paidAt: undefined,
      transactionId: undefined,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    payments.push(newPayment);
    return newPayment;
  });
};

/**
 * Update a payment
 */
export const updatePayment = async (
  id: string,
  data: Partial<Payment>,
): Promise<Payment> => {
  return mockApiCall(() => {
    const index = payments.findIndex((p) => p.id === id);
    if (index === -1) {
      throw new MockApiError("Payment not found", 404);
    }

    payments[index] = {
      ...payments[index],
      ...data,
      id,
      updatedAt: new Date(),
    };

    return payments[index];
  });
};

/**
 * Mark payment as paid
 */
export const markPaymentAsPaid = async (
  id: string,
  transactionId: string,
  paymentMethod: string,
): Promise<Payment> => {
  return updatePayment(id, {
    status: "paid",
    paidAt: new Date(),
    transactionId,
    paymentMethod,
  });
};

/**
 * Get revenue statistics for a teacher
 */
export const getTeacherRevenue = async (
  teacherId: string,
): Promise<{
  total: number;
  paid: number;
  pending: number;
  overdue: number;
}> => {
  return mockApiCall(() => {
    const currentUser = getCurrentAuthUser();

    // Authorization: Only the teacher themselves can view their revenue
    if (!currentUser) {
      throw new MockApiError("Unauthorized: Authentication required", 401);
    }

    if (currentUser.role === "teacher" && currentUser.id !== teacherId) {
      throw new MockApiError(
        "Unauthorized: You can only view your own revenue",
        403,
      );
    }

    if (currentUser.role === "student") {
      throw new MockApiError(
        "Unauthorized: Students cannot view teacher revenue",
        403,
      );
    }

    const teacherPayments = payments.filter((p) => p.teacherId === teacherId);

    const total = teacherPayments.reduce((sum, p) => sum + p.amount, 0);
    const paid = teacherPayments
      .filter((p) => p.status === "paid")
      .reduce((sum, p) => sum + p.amount, 0);
    const pending = teacherPayments
      .filter((p) => p.status === "pending")
      .reduce((sum, p) => sum + p.amount, 0);
    const overdue = teacherPayments
      .filter((p) => p.status === "overdue")
      .reduce((sum, p) => sum + p.amount, 0);

    return { total, paid, pending, overdue };
  });
};
