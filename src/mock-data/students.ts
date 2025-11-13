/**
 * Mock data for students
 */

import type { Student } from "@/types";
import { generateSequentialId } from "@/utils/id";

export const mockStudents: Student[] = [
  {
    id: generateSequentialId("student", 1),
    email: "emma.andresen@example.no",
    name: "Emma Andresen",
    phone: "+47 950 11 111",
    role: "student",
    avatar: undefined,
    emergencyContact: {
      name: "Per Andresen",
      phone: "+47 950 22 222",
      relationship: "Ektefelle",
    },
    medicalNotes: undefined,
    createdAt: new Date("2024-01-10"),
    updatedAt: new Date("2024-11-01"),
  },
  {
    id: generateSequentialId("student", 2),
    email: "noah.pedersen@example.no",
    name: "Noah Pedersen",
    phone: "+47 950 33 333",
    role: "student",
    avatar: undefined,
    emergencyContact: {
      name: "Linda Pedersen",
      phone: "+47 950 44 444",
      relationship: "Mor",
    },
    medicalNotes: "Astma - har inhalator med seg",
    createdAt: new Date("2024-02-15"),
    updatedAt: new Date("2024-10-28"),
  },
  {
    id: generateSequentialId("student", 3),
    email: "sofia.kristiansen@example.no",
    name: "Sofia Kristiansen",
    phone: "+47 950 55 555",
    role: "student",
    avatar: undefined,
    emergencyContact: {
      name: "Kristian Kristiansen",
      phone: "+47 950 66 666",
      relationship: "Far",
    },
    medicalNotes: undefined,
    createdAt: new Date("2024-03-05"),
    updatedAt: new Date("2024-11-02"),
  },
  {
    id: generateSequentialId("student", 4),
    email: "oliver.johansen@example.no",
    name: "Oliver Johansen",
    phone: "+47 950 77 777",
    role: "student",
    avatar: undefined,
    emergencyContact: {
      name: "Maria Johansen",
      phone: "+47 950 88 888",
      relationship: "Ektefelle",
    },
    medicalNotes: "Tidligere ryggskade - trenger modifiserte stillinger",
    createdAt: new Date("2024-04-12"),
    updatedAt: new Date("2024-10-30"),
  },
  {
    id: generateSequentialId("student", 5),
    email: "maja.hansen@example.no",
    name: "Maja Hansen",
    phone: "+47 950 99 999",
    role: "student",
    avatar: undefined,
    emergencyContact: {
      name: "Hans Hansen",
      phone: "+47 951 11 111",
      relationship: "Bror",
    },
    medicalNotes: undefined,
    createdAt: new Date("2024-05-20"),
    updatedAt: new Date("2024-11-04"),
  },
  {
    id: generateSequentialId("student", 6),
    email: "lucas.berg@example.no",
    name: "Lucas Berg",
    phone: "+47 951 22 222",
    role: "student",
    avatar: undefined,
    emergencyContact: {
      name: "Siri Berg",
      phone: "+47 951 33 333",
      relationship: "Mor",
    },
    medicalNotes: undefined,
    createdAt: new Date("2024-06-08"),
    updatedAt: new Date("2024-11-05"),
  },
  {
    id: generateSequentialId("student", 7),
    email: "ella.nilsen@example.no",
    name: "Ella Nilsen",
    phone: "+47 951 44 444",
    role: "student",
    avatar: undefined,
    emergencyContact: {
      name: "Tom Nilsen",
      phone: "+47 951 55 555",
      relationship: "Partner",
    },
    medicalNotes: undefined,
    createdAt: new Date("2024-07-14"),
    updatedAt: new Date("2024-11-06"),
  },
  {
    id: generateSequentialId("student", 8),
    email: "william.larsen@example.no",
    name: "William Larsen",
    phone: "+47 951 66 666",
    role: "student",
    avatar: undefined,
    emergencyContact: {
      name: "Eva Larsen",
      phone: "+47 951 77 777",
      relationship: "Søster",
    },
    medicalNotes: "Høyt blodtrykk - unngå intense økter",
    createdAt: new Date("2024-08-22"),
    updatedAt: new Date("2024-11-07"),
  },
  {
    id: generateSequentialId("student", 9),
    email: "alma.olsen@example.no",
    name: "Alma Olsen",
    phone: "+47 951 88 888",
    role: "student",
    avatar: undefined,
    emergencyContact: {
      name: "Ola Olsen",
      phone: "+47 951 99 999",
      relationship: "Far",
    },
    medicalNotes: undefined,
    createdAt: new Date("2024-09-10"),
    updatedAt: new Date("2024-11-08"),
  },
  {
    id: generateSequentialId("student", 10),
    email: "aksel.jensen@example.no",
    name: "Aksel Jensen",
    phone: "+47 952 11 111",
    role: "student",
    avatar: undefined,
    emergencyContact: {
      name: "Kari Jensen",
      phone: "+47 952 22 222",
      relationship: "Mor",
    },
    medicalNotes: undefined,
    createdAt: new Date("2024-10-01"),
    updatedAt: new Date("2024-11-09"),
  },
];

/**
 * Get student by ID
 */
export const getStudentById = (id: string): Student | undefined => {
  return mockStudents.find((student) => student.id === id);
};

/**
 * Get student by email
 */
export const getStudentByEmail = (email: string): Student | undefined => {
  return mockStudents.find((student) => student.email === email);
};
