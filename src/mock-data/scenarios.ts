/**
 * DEV ONLY: Scenario-specific mock data generators
 * These functions generate different data sets based on the selected scenario
 */

import { addDays, startOfWeek, setHours, format, addWeeks } from "date-fns";
import { nb } from "date-fns/locale";
import type {
  Course,
  Event,
  Booking,
  Payment,
  PaymentStatus,
  BookingStatus,
  Student,
} from "@/types";
import { mockStudents } from "./students";

const today = new Date();
const thisMonday = startOfWeek(today, { weekStartsOn: 1 });
const thisWeekend = addDays(thisMonday, 5); // Saturday
const nextWeek = addDays(thisMonday, 7);

// Helper to generate course sessions
function generateCourse(
  courseData: {
    id: string;
    name: string;
    description: string;
    capacity: number;
    enrolledCount: number;
    startDate: Date;
    recurringTime: string;
    duration: number;
    price: number;
    location: string;
    recurringDayOfWeek: number;
  },
  numberOfWeeks: number,
): Course {
  const sessions = [];

  for (let i = 0; i < numberOfWeeks; i++) {
    const sessionDate = addWeeks(courseData.startDate, i);
    sessions.push({
      id: `${courseData.id}-session-${i + 1}`,
      courseId: courseData.id,
      sessionNumber: i + 1,
      date: sessionDate,
      startTime: courseData.recurringTime,
      duration: courseData.duration,
      topic: `Uke ${i + 1}`,
      notes: undefined,
    });
  }

  return {
    id: courseData.id,
    name: courseData.name,
    description: courseData.description,
    teacherId: "teacher-0001",
    numberOfWeeks,
    startDate: courseData.startDate,
    recurringDayOfWeek: courseData.recurringDayOfWeek,
    recurringTime: courseData.recurringTime,
    duration: courseData.duration,
    capacity: courseData.capacity,
    price: courseData.price,
    location: courseData.location,
    sessions,
    enrolledCount: courseData.enrolledCount,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

// Helper to generate an event
function generateEvent(eventData: {
  id: string;
  name: string;
  description: string;
  eventType: string;
  date: Date;
  startTime: string;
  duration: number;
  capacity: number;
  bookedCount: number;
  price: number;
  location: string;
  dropInAvailable: boolean;
}): Event {
  return {
    id: eventData.id,
    name: eventData.name,
    description: eventData.description,
    teacherId: "teacher-0001",
    eventType: eventData.eventType,
    date: eventData.date,
    startTime: eventData.startTime,
    duration: eventData.duration,
    capacity: eventData.capacity,
    bookedCount: eventData.bookedCount,
    price: eventData.price,
    location: eventData.location,
    dropInAvailable: eventData.dropInAvailable,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

// Helper to generate a booking
function generateBooking(
  itemId: string,
  itemType: "course" | "event",
  studentId: string,
  status: BookingStatus = "confirmed",
): Booking {
  const bookingId = `booking-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  return {
    id: bookingId,
    studentId,
    itemId,
    itemType,
    bookingDate: addDays(today, -7),
    status,
    createdAt: addDays(today, -7),
    updatedAt: today,
  };
}

// Helper to generate a payment
function generatePayment(
  booking: Booking,
  amount: number,
  status: PaymentStatus = "pending",
): Payment {
  return {
    id: `payment-${booking.id}`,
    bookingId: booking.id,
    studentId: booking.studentId,
    teacherId: "teacher-0001",
    amount,
    currency: "NOK",
    status,
    dueDate: addDays(today, 7),
    paidAt: status === "paid" ? today : undefined,
    paymentMethod: status === "paid" ? "Vipps" : undefined,
    createdAt: booking.createdAt,
    updatedAt: today,
  };
}

// Generate scenario-specific data
export function getScenarioData(scenario: string) {
  switch (scenario) {
    case "empty":
      return {
        courses: [],
        events: [],
        bookings: [],
        payments: [],
        students: [],
      };

    case "fullyBooked": {
      const course1 = generateCourse(
        {
          id: "course-full-1",
          name: "Hatha Yoga - Fullbooket",
          description: "Fullbooket kurs",
          capacity: 12,
          enrolledCount: 12,
          startDate: thisMonday,
          recurringTime: "18:00",
          duration: 90,
          price: 1800,
          location: "Studio A",
          recurringDayOfWeek: 1,
        },
        8,
      );

      const course2 = generateCourse(
        {
          id: "course-full-2",
          name: "Vinyasa Flow - Fullbooket",
          description: "Fullbooket kurs",
          capacity: 15,
          enrolledCount: 15,
          startDate: addDays(thisMonday, 1),
          recurringTime: "19:00",
          duration: 60,
          price: 1600,
          location: "Studio B",
          recurringDayOfWeek: 2,
        },
        6,
      );

      const event1 = generateEvent({
        id: "event-full-1",
        name: "Yin Yoga Workshop - Fullbooket",
        description: "Fullbooket workshop",
        eventType: "Workshop",
        capacity: 20,
        bookedCount: 20,
        price: 450,
        date: addDays(today, 5),
        startTime: "10:00",
        duration: 180,
        location: "Studio A",
        dropInAvailable: false,
      });

      // Generate bookings for all spots
      const bookings: Booking[] = [];
      const payments: Payment[] = [];

      // Fill course 1
      for (let i = 0; i < 12; i++) {
        const studentIndex = i % mockStudents.length;
        const booking = generateBooking(
          "course-full-1",
          "course",
          mockStudents[studentIndex].id,
          "confirmed",
        );
        bookings.push(booking);
        payments.push(
          generatePayment(booking, 1800, i < 8 ? "paid" : "pending"),
        );
      }

      // Fill course 2
      for (let i = 0; i < 15; i++) {
        const booking = generateBooking(
          "course-full-2",
          "course",
          mockStudents[i % mockStudents.length].id,
          "confirmed",
        );
        bookings.push(booking);
        payments.push(
          generatePayment(booking, 1600, i < 10 ? "paid" : "pending"),
        );
      }

      // Fill event
      for (let i = 0; i < 20; i++) {
        const booking = generateBooking(
          "event-full-1",
          "event",
          mockStudents[i % mockStudents.length].id,
          "confirmed",
        );
        bookings.push(booking);
        payments.push(generatePayment(booking, 450, "paid"));
      }

      return {
        courses: [course1, course2],
        events: [event1],
        bookings,
        payments,
        students: mockStudents.slice(0, 20),
      };
    }

    case "partialBooked": {
      const course1 = generateCourse(
        {
          id: "course-partial-1",
          name: "Morgenyoga",
          description: "Start dagen med energi",
          capacity: 10,
          enrolledCount: 6,
          startDate: thisMonday,
          recurringTime: "07:00",
          duration: 60,
          price: 1500,
          location: "Studio A",
          recurringDayOfWeek: 1,
        },
        8,
      );

      const course2 = generateCourse(
        {
          id: "course-partial-2",
          name: "Kundalini Yoga",
          description: "Kraftfull energi-yoga",
          capacity: 12,
          enrolledCount: 4,
          startDate: addDays(thisMonday, 1),
          recurringTime: "18:30",
          duration: 90,
          price: 1900,
          location: "Studio B",
          recurringDayOfWeek: 2,
        },
        6,
      );

      const event1 = generateEvent({
        id: "event-partial-1",
        name: "Meditasjon og Mindfulness",
        description: "Ro og fokus",
        eventType: "Workshop",
        date: addDays(today, 10),
        startTime: "18:00",
        duration: 120,
        capacity: 15,
        bookedCount: 8,
        price: 350,
        location: "Studio A",
        dropInAvailable: true,
      });

      const event2 = generateEvent({
        id: "event-partial-2",
        name: "Yoga Retreat Helg",
        description: "Helaften med yoga",
        eventType: "Retreat",
        date: addDays(today, 14),
        startTime: "10:00",
        duration: 480,
        capacity: 25,
        bookedCount: 12,
        price: 2500,
        location: "Retreat Senter",
        dropInAvailable: false,
      });

      // Generate partial bookings
      const bookings: Booking[] = [];
      const payments: Payment[] = [];

      // Partial fill course 1
      for (let i = 0; i < 6; i++) {
        const studentIndex = i % mockStudents.length;
        const booking = generateBooking(
          "course-partial-1",
          "course",
          mockStudents[studentIndex].id,
          "confirmed",
        );
        bookings.push(booking);
        payments.push(
          generatePayment(booking, 1500, i < 4 ? "paid" : "pending"),
        );
      }

      // Partial fill course 2
      for (let i = 0; i < 4; i++) {
        const studentIndex = (i + 6) % mockStudents.length;
        const booking = generateBooking(
          "course-partial-2",
          "course",
          mockStudents[studentIndex].id,
          "confirmed",
        );
        bookings.push(booking);
        payments.push(generatePayment(booking, 1900, "paid"));
      }

      // Partial fill events
      for (let i = 0; i < 8; i++) {
        const studentIndex = i % mockStudents.length;
        const booking = generateBooking(
          "event-partial-1",
          "event",
          mockStudents[studentIndex].id,
          "confirmed",
        );
        bookings.push(booking);
        payments.push(generatePayment(booking, 350, "paid"));
      }

      for (let i = 0; i < 12; i++) {
        const studentIndex = i % mockStudents.length;
        const booking = generateBooking(
          "event-partial-2",
          "event",
          mockStudents[studentIndex].id,
          i < 10 ? "confirmed" : "pending",
        );
        bookings.push(booking);
        payments.push(
          generatePayment(booking, 2500, i < 8 ? "paid" : "pending"),
        );
      }

      return {
        courses: [course1, course2],
        events: [event1, event2],
        bookings,
        payments,
        students: mockStudents.slice(0, 12),
      };
    }

    case "noCourses": {
      const event1 = generateEvent({
        id: "event-only-1",
        name: "Breathwork Workshop",
        description: "Utforsk pusteteknikker",
        eventType: "Workshop",
        date: addDays(today, 2),
        startTime: "18:00",
        duration: 120,
        capacity: 20,
        bookedCount: 15,
        price: 400,
        location: "Studio A",
        dropInAvailable: true,
      });

      const event2 = generateEvent({
        id: "event-only-2",
        name: "Sound Bath Healing",
        description: "Healing med lyd",
        eventType: "Workshop",
        date: addDays(today, 7),
        startTime: "19:00",
        duration: 90,
        capacity: 30,
        bookedCount: 22,
        price: 350,
        location: "Studio B",
        dropInAvailable: true,
      });

      const event3 = generateEvent({
        id: "event-only-3",
        name: "Yoga Teacher Training Info",
        description: "Gratis informasjonsmøte",
        eventType: "Info",
        date: addDays(today, 14),
        startTime: "18:30",
        duration: 60,
        capacity: 50,
        bookedCount: 35,
        price: 0,
        location: "Studio A",
        dropInAvailable: true,
      });

      // Generate bookings for events only
      const bookings: Booking[] = [];
      const payments: Payment[] = [];

      for (let i = 0; i < 15; i++) {
        const booking = generateBooking(
          "event-only-1",
          "event",
          mockStudents[i % mockStudents.length].id,
          "confirmed",
        );
        bookings.push(booking);
        if (i < 12) payments.push(generatePayment(booking, 400, "paid"));
      }

      for (let i = 0; i < 22; i++) {
        const booking = generateBooking(
          "event-only-2",
          "event",
          mockStudents[i % mockStudents.length].id,
          "confirmed",
        );
        bookings.push(booking);
        payments.push(
          generatePayment(booking, 350, i < 18 ? "paid" : "pending"),
        );
      }

      return {
        courses: [],
        events: [event1, event2, event3],
        bookings,
        payments,
        students: mockStudents,
      };
    }

    case "noEvents": {
      const course1 = generateCourse(
        {
          id: "course-only-1",
          name: "Ashtanga Yoga Nybegynner",
          description: "Klassisk Ashtanga for nybegynnere",
          capacity: 8,
          enrolledCount: 5,
          startDate: thisMonday,
          recurringTime: "17:00",
          duration: 90,
          price: 2200,
          location: "Studio A",
          recurringDayOfWeek: 1,
        },
        10,
      );

      const course2 = generateCourse(
        {
          id: "course-only-2",
          name: "Restorative Yoga",
          description: "Dyp avslapning",
          capacity: 10,
          enrolledCount: 8,
          startDate: addDays(thisMonday, 2),
          recurringTime: "19:00",
          duration: 60,
          price: 1400,
          location: "Studio B",
          recurringDayOfWeek: 3,
        },
        8,
      );

      const course3 = generateCourse(
        {
          id: "course-only-3",
          name: "Power Yoga",
          description: "Intensiv styrketrening",
          capacity: 15,
          enrolledCount: 10,
          startDate: addDays(thisMonday, 1),
          recurringTime: "18:00",
          duration: 90,
          price: 1800,
          location: "Studio C",
          recurringDayOfWeek: 2,
        },
        12,
      );

      // Generate bookings for courses only
      const bookings: Booking[] = [];
      const payments: Payment[] = [];

      for (let i = 0; i < 5; i++) {
        const studentIndex = i % mockStudents.length;
        const booking = generateBooking(
          "course-only-1",
          "course",
          mockStudents[studentIndex].id,
          "confirmed",
        );
        bookings.push(booking);
        payments.push(generatePayment(booking, 2200, "paid"));
      }

      for (let i = 0; i < 8; i++) {
        const studentIndex = (i + 5) % mockStudents.length;
        const booking = generateBooking(
          "course-only-2",
          "course",
          mockStudents[studentIndex].id,
          "confirmed",
        );
        bookings.push(booking);
        payments.push(
          generatePayment(booking, 1400, i < 6 ? "paid" : "pending"),
        );
      }

      for (let i = 0; i < 10; i++) {
        const studentIndex = i % mockStudents.length;
        const booking = generateBooking(
          "course-only-3",
          "course",
          mockStudents[studentIndex].id,
          "confirmed",
        );
        bookings.push(booking);
        payments.push(generatePayment(booking, 1800, "paid"));
      }

      return {
        courses: [course1, course2, course3],
        events: [],
        bookings,
        payments,
        students: mockStudents.slice(0, 13),
      };
    }

    case "manyStudents": {
      const course1 = generateCourse(
        {
          id: "course-many-1",
          name: "Popular Morning Flow",
          description: "Populær morgentime",
          capacity: 20,
          enrolledCount: 18,
          startDate: thisMonday,
          recurringTime: "06:30",
          duration: 60,
          price: 1600,
          location: "Studio A",
          recurringDayOfWeek: 1,
        },
        20,
      );

      const course2 = generateCourse(
        {
          id: "course-many-2",
          name: "Evening Relaxation",
          description: "Kveldsavslapning",
          capacity: 25,
          enrolledCount: 22,
          startDate: thisMonday,
          recurringTime: "20:00",
          duration: 60,
          price: 1400,
          location: "Studio B",
          recurringDayOfWeek: 1,
        },
        16,
      );

      const event1 = generateEvent({
        id: "event-many-1",
        name: "Community Yoga Day",
        description: "Fellesskap og yoga",
        eventType: "Special",
        date: addDays(today, 3),
        startTime: "10:00",
        duration: 240,
        capacity: 50,
        bookedCount: 45,
        price: 100,
        location: "Park",
        dropInAvailable: true,
      });

      // Generate many bookings
      const bookings: Booking[] = [];
      const payments: Payment[] = [];
      const allStudents = [
        ...mockStudents,
        ...mockStudents.map((s) => ({
          ...s,
          id: `${s.id}-2`,
          email: `2-${s.email}`,
        })),
      ];

      for (let i = 0; i < 18; i++) {
        const booking = generateBooking(
          "course-many-1",
          "course",
          allStudents[i].id,
          "confirmed",
        );
        bookings.push(booking);
        payments.push(generatePayment(booking, 1600, "paid"));
      }

      for (let i = 0; i < 22; i++) {
        const booking = generateBooking(
          "course-many-2",
          "course",
          allStudents[i].id,
          "confirmed",
        );
        bookings.push(booking);
        payments.push(
          generatePayment(booking, 1400, i < 20 ? "paid" : "pending"),
        );
      }

      for (let i = 0; i < 45; i++) {
        const booking = generateBooking(
          "event-many-1",
          "event",
          allStudents[i % allStudents.length].id,
          "confirmed",
        );
        bookings.push(booking);
        payments.push(generatePayment(booking, 100, "paid"));
      }

      return {
        courses: [course1, course2],
        events: [event1],
        bookings,
        payments,
        students: allStudents,
      };
    }

    case "unpaidBills": {
      const course1 = generateCourse(
        {
          id: "course-unpaid-1",
          name: "Premium Yoga Series",
          description: "Eksklusivt kurs",
          capacity: 10,
          enrolledCount: 8,
          startDate: addDays(thisMonday, 1),
          recurringTime: "18:00",
          duration: 120,
          price: 3500,
          location: "Studio A",
          recurringDayOfWeek: 2,
        },
        10,
      );

      const event1 = generateEvent({
        id: "event-unpaid-1",
        name: "Advanced Workshop",
        description: "Workshop for viderekomne",
        eventType: "Workshop",
        date: addDays(today, -5),
        startTime: "10:00",
        duration: 180,
        capacity: 15,
        bookedCount: 12,
        price: 800,
        location: "Studio B",
        dropInAvailable: false,
      });

      // Generate bookings with mostly unpaid payments
      const bookings: Booking[] = [];
      const payments: Payment[] = [];

      for (let i = 0; i < 8; i++) {
        const studentIndex = i % mockStudents.length;
        const booking = generateBooking(
          "course-unpaid-1",
          "course",
          mockStudents[studentIndex].id,
          "confirmed",
        );
        bookings.push(booking);
        // Only 2 have paid
        payments.push(
          generatePayment(
            booking,
            3500,
            i < 2 ? "paid" : i < 6 ? "pending" : "overdue",
          ),
        );
      }

      for (let i = 0; i < 12; i++) {
        const studentIndex = i % mockStudents.length;
        const booking = generateBooking(
          "event-unpaid-1",
          "event",
          mockStudents[studentIndex].id,
          "confirmed",
        );
        bookings.push(booking);
        // Most are unpaid or overdue
        const status: PaymentStatus =
          i < 3 ? "paid" : i < 8 ? "pending" : "overdue";
        const payment = generatePayment(booking, 800, status);
        if (status === "overdue") {
          payment.dueDate = addDays(today, -3).toISOString();
        }
        payments.push(payment);
      }

      return {
        courses: [course1],
        events: [event1],
        bookings,
        payments,
        students: mockStudents.slice(0, 12),
      };
    }

    case "normal":
    default: {
      // Rich default scenario with courses and events happening this week
      const course1 = generateCourse(
        {
          id: "course-normal-1",
          name: "Morgen Hatha Yoga",
          description:
            "Start dagen med en rolig og styrkende yoga-praksis. Perfekt for alle nivåer.",
          capacity: 12,
          enrolledCount: 8,
          startDate: thisMonday,
          recurringTime: "07:00",
          duration: 60,
          price: 1500,
          location: "Studio A",
          recurringDayOfWeek: 1,
        },
        8,
      );

      const course2 = generateCourse(
        {
          id: "course-normal-2",
          name: "Vinyasa Flow - Kveld",
          description:
            "Dynamisk yoga-sekvens som bygger styrke og fleksibilitet. For deg med litt erfaring.",
          capacity: 15,
          enrolledCount: 11,
          startDate: addDays(thisMonday, 1),
          recurringTime: "18:30",
          duration: 90,
          price: 1800,
          location: "Studio B",
          recurringDayOfWeek: 2,
        },
        10,
      );

      const course3 = generateCourse(
        {
          id: "course-normal-3",
          name: "Yin Yoga & Meditasjon",
          description:
            "Dyp avslapning og lange, rolige strekk. Perfekt for stressmestring og fleksibilitet.",
          capacity: 10,
          enrolledCount: 7,
          startDate: addDays(thisMonday, 2),
          recurringTime: "19:00",
          duration: 90,
          price: 1600,
          location: "Studio C",
          recurringDayOfWeek: 3,
        },
        8,
      );

      const course4 = generateCourse(
        {
          id: "course-normal-4",
          name: "Nybegynner Yoga",
          description:
            "Helt ny til yoga? Dette er kurset for deg! Vi går gjennom det grunnleggende i et trygt tempo.",
          capacity: 12,
          enrolledCount: 10,
          startDate: thisMonday,
          recurringTime: "17:00",
          duration: 75,
          price: 1400,
          location: "Studio A",
          recurringDayOfWeek: 1,
        },
        6,
      );

      const course5 = generateCourse(
        {
          id: "course-normal-5",
          name: "Power Yoga Weekend",
          description:
            "Intensiv og utfordrende yoga for de som vil ha en real treningsøkt.",
          capacity: 15,
          enrolledCount: 9,
          startDate: thisWeekend,
          recurringTime: "10:00",
          duration: 90,
          price: 1700,
          location: "Studio B",
          recurringDayOfWeek: 6,
        },
        8,
      );

      // Events happening this week and next
      const event1 = generateEvent({
        id: "event-normal-1",
        name: "Breathwork & Sound Bath",
        description:
          "En transformerende opplevelse med pusteteknikker og healing lyder. Inkluderer te og snacks.",
        eventType: "Workshop",
        date: addDays(today, 2),
        startTime: "18:00",
        duration: 150,
        capacity: 20,
        bookedCount: 14,
        price: 450,
        location: "Studio A",
        dropInAvailable: true,
      });

      const event2 = generateEvent({
        id: "event-normal-2",
        name: "Yoga for Løpere",
        description:
          "Spesialtilpasset workshop for løpere. Fokus på strekk, styrke og skadeforebygging.",
        eventType: "Workshop",
        date: thisWeekend,
        startTime: "13:00",
        duration: 120,
        capacity: 15,
        bookedCount: 8,
        price: 350,
        location: "Studio C",
        dropInAvailable: true,
      });

      const event3 = generateEvent({
        id: "event-normal-3",
        name: "Intro til Ashtanga",
        description:
          "Gratis introduksjonsklasse til Ashtanga yoga. Perfekt for nybegynnere!",
        eventType: "Intro",
        date: addDays(nextWeek, 2),
        startTime: "19:00",
        duration: 90,
        capacity: 20,
        bookedCount: 16,
        price: 0,
        location: "Studio B",
        dropInAvailable: true,
      });

      const event4 = generateEvent({
        id: "event-normal-4",
        name: "Helaften: Yoga & Ayurveda",
        description:
          "Lær om sammenhengen mellom yoga og ayurveda. Inkluderer yoga-praksis, teori og ayurvedisk middag.",
        eventType: "Workshop",
        date: addDays(nextWeek, 5),
        startTime: "16:00",
        duration: 300,
        capacity: 25,
        bookedCount: 18,
        price: 850,
        location: "Studio A + Restaurant",
        dropInAvailable: false,
      });

      const event5 = generateEvent({
        id: "event-normal-5",
        name: "Søndag Slow Flow",
        description:
          "Rolig og meditativ yoga for å avslutte helgen. Drop-in velkommen!",
        eventType: "Special",
        date: addDays(thisWeekend, 1),
        startTime: "10:00",
        duration: 90,
        capacity: 12,
        bookedCount: 5,
        price: 200,
        location: "Studio C",
        dropInAvailable: true,
      });

      // Generate realistic bookings and payments
      const bookings: Booking[] = [];
      const payments: Payment[] = [];

      // Course 1 bookings (8 students)
      for (let i = 0; i < 8; i++) {
        const studentIndex = i % mockStudents.length;
        const booking = generateBooking(
          "course-normal-1",
          "course",
          mockStudents[studentIndex].id,
          "confirmed",
        );
        bookings.push(booking);
        payments.push(
          generatePayment(booking, 1500, i < 6 ? "paid" : "pending"),
        );
      }

      // Course 2 bookings (11 students)
      for (let i = 0; i < 11; i++) {
        const studentIndex = (i + 2) % mockStudents.length;
        const booking = generateBooking(
          "course-normal-2",
          "course",
          mockStudents[studentIndex].id,
          "confirmed",
        );
        bookings.push(booking);
        payments.push(
          generatePayment(booking, 1800, i < 9 ? "paid" : "pending"),
        );
      }

      // Course 3 bookings (7 students)
      for (let i = 0; i < 7; i++) {
        const studentIndex = (i + 5) % mockStudents.length;
        const booking = generateBooking(
          "course-normal-3",
          "course",
          mockStudents[studentIndex].id,
          "confirmed",
        );
        bookings.push(booking);
        payments.push(
          generatePayment(booking, 1600, i < 5 ? "paid" : "pending"),
        );
      }

      // Course 4 bookings (10 students)
      for (let i = 0; i < 10; i++) {
        const studentIndex = i % mockStudents.length;
        const booking = generateBooking(
          "course-normal-4",
          "course",
          mockStudents[studentIndex].id,
          "confirmed",
        );
        bookings.push(booking);
        payments.push(
          generatePayment(booking, 1400, i < 8 ? "paid" : "pending"),
        );
      }

      // Course 5 bookings (9 students)
      for (let i = 0; i < 9; i++) {
        const studentIndex = (i + 3) % mockStudents.length;
        const booking = generateBooking(
          "course-normal-5",
          "course",
          mockStudents[studentIndex].id,
          "confirmed",
        );
        bookings.push(booking);
        payments.push(
          generatePayment(booking, 1700, i < 7 ? "paid" : "pending"),
        );
      }

      // Event 1 bookings (14 students)
      for (let i = 0; i < 14; i++) {
        const studentIndex = i % mockStudents.length;
        const booking = generateBooking(
          "event-normal-1",
          "event",
          mockStudents[studentIndex].id,
          "confirmed",
        );
        bookings.push(booking);
        payments.push(
          generatePayment(booking, 450, i < 10 ? "paid" : "pending"),
        );
      }

      // Event 2 bookings (8 students)
      for (let i = 0; i < 8; i++) {
        const studentIndex = (i + 4) % mockStudents.length;
        const booking = generateBooking(
          "event-normal-2",
          "event",
          mockStudents[studentIndex].id,
          "confirmed",
        );
        bookings.push(booking);
        payments.push(
          generatePayment(booking, 350, i < 6 ? "paid" : "pending"),
        );
      }

      // Event 3 bookings (16 students) - Free intro
      for (let i = 0; i < 16; i++) {
        const studentIndex = i % mockStudents.length;
        const booking = generateBooking(
          "event-normal-3",
          "event",
          mockStudents[studentIndex].id,
          "confirmed",
        );
        bookings.push(booking);
        // Free event, so no payment needed
      }

      // Event 4 bookings (18 students)
      for (let i = 0; i < 18; i++) {
        const studentIndex = i % mockStudents.length;
        const booking = generateBooking(
          "event-normal-4",
          "event",
          mockStudents[studentIndex].id,
          "confirmed",
        );
        bookings.push(booking);
        payments.push(
          generatePayment(booking, 850, i < 12 ? "paid" : "pending"),
        );
      }

      // Event 5 bookings (5 students)
      for (let i = 0; i < 5; i++) {
        const studentIndex = (i + 6) % mockStudents.length;
        const booking = generateBooking(
          "event-normal-5",
          "event",
          mockStudents[studentIndex].id,
          "confirmed",
        );
        bookings.push(booking);
        payments.push(
          generatePayment(booking, 200, i < 4 ? "paid" : "pending"),
        );
      }

      return {
        courses: [course1, course2, course3, course4, course5],
        events: [event1, event2, event3, event4, event5],
        bookings,
        payments,
        students: mockStudents,
      };
    }
  }
}
