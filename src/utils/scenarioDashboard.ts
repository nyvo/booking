/**
 * Scenario-based Dashboard Data
 *
 * DEV ONLY: Provides scenario-specific data for testing dashboard states.
 * This keeps scenario logic separate from the main dashboard component.
 */

import { addDays, startOfWeek } from "date-fns";
import type { Course, Event } from "@/types";
import type { Scenario } from "@/contexts/ScenarioContext";

const today = new Date();
today.setHours(0, 0, 0, 0);

const thisMonday = startOfWeek(today, { weekStartsOn: 1 });
const thisWeekend = addDays(thisMonday, 5); // Saturday
const nextWeek = addDays(thisMonday, 7);

/**
 * Generate mock courses for a scenario
 */
function generateScenarioCourse(
  id: string,
  name: string,
  startDate: Date,
  recurringDayOfWeek: number,
  enrolledCount: number,
  capacity: number,
): Course {
  return {
    id,
    teacherId: "teacher-0001",
    name,
    description: `Mock course for scenario testing`,
    numberOfWeeks: 8,
    startDate,
    recurringDayOfWeek,
    recurringTime: "18:00",
    duration: 90,
    capacity,
    price: 1500,
    location: "Studio A",
    sessions: [],
    enrolledCount,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

/**
 * Generate mock event for a scenario
 */
function generateScenarioEvent(
  id: string,
  name: string,
  date: Date,
  bookedCount: number,
  capacity: number,
): Event {
  return {
    id,
    teacherId: "teacher-0001",
    name,
    description: `Mock event for scenario testing`,
    eventType: "Workshop",
    date,
    startTime: "19:00",
    duration: 120,
    capacity,
    price: 450,
    location: "Studio B",
    dropInAvailable: true,
    bookedCount,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

/**
 * Get dashboard data based on selected scenario
 *
 * This function returns scenario-specific courses and events
 * to test different dashboard states in development.
 */
export function getScenarioDashboardData(scenario: Scenario): {
  courses: Course[];
  events: Event[];
} {
  switch (scenario) {
    case "empty":
      // No courses or events - tests empty state
      return {
        courses: [],
        events: [],
      };

    case "fullyBooked":
      // All courses/events are fully booked
      return {
        courses: [
          generateScenarioCourse(
            "scenario-course-1",
            "Fullbooket Morgenyoga",
            thisMonday,
            1,
            12,
            12,
          ),
          generateScenarioCourse(
            "scenario-course-2",
            "Fullbooket Kveldyoga",
            addDays(thisMonday, 2),
            3,
            15,
            15,
          ),
        ],
        events: [
          generateScenarioEvent(
            "scenario-event-1",
            "Fullbooket Workshop",
            addDays(today, 2),
            20,
            20,
          ),
        ],
      };

    case "partialBooked":
      // Some courses with available spots
      return {
        courses: [
          generateScenarioCourse(
            "scenario-course-1",
            "Hatha Yoga - Ledige plasser",
            thisMonday,
            1,
            6,
            12,
          ),
          generateScenarioCourse(
            "scenario-course-2",
            "Vinyasa Flow",
            addDays(thisMonday, 1),
            2,
            10,
            15,
          ),
        ],
        events: [
          generateScenarioEvent(
            "scenario-event-1",
            "Breathwork Workshop",
            addDays(today, 3),
            8,
            15,
          ),
        ],
      };

    case "noCourses":
      // Only events, no courses
      return {
        courses: [],
        events: [
          generateScenarioEvent(
            "scenario-event-1",
            "Yoga Retreat",
            addDays(today, 1),
            12,
            20,
          ),
          generateScenarioEvent(
            "scenario-event-2",
            "Meditation Workshop",
            addDays(today, 4),
            8,
            15,
          ),
        ],
      };

    case "noEvents":
      // Only courses, no events
      return {
        courses: [
          generateScenarioCourse(
            "scenario-course-1",
            "Nybegynner Yoga",
            thisMonday,
            1,
            8,
            12,
          ),
          generateScenarioCourse(
            "scenario-course-2",
            "Power Yoga",
            addDays(thisMonday, 2),
            3,
            11,
            15,
          ),
          generateScenarioCourse(
            "scenario-course-3",
            "Yin Yoga",
            addDays(thisMonday, 4),
            5,
            7,
            10,
          ),
        ],
        events: [],
      };

    case "manyStudents":
      // Multiple courses with many students
      return {
        courses: [
          generateScenarioCourse(
            "scenario-course-1",
            "Populær Morgenyoga",
            thisMonday,
            1,
            18,
            20,
          ),
          generateScenarioCourse(
            "scenario-course-2",
            "Kveld Vinyasa",
            addDays(thisMonday, 1),
            2,
            22,
            25,
          ),
          generateScenarioCourse(
            "scenario-course-3",
            "Weekend Flow",
            thisWeekend,
            6,
            19,
            20,
          ),
        ],
        events: [
          generateScenarioEvent(
            "scenario-event-1",
            "Community Yoga Day",
            addDays(today, 2),
            45,
            50,
          ),
        ],
      };

    case "unpaidBills":
      // Same as normal, but with unpaid bills (doesn't affect dashboard display)
      return {
        courses: [
          generateScenarioCourse(
            "scenario-course-1",
            "Premium Yoga Series",
            thisMonday,
            1,
            8,
            10,
          ),
        ],
        events: [
          generateScenarioEvent(
            "scenario-event-1",
            "Advanced Workshop",
            addDays(today, -5), // Past event
            12,
            15,
          ),
        ],
      };

    case "normal":
    default:
      // Normal scenario with a good mix of courses and events
      return {
        courses: [
          generateScenarioCourse(
            "scenario-course-1",
            "Morgen Hatha Yoga",
            thisMonday,
            1,
            8,
            12,
          ),
          generateScenarioCourse(
            "scenario-course-2",
            "Vinyasa Flow - Kveld",
            addDays(thisMonday, 1),
            2,
            11,
            15,
          ),
          generateScenarioCourse(
            "scenario-course-3",
            "Yin Yoga & Meditasjon",
            addDays(thisMonday, 2),
            3,
            7,
            10,
          ),
        ],
        events: [
          generateScenarioEvent(
            "scenario-event-1",
            "Breathwork & Sound Bath",
            addDays(today, 2),
            14,
            20,
          ),
          generateScenarioEvent(
            "scenario-event-2",
            "Yoga for Løpere",
            thisWeekend,
            8,
            15,
          ),
        ],
      };
  }
}

/**
 * Check if we should use scenario data (DEV mode only)
 */
export function shouldUseScenarioData(): boolean {
  return import.meta.env.MODE === "development";
}
