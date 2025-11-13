/**
 * Mock data for teachers
 */

import type { Teacher } from "@/types";
import { generateSequentialId } from "@/utils/id";

export const mockTeachers: Teacher[] = [
  {
    id: generateSequentialId("teacher", 1),
    email: "kari.nordmann@yoga.no",
    name: "Kari Nordmann",
    phone: "+47 900 12 345",
    role: "teacher",
    avatar: undefined,
    bio: "Sertifisert yogainstruktør med 10 års erfaring. Spesialiserer meg i Hatha og Vinyasa yoga.",
    specialties: ["Hatha Yoga", "Vinyasa Yoga", "Meditasjon"],
    website: "https://karinordmann-yoga.no",
    createdAt: new Date("2023-01-15"),
    updatedAt: new Date("2024-11-01"),
  },
  {
    id: generateSequentialId("teacher", 2),
    email: "lars.hansen@yoga.no",
    name: "Lars Hansen",
    phone: "+47 900 23 456",
    role: "teacher",
    avatar: undefined,
    bio: "Yogainstruktør og fysioterapeut. Fokuserer på terapeutisk yoga og rehabilitering.",
    specialties: ["Terapeutisk Yoga", "Yin Yoga", "Restorative Yoga"],
    website: undefined,
    createdAt: new Date("2023-03-20"),
    updatedAt: new Date("2024-10-15"),
  },
  {
    id: generateSequentialId("teacher", 3),
    email: "anne.berg@yoga.no",
    name: "Anne Berg",
    phone: "+47 900 34 567",
    role: "teacher",
    avatar: undefined,
    bio: "Lidenskapelig om dynamisk yoga og mindfulness. Holder regelmessige workshops og retreats.",
    specialties: ["Power Yoga", "Ashtanga Yoga", "Mindfulness"],
    website: "https://anneberg-yoga.no",
    createdAt: new Date("2023-06-10"),
    updatedAt: new Date("2024-11-05"),
  },
  {
    id: generateSequentialId("teacher", 4),
    email: "ole.jensen@yoga.no",
    name: "Ole Jensen",
    phone: "+47 900 45 678",
    role: "teacher",
    avatar: undefined,
    bio: "Erfaren instruktør i klassisk yoga. Liker å jobbe med nybegynnere og seniorer.",
    specialties: ["Hatha Yoga", "Senioryoga", "Nybegynneryoga"],
    website: undefined,
    createdAt: new Date("2023-08-01"),
    updatedAt: new Date("2024-10-20"),
  },
  {
    id: generateSequentialId("teacher", 5),
    email: "mari.olsen@yoga.no",
    name: "Mari Olsen",
    phone: "+47 900 56 789",
    role: "teacher",
    avatar: undefined,
    bio: "Spesialist i prenatal og postnatal yoga. Hjelper kvinner gjennom hele svangerskapet og etterpå.",
    specialties: ["Prenatal Yoga", "Postnatal Yoga", "Kvinners helse"],
    website: "https://mariolsen-yoga.no",
    createdAt: new Date("2023-09-15"),
    updatedAt: new Date("2024-11-03"),
  },
];

/**
 * Get teacher by ID
 */
export const getTeacherById = (id: string): Teacher | undefined => {
  return mockTeachers.find((teacher) => teacher.id === id);
};

/**
 * Get teacher by email
 */
export const getTeacherByEmail = (email: string): Teacher | undefined => {
  return mockTeachers.find((teacher) => teacher.email === email);
};
