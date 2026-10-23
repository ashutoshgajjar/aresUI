import { apiGet, apiPost, clearCsrfToken } from "@/api/client";

export const authApi = {
  csrf: () => apiGet("/auth/csrf/"),

  login: ({ email, password, ...rest }) =>
    apiPost("/auth/login/", {
      contact: { email },
      security: { password },
      ...rest,
    }),

  register: (payload) => apiPost("/auth/register/", payload),

  me: () => apiGet("/auth/me/"),

  refresh: () => apiPost("/auth/token/refresh/"),

  logout: async () => {
    const response = await apiPost("/auth/logout/");
    clearCsrfToken();
    return response;
  },
};
