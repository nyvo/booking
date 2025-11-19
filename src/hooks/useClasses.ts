/**
 * Custom hooks for managing courses and events
 */

import { useState, useEffect } from "react";
import type {
  Course,
  Event,
  FilterOptions,
  PaginatedResponse,
  PaginationParams,
  Student,
} from "@/types";
import {
  getCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
} from "@/services/classService";
import { getBookings } from "@/services/bookingService";
import { getStudents } from "@/services/userService";

// ========== COURSES ==========

/**
 * Hook to fetch courses with filtering and pagination
 */
export const useCourses = (
  filters?: FilterOptions,
  pagination?: PaginationParams,
) => {
  const [data, setData] = useState<PaginatedResponse<Course> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        const result = await getCourses(filters || {}, pagination);
        setData(result);
        setError(null);
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error("Failed to fetch courses"),
        );
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [filters, pagination]);

  return { data, loading, error };
};

/**
 * Hook to fetch a single course by ID
 */
export const useCourse = (id: string | undefined) => {
  const [data, setData] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    const fetchCourse = async () => {
      try {
        setLoading(true);
        const result = await getCourseById(id);
        setData(result);
        setError(null);
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error("Failed to fetch course"),
        );
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [id]);

  return { data, loading, error };
};

/**
 * Hook to manage course mutations (create, update, delete)
 */
export const useCourseMutations = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const create = async (
    data: Omit<Course, "id" | "createdAt" | "updatedAt" | "enrolledCount">,
  ) => {
    try {
      setLoading(true);
      setError(null);
      const result = await createCourse(data);
      return result;
    } catch (err) {
      const error =
        err instanceof Error ? err : new Error("Failed to create course");
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const update = async (id: string, data: Partial<Course>) => {
    try {
      setLoading(true);
      setError(null);
      const result = await updateCourse(id, data);
      return result;
    } catch (err) {
      const error =
        err instanceof Error ? err : new Error("Failed to update course");
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
      await deleteCourse(id);
    } catch (err) {
      const error =
        err instanceof Error ? err : new Error("Failed to delete course");
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return { create, update, remove, loading, error };
};

// ========== EVENT PARTICIPANTS ==========

/**
 * Hook to fetch participants registered for a specific event
 */
export const useEventParticipants = (eventId: string | undefined) => {
  const [data, setData] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!eventId) {
      setLoading(false);
      return;
    }

    const fetchEventParticipants = async () => {
      try {
        setLoading(true);

        // Fetch all bookings and students
        const [bookingsResponse, studentsResponse] = await Promise.all([
          getBookings({}),
          getStudents(),
        ]);

        const allBookings = bookingsResponse.data;
        const allStudents = studentsResponse;

        // Filter bookings for this specific event
        const eventBookings = allBookings.filter(
          (booking) =>
            booking.itemId === eventId && booking.itemType === "event",
        );

        // Get unique student IDs from these bookings
        const studentIds = new Set(
          eventBookings.map((booking) => booking.studentId),
        );

        // Get registered participants with additional info
        const registeredParticipants = allStudents
          .filter((student) => studentIds.has(student.id))
          .map((student) => {
            const studentBookings = eventBookings.filter(
              (b) => b.studentId === student.id,
            );

            // Check if student is new (first booking within last 7 days)
            const firstBooking = studentBookings.sort(
              (a, b) =>
                new Date(a.createdAt || 0).getTime() -
                new Date(b.createdAt || 0).getTime(),
            )[0];
            const isNew =
              firstBooking &&
              firstBooking.createdAt &&
              new Date().getTime() -
                new Date(firstBooking.createdAt).getTime() <
                7 * 24 * 60 * 60 * 1000;

            const activeBookings = studentBookings.filter(
              (b) => b.status !== "cancelled",
            ).length;

            return {
              ...student,
              isNew,
              activeBookings,
              bookingCount: studentBookings.length,
            };
          });

        setData(registeredParticipants);
        setError(null);
      } catch (err) {
        setError(
          err instanceof Error
            ? err
            : new Error("Failed to fetch event participants"),
        );
      } finally {
        setLoading(false);
      }
    };

    fetchEventParticipants();
  }, [eventId]);

  return { data, loading, error };
};

