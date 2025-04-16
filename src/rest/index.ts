/**
 * Check whether an error indicates that a retry can be attempted
 *
 * @param error - The error thrown by the network request
 * @returns Whether the error indicates a retry should be attempted
 */
export function shouldRetry(error: Error | NodeJS.ErrnoException) {
  // Retry for possible timed out requests
  if (error.name == "AbortError") return true;
  // Downlevel ECONNRESET to retry as it may be recoverable
  return ("code" in error && error.code == "ECONNRESET") || error.message.includes("ECONNRESET");
}

// This type should be exported from revolt-api
export type { AxiosRequestConfig } from "axios";
