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

export const tasksApi = {
  list: (params = {}) => apiGet(`/tasks/${toQuery(params)}`),
  get: (taskId) => apiGet(`/tasks/${encodeURIComponent(taskId)}/`),
  create: (payload) => apiPost("/tasks/", payload),
  update: (taskId, payload) => apiPatch(`/tasks/${encodeURIComponent(taskId)}/`, payload),
  replace: (taskId, payload) => apiPut(`/tasks/${encodeURIComponent(taskId)}/`, payload),
  remove: (taskId) => apiDelete(`/tasks/${encodeURIComponent(taskId)}/`),
};
