// const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "/api/v1").replace(/\/$/, "");

// let csrfToken = null;
// let refreshPromise = null;

// export class ApiError extends Error {
//   constructor(message, { status = 0, code = "api_error", details = null, response = null } = {}) {
//     super(message);
//     this.name = "ApiError";
//     this.status = status;
//     this.code = code;
//     this.details = details;
//     this.response = response;
//   }
// }

// const isUnsafeMethod = (method) => !["GET", "HEAD", "OPTIONS"].includes(method.toUpperCase());
// const isAuthPath = (path) =>
//   path.startsWith("/auth/login") ||
//   path.startsWith("/auth/register") ||
//   path.startsWith("/auth/csrf");

// function buildUrl(path) {
//   if (/^https?:\/\//i.test(path)) return path;
//   return `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
// }

// function readCookie(name) {
//   const prefix = `${encodeURIComponent(name)}=`;
//   const found = document.cookie.split(";").map((value) => value.trim()).find((value) => value.startsWith(prefix));
//   return found ? decodeURIComponent(found.slice(prefix.length)) : null;
// }

// async function parseResponse(response) {
//   const contentType = response.headers.get("content-type") || "";
//   if (response.status === 204) return null;
//   if (contentType.includes("application/json")) {
//     try {
//       return await response.json();
//     } catch {
//       return null;
//     }
//   }
//   return await response.text();
// }

// function createApiError(response, body) {
//   const error = body?.error;
//   if (error) {
//     return new ApiError(
//       typeof error.message === "string" ? error.message : "API request failed.",
//       {
//         status: response.status,
//         code: error.code || "api_error",
//         details: error.message ?? null,
//         response,
//       },
//     );
//   }

//   return new ApiError(
//     typeof body === "string" && body ? body : `Request failed with status ${response.status}.`,
//     {
//       status: response.status,
//       code: "api_error",
//       details: body,
//       response,
//     },
//   );
// }

// export async function getCsrfToken({ force = false } = {}) {
//   if (csrfToken && !force) return csrfToken;

//   const response = await fetch(buildUrl("/auth/csrf/"), {
//     method: "GET",
//     credentials: "include",
//     headers: { Accept: "application/json" },
//   });

//   const body = await parseResponse(response);
//   if (!response.ok) throw createApiError(response, body);

//   csrfToken = body?.csrfToken || readCookie("csrftoken") || null;
//   if (!csrfToken) {
//     throw new ApiError("CSRF token was not returned by the backend.", { status: response.status, code: "csrf_error" });
//   }

//   return csrfToken;
// }

// async function ensureCsrf() {
//   return getCsrfToken();
// }

// async function refreshSession() {
//   if (refreshPromise) return refreshPromise;

//   refreshPromise = (async () => {
//     await ensureCsrf();

//     const response = await fetch(buildUrl("/auth/token/refresh/"), {
//       method: "POST",
//       credentials: "include",
//       headers: {
//         Accept: "application/json",
//         "X-CSRFToken": csrfToken,
//       },
//     });

//     const body = await parseResponse(response);
//     if (!response.ok) throw createApiError(response, body);
//     return body;
//   })().finally(() => {
//     refreshPromise = null;
//   });

//   return refreshPromise;
// }

// export async function apiRequest(path, options = {}) {
//   const {
//     method = "GET",
//     body,
//     headers = {},
//     signal,
//     retryOn401 = true,
//     ...rest
//   } = options;

//   const requestMethod = method.toUpperCase();
//   const requestHeaders = new Headers(headers);
//   requestHeaders.set("Accept", requestHeaders.get("Accept") || "application/json");

//   let requestBody = body;
//   const isFormData = body instanceof FormData;
//   const isBlob = body instanceof Blob;
//   const isStringBody = typeof body === "string";

//   if (body !== undefined && body !== null && !isFormData && !isBlob && !isStringBody) {
//     requestHeaders.set("Content-Type", requestHeaders.get("Content-Type") || "application/json");
//     requestBody = JSON.stringify(body);
//   }

