/**
 * Core TypeScript types and interfaces for the yoga booking app
 */

export type UserRole = 'teacher' | 'student';

export type ClassType = 'single' | 'course' | 'event';

export type BookingStatus = 'confirmed' | 'pending' | 'cancelled' | 'completed';

export type PaymentStatus = 'paid' | 'pending' | 'overdue' | 'refunded';

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  role: UserRole;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Teacher extends User {
  role: 'teacher';
  bio?: string;
  specialties?: string[];
  website?: string;
}

export interface Student extends User {
  role: 'student';
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
  medicalNotes?: string;
}

export interface Class {
  id: string;
  teacherId: string;
  teacher?: Teacher;
  name: string;
  description?: string;
  type: ClassType;
  date: Date;
  startTime: string;
  duration: number;
  capacity: number;
  price: number;
  location: string;
  dropInAvailable: boolean;
  bookedCount: number;
  imageUrl?: string;
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CourseSession {
  id: string;
  courseId: string;
  sessionNumber: number;
  date: Date;
  startTime: string;
  duration: number;
  topic?: string;
  notes?: string;
}

export interface Course {
  id: string;
  teacherId: string;
  teacher?: Teacher;
  name: string;
  description?: string;
  numberOfWeeks: number;
  startDate: Date;
  recurringDayOfWeek: number;
  recurringTime: string;
  duration: number;
  capacity: number;
  price: number;
  location: string;
  sessions: CourseSession[];
  enrolledCount: number;
  imageUrl?: string;
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Event {
  id: string;
  teacherId: string;
  teacher?: Teacher;
  name: string;
  description?: string;
  eventType: string;
  date: Date;
  startTime: string;
  duration: number;
  capacity: number;
  price: number;
  location: string;
  dropInAvailable: boolean;
  bookedCount: number;
  imageUrl?: string;
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Booking {
  id: string;
  studentId: string;
  student?: Student;
  itemId: string;
  itemType: ClassType;
  item?: Class | Course | Event;
  bookingDate: Date;
  status: BookingStatus;
  paymentId?: string;
  payment?: Payment;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Payment {
  id: string;
  bookingId: string;
  booking?: Booking;
  studentId: string;
  student?: Student;
  teacherId: string;
  teacher?: Teacher;
  amount: number;
  currency: string;
  status: PaymentStatus;
  paymentMethod?: string;
  transactionId?: string;
  paidAt?: Date;
  dueDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Attendance {
  id: string;
  bookingId: string;
  booking?: Booking;
  studentId: string;
  student?: Student;
  classId: string;
  class?: Class;
  attended: boolean;
  notes?: string;
  recordedAt: Date;
}

export interface DashboardStats {
  totalRevenue: number;
  totalStudents: number;
  upcomingClasses: number;
  recentBookings: number;
  revenueChange: number;
  studentsChange: number;
}

export interface FilterOptions {
  search?: string;
  dateFrom?: Date;
  dateTo?: Date;
  teacherId?: string;
  type?: ClassType;
  dropInOnly?: boolean;
  status?: BookingStatus | PaymentStatus;
}

export interface PaginationParams {
  page: number;
  pageSize: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
