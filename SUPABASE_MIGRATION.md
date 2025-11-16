# Supabase Migration Guide for Yoga Booking App

This guide will help you migrate from the mock authentication system to Supabase for production-ready authentication and database management.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Supabase Project Setup](#supabase-project-setup)
3. [Database Schema](#database-schema)
4. [Row Level Security (RLS)](#row-level-security)
5. [Environment Configuration](#environment-configuration)
6. [Code Migration Steps](#code-migration-steps)
7. [Testing](#testing)
8. [Troubleshooting](#troubleshooting)

## Prerequisites

- Node.js 18+ installed
- Supabase account (free tier works fine)
- Git for version control
- Basic understanding of SQL

## Supabase Project Setup

### Step 1: Create Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign up or log in
3. Click "New Project"
4. Fill in:
   - Project name: `yoga-booking`
   - Database password: (save this securely!)
   - Region: Choose closest to your users
   - Pricing plan: Free tier is fine to start

### Step 2: Get Your API Keys

1. Once project is created, go to **Settings > API**
2. Copy these values:
   - **Project URL**: `https://[your-project-id].supabase.co`
   - **anon/public key**: `eyJhbGciOiJI...` (long string)
3. Add these to your `.env.local` file (already created)

## Database Schema

Copy and paste these SQL commands into your Supabase SQL Editor (found under SQL Editor in the sidebar):

### Part 1: Enable Extensions and Create Tables

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table (extends Supabase auth.users)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  phone TEXT,
  role TEXT NOT NULL CHECK (role IN ('teacher', 'student')),
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- Teacher profiles (extends profiles)
CREATE TABLE teacher_profiles (
  id UUID REFERENCES profiles(id) ON DELETE CASCADE PRIMARY KEY,
  bio TEXT,
  specialties TEXT[],
  website TEXT
);

-- Student profiles (extends profiles)
CREATE TABLE student_profiles (
  id UUID REFERENCES profiles(id) ON DELETE CASCADE PRIMARY KEY,
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  emergency_contact_relationship TEXT,
  medical_notes TEXT
);

-- Courses table
CREATE TABLE courses (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  teacher_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  number_of_weeks INTEGER NOT NULL,
  start_date DATE NOT NULL,
  recurring_day_of_week INTEGER NOT NULL CHECK (recurring_day_of_week >= 0 AND recurring_day_of_week <= 6),
  recurring_time TIME NOT NULL,
  duration INTEGER NOT NULL,
  capacity INTEGER NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  location TEXT NOT NULL,
  enrolled_count INTEGER DEFAULT 0,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- Course sessions table
CREATE TABLE course_sessions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE NOT NULL,
  session_number INTEGER NOT NULL,
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  duration INTEGER NOT NULL,
  topic TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- Events table
CREATE TABLE events (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  teacher_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  event_type TEXT NOT NULL,
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  duration INTEGER NOT NULL,
  capacity INTEGER NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  location TEXT NOT NULL,
  drop_in_available BOOLEAN DEFAULT false,
  booked_count INTEGER DEFAULT 0,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- Bookings table
CREATE TABLE bookings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  student_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  item_id UUID NOT NULL,
  item_type TEXT NOT NULL CHECK (item_type IN ('course', 'event')),
  booking_date TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('confirmed', 'pending', 'cancelled', 'completed')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- Payments table
CREATE TABLE payments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE UNIQUE NOT NULL,
  student_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  teacher_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  currency TEXT DEFAULT 'NOK' NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('paid', 'pending', 'overdue', 'refunded')),
  payment_method TEXT,
  transaction_id TEXT,
  paid_at TIMESTAMP WITH TIME ZONE,
  due_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- Attendance table
CREATE TABLE attendance (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE NOT NULL,
  student_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  session_id UUID REFERENCES course_sessions(id) ON DELETE CASCADE NOT NULL,
  attended BOOLEAN DEFAULT false,
  notes TEXT,
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);
```

### Part 2: Create Indexes for Performance

```sql
-- Indexes for better query performance
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_courses_teacher_id ON courses(teacher_id);
CREATE INDEX idx_courses_start_date ON courses(start_date);
CREATE INDEX idx_events_teacher_id ON events(teacher_id);
CREATE INDEX idx_events_date ON events(date);
CREATE INDEX idx_bookings_student_id ON bookings(student_id);
CREATE INDEX idx_bookings_item_id ON bookings(item_id);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_payments_student_id ON payments(student_id);
CREATE INDEX idx_payments_teacher_id ON payments(teacher_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_course_sessions_course_id ON course_sessions(course_id);
CREATE INDEX idx_course_sessions_date ON course_sessions(date);
```

### Part 3: Create Update Triggers

```sql
-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc', NOW());
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to all tables with updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_courses_updated_at BEFORE UPDATE ON courses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON events
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### Part 4: Create Profile Trigger for New Users

```sql
-- Function to create profile after user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, role, phone)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'name',
    NEW.raw_user_meta_data->>'role',
    NEW.raw_user_meta_data->>'phone'
  );
  
  -- Create role-specific profile
  IF NEW.raw_user_meta_data->>'role' = 'teacher' THEN
    INSERT INTO public.teacher_profiles (id) VALUES (NEW.id);
  ELSIF NEW.raw_user_meta_data->>'role' = 'student' THEN
    INSERT INTO public.student_profiles (id) VALUES (NEW.id);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

## Row Level Security

Enable RLS and create policies for secure data access:

### Part 1: Enable RLS on All Tables

```sql
-- Enable Row Level Security on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE teacher_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
```

### Part 2: Profile Policies

```sql
-- Profiles: Everyone can view profiles
CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Teacher profiles are public
CREATE POLICY "Teacher profiles are viewable by everyone"
  ON teacher_profiles FOR SELECT
  USING (true);

-- Teachers can update their own teacher profile
CREATE POLICY "Teachers can update own teacher profile"
  ON teacher_profiles FOR UPDATE
  USING (auth.uid() = id);

-- Students can only view their own student profile
CREATE POLICY "Students can view own student profile"
  ON student_profiles FOR SELECT
  USING (auth.uid() = id);

-- Teachers can view all student profiles (for enrolled students)
CREATE POLICY "Teachers can view student profiles"
  ON student_profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'teacher'
    )
  );

-- Students can update their own student profile
CREATE POLICY "Students can update own student profile"
  ON student_profiles FOR UPDATE
  USING (auth.uid() = id);
```

### Part 3: Course & Event Policies

```sql
-- Courses are public to view
CREATE POLICY "Courses are viewable by everyone"
  ON courses FOR SELECT
  USING (true);

-- Only teachers can create courses
CREATE POLICY "Teachers can create courses"
  ON courses FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'teacher'
    ) AND teacher_id = auth.uid()
  );

-- Teachers can update their own courses
CREATE POLICY "Teachers can update own courses"
  ON courses FOR UPDATE
  USING (teacher_id = auth.uid());

-- Teachers can delete their own courses
CREATE POLICY "Teachers can delete own courses"
  ON courses FOR DELETE
  USING (teacher_id = auth.uid());

-- Course sessions are public to view
CREATE POLICY "Course sessions are viewable by everyone"
  ON course_sessions FOR SELECT
  USING (true);

-- Teachers can manage sessions for their courses
CREATE POLICY "Teachers can manage own course sessions"
  ON course_sessions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM courses
      WHERE courses.id = course_sessions.course_id
      AND courses.teacher_id = auth.uid()
    )
  );

-- Events are public to view
CREATE POLICY "Events are viewable by everyone"
  ON events FOR SELECT
  USING (true);

-- Only teachers can create events
CREATE POLICY "Teachers can create events"
  ON events FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'teacher'
    ) AND teacher_id = auth.uid()
  );

-- Teachers can update their own events
CREATE POLICY "Teachers can update own events"
  ON events FOR UPDATE
  USING (teacher_id = auth.uid());

-- Teachers can delete their own events
CREATE POLICY "Teachers can delete own events"
  ON events FOR DELETE
  USING (teacher_id = auth.uid());
```

### Part 4: Booking & Payment Policies

```sql
-- Students can view their own bookings
CREATE POLICY "Students can view own bookings"
  ON bookings FOR SELECT
  USING (student_id = auth.uid());

-- Teachers can view bookings for their courses/events
CREATE POLICY "Teachers can view relevant bookings"
  ON bookings FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM courses
      WHERE courses.id = bookings.item_id
      AND courses.teacher_id = auth.uid()
      AND bookings.item_type = 'course'
    ) OR EXISTS (
      SELECT 1 FROM events
      WHERE events.id = bookings.item_id
      AND events.teacher_id = auth.uid()
      AND bookings.item_type = 'event'
    )
  );