//   if (isUnsafeMethod(requestMethod)) {
//     if (!isAuthPath(path) || path.startsWith("/auth/login") || path.startsWith("/auth/register") || path.startsWith("/auth/token/refresh")) {
//       await ensureCsrf();
//       requestHeaders.set("X-CSRFToken", csrfToken);
//     }
//   }

//   const response = await fetch(buildUrl(path), {
//     ...rest,
//     method: requestMethod,
//     body: requestBody,
//     headers: requestHeaders,
//     credentials: "include",
//     signal,
//   });

//   const responseBody = await parseResponse(response);

//   const isAuthEndpoint = [
//     "/auth/login",
//     "/auth/register",
//     "/auth/token/refresh",
//     "/auth/logout",
//     "/auth/csrf",
//   ].some((endpoint) => path.startsWith(endpoint));

//   if (response.status === 401 && retryOn401 && !isAuthEndpoint && !path.startsWith("/health")) {
//     try {
//       await refreshSession();
//       return apiRequest(path, { ...options, retryOn401: false });
//     } catch {
//       // Return the original authentication error to the caller.
//     }
//   }

//   if (!response.ok) {
//     throw createApiError(response, responseBody);
//   }

//   return responseBody;
// }

// export async function apiGet(path, options = {}) {
//   return apiRequest(path, { ...options, method: "GET" });
// }

// export async function apiPost(path, body, options = {}) {
//   return apiRequest(path, { ...options, method: "POST", body });
// }

// export async function apiPatch(path, body, options = {}) {
//   return apiRequest(path, { ...options, method: "PATCH", body });
// }

// export async function apiPut(path, body, options = {}) {
//   return apiRequest(path, { ...options, method: "PUT", body });
// }

// export async function apiDelete(path, options = {}) {
//   return apiRequest(path, { ...options, method: "DELETE" });
// }

// export function clearCsrfToken() {
//   csrfToken = null;
// }

// export const apiConfig = {
//   baseUrl: API_BASE_URL,
// };
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

let csrfToken = null;
let refreshPromise = null;

const UNSAFE_METHODS = new Set([
  "POST",
  "PUT",
  "PATCH",
  "DELETE",
]);

const AUTH_PATHS = [
  "/auth/login",
  "/auth/register",
  "/auth/token/refresh",
  "/auth/logout",
  "/auth/csrf",
];

export class ApiError extends Error {
  constructor(
    message,
    {
      status = 0,
      code = "api_error",
      details = null,
      fieldErrors = {},
      response = null,
      requestId = null,
      path = null,
    } = {},
  ) {
    super(message);

    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.details = details;
    this.fieldErrors = fieldErrors;
    this.response = response;
    this.requestId = requestId;
    this.path = path;
  }

  get isValidationError() {
    return (
      this.code === "validation_error" ||
      Object.keys(this.fieldErrors).length > 0
    );
  }

  get isNotFound() {
    return (
      this.status === 404 ||
      [
        "not_found",
        "user_not_found",
        "file_not_found",
        "task_not_found",
      ].includes(this.code)
    );
  }

  get isAuthenticationError() {
    return (
      this.status === 401 ||
      [
        "authentication_failed",
        "token_not_valid",
        "session_invalid",
        "session_revoked",
      ].includes(this.code)
    );
  }

  get isPermissionError() {
    return (
      this.status === 403 ||
      [
        "permission_denied",
        "not_authenticated",
        "csrf_failed",
      ].includes(this.code)
    );
  }
}

/**
 * Convert nested DRF validation errors into dot notation.
 *
 * Example:
 *
 * {
 *   contact: {
 *     email: ["Email is required."]
 *   },
 *   security: {
 *     password: ["This password is too short."]
 *   }
 * }
 *
 * becomes:
 *
 * {
 *   "contact.email": "Email is required.",
 *   "security.password": "This password is too short."
 * }
 */
