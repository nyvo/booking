/**
 * Mock data for bookings and payments
 */

import type { Booking, Payment, Attendance } from "@/types";
import { generateSequentialId } from "@/utils/id";
import { addDays, subDays } from "date-fns";
import { CURRENCY } from "@/config/constants";

const today = new Date();

// Mock bookings
export const mockBookings: Booking[] = [
  // Class bookings
  {
    id: generateSequentialId("booking", 1),
    studentId: "student-0001",
    itemId: "class-0001",
    itemType: "single",
    bookingDate: subDays(today, 2),
    status: "confirmed",
    paymentId: "payment-0001",
    notes: undefined,
    createdAt: subDays(today, 2),
    updatedAt: subDays(today, 2),
  },
  {
    id: generateSequentialId("booking", 2),
    studentId: "student-0002",
    itemId: "class-0001",
    itemType: "single",
    bookingDate: subDays(today, 1),
    status: "confirmed",
    paymentId: "payment-0002",
    notes: undefined,
    createdAt: subDays(today, 1),
    updatedAt: subDays(today, 1),
  },
  {
    id: generateSequentialId("booking", 3),
    studentId: "student-0003",
    itemId: "class-0002",
    itemType: "single",
    bookingDate: subDays(today, 3),
    status: "confirmed",
    paymentId: "payment-0003",
    notes: undefined,
    createdAt: subDays(today, 3),
    updatedAt: subDays(today, 3),
  },
  {
    id: generateSequentialId("booking", 4),
    studentId: "student-0004",
    itemId: "class-0002",
    itemType: "single",
    bookingDate: subDays(today, 2),
    status: "confirmed",
    paymentId: "payment-0004",
    notes: undefined,
    createdAt: subDays(today, 2),
    updatedAt: subDays(today, 2),
  },
  {
    id: generateSequentialId("booking", 5),
    studentId: "student-0005",
    itemId: "class-0003",
    itemType: "single",
    bookingDate: today,
    status: "pending",
    paymentId: "payment-0005",
    notes: undefined,
    createdAt: today,
    updatedAt: today,
  },
  // Course bookings
  {
    id: generateSequentialId("booking", 6),
    studentId: "student-0001",
    itemId: "course-0001",
    itemType: "course",
    bookingDate: subDays(today, 10),
    status: "confirmed",
    paymentId: "payment-0006",
    notes: undefined,
    createdAt: subDays(today, 10),
    updatedAt: subDays(today, 10),
  },
  {
    id: generateSequentialId("booking", 7),
    studentId: "student-0006",
    itemId: "course-0001",
    itemType: "course",
    bookingDate: subDays(today, 8),
    status: "confirmed",
    paymentId: "payment-0007",
    notes: undefined,
    createdAt: subDays(today, 8),
    updatedAt: subDays(today, 8),
  },
  {
    id: generateSequentialId("booking", 8),
    studentId: "student-0007",
    itemId: "course-0002",
    itemType: "course",
    bookingDate: subDays(today, 5),
    status: "confirmed",
    paymentId: "payment-0008",
    notes: undefined,
    createdAt: subDays(today, 5),
    updatedAt: subDays(today, 5),
  },
  // Event bookings
  {
    id: generateSequentialId("booking", 9),
    studentId: "student-0002",
    itemId: "event-0001",
    itemType: "event",
    bookingDate: subDays(today, 7),
    status: "confirmed",
    paymentId: "payment-0009",
    notes: undefined,
    createdAt: subDays(today, 7),
    updatedAt: subDays(today, 7),
  },
  {
    id: generateSequentialId("booking", 10),
    studentId: "student-0008",
    itemId: "event-0002",
    itemType: "event",
    bookingDate: subDays(today, 4),
    status: "confirmed",
    paymentId: "payment-0010",
    notes: undefined,
    createdAt: subDays(today, 4),
    updatedAt: subDays(today, 4),
  },
  {
    id: generateSequentialId("booking", 11),
    studentId: "student-0009",
    itemId: "event-0003",
    itemType: "event",
    bookingDate: today,
    status: "pending",
    paymentId: "payment-0011",
    notes: undefined,
    createdAt: today,
    updatedAt: today,
  },
];

