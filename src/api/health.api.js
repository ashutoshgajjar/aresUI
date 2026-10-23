import { apiGet } from "@/api/client";

export const healthApi = {
  check: () => apiGet("/health/", { retryOn401: false }),
};
