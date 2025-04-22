/**
 * Utility functions for handling network requests
 */

/**
 * Check if the error is a network connectivity issue
 */
export function isNetworkError(error: any): boolean {
  return (
    error?.message === "Failed to fetch" ||
    error?.message?.includes("NetworkError") ||
    error?.message?.includes("Network request failed") ||
    error?.name === "AbortError" ||
    error?.code === "ERR_NAME_NOT_RESOLVED"
  );
}

/**
 * Format a user-friendly error message for network issues
 */
export function getNetworkErrorMessage(error: any): string {
  if (isNetworkError(error)) {
    return "Network connection issue. Please check your internet connection and try again.";
  }
  return error?.message || "An unknown error occurred";
}
