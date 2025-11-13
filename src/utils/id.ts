/**
 * Utility functions for generating unique IDs
 */

/**
 * Generate a unique ID for mock data
 */
export const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Generate a sequential ID with prefix
 */
export const generateSequentialId = (prefix: string, index: number): string => {
  return `${prefix}-${String(index).padStart(4, '0')}`;
};