// Mock payments
export const mockPayments: Payment[] = [
  {
    id: "payment-0001",
    bookingId: "booking-0001",
    studentId: "student-0001",
    teacherId: "teacher-0001",
    amount: 250,
    currency: CURRENCY,
    status: "paid",
    paymentMethod: "Vipps",
    transactionId: "VIPPS-12345",
    paidAt: subDays(today, 2),
    dueDate: subDays(today, 2),
    createdAt: subDays(today, 2),
    updatedAt: subDays(today, 2),
  },
  {
    id: "payment-0002",
    bookingId: "booking-0002",
    studentId: "student-0002",
    teacherId: "teacher-0001",
    amount: 250,
    currency: CURRENCY,
    status: "paid",
    paymentMethod: "Kort",
    transactionId: "CARD-67890",
    paidAt: subDays(today, 1),
    dueDate: subDays(today, 1),
    createdAt: subDays(today, 1),
    updatedAt: subDays(today, 1),
  },
  {
    id: "payment-0003",
    bookingId: "booking-0003",
    studentId: "student-0003",
    teacherId: "teacher-0003",
    amount: 300,
    currency: CURRENCY,
    status: "paid",
    paymentMethod: "Vipps",
    transactionId: "VIPPS-11111",
    paidAt: subDays(today, 3),
    dueDate: subDays(today, 3),
    createdAt: subDays(today, 3),
    updatedAt: subDays(today, 3),
  },
  {
    id: "payment-0004",
    bookingId: "booking-0004",
    studentId: "student-0004",
    teacherId: "teacher-0003",
    amount: 300,
    currency: CURRENCY,
    status: "paid",
    paymentMethod: "Vipps",
    transactionId: "VIPPS-22222",
    paidAt: subDays(today, 2),
    dueDate: subDays(today, 2),
    createdAt: subDays(today, 2),
    updatedAt: subDays(today, 2),
  },
  {
    id: "payment-0005",
    bookingId: "booking-0005",
    studentId: "student-0005",
    teacherId: "teacher-0002",
    amount: 280,
    currency: CURRENCY,
    status: "pending",
    paymentMethod: undefined,
    transactionId: undefined,
    paidAt: undefined,
    dueDate: addDays(today, 1),
    createdAt: today,
    updatedAt: today,
  },
  {
    id: "payment-0006",
    bookingId: "booking-0006",
    studentId: "student-0001",
    teacherId: "teacher-0001",
    amount: 1200,
    currency: CURRENCY,
    status: "paid",
    paymentMethod: "Bankkort",
    transactionId: "CARD-33333",
    paidAt: subDays(today, 10),
    dueDate: subDays(today, 10),
    createdAt: subDays(today, 10),
    updatedAt: subDays(today, 10),
  },
  {
    id: "payment-0007",
    bookingId: "booking-0007",
    studentId: "student-0006",
    teacherId: "teacher-0001",
    amount: 1200,
    currency: CURRENCY,
    status: "paid",
    paymentMethod: "Vipps",
    transactionId: "VIPPS-44444",
    paidAt: subDays(today, 8),
    dueDate: subDays(today, 8),
    createdAt: subDays(today, 8),
    updatedAt: subDays(today, 8),
  },
  {
    id: "payment-0008",
    bookingId: "booking-0008",
    studentId: "student-0007",
    teacherId: "teacher-0003",
    amount: 1800,
    currency: CURRENCY,
    status: "paid",
    paymentMethod: "Kort",
    transactionId: "CARD-55555",
    paidAt: subDays(today, 5),
    dueDate: subDays(today, 5),
    createdAt: subDays(today, 5),
    updatedAt: subDays(today, 5),
  },
  {
    id: "payment-0009",
    bookingId: "booking-0009",
    studentId: "student-0002",
    teacherId: "teacher-0001",
    amount: 600,
    currency: CURRENCY,
    status: "paid",
    paymentMethod: "Vipps",
    transactionId: "VIPPS-66666",
    paidAt: subDays(today, 7),
    dueDate: subDays(today, 7),
    createdAt: subDays(today, 7),
    updatedAt: subDays(today, 7),
  },
  {
    id: "payment-0010",
    bookingId: "booking-0010",
    studentId: "student-0008",
    teacherId: "teacher-0002",
    amount: 1500,
    currency: CURRENCY,
    status: "paid",
    paymentMethod: "Bankkort",
    transactionId: "CARD-77777",
    paidAt: subDays(today, 4),
    dueDate: subDays(today, 4),
    createdAt: subDays(today, 4),
    updatedAt: subDays(today, 4),
  },
  {
    id: "payment-0011",
    bookingId: "booking-0011",
    studentId: "student-0009",
    teacherId: "teacher-0003",
    amount: 350,
    currency: CURRENCY,
    status: "pending",
    paymentMethod: undefined,
    transactionId: undefined,
    paidAt: undefined,
    dueDate: addDays(today, 2),
    createdAt: today,
    updatedAt: today,
  },
];

// Mock attendance records
export const mockAttendance: Attendance[] = [
  {
    id: generateSequentialId("attendance", 1),
    bookingId: "booking-0001",
    studentId: "student-0001",
    classId: "class-0001",
    attended: true,
    notes: undefined,
    recordedAt: subDays(today, 1),
  },
  {
    id: generateSequentialId("attendance", 2),
    bookingId: "booking-0002",
    studentId: "student-0002",
    classId: "class-0001",
    attended: true,
    notes: undefined,
    recordedAt: subDays(today, 1),
  },
  {
    id: generateSequentialId("attendance", 3),
    bookingId: "booking-0003",
    studentId: "student-0003",
    classId: "class-0002",
    attended: false,
    notes: "Syk",
    recordedAt: today,
  },
];

/**
 * Get booking by ID
 */
export const getBookingById = (id: string): Booking | undefined => {
  return mockBookings.find((b) => b.id === id);
};

/**
 * Get payment by ID
 */
export const getPaymentById = (id: string): Payment | undefined => {
  return mockPayments.find((p) => p.id === id);
};

/**
 * Get bookings by student ID
 */
export const getBookingsByStudentId = (studentId: string): Booking[] => {
  return mockBookings.filter((b) => b.studentId === studentId);
};

/**
 * Get payments by teacher ID
 */
export const getPaymentsByTeacherId = (teacherId: string): Payment[] => {
  return mockPayments.filter((p) => p.teacherId === teacherId);
};
