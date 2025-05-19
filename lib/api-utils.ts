// lib/api-utils.ts
import { safeFetchJson } from "./fetch-interceptor"

/**
 * Utility function to get the correct API URL based on the environment
 */
export function getApiUrl(path: string): string {
  // Remove leading slash if present
  const cleanPath = path.startsWith("/") ? path.substring(1) : path

  // Always return a relative path starting with /api/
  return `/api/${cleanPath}`
}

/**
 * Create fetch options with appropriate headers
 */
export function createFetchOptions(options: RequestInit = {}): RequestInit {
  return {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  }
}

/**
 * Fetch data from API using the safe fetch interceptor
 */
export async function fetchFromApi<T = any>(path: string, options: RequestInit = {}): Promise<T> {
  const url = getApiUrl(path)
  return safeFetchJson<T>(url, createFetchOptions(options))
}

/**
 * Post data to API using the safe fetch interceptor
 */
export async function postToApi<T = any>(path: string, data: any, options: RequestInit = {}): Promise<T> {
  const url = getApiUrl(path)
  return safeFetchJson<T>(url, {
    ...createFetchOptions(options),
    method: "POST",
    body: JSON.stringify(data),
  })
}
