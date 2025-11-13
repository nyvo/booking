# Phase 2 Complete: Mock Data Layer

## Overview
Phase 2 establishes a complete mock data layer that simulates a real backend API. This allows for full-featured development and testing without a database.

## What Was Built

### 1. Date Utilities (`src/utils/date.ts`)
- Complete date formatting with Norwegian locale (date-fns)
- Display functions: `formatDisplayDate`, `formatDisplayDateTime`, `formatTime`
- Relative time formatting: "I dag", "I morgen", "2 timer siden"
- Norwegian weekday and month names
- Duration text in Norwegian: "1 time 30 min"
- Date manipulation: add days/weeks, start/end of week

### 2. Mock Data

#### Teachers (`src/mock-data/teachers.ts`)
- 5 realistic teacher profiles
- Norwegian names, emails, phone numbers
- Specialties: Hatha, Vinyasa, Power Yoga, Yin, Prenatal, etc.
- Bio and website information

#### Students (`src/mock-data/students.ts`)
- 10 student profiles with Norwegian names
- Emergency contact information
- Medical notes where relevant
- Realistic email and phone numbers

#### Classes, Courses, Events (`src/mock-data/classes.ts`)
- **5 Single Classes**: Morning Hatha, Power Yoga, Yin & Meditation, Senior Yoga, Vinyasa Flow
- **3 Course Series**: 4-8 week programs with recurring sessions
- **3 Events**: Workshops, retreats, special arrangements
- Full details: pricing, capacity, location, drop-in availability
- Auto-generated course sessions

#### Bookings & Payments (`src/mock-data/bookings.ts`)
- 11 realistic bookings across classes, courses, and events
- Different booking statuses: confirmed, pending, cancelled
- 11 matching payments with various statuses
- Payment methods: Vipps, Kort, Bankkort
- Transaction IDs and payment dates
- 3 attendance records

### 3. Mock API Service Layer

#### Base Service (`src/services/api.ts`)
- Simulated network delays (500ms default)
- Generic pagination function
- Search/filter utilities
- Error handling with `MockApiError`

#### Class Service (`src/services/classService.ts`)
**Full CRUD operations for:**
- Classes: get, getById, create, update, delete
- Courses: get, getById, create, update, delete
- Events: get, getById, create, update, delete
- Filtering by: search, teacher, date range, drop-in availability
- Pagination support

#### Booking Service (`src/services/bookingService.ts`)
**Full CRUD operations for:**
- Bookings: get, getById, create, update, cancel, delete
- Get bookings by student ID
- Payments: get, getById, create, update, markAsPaid
- Get payments by teacher ID
- Revenue statistics calculation

#### User Service (`src/services/userService.ts`)
- Get all teachers/students
- Get by ID or email
- Update profiles
- Mock authentication: login, logout, getCurrentUser

### 4. Custom React Hooks

#### Class Hooks (`src/hooks/useClasses.ts`)
- `useClasses`: Fetch all classes with filters/pagination
- `useClass`: Fetch single class by ID
- `useClassMutations`: Create, update, delete classes
- `useCourses`: Fetch all courses
- `useCourse`: Fetch single course
- `useCourseMutations`: Create, update, delete courses
- `useEvents`: Fetch all events
- `useEvent`: Fetch single event
- `useEventMutations`: Create, update, delete events

#### Booking Hooks (`src/hooks/useBookings.ts`)
- `useBookings`: Fetch all bookings with filters
- `useStudentBookings`: Get bookings for a specific student
- `useBooking`: Fetch single booking
- `useBookingMutations`: Create, update, cancel, delete bookings
- `usePayments`: Fetch payments with filters
- `useTeacherPayments`: Get payments for a teacher
- `useTeacherRevenue`: Get revenue statistics
- `usePaymentMutations`: Create, update, mark as paid

#### Auth Hooks (`src/hooks/useAuth.ts`)
- `useAuth`: Authentication state and sign in/out
- `useTeachers`: Fetch all teachers
- `useTeacher`: Fetch single teacher
- `useTeacherMutations`: Update teacher profile
- `useStudents`: Fetch all students
- `useStudent`: Fetch single student
- `useStudentMutations`: Update student profile

## Features

### Data Management
- In-memory storage simulating a database
- Automatic ID generation
- Created/updated timestamps
- Relationship handling (teachers, students, bookings)

### Error Handling
- Custom `MockApiError` class
- HTTP status codes (404, 401, 500)
- Try-catch in all hooks
- Error state management

### Loading States
- Simulated network delays
- Loading state in all hooks
- Proper async/await patterns

### Filtering & Pagination
- Search by text (name, description, location)
- Filter by teacher, date range, status
- Drop-in availability filter
- Pagination with page/pageSize
- Total count and page calculations

## Usage Example

```typescript
// Fetch classes for a teacher
const { data, loading, error } = useClasses(
  { teacherId: 'teacher-0001', dropInOnly: true },
  { page: 1, pageSize: 10 }
);

// Create a new class
const { create, loading } = useClassMutations();
const newClass = await create({
  teacherId: 'teacher-0001',
  name: 'Morgen Yoga',
  date: new Date(),
  // ... other fields
});

// Get student bookings
const { data: bookings } = useStudentBookings('student-0001');

// Get teacher revenue
const { data: revenue } = useTeacherRevenue('teacher-0001');
// { total: 5000, paid: 4500, pending: 500, overdue: 0 }
```

## Next Steps: Phase 3

Ready to build the **Teacher Dashboard** with:
- Authentication placeholder
- Dashboard home with stats
- Class/course/event management
- Student management
- Payment tracking

All data infrastructure is now in place!