-- Students can create their own bookings
CREATE POLICY "Students can create own bookings"
  ON bookings FOR INSERT
  WITH CHECK (
    student_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'student'
    )
  );

-- Students can update their own bookings (cancel)
CREATE POLICY "Students can update own bookings"
  ON bookings FOR UPDATE
  USING (student_id = auth.uid());

-- Students can view their own payments
CREATE POLICY "Students can view own payments"
  ON payments FOR SELECT
  USING (student_id = auth.uid());

-- Teachers can view payments for their courses/events
CREATE POLICY "Teachers can view relevant payments"
  ON payments FOR SELECT
  USING (teacher_id = auth.uid());

-- Payments can be created by the system (service role)
CREATE POLICY "System can create payments"
  ON payments FOR INSERT
  WITH CHECK (true);

-- Teachers can update payment status
CREATE POLICY "Teachers can update payment status"
  ON payments FOR UPDATE
  USING (teacher_id = auth.uid());
```

## Environment Configuration

### Update your `.env.local` file:

```env
# Get these from your Supabase project dashboard
VITE_SUPABASE_URL=https://[your-project-id].supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...[your-anon-key]
```

## Code Migration Steps

### Step 1: Update AuthContext for Supabase

Replace the mock authentication in `src/contexts/AuthContext.tsx` with Supabase auth:

```typescript
import { supabase } from '@/lib/supabase';

