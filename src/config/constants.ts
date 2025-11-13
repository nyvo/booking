/**
 * Application constants
 * Centralized location for all constant values used throughout the app
 */

export const APP_NAME = 'Yoga Booking';

export const ROUTES = {
  HOME: '/',

  // Teacher routes
  TEACHER: {
    DASHBOARD: '/teacher/dashboard',
    CLASSES: '/teacher/classes',
    CLASSES_CREATE: '/teacher/classes/create',
    CLASSES_EDIT: '/teacher/classes/:id/edit',
    COURSES: '/teacher/courses',
    COURSES_CREATE: '/teacher/courses/create',
    COURSES_EDIT: '/teacher/courses/:id/edit',
    EVENTS: '/teacher/events',
    EVENTS_CREATE: '/teacher/events/create',
    EVENTS_EDIT: '/teacher/events/:id/edit',
    STUDENTS: '/teacher/students',
    STUDENTS_DETAIL: '/teacher/students/:id',
    PAYMENTS: '/teacher/payments',
    PROFILE: '/teacher/profile',
    SETTINGS: '/teacher/settings',
  },

  // Student routes
  STUDENT: {
    BROWSE: '/student/browse',
    CLASS_DETAIL: '/student/class/:id',
    COURSE_DETAIL: '/student/course/:id',
    EVENT_DETAIL: '/student/event/:id',
    BOOKINGS: '/student/bookings',
    PROFILE: '/student/profile',
  },

  // Auth routes
  AUTH: {
    LOGIN: '/login',
    REGISTER: '/register',
    FORGOT_PASSWORD: '/forgot-password',
  },
} as const;

export const CLASS_TYPES = {
  SINGLE: 'single',
  COURSE: 'course',
  EVENT: 'event',
} as const;

export const BOOKING_STATUS = {
  CONFIRMED: 'confirmed',
  PENDING: 'pending',
  CANCELLED: 'cancelled',
  COMPLETED: 'completed',
} as const;

export const PAYMENT_STATUS = {
  PAID: 'paid',
  PENDING: 'pending',
  OVERDUE: 'overdue',
  REFUNDED: 'refunded',
} as const;

export const USER_ROLES = {
  TEACHER: 'teacher',
  STUDENT: 'student',
} as const;

export const DATE_FORMATS = {
  DISPLAY: 'dd.MM.yyyy',
  DISPLAY_WITH_TIME: 'dd.MM.yyyy HH:mm',
  TIME_ONLY: 'HH:mm',
  WEEKDAY_SHORT: 'EEE',
  MONTH_YEAR: 'MMMM yyyy',
} as const;

export const CURRENCY = 'NOK';

export const DEFAULT_CLASS_DURATION = 60; // minutes
export const DEFAULT_CLASS_CAPACITY = 15;

export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: [10, 25, 50, 100],
} as const;
