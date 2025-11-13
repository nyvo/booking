/**
 * Custom hooks for managing bookings and payments
 */

import { useState, useEffect } from "react";
import type {
  Booking,
  Payment,
  FilterOptions,
  PaginatedResponse,
  PaginationParams,
} from "@/types";
import {
  getBookings,
  getBookingById,
  getBookingsByStudentId,
  createBooking,
  updateBooking,
  cancelBooking,
  deleteBooking,
  getPayments,
  getPaymentsByTeacherId,
  createPayment,
  updatePayment,
  markPaymentAsPaid,
  getTeacherRevenue,
} from "@/services/bookingService";

/**
 * Hook to fetch bookings with filtering and pagination
 */
export const useBookings = (
  filters?: FilterOptions,
  pagination?: PaginationParams,
) => {
  const [data, setData] = useState<PaginatedResponse<Booking> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Skip fetching if filters is undefined (waiting for required data)
    if (!filters) {
      setLoading(false);
      return;
    }

    const fetchBookings = async () => {
      try {
        setLoading(true);
        const result = await getBookings(filters, pagination);
        setData(result);
        setError(null);
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error("Failed to fetch bookings"),
        );
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [filters, pagination]);

  return { data, loading, error };
};

/**
 * Hook to fetch bookings by student ID
 */
export const useStudentBookings = (studentId: string | undefined) => {
  const [data, setData] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!studentId) {
      setLoading(false);
      return;
    }

    const fetchBookings = async () => {
      try {
        setLoading(true);
        const result = await getBookingsByStudentId(studentId);
        setData(result);
        setError(null);
      } catch (err) {
        setError(
          err instanceof Error
            ? err
            : new Error("Failed to fetch student bookings"),
        );
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [studentId]);

  return { data, loading, error };
};

/**
 * Hook to fetch a single booking by ID
 */
export const useBooking = (id: string | undefined) => {
  const [data, setData] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    const fetchBooking = async () => {
      try {
        setLoading(true);
        const result = await getBookingById(id);
        setData(result);
        setError(null);
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error("Failed to fetch booking"),
        );
      } finally {
        setLoading(false);
      }
    };

    fetchBooking();
  }, [id]);

  return { data, loading, error };
};

/**
 * Hook to manage booking mutations (create, update, cancel, delete)
 */
export const useBookingMutations = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const create = async (
    data: Omit<
      Booking,
      "id" | "createdAt" | "updatedAt" | "status" | "paymentId"
    >,
  ) => {
    try {
      setLoading(true);
      setError(null);
      const result = await createBooking(data);
      return result;
    } catch (err) {
      const error =
        err instanceof Error ? err : new Error("Failed to create booking");
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const update = async (id: string, data: Partial<Booking>) => {
    try {
      setLoading(true);
      setError(null);
      const result = await updateBooking(id, data);
      return result;
    } catch (err) {
      const error =
        err instanceof Error ? err : new Error("Failed to update booking");
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const cancel = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      const result = await cancelBooking(id);
      return result;
    } catch (err) {
      const error =
        err instanceof Error ? err : new Error("Failed to cancel booking");
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const remove = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      await deleteBooking(id);
    } catch (err) {
      const error =
        err instanceof Error ? err : new Error("Failed to delete booking");
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return { create, update, cancel, remove, loading, error };
};

// ========== PAYMENTS ==========

/**
 * Hook to fetch payments with filtering and pagination
 */
export const usePayments = (
  filters?: FilterOptions,
  pagination?: PaginationParams,
) => {
  const [data, setData] = useState<PaginatedResponse<Payment> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Skip fetching if filters is undefined (waiting for required data)
    if (!filters) {
      setLoading(false);
      return;
    }

    const fetchPayments = async () => {
      try {
        setLoading(true);
        const result = await getPayments(filters, pagination);
        setData(result);
        setError(null);
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error("Failed to fetch payments"),
        );
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, [filters, pagination]);

  return { data, loading, error };
};

/**
 * Hook to fetch payments by teacher ID
 */
export const useTeacherPayments = (teacherId: string | undefined) => {
  const [data, setData] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!teacherId) {
      setLoading(false);
      return;
    }

    const fetchPayments = async () => {
      try {
        setLoading(true);
        const result = await getPaymentsByTeacherId(teacherId);
        setData(result);
        setError(null);
      } catch (err) {
        setError(
          err instanceof Error
            ? err
            : new Error("Failed to fetch teacher payments"),
        );
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, [teacherId]);

  return { data, loading, error };
};

/**
 * Hook to fetch teacher revenue statistics
 */
export const useTeacherRevenue = (teacherId: string | undefined) => {
  const [data, setData] = useState<{
    total: number;
    paid: number;
    pending: number;
    overdue: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!teacherId) {
      setLoading(false);
      return;
    }

    const fetchRevenue = async () => {
      try {
        setLoading(true);
        const result = await getTeacherRevenue(teacherId);
        setData(result);
        setError(null);
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error("Failed to fetch revenue"),
        );
      } finally {
        setLoading(false);
      }
    };

    fetchRevenue();
  }, [teacherId]);

  return { data, loading, error };
};

/**
 * Hook to manage payment mutations
 */
export const usePaymentMutations = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const create = async (
    data: Omit<
      Payment,
      "id" | "createdAt" | "updatedAt" | "status" | "paidAt" | "transactionId"
    >,
  ) => {
    try {
      setLoading(true);
      setError(null);
      const result = await createPayment(data);
      return result;
    } catch (err) {
      const error =
        err instanceof Error ? err : new Error("Failed to create payment");
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const update = async (id: string, data: Partial<Payment>) => {
    try {
      setLoading(true);
      setError(null);
      const result = await updatePayment(id, data);
      return result;
    } catch (err) {
      const error =
        err instanceof Error ? err : new Error("Failed to update payment");
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const markAsPaid = async (
    id: string,
    transactionId: string,
    paymentMethod: string,
  ) => {
    try {
      setLoading(true);
      setError(null);
      const result = await markPaymentAsPaid(id, transactionId, paymentMethod);
      return result;
    } catch (err) {
      const error =
        err instanceof Error
          ? err
          : new Error("Failed to mark payment as paid");
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return { create, update, markAsPaid, loading, error };
};