function flattenFieldErrors(value, prefix = "", result = {}) {
  if (value === null || value === undefined) {
    return result;
  }

  if (typeof value === "string") {
    if (prefix) {
      result[prefix] = value;
    }
    return result;
  }

  if (Array.isArray(value)) {
    const messages = value
      .filter(Boolean)
      .map((item) => {
        if (typeof item === "string") {
          return item;
        }

        if (item && typeof item === "object") {
          return JSON.stringify(item);
        }

        return String(item);
      });

    if (prefix && messages.length > 0) {
      result[prefix] = messages.join(" ");
    }

    return result;
  }

  if (typeof value === "object") {
    Object.entries(value).forEach(([key, childValue]) => {
      const childPrefix =
        prefix && key
          ? `${prefix}.${key}`
          : key;

      flattenFieldErrors(
        childValue,
        childPrefix,
        result,
      );
    });
  }

  return result;
}

/**
 * Convert API errors into a useful user-facing message.
 */
function resolveErrorMessage(message, fallback) {
  if (typeof message === "string" && message.trim()) {
    return message;
  }

  if (Array.isArray(message)) {
    const messages = message
      .filter(Boolean)
      .map((item) =>
        typeof item === "string"
          ? item
          : JSON.stringify(item),
      );

    if (messages.length > 0) {
      return messages.join(" ");
    }
  }

  if (message && typeof message === "object") {
    const fieldErrors = flattenFieldErrors(message);

    const formError =
      fieldErrors.form ||
      fieldErrors.non_field_errors ||
      fieldErrors.detail;

    if (formError) {
      return formError;
    }

    const firstError = Object.values(fieldErrors)[0];

    if (firstError) {
      return firstError;
    }
  }

  return fallback;
}

/**
 * Get a fallback error code when an older backend response
 * does not provide a specific code.
 */
function getFallbackErrorCode(path, status) {
  if (status === 400) {
    return "validation_error";
  }

  if (status === 401) {
    return "authentication_failed";
  }

  if (status === 403) {
    return "permission_denied";
  }

  if (status === 404) {
    if (path.startsWith("/files/")) {
      return "file_not_found";
    }

    if (path.startsWith("/users/")) {
      return "user_not_found";
    }

    if (path.startsWith("/tasks/")) {
      return "task_not_found";
    }

    return "not_found";
  }

  if (status === 409) {
    return "conflict";
  }

  if (status === 413) {
    return "file_too_large";
  }

  if (status === 422) {
    return "validation_error";
  }

  if (status >= 500) {
    return "server_error";
  }

  return "api_error";
}

/**
 * Check whether this endpoint belongs to authentication.
 */
function isAuthPath(path) {
  return AUTH_PATHS.some((endpoint) =>
    path.startsWith(endpoint),
  );
}

/**
 * Check whether a request can modify server state.
 */
const isUnsafeMethod = (method) =>
  UNSAFE_METHODS.has(method.toUpperCase());

function buildUrl(path) {
  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  return `${API_BASE_URL}${
    path.startsWith("/") ? path : `/${path}`
  }`;
}

function readCookie(name) {
  if (
    typeof document === "undefined" ||
    !document.cookie
  ) {
    return null;
  }

  const prefix = `${encodeURIComponent(name)}=`;

  const found = document.cookie
    .split(";")
    .map((value) => value.trim())
    .find((value) => value.startsWith(prefix));

  return found
    ? decodeURIComponent(
        found.slice(prefix.length),
      )
    : null;
}

async function parseResponse(response) {
  const contentType =
    response.headers.get("content-type") || "";

  if (response.status === 204) {
    return null;
  }

  if (contentType.includes("application/json")) {
    try {
      return await response.json();
    } catch {
      return null;
    }
  }

  try {
    return await response.text();
  } catch {
    return null;
  }
}

