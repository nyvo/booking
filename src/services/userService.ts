/**
 * Mock API service for users (teachers and students)
 */

import type { User, Teacher, Student } from "@/types";
import { mockTeachers } from "@/mock-data/teachers";
import { mockStudents } from "@/mock-data/students";
import { mockApiCall, MockApiError } from "./api";

// In-memory storage
let teachers = [...mockTeachers];
let students = [...mockStudents];

const SESSION_KEY = "yoga_booking_user";

/**
 * Get current authenticated user from session (for authorization checks)
 */
const getCurrentAuthUser = (): User | null => {
  const stored = sessionStorage.getItem(SESSION_KEY);
  if (stored) {
    try {
      return JSON.parse(stored) as User;
    } catch {
      return null;
    }
  }
  return null;
};

/**
 * Get all teachers
 */
export const getTeachers = async (): Promise<Teacher[]> => {
  return mockApiCall(() => {
    return [...teachers];
  });
};

/**
 * Get teacher by ID
 */
export const getTeacherById = async (id: string): Promise<Teacher> => {
  return mockApiCall(() => {
    const teacher = teachers.find((t) => t.id === id);
    if (!teacher) {
      throw new MockApiError("Teacher not found", 404);
    }
    return teacher;
  });
};

/**
 * Get teacher by email
 */
export const getTeacherByEmail = async (email: string): Promise<Teacher> => {
  return mockApiCall(() => {
    const teacher = teachers.find((t) => t.email === email);
    if (!teacher) {
      throw new MockApiError("Teacher not found", 404);
    }
    return teacher;
  });
};

/**
 * Update teacher profile
 */
export const updateTeacher = async (
  id: string,
  data: Partial<Teacher>,
): Promise<Teacher> => {
  return mockApiCall(() => {
    const currentUser = getCurrentAuthUser();

    // Authorization: Only the teacher themselves can update their profile
    if (!currentUser || currentUser.id !== id) {
      throw new MockApiError(
        "Unauthorized: You can only update your own profile",
        403,
      );
    }

    const index = teachers.findIndex((t) => t.id === id);
    if (index === -1) {
      throw new MockApiError("Teacher not found", 404);
    }

    teachers[index] = {
      ...teachers[index],
      ...data,
      id,
      role: "teacher",
      updatedAt: new Date(),
    };

    return teachers[index];
  });
};

// ========== STUDENTS ==========

/**
 * Get all students - Only teachers can view all students
 */
export const getStudents = async (): Promise<Student[]> => {
  return mockApiCall(() => {
    const currentUser = getCurrentAuthUser();

    // Authorization: Only teachers can view all students
    if (!currentUser || currentUser.role !== "teacher") {
      throw new MockApiError(
        "Unauthorized: Only teachers can view student list",
        403,
      );
    }

    return [...students];
  });
};

/**
 * Get student by ID
 */
export const getStudentById = async (id: string): Promise<Student> => {
  return mockApiCall(() => {
    const student = students.find((s) => s.id === id);
    if (!student) {
      throw new MockApiError("Student not found", 404);
    }
    return student;
  });
};

/**
 * Get student by email
 */
export const getStudentByEmail = async (email: string): Promise<Student> => {
  return mockApiCall(() => {
    const student = students.find((s) => s.email === email);
    if (!student) {
      throw new MockApiError("Student not found", 404);
    }
    return student;
  });
};

/**
 * Update student profile
 */
export const updateStudent = async (
  id: string,
  data: Partial<Student>,
): Promise<Student> => {
  return mockApiCall(() => {
    const currentUser = getCurrentAuthUser();

    // Authorization: Only the student themselves can update their profile
    if (!currentUser || currentUser.id !== id) {
      throw new MockApiError(
        "Unauthorized: You can only update your own profile",
        403,
      );
    }

    const index = students.findIndex((s) => s.id === id);
    if (index === -1) {
      throw new MockApiError("Student not found", 404);
    }

    students[index] = {
      ...students[index],
      ...data,
      id,
      role: "student",
      updatedAt: new Date(),
    };

    return students[index];
  });
};

// ========== AUTHENTICATION (Mock) ==========

/**
 * Mock login function
 */
export const login = async (email: string, password: string): Promise<User> => {
  return mockApiCall(() => {
    const teacher = teachers.find((t) => t.email === email);
    if (teacher) {
      // Store user in session storage
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(teacher));
      return teacher;
    }

    const student = students.find((s) => s.email === email);
    if (student) {
      // Store user in session storage
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(student));
      return student;
    }

    throw new MockApiError("Invalid credentials", 401);
  }, 1000);
};

/**
 * Mock logout function
 */
export const logout = async (): Promise<void> => {
  return mockApiCall(() => {
    // Clear session storage
    sessionStorage.removeItem(SESSION_KEY);
  }, 300);
};

/**
 * Get current user (mock)
 */
export const getCurrentUser = async (): Promise<User | null> => {
  return mockApiCall(() => {
    const stored = sessionStorage.getItem(SESSION_KEY);
    if (stored) {
      try {
        return JSON.parse(stored) as User;
      } catch {
        // Invalid stored data, clear it
        sessionStorage.removeItem(SESSION_KEY);
        return null;
      }
    }

    // For development: auto-login based on role preference
    // Remove this in production!
    if (import.meta.env.MODE === "development") {
      const rolePreference = sessionStorage.getItem(
        "yoga_booking_role_preference",
      );
      const defaultUser =
        rolePreference === "student" ? students[0] : teachers[0];
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(defaultUser));
      return defaultUser;
    }

    return null;
  }, 300);
};
