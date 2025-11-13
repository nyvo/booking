/**
 * Date utility functions with Norwegian formatting
 */

import {
  format,
  formatDistance,
  formatRelative,
  parseISO,
  addDays,
  addWeeks,
  startOfWeek,
  endOfWeek,
  isSameDay,
  isPast,
  isFuture,
  isToday,
} from "date-fns";
import { nb } from "date-fns/locale";
import { DATE_FORMATS } from "@/config/constants";

/**
 * Format a date with the specified format string
 */
export const formatDate = (
  date: Date | string,
  formatString: string = DATE_FORMATS.DISPLAY,
): string => {
  const dateObj = typeof date === "string" ? parseISO(date) : date;
  return format(dateObj, formatString, { locale: nb });
};

/**
 * Format date for display (dd.MM.yyyy)
 */
export const formatDisplayDate = (date: Date | string): string => {
  return formatDate(date, DATE_FORMATS.DISPLAY);
};

/**
 * Format date and time for display (dd.MM.yyyy HH:mm)
 */
export const formatDisplayDateTime = (date: Date | string): string => {
  return formatDate(date, DATE_FORMATS.DISPLAY_WITH_TIME);
};

/**
 * Format time only (HH:mm)
 */
export const formatTime = (date: Date | string): string => {
  return formatDate(date, DATE_FORMATS.TIME_ONLY);
};

/**
 * Format weekday short (Man, Tir, Ons, etc.)
 */
export const formatWeekdayShort = (date: Date | string): string => {
  return formatDate(date, DATE_FORMATS.WEEKDAY_SHORT);
};

/**
 * Format month and year (januar 2025)
 */
export const formatMonthYear = (date: Date | string): string => {
  return formatDate(date, DATE_FORMATS.MONTH_YEAR);
};

/**
 * Format relative time (e.g., "2 timer siden", "om 3 dager")
 */
export const formatRelativeTime = (
  date: Date | string,
  baseDate: Date = new Date(),
): string => {
  const dateObj = typeof date === "string" ? parseISO(date) : date;
  return formatDistance(dateObj, baseDate, { addSuffix: true, locale: nb });
};

/**
 * Format relative date with context (e.g., "i går kl. 14:30", "i morgen kl. 10:00")
 */
export const formatRelativeDate = (
  date: Date | string,
  baseDate: Date = new Date(),
): string => {
  const dateObj = typeof date === "string" ? parseISO(date) : date;
  return formatRelative(dateObj, baseDate, { locale: nb });
};

/**
 * Get display text for date (I dag, I morgen, I går, or formatted date)
 */
export const getDateDisplayText = (date: Date | string): string => {
  const dateObj = typeof date === "string" ? parseISO(date) : date;
  const now = new Date();
  const tomorrow = addDays(now, 1);
  const yesterday = addDays(now, -1);

  if (isToday(dateObj)) {
    return "I dag";
  }
  if (isSameDay(dateObj, tomorrow)) {
    return "I morgen";
  }
  if (isSameDay(dateObj, yesterday)) {
    return "I går";
  }

  return formatDisplayDate(dateObj);
};

/**
 * Create a date-time string for display
 */
export const formatDateTimeDisplay = (
  date: Date | string,
  time: string,
): string => {
  const dateText = getDateDisplayText(date);
  return `${dateText} kl. ${time}`;
};

/**
 * Check if date is in the past
 */
export const isDatePast = (date: Date | string): boolean => {
  const dateObj = typeof date === "string" ? parseISO(date) : date;
  return isPast(dateObj);
};

/**
 * Check if date is in the future
 */
export const isDateFuture = (date: Date | string): boolean => {
  const dateObj = typeof date === "string" ? parseISO(date) : date;
  return isFuture(dateObj);
};

/**
 * Check if date is today
 */
export const isDateToday = (date: Date | string): boolean => {
  const dateObj = typeof date === "string" ? parseISO(date) : date;
  return isToday(dateObj);
};

/**
 * Add days to a date
 */
export const addDaysToDate = (date: Date | string, days: number): Date => {
  const dateObj = typeof date === "string" ? parseISO(date) : date;
  return addDays(dateObj, days);
};

/**
 * Add weeks to a date
 */
export const addWeeksToDate = (date: Date | string, weeks: number): Date => {
  const dateObj = typeof date === "string" ? parseISO(date) : date;
  return addWeeks(dateObj, weeks);
};

/**
 * Get start of week (Monday)
 */
export const getStartOfWeek = (date: Date | string): Date => {
  const dateObj = typeof date === "string" ? parseISO(date) : date;
  return startOfWeek(dateObj, { locale: nb, weekStartsOn: 1 });
};

/**
 * Get end of week (Sunday)
 */
export const getEndOfWeek = (date: Date | string): Date => {
  const dateObj = typeof date === "string" ? parseISO(date) : date;
  return endOfWeek(dateObj, { locale: nb, weekStartsOn: 1 });
};

/**
 * Parse ISO string to Date
 */
export const parseISOString = (dateString: string): Date => {
  return parseISO(dateString);
};

/**
 * Combine date and time string to create a Date object
 */
export const combineDateAndTime = (
  date: Date | string,
  timeString: string,
): Date => {
  const dateObj = typeof date === "string" ? parseISO(date) : date;
  const [hours, minutes] = timeString.split(":").map(Number);

  const combined = new Date(dateObj);
  combined.setHours(hours, minutes, 0, 0);

  return combined;
};

/**
 * Get duration text in Norwegian (e.g., "1 time", "2 timer", "1 time 30 min")
 */
export const getDurationText = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (hours === 0) {
    return `${mins} min`;
  }
  if (mins === 0) {
    return hours === 1 ? "1 time" : `${hours} timer`;
  }
  const hourText = hours === 1 ? "1 time" : `${hours} timer`;
  return `${hourText} ${mins} min`;
};

/**
 * Format currency in Norwegian format (NOK)
 */
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("nb-NO", {
    style: "currency",
    currency: "NOK",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};