// In your login function:
const { data, error } = await supabase.auth.signInWithPassword({
  email,
  password,
});

// In your logout function:
await supabase.auth.signOut();

// Listen to auth state changes:
useEffect(() => {
  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    async (event, session) => {
      if (session) {
        // Fetch user profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        
        setUser(profile);
      } else {
        setUser(null);
      }
    }
  );

  return () => subscription.unsubscribe();
}, []);
```

### Step 2: Update Services

Replace mock API calls with Supabase queries:

```typescript
// Example: Fetch courses
const { data, error } = await supabase
  .from('courses')
  .select('*')
  .eq('teacher_id', teacherId)
  .order('start_date', { ascending: true });

// Example: Create booking
const { data, error } = await supabase
  .from('bookings')
  .insert({
    student_id: userId,
    item_id: courseId,
    item_type: 'course',
    status: 'confirmed'
  })
  .select()
  .single();
```

### Step 3: Handle Real-time Updates (Optional)

```typescript
// Subscribe to real-time changes
const subscription = supabase
  .channel('bookings')
  .on('postgres_changes', 
    { 
      event: 'INSERT', 
      schema: 'public', 
      table: 'bookings',
      filter: `student_id=eq.${userId}`
    },
    (payload) => {
      console.log('New booking:', payload.new);
      // Update your state
    }
  )
  .subscribe();
```

## Testing

### Test Authentication Flow:

1. **Register new user**:
   - Go to `/register`
   - Create account as student
   - Check Supabase dashboard for new user

2. **Login**:
   - Go to `/login`
   - Use registered credentials
   - Should redirect to appropriate dashboard

3. **Password Reset**:
   - Go to `/forgot-password`
   - Enter email
   - Check email for reset link

### Test Data Operations:

1. **As Teacher**:
   - Create a course
   - View course list
   - Edit course details
   - Check data in Supabase dashboard

2. **As Student**:
   - Browse courses
   - Book a course
   - View bookings
   - Check payment record created

## Troubleshooting

### Common Issues:

1. **"Missing Supabase environment variables"**
   - Ensure `.env.local` has correct values
   - Restart dev server after adding env vars

2. **"Permission denied" errors**
   - Check RLS policies are correctly set
   - Verify user role in profiles table
   - Check auth.uid() matches profile id

3. **Profile not created on signup**
   - Check trigger `on_auth_user_created` exists
   - Verify metadata is passed during signup

4. **Can't see data after login**
   - Check RLS policies
   - Verify user is authenticated
   - Check console for error messages

### Debugging Tips:

1. **Check Supabase Logs**:
   - Go to Supabase Dashboard > Logs
   - Filter by error level
   - Check query performance

2. **Test RLS Policies**:
   - Use Supabase SQL Editor
   - Run queries with different user contexts
   - Use `auth.uid()` to debug

3. **Monitor Real-time**:
   - Use browser DevTools Network tab
   - Check WebSocket connections
   - Monitor console for errors

## Next Steps

After completing this migration:

1. **Add Payment Integration**:
   - Integrate Stripe or similar
   - Update payment webhook handlers
   - Add refund functionality

2. **Email Notifications**:
   - Configure Supabase email templates
   - Set up booking confirmations
   - Add payment reminders

3. **Advanced Features**:
   - Add image uploads for courses
   - Implement search functionality
   - Add analytics dashboard

4. **Production Deployment**:
   - Set up production environment variables
   - Configure custom domain
   - Set up monitoring and alerts

## Support

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Discord](https://discord.supabase.com)
- [Project Issues](https://github.com/your-repo/issues)

---

This migration guide provides everything you need to move from mock authentication to a production-ready Supabase backend. Take it step by step, test thoroughly, and don't hesitate to refer to Supabase documentation for additional details.