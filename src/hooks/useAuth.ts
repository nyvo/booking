/**
 * Custom hooks for authentication and user management
 */

import { useState, useEffect } from "react";
import type { User, Teacher, Student } from "@/types";
import {
  getTeachers,
  getTeacherById,
  updateTeacher,
  getStudents,
  getStudentById,
  updateStudent,
  login,
  logout,
  getCurrentUser,
} from "@/services/userService";

/**
 * Hook to manage authentication
 */
export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        setLoading(true);
        const currentUser = await getCurrentUser();
        setUser(currentUser);
        setError(null);
      } catch (err) {
        setError(
          err instanceof Error
            ? err
            : new Error("Failed to fetch current user"),
        );
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchCurrentUser();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      const loggedInUser = await login(email, password);
      setUser(loggedInUser);
      return loggedInUser;
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to log in");
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      setError(null);
      await logout();
      setUser(null);
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to log out");
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return { user, loading, error, signIn, signOut };
};

/**
 * Hook to fetch all teachers
 */
export const useTeachers = () => {
  const [data, setData] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        setLoading(true);
        const result = await getTeachers();
        setData(result);
        setError(null);
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error("Failed to fetch teachers"),
        );
      } finally {
        setLoading(false);
      }
    };

    fetchTeachers();
  }, []);

  return { data, loading, error };
};

/**
 * Hook to fetch a single teacher by ID
 */
export const useTeacher = (id: string | undefined) => {
  const [data, setData] = useState<Teacher | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    const fetchTeacher = async () => {
      try {
        setLoading(true);
        const result = await getTeacherById(id);
        setData(result);
        setError(null);
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error("Failed to fetch teacher"),
        );
      } finally {
        setLoading(false);
      }
    };

    fetchTeacher();
  }, [id]);

  return { data, loading, error };
};

/**
 * Hook to update teacher profile
 */
export const useTeacherMutations = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const update = async (id: string, data: Partial<Teacher>) => {
    try {
      setLoading(true);
      setError(null);
      const result = await updateTeacher(id, data);
      return result;
    } catch (err) {
      const error =
        err instanceof Error ? err : new Error("Failed to update teacher");
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return { update, loading, error };
};

/**
 * Hook to fetch all students
 */
export const useStudents = () => {
  const [data, setData] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true);
        const result = await getStudents();
        setData(result);
        setError(null);
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error("Failed to fetch students"),
        );
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);

  return { data, loading, error };
};

/**
 * Hook to fetch a single student by ID
 */
export const useStudent = (id: string | undefined) => {
  const [data, setData] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    const fetchStudent = async () => {
      try {
        setLoading(true);
        const result = await getStudentById(id);
        setData(result);
        setError(null);
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error("Failed to fetch student"),
        );
      } finally {
        setLoading(false);
      }
    };

    fetchStudent();
  }, [id]);

  return { data, loading, error };
};

/**
 * Hook to update student profile
 */
export const useStudentMutations = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const update = async (id: string, data: Partial<Student>) => {
    try {
      setLoading(true);
      setError(null);
      const result = await updateStudent(id, data);
      return result;
    } catch (err) {
      const error =
        err instanceof Error ? err : new Error("Failed to update student");
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return { update, loading, error };
};
