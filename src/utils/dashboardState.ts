/**
 * Dashboard State Logic
 *
 * All logic for deriving dashboard UI state lives here.
 * This keeps the component clean and makes the logic easy to test.
 */

import type { Course, Event } from "@/types";

/**
 * Union type for dashboard items (courses or events)
 */
export type DashboardItem = {
  type: "course" | "event";
  data: Course | Event;
  date: Date;
  time: string;
  location: string;
  enrolled: number;
  capacity: number;
};

/**
 * Dashboard state - simple and clean
 */
export type DashboardState = {
  // All upcoming items, sorted chronologically
  allUpcoming: DashboardItem[];

  // First upcoming item (for hero card)
  nextSession: DashboardItem | null;

  // Remaining upcoming items (allUpcoming minus nextSession)
  remainingUpcoming: DashboardItem[];

  // Convenience flag
  hasUpcoming: boolean;
};

/**
 * Convert Course to DashboardItem
 */
function courseToDashboardItem(course: Course): DashboardItem {
  return {
    type: "course",
    data: course,
    date: new Date(course.startDate),
    time: course.recurringTime,
    location: course.location,
    enrolled: course.enrolledCount,
    capacity: course.capacity,
  };
}

/**
 * Convert Event to DashboardItem
 */
function eventToDashboardItem(event: Event): DashboardItem {
  return {
    type: "event",
    data: event,
    date: new Date(event.date),
    time: event.startTime,
    location: event.location,
    enrolled: event.bookedCount,
    capacity: event.capacity,
  };
}

/**
 * Main function to derive dashboard state from raw data
 *
 * This is a pure function with no side effects, making it easy to test.
 * All date/time logic is centralized here instead of scattered in JSX.
 *
 * @param courses - List of courses
 * @param events - List of events
 * @param referenceDate - Date to use as "now" (defaults to actual now)
 * @returns Complete dashboard state
 */
export function getDashboardState(
  courses: Course[],
  events: Event[],
  referenceDate: Date = new Date(),
): DashboardState {
  // Normalize reference date to start of day for consistent comparisons
  const now = new Date(referenceDate);
  now.setHours(0, 0, 0, 0);

  // Convert all courses and events to common format
  const courseItems = courses.map(courseToDashboardItem);
  const eventItems = events.map(eventToDashboardItem);

  // Combine and sort by date
  const allItems = [...courseItems, ...eventItems].sort(
    (a, b) => a.date.getTime() - b.date.getTime(),
  );

  // Filter items that are upcoming (today or future)
  const allUpcoming = allItems.filter((item) => {
    const itemDate = new Date(item.date);
    itemDate.setHours(0, 0, 0, 0);
    return itemDate >= now;
  });

  // Next session is the first in the upcoming list
  const nextSession = allUpcoming[0] || null;

  // Remaining upcoming sessions (exclude the next session)
  const remainingUpcoming = allUpcoming.slice(1);

  return {
    allUpcoming,
    nextSession,
    remainingUpcoming,
    hasUpcoming: allUpcoming.length > 0,
  };
}

/**
 * Get a display label for a dashboard item
 */
export function getDashboardItemLabel(item: DashboardItem): string {
  return item.type === "course" ? "Kurs" : "Arrangement";
}

/**
 * Get a display name for a dashboard item
 */
export function getDashboardItemName(item: DashboardItem): string {
  return item.data.name;
}

/**
 * Get a date label for an item (e.g., "i dag", "mandag 19:00", etc.)
 */
export function getDateLabel(item: DashboardItem): string {
  const itemDate = new Date(item.date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const itemDateNormalized = new Date(itemDate);
  itemDateNormalized.setHours(0, 0, 0, 0);

  // Check if it's today
  if (itemDateNormalized.getTime() === today.getTime()) {
    return "i dag";
  }

  // Otherwise return weekday name in Norwegian
  const weekdays = [
    "søndag",
    "mandag",
    "tirsdag",
    "onsdag",
    "torsdag",
    "fredag",
    "lørdag",
  ];
  const weekday = weekdays[itemDate.getDay()];
  return weekday;
}
