/**
 * Mock API service for courses and events
 */

import type {
  Course,
  Event,
  FilterOptions,
  PaginatedResponse,
  PaginationParams,
} from "@/types";
import { mockCourses, mockEvents } from "@/mock-data/classes";
import { getScenarioData } from "@/mock-data/scenarios";
import { mockApiCall, paginate, filterBySearch, MockApiError } from "./api";
import { generateId } from "@/utils/id";

// DEV ONLY: Check for active scenario
const getActiveCourses = () => {
  if (import.meta.env.MODE === "development") {
    const scenario = localStorage.getItem("yoga_booking_dev_scenario");
    if (scenario) {
      const scenarioData = getScenarioData(scenario);
      if (scenarioData) {
        return scenarioData.courses;
      }
    }
  }
  return courses;
};

const getActiveEvents = () => {
  if (import.meta.env.MODE === "development") {
    const scenario = localStorage.getItem("yoga_booking_dev_scenario");
    if (scenario) {
      const scenarioData = getScenarioData(scenario);
      if (scenarioData) {
        return scenarioData.events;
      }
    }
  }
  return events;
};

// In-memory storage (simulates database)
let courses = [...mockCourses];
let events = [...mockEvents];

// ========== COURSES ==========

/**
 * Get all courses with optional filtering and pagination
 */
export const getCourses = async (
  filters?: FilterOptions,
  pagination?: PaginationParams,
): Promise<PaginatedResponse<Course>> => {
  return mockApiCall(() => {
    // DEV ONLY: Use scenario data if active
    let filtered = [...getActiveCourses()];

    if (filters?.search) {
      filtered = filterBySearch(filtered, filters.search, [
        "name",
        "description",
        "location",
      ]);
    }

    if (filters?.teacherId) {
      filtered = filtered.filter((c) => c.teacherId === filters.teacherId);
    }

    if (filters?.dateFrom) {
      filtered = filtered.filter((c) => {
        const startDate = new Date(c.startDate);
        const endDate = new Date(c.endDate);
        const filterDate = filters.dateFrom!;

        // Include course if it has sessions on or after the filter date
        // (course is ongoing or hasn't ended yet)
        return endDate >= filterDate;
      });
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
 * Get course by ID
 */
export const getCourseById = async (id: string): Promise<Course> => {
  return mockApiCall(() => {
    // DEV ONLY: Use scenario data if active
    const activeCourses = getActiveCourses();
    const course = activeCourses.find((c) => c.id === id);
    if (!course) {
      throw new MockApiError("Course not found", 404);
    }
    return course;
  });
};

/**
 * Create a new course
 */
export const createCourse = async (
  data: Omit<Course, "id" | "createdAt" | "updatedAt" | "enrolledCount">,
): Promise<Course> => {
  return mockApiCall(() => {
    const newCourse: Course = {
      ...data,
      id: generateId(),
      enrolledCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    courses.push(newCourse);
    return newCourse;
  });
};

/**
 * Update a course
 */
export const updateCourse = async (
  id: string,
  data: Partial<Course>,
): Promise<Course> => {
  return mockApiCall(() => {
    const index = courses.findIndex((c) => c.id === id);
    if (index === -1) {
      throw new MockApiError("Course not found", 404);
    }

    courses[index] = {
      ...courses[index],
      ...data,
      id,
      updatedAt: new Date(),
    };

    return courses[index];
  });
};

/**
 * Delete a course
 */
export const deleteCourse = async (id: string): Promise<void> => {
  return mockApiCall(() => {
    const index = courses.findIndex((c) => c.id === id);
    if (index === -1) {
      throw new MockApiError("Course not found", 404);
    }
    courses.splice(index, 1);
  });
};

// ========== EVENTS ==========

/**
 * Get all events with optional filtering and pagination
 */
export const getEvents = async (
  filters?: FilterOptions,
  pagination?: PaginationParams,
): Promise<PaginatedResponse<Event>> => {
  return mockApiCall(() => {
    // DEV ONLY: Use scenario data if active
    let filtered = [...getActiveEvents()];

    if (filters?.search) {
      filtered = filterBySearch(filtered, filters.search, [
        "name",
        "description",
        "location",
        "eventType",
      ]);
    }

    if (filters?.teacherId) {
      filtered = filtered.filter((e) => e.teacherId === filters.teacherId);
    }

    if (filters?.dateFrom) {
      filtered = filtered.filter((e) => new Date(e.date) >= filters.dateFrom!);
    }

    if (filters?.dateTo) {
      filtered = filtered.filter((e) => new Date(e.date) <= filters.dateTo!);
    }

    if (filters?.dropInOnly) {
      filtered = filtered.filter((e) => e.dropInAvailable);
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
 * Get event by ID
 */
export const getEventById = async (id: string): Promise<Event> => {
  return mockApiCall(() => {
    // DEV ONLY: Use scenario data if active
    const activeEvents = getActiveEvents();
    const event = activeEvents.find((e) => e.id === id);
    if (!event) {
      throw new MockApiError("Event not found", 404);
    }
    return event;
  });
};

/**
 * Create a new event
 */
export const createEvent = async (
  data: Omit<Event, "id" | "createdAt" | "updatedAt" | "bookedCount">,
): Promise<Event> => {
  return mockApiCall(() => {
    const newEvent: Event = {
      ...data,
      id: generateId(),
      bookedCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    events.push(newEvent);
    return newEvent;
  });
};

/**
 * Update an event
 */
export const updateEvent = async (
  id: string,
  data: Partial<Event>,
): Promise<Event> => {
  return mockApiCall(() => {
    const index = events.findIndex((e) => e.id === id);
    if (index === -1) {
      throw new MockApiError("Event not found", 404);
    }

    events[index] = {
      ...events[index],
      ...data,
      id,
      updatedAt: new Date(),
    };

    return events[index];
  });
};

/**
 * Delete an event
 */
export const deleteEvent = async (id: string): Promise<void> => {
  return mockApiCall(() => {
    const index = events.findIndex((e) => e.id === id);
    if (index === -1) {
      throw new MockApiError("Event not found", 404);
    }
    events.splice(index, 1);
  });
};
