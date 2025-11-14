import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ROUTES } from "@/config/constants";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

// Home page
import Home from "@/pages/Home";

// Teacher pages
import TeacherDashboard from "@/pages/teacher/Dashboard";
import TeacherCourses from "@/pages/teacher/Courses";
import CourseCreate from "@/pages/teacher/CourseCreate";
import CourseDetail from "@/pages/teacher/CourseDetail";
import CourseEdit from "@/pages/teacher/CourseEdit";
import TeacherEvents from "@/pages/teacher/Events";
import EventCreate from "@/pages/teacher/EventCreate";
import EventDetail from "@/pages/teacher/EventDetail";
import EventEdit from "@/pages/teacher/EventEdit";
import TeacherStudents from "@/pages/teacher/Students";
import StudentDetail from "@/pages/teacher/StudentDetail";
import TeacherPayments from "@/pages/teacher/Payments";
import TeacherAccount from "@/pages/teacher/Account";
// Student pages
import StudentBrowse from "@/pages/student/Browse";
import StudentCourseDetail from "@/pages/student/CourseDetail";
import StudentEventDetail from "@/pages/student/EventDetail";
import StudentBookings from "@/pages/student/Bookings";
import StudentProfile from "@/pages/student/Profile";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Root - redirects based on user role */}
          <Route path="/" element={<Home />} />

          {/* Teacher routes - Protected */}
          <Route
            path={ROUTES.TEACHER.DASHBOARD}
            element={
              <ProtectedRoute allowedRoles={["teacher"]}>
                <TeacherDashboard />
              </ProtectedRoute>
            }
          />
          {/* Legacy classes routes - redirect to unified courses */}
          <Route
            path={ROUTES.TEACHER.CLASSES}
            element={<Navigate to={ROUTES.TEACHER.COURSES} replace />}
          />
          <Route
            path={ROUTES.TEACHER.CLASSES_CREATE}
            element={<Navigate to={ROUTES.TEACHER.COURSES_CREATE} replace />}
          />
          <Route
            path={ROUTES.TEACHER.CLASSES_EDIT}
            element={<Navigate to={ROUTES.TEACHER.COURSES} replace />}
          />
          <Route
            path={ROUTES.TEACHER.COURSES}
            element={
              <ProtectedRoute allowedRoles={["teacher"]}>
                <TeacherCourses />
              </ProtectedRoute>
            }
          />
          <Route
            path={ROUTES.TEACHER.COURSES_CREATE}
            element={
              <ProtectedRoute allowedRoles={["teacher"]}>
                <CourseCreate />
              </ProtectedRoute>
            }
          />
          <Route
            path={ROUTES.TEACHER.COURSES_DETAIL}
            element={
              <ProtectedRoute allowedRoles={["teacher"]}>
                <CourseDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path={ROUTES.TEACHER.COURSES_EDIT}
            element={
              <ProtectedRoute allowedRoles={["teacher"]}>
                <CourseEdit />
              </ProtectedRoute>
            }
          />
          <Route
            path={ROUTES.TEACHER.EVENTS}
            element={
              <ProtectedRoute allowedRoles={["teacher"]}>
                <TeacherEvents />
              </ProtectedRoute>
            }
          />
          <Route
            path={ROUTES.TEACHER.EVENTS_CREATE}
            element={
              <ProtectedRoute allowedRoles={["teacher"]}>
                <EventCreate />
              </ProtectedRoute>
            }
          />
          <Route
            path={ROUTES.TEACHER.EVENTS_DETAIL}
            element={
              <ProtectedRoute allowedRoles={["teacher"]}>
                <EventDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path={ROUTES.TEACHER.EVENTS_EDIT}
            element={
              <ProtectedRoute allowedRoles={["teacher"]}>
                <EventEdit />
              </ProtectedRoute>
            }
          />
          <Route
            path={ROUTES.TEACHER.STUDENTS}
            element={
              <ProtectedRoute allowedRoles={["teacher"]}>
                <TeacherStudents />
              </ProtectedRoute>
            }
          />
          <Route
            path={ROUTES.TEACHER.STUDENTS_DETAIL}
            element={
              <ProtectedRoute allowedRoles={["teacher"]}>
                <StudentDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path={ROUTES.TEACHER.PAYMENTS}
            element={
              <ProtectedRoute allowedRoles={["teacher"]}>
                <TeacherPayments />
              </ProtectedRoute>
            }
          />
          <Route
            path={ROUTES.TEACHER.ACCOUNT}
            element={
              <ProtectedRoute allowedRoles={["teacher"]}>
                <TeacherAccount />
              </ProtectedRoute>
            }
          />
          {/* Legacy routes - redirect to unified Account page */}
          <Route
            path={ROUTES.TEACHER.PROFILE}
            element={<Navigate to={ROUTES.TEACHER.ACCOUNT} replace />}
          />
          <Route
            path={ROUTES.TEACHER.SETTINGS}
            element={<Navigate to={ROUTES.TEACHER.ACCOUNT} replace />}
          />

          {/* Student routes - Protected */}
          <Route
            path={ROUTES.STUDENT.BROWSE}
            element={
              <ProtectedRoute allowedRoles={["student"]}>
                <StudentBrowse />
              </ProtectedRoute>
            }
          />
          {/* Legacy class detail route - redirect to browse */}
          <Route
            path={ROUTES.STUDENT.CLASS_DETAIL}
            element={<Navigate to={ROUTES.STUDENT.BROWSE} replace />}
          />
          <Route
            path={ROUTES.STUDENT.COURSE_DETAIL}
            element={
              <ProtectedRoute allowedRoles={["student"]}>
                <StudentCourseDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path={ROUTES.STUDENT.EVENT_DETAIL}
            element={
              <ProtectedRoute allowedRoles={["student"]}>
                <StudentEventDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path={ROUTES.STUDENT.BOOKINGS}
            element={
              <ProtectedRoute allowedRoles={["student"]}>
                <StudentBookings />
              </ProtectedRoute>
            }
          />
          <Route
            path={ROUTES.STUDENT.PROFILE}
            element={
              <ProtectedRoute allowedRoles={["student"]}>
                <StudentProfile />
              </ProtectedRoute>
            }
          />

          {/* 404 fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
