import axios from "axios";

export function resolveApiErrorMessage(
  error: unknown,
  fallback = "Something went wrong. Please try again.",
) {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as
      | { message?: string | string[] }
      | undefined;

    if (Array.isArray(data?.message)) {
      return data.message[0] ?? fallback;
    }

    if (typeof data?.message === "string") {
      return data.message;
    }
  }

  return fallback;
}