function createApiError(
  response,
  body,
  path = "",
) {
  const error = body?.error;

  const status = response?.status || 0;

  const serverCode =
    error?.code || null;

  const code =
    serverCode ||
    getFallbackErrorCode(path, status);

  const messageSource =
    error?.message ??
    body?.message ??
    body?.detail ??
    body;

  const fieldErrors =
    messageSource &&
    typeof messageSource === "object"
      ? flattenFieldErrors(messageSource)
      : {};

  const fallbackMessage = (() => {
    switch (code) {
      case "user_not_found":
        return "The requested user was not found.";

      case "file_not_found":
        return "The requested file was not found.";

      case "task_not_found":
        return "The requested task was not found.";

      case "authentication_failed":
        return "Email or password is incorrect.";

      case "permission_denied":
        return "You do not have permission to perform this action.";

      case "validation_error":
        return "Please correct the highlighted fields.";

      case "csrf_failed":
        return "Your security token has expired. Please try again.";

      case "file_too_large":
        return "The selected file is too large.";

      case "conflict":
        return "This request conflicts with existing data.";

      case "server_error":
        return "The server encountered an error. Please try again later.";

      default:
        return `Request failed with status ${status}.`;
    }
  })();

  const message =
    resolveErrorMessage(
      messageSource,
      fallbackMessage,
    );

  const requestId =
    error?.request_id ||
    response?.headers?.get("X-Request-ID") ||
    null;

  return new ApiError(
    message,
    {
      status,
      code,
      details: messageSource,
      fieldErrors,
      response,
      requestId,
      path,
    },
  );
}

function createNetworkError(error, path) {
  return new ApiError(
    "Unable to connect to the server.",
    {
      status: 0,
      code: "network_error",
      details: error,
      path,
    },
  );
}

export async function getCsrfToken({
  force = false,
} = {}) {
  if (csrfToken && !force) {
    return csrfToken;
  }

  try {
    const response = await fetch(
      buildUrl("/auth/csrf/"),
      {
        method: "GET",
        credentials: "include",
        headers: {
          Accept: "application/json",
        },
      },
    );

    const body = await parseResponse(response);

    if (!response.ok) {
      throw createApiError(
        response,
        body,
        "/auth/csrf/",
      );
    }

    csrfToken =
      body?.csrfToken ||
      readCookie("csrftoken") ||
      null;

    if (!csrfToken) {
      throw new ApiError(
        "CSRF token was not returned by the backend.",
        {
          status: response.status,
          code: "csrf_error",
          details: body,
          response,
          path: "/auth/csrf/",
        },
      );
    }

    return csrfToken;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    throw createNetworkError(
      error,
      "/auth/csrf/",
    );
  }
}

async function ensureCsrf() {
  return getCsrfToken();
}

/**
 * Refresh the current authentication session.
 *
 * Only one refresh request can run at a time.
 * Other requests wait for the same promise.
 */
async function refreshSession() {
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = (async () => {
    await ensureCsrf();

    let response;

    try {
      response = await fetch(
        buildUrl("/auth/token/refresh/"),
        {
          method: "POST",
          credentials: "include",
          headers: {
            Accept: "application/json",
            "X-CSRFToken": csrfToken,
          },
        },
      );
    } catch (error) {
      throw createNetworkError(
        error,
        "/auth/token/refresh/",
      );
    }

    const body = await parseResponse(response);

    if (!response.ok) {
      throw createApiError(
        response,
        body,
        "/auth/token/refresh/",
      );
    }

    return body;
  })().finally(() => {
    refreshPromise = null;
  });

  return refreshPromise;
}

/**
 * Main API request function.
 */
