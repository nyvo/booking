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
