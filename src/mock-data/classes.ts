/**
 * Mock data for courses and events
 */

import type { Course, Event, CourseSession } from "@/types";
import { generateSequentialId } from "@/utils/id";
import { addDays, addWeeks } from "date-fns";

const today = new Date();

// Mock course sessions helper
const generateCourseSessions = (
  courseId: string,
  startDate: Date,
  numberOfWeeks: number,
  _dayOfWeek: number,
  startTime: string,
  duration: number,
): CourseSession[] => {
  const sessions: CourseSession[] = [];

  for (let i = 0; i < numberOfWeeks; i++) {
    const sessionDate = addWeeks(startDate, i);
    sessions.push({
      id: generateSequentialId("session", i + 1),
      courseId,
      sessionNumber: i + 1,
      date: sessionDate,
      startTime,
      duration,
      topic: `Uke ${i + 1}`,
      notes: undefined,
    });
  }

  return sessions;
};

// Mock courses
export const mockCourses: Course[] = [
  {
    id: generateSequentialId("course", 1),
    teacherId: "teacher-0001",
    name: "Nybegynner Hatha Yoga - 6 uker",
    description:
      "Perfekt for deg som er helt ny til yoga. Vi går gjennom grunnleggende stillinger, pust og meditasjon over 6 uker.",
    numberOfWeeks: 6,
    startDate: addDays(today, 7),
    recurringDayOfWeek: 2,
    recurringTime: "18:00",
    duration: 75,
    capacity: 12,
    price: 1200,
    location: "Studio A",
    sessions: [],
    enrolledCount: 8,
    createdAt: new Date("2024-09-15"),
    updatedAt: new Date("2024-11-01"),
  },
  {
    id: generateSequentialId("course", 2),
    teacherId: "teacher-0003",
    name: "Ashtanga Yoga Fundamentals - 8 uker",
    description:
      "Lær den tradisjonelle Ashtanga-serien. Strukturert opplegg over 8 uker for å bygge styrke og fleksibilitet.",
    numberOfWeeks: 8,
    startDate: addDays(today, 10),
    recurringDayOfWeek: 4,
    recurringTime: "19:00",
    duration: 90,
    capacity: 10,
    price: 1800,
    location: "Studio B",
    sessions: [],
    enrolledCount: 6,
    createdAt: new Date("2024-09-20"),
    updatedAt: new Date("2024-11-02"),
  },
  {
    id: generateSequentialId("course", 3),
    teacherId: "teacher-0005",
    name: "Prenatal Yoga - 4 uker",
    description:
      "Yoga spesielt tilpasset gravide. Fokus på å styrke kroppen og forberede til fødsel.",
    numberOfWeeks: 4,
    startDate: addDays(today, 5),
    recurringDayOfWeek: 6,
    recurringTime: "11:00",
    duration: 60,
    capacity: 8,
    price: 900,
    location: "Studio C",
    sessions: [],
    enrolledCount: 5,
    createdAt: new Date("2024-10-01"),
    updatedAt: new Date("2024-11-03"),
  },
];

// Generate sessions for each course
mockCourses[0].sessions = generateCourseSessions(
  mockCourses[0].id,
  mockCourses[0].startDate,
  mockCourses[0].numberOfWeeks,
  mockCourses[0].recurringDayOfWeek,
  mockCourses[0].recurringTime,
  mockCourses[0].duration,
);

mockCourses[1].sessions = generateCourseSessions(
  mockCourses[1].id,
  mockCourses[1].startDate,
  mockCourses[1].numberOfWeeks,
  mockCourses[1].recurringDayOfWeek,
  mockCourses[1].recurringTime,
  mockCourses[1].duration,
);

mockCourses[2].sessions = generateCourseSessions(
  mockCourses[2].id,
  mockCourses[2].startDate,
  mockCourses[2].numberOfWeeks,
  mockCourses[2].recurringDayOfWeek,
  mockCourses[2].recurringTime,
  mockCourses[2].duration,
);

// Mock events
export const mockEvents: Event[] = [
  {
    id: generateSequentialId("event", 1),
    teacherId: "teacher-0001",
    name: "Workshop: Avanserte balanser",
    description:
      "En 3-timers workshop der vi jobber med utfordrende balanseposisjoner. For øvede praktiserende.",
    eventType: "Workshop",
    date: addDays(today, 14),
    startTime: "13:00",
    duration: 180,
    capacity: 15,
    price: 600,
    location: "Studio A",
    dropInAvailable: false,
    bookedCount: 11,
    createdAt: new Date("2024-10-15"),
    updatedAt: new Date("2024-11-01"),
  },
  {
    id: generateSequentialId("event", 2),
    teacherId: "teacher-0002",
    name: "Yoga & Mindfulness Retreat",
    description:
      "Heldags retreat med yoga, meditasjon og mindfulness-øvelser. Inkluderer vegetarisk lunsj.",
    eventType: "Retreat",
    date: addDays(today, 21),
    startTime: "09:00",
    duration: 480,
    capacity: 20,
    price: 1500,
    location: "Retreat-senteret",
    dropInAvailable: false,
    bookedCount: 15,
    createdAt: new Date("2024-10-20"),
    updatedAt: new Date("2024-11-02"),
  },
  {
    id: generateSequentialId("event", 3),
    teacherId: "teacher-0003",
    name: "Julespecial: Restorative Yoga",
    description:
      "Kom og slapp av før julestresset. Rolig restorative yoga med tente lys og varme tepper.",
    eventType: "Spesialarrangement",
    date: addDays(today, 30),
    startTime: "18:00",
    duration: 90,
    capacity: 18,
    price: 350,
    location: "Studio A",
    dropInAvailable: true,
    bookedCount: 6,
    createdAt: new Date("2024-10-25"),
    updatedAt: new Date("2024-11-03"),
  },
];

/**
 * Get course by ID
 */
export const getCourseById = (id: string): Course | undefined => {
  return mockCourses.find((c) => c.id === id);
};

/**
 * Get event by ID
 */
export const getEventById = (id: string): Event | undefined => {
  return mockEvents.find((e) => e.id === id);
};