export async function apiRequest(
  path,
  options = {},
) {
  const {
    method = "GET",
    body,
    headers = {},
    signal,
    retryOn401 = true,
    retryOnCsrf = true,
    ...rest
  } = options;

  const requestMethod =
    method.toUpperCase();

  const requestHeaders =
    new Headers(headers);

  requestHeaders.set(
    "Accept",
    requestHeaders.get("Accept") ||
      "application/json",
  );

  let requestBody = body;

  const isFormData =
    body instanceof FormData;

  const isBlob =
    body instanceof Blob;

  const isStringBody =
    typeof body === "string";

  if (
    body !== undefined &&
    body !== null &&
    !isFormData &&
    !isBlob &&
    !isStringBody
  ) {
    requestHeaders.set(
      "Content-Type",
      requestHeaders.get(
        "Content-Type",
      ) || "application/json",
    );

    requestBody =
      JSON.stringify(body);
  }

  if (
    isUnsafeMethod(requestMethod)
  ) {
    await ensureCsrf();

    requestHeaders.set(
      "X-CSRFToken",
      csrfToken,
    );
  }

  let response;

  try {
    response = await fetch(
      buildUrl(path),
      {
        ...rest,
        method: requestMethod,
        body: requestBody,
        headers: requestHeaders,
        credentials: "include",
        signal,
      },
    );
  } catch (error) {
    throw createNetworkError(
      error,
      path,
    );
  }

  const responseBody =
    await parseResponse(response);

  const authEndpoint =
    isAuthPath(path);

  /**
   * Session expired.
   *
   * Do not attempt refresh for:
   *
   * - login
   * - register
   * - refresh
   * - logout
   * - csrf
   * - health
   */
  if (
    response.status === 401 &&
    retryOn401 &&
    !authEndpoint &&
    !path.startsWith("/health")
  ) {
    try {
      await refreshSession();

      return apiRequest(
        path,
        {
          ...options,
          retryOn401: false,
        },
      );
    } catch {
      /**
       * Keep the original 401.
       * This allows AuthContext to handle logout/
       * redirect behavior centrally.
       */
    }
  }

  /**
   * Handle an expired/stale CSRF token.
   *
   * Only retry once and only when the backend
   * explicitly reports a CSRF failure.
   *
   * This avoids blindly repeating POST/PUT/PATCH/DELETE.
   */
  const errorCode =
    responseBody?.error?.code;

  if (
    response.status === 403 &&
    errorCode === "csrf_failed" &&
    retryOnCsrf &&
    isUnsafeMethod(requestMethod)
  ) {
    clearCsrfToken();

    await getCsrfToken({
      force: true,
    });

    return apiRequest(
      path,
      {
        ...options,
        retryOnCsrf: false,
      },
    );
  }

  if (!response.ok) {
    throw createApiError(
      response,
      responseBody,
      path,
    );
  }

  return responseBody;
}

/* ------------------------------------------------------------------
 * Convenience methods
 * ------------------------------------------------------------------ */

export async function apiGet(
  path,
  options = {},
) {
  return apiRequest(
    path,
    {
      ...options,
      method: "GET",
    },
  );
}

export async function apiPost(
  path,
  body,
  options = {},
) {
  return apiRequest(
    path,
    {
      ...options,
      method: "POST",
      body,
    },
  );
}

export async function apiPatch(
  path,
  body,
  options = {},
) {
  return apiRequest(
    path,
    {
      ...options,
      method: "PATCH",
      body,
    },
  );
}

export async function apiPut(
  path,
  body,
  options = {},
) {
  return apiRequest(
    path,
    {
      ...options,
      method: "PUT",
      body,
    },
  );
}

export async function apiDelete(
  path,
  options = {},
) {
  return apiRequest(
    path,
    {
      ...options,
      method: "DELETE",
    },
  );
}

export function clearCsrfToken() {
  csrfToken = null;
}

export const apiConfig = {
  baseUrl: API_BASE_URL,
};

/**
 * Form helper.
 *
 * Example:
 *
 * const emailError =
 *     getFieldError(error, "contact.email");
 */
export function getFieldError(
  error,
  field,
) {
  if (!(error instanceof ApiError)) {
    return null;
  }

  return (
    error.fieldErrors?.[field] ||
    null
  );
}

/**
 * Returns the general form error.
 */
export function getFormError(error) {
  if (!(error instanceof ApiError)) {
    return "Something went wrong.";
  }

  if (
    error.code === "validation_error"
  ) {
    return (
      error.fieldErrors?.form ||
      error.fieldErrors?.non_field_errors ||
      error.message
    );
  }

  return error.message;
}