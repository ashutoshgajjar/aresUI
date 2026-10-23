import { apiDelete, apiGet, apiPatch, apiPost, apiPut } from "@/api/client";

function toQuery(params = {}) {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    search.set(key, typeof value === "object" ? JSON.stringify(value) : String(value));
  });
  const query = search.toString();
  return query ? `?${query}` : "";
}

export const usersApi = {
  list: (params = {}) => apiGet(`/users/${toQuery(params)}`),
  get: (userId) => apiGet(`/users/${encodeURIComponent(userId)}/`),
  create: (payload) => apiPost("/users/", payload),
  update: (userId, payload) => apiPatch(`/users/${encodeURIComponent(userId)}/`, payload),
  replace: (userId, payload) => apiPut(`/users/${encodeURIComponent(userId)}/`, payload),
  remove: (userId) => apiDelete(`/users/${encodeURIComponent(userId)}/`),
};