// ========== COURSE STUDENTS ==========

/**
 * Hook to fetch students enrolled in a specific course
 */
export const useCourseStudents = (courseId: string | undefined) => {
  const [data, setData] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!courseId) {
      setLoading(false);
      return;
    }

    const fetchCourseStudents = async () => {
      try {
        setLoading(true);

        // Fetch all bookings and students
        const [bookingsResponse, studentsResponse] = await Promise.all([
          getBookings({}),
          getStudents(),
        ]);

        const allBookings = bookingsResponse.data;
        const allStudents = studentsResponse;

        // Filter bookings for this specific course
        const courseBookings = allBookings.filter(
          (booking) =>
            booking.itemId === courseId && booking.itemType === "course",
        );

        // Get unique student IDs from these bookings
        const studentIds = new Set(
          courseBookings.map((booking) => booking.studentId),
        );

        // Get enrolled students with additional info
        const enrolledStudents = allStudents
          .filter((student) => studentIds.has(student.id))
          .map((student) => {
            const studentBookings = courseBookings.filter(
              (b) => b.studentId === student.id,
            );

            // Check if student is new (first booking within last 7 days)
            const firstBooking = studentBookings.sort(
              (a, b) =>
                new Date(a.createdAt || 0).getTime() -
                new Date(b.createdAt || 0).getTime(),
            )[0];
            const isNew =
              firstBooking &&
              firstBooking.createdAt &&
              new Date().getTime() -
                new Date(firstBooking.createdAt).getTime() <
                7 * 24 * 60 * 60 * 1000;

            const activeBookings = studentBookings.filter(
              (b) => b.status !== "cancelled",
            ).length;

            return {
              ...student,
              isNew,
              activeBookings,
              bookingCount: studentBookings.length,
            };
          });

        setData(enrolledStudents);
        setError(null);
      } catch (err) {
        setError(
          err instanceof Error
            ? err
            : new Error("Failed to fetch course students"),
        );
      } finally {
        setLoading(false);
      }
    };

    fetchCourseStudents();
  }, [courseId]);

  return { data, loading, error };
};

// ========== EVENTS ==========

/**
 * Hook to fetch events with filtering and pagination
 */
export const useEvents = (
  filters?: FilterOptions,
  pagination?: PaginationParams,
) => {
  const [data, setData] = useState<PaginatedResponse<Event> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const result = await getEvents(filters || {}, pagination);
        setData(result);
        setError(null);
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error("Failed to fetch events"),
        );
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [filters, pagination]);

  return { data, loading, error };
};

/**
 * Hook to fetch a single event by ID
 */
export const useEvent = (id: string | undefined) => {
  const [data, setData] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    const fetchEvent = async () => {
      try {
        setLoading(true);
        const result = await getEventById(id);
        setData(result);
        setError(null);
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error("Failed to fetch event"),
        );
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [id]);

  return { data, loading, error };
};

/**
 * Hook to manage event mutations (create, update, delete)
 */
export const useEventMutations = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const create = async (
    data: Omit<Event, "id" | "createdAt" | "updatedAt" | "bookedCount">,
  ) => {
    try {
      setLoading(true);
      setError(null);
      const result = await createEvent(data);
      return result;
    } catch (err) {
      const error =
        err instanceof Error ? err : new Error("Failed to create event");
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const update = async (id: string, data: Partial<Event>) => {
    try {
      setLoading(true);
      setError(null);
      const result = await updateEvent(id, data);
      return result;
    } catch (err) {
      const error =
        err instanceof Error ? err : new Error("Failed to update event");
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
      await deleteEvent(id);
    } catch (err) {
      const error =
        err instanceof Error ? err : new Error("Failed to delete event");
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return { create, update, remove, loading, error };
};
