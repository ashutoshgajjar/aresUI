import { apiDelete, apiGet, apiPatch, apiPut, apiPost } from "@/api/client";

function toQuery(params = {}) {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    search.set(key, typeof value === "object" ? JSON.stringify(value) : String(value));
  });
  const query = search.toString();
  return query ? `?${query}` : "";
}

function buildMultipart({ file, name, taskId, userId, metadata }) {
  const form = new FormData();
  form.append("file", file);
  if (name) form.append("name", name);
  if (taskId) form.append("task_id", taskId);
  if (userId) form.append("user_id", userId);
  if (metadata !== undefined) form.append("metadata", JSON.stringify(metadata));
  return form;
}

export const filesApi = {
  list: (params = {}) => apiGet(`/files/${toQuery(params)}`),

  upload: (payload) =>
    apiPost(
      "/files/",
      buildMultipart(payload),
    ),

  get: (fileId) => apiGet(`/files/${encodeURIComponent(fileId)}/`),

  patchMetadata: (fileId, payload) =>
    apiPatch(`/files/${encodeURIComponent(fileId)}/`, payload),

  replace: (fileId, payload) =>
    apiPut(
      `/files/${encodeURIComponent(fileId)}/`,
      buildMultipart(payload),
    ),

  history: (fileId, params = {}) =>
    apiGet(`/files/${encodeURIComponent(fileId)}/versions/${toQuery(params)}`),

  downloadUrl: (fileId, version) =>
    apiGet(
      `/files/${encodeURIComponent(fileId)}/download-url/${version ? `?version=${encodeURIComponent(version)}` : ""}`,
    ),

  remove: (fileId) => apiDelete(`/files/${encodeURIComponent(fileId)}/`),
};
