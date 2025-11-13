/**
 * Mock API service layer
 * Simulates API calls with delays to mimic real network requests
 */

import type {
  PaginatedResponse,
  PaginationParams,
  FilterOptions,
} from "@/types";

/**
 * Simulate network delay
 */
const delay = (ms: number = 500): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

/**
 * Generic paginate function
 */
export const paginate = <T>(
  data: T[],
  params: PaginationParams,
): PaginatedResponse<T> => {
  const { page, pageSize } = params;
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  const paginatedData = data.slice(start, end);

  return {
    data: paginatedData,
    total: data.length,
    page,
    pageSize,
    totalPages: Math.ceil(data.length / pageSize),
  };
};

/**
 * Generic filter function
 */
export const filterBySearch = <T extends Record<string, any>>(
  data: T[],
  searchTerm: string,
  searchFields: (keyof T)[],
): T[] => {
  if (!searchTerm) return data;

  const lowerSearch = searchTerm.toLowerCase();
  return data.filter((item) =>
    searchFields.some((field) => {
      const value = item[field];
      return value && String(value).toLowerCase().includes(lowerSearch);
    }),
  );
};

/**
 * Mock API response wrapper
 */
export const mockApiCall = async <T>(
  operation: () => T,
  delayMs: number = 500,
): Promise<T> => {
  await delay(delayMs);

  try {
    return operation();
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : "Unknown error occurred",
    );
  }
};

/**
 * Mock API error
 */
export class MockApiError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
  ) {
    super(message);
    this.name = "MockApiError";
  }
}
