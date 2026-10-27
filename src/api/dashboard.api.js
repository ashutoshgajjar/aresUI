// // import { apiGet } from "@/api/client";

// // export async function getDashboardData() {
// //     const [users, tasks, files] = await Promise.all([
// //         apiGet("/users/?limit=1&offset=0"),
// //         // apiGet("/users/?limit=1&offset=0&role=admin"),
// //         apiGet("/users/?limit=1&filter={\"metadata\":{\"accountStatus\":\"active\",\"is_active\":true}}"),

// //         // apiGet("/users/?limit=all"),
// //         apiGet("/tasks/?limit=50&offset=0"),
// //         apiGet("/files/?limit=1%&offset=0"),
// //     ]);

// //     const taskResults = tasks?.results || [];
    
// //     const taskStatus = taskResults.reduce((acc, task) => {
// //         const status = task?.status || "unknown";
// //         acc[status] = (acc[status] || 0) + 1;
// //         return acc;
// //     }, {});
    
// //     const userResults = users?.results || [];

// //     const userRoles = userResults.reduce((acc, user) => {
// //         const role = user?.metadata?.role || "unknown";
// //         acc[role] = (acc[role] || 0) + 1;
// //         return acc;
// //     }, {});

// //     const userStatus = userResults.reduce((acc, user) => {
// //         let status = "unknown";
        
// //         if (user?.metadata?.accountStatus) {
// //             status = user.metadata.accountStatus;
// //         } 
// //         else if (user?.metadata?.is_active === true || user?.metadata?.is_active === "true") {
// //             status = "active";
// //         } 
// //         else if (user?.metadata?.is_active === false || user?.metadata?.is_active === "false") {
// //             status = "inactive";
// //         }

// //         acc[status] = (acc[status] || 0) + 1;
// //         return acc;
// //     }, {});

// //     const isActiveUser = (user) => {
// //         const accountStatus = user?.metadata?.accountStatus;

// //         // Account status takes priority when available.
// //         if (
// //             accountStatus !== null &&
// //             accountStatus !== undefined &&
// //             String(accountStatus).trim() !== ""
// //         ) {
// //             return String(accountStatus).trim().toLowerCase() === "active";
// //         }

// //         const isActive = user?.metadata?.is_active;

// //         return isActive === true || isActive === "true";
// //     };

// //     // Count active users in the loaded records.
// //     const activeUsersLength = userResults.filter(isActiveUser).length;

// //     return {
// //         users: {
// //             total: Number(users?.count || 0),
// //             loaded: userResults.length,
// //             roles: userRoles,
// //             active: activeUsersLength,
// //             status: userStatus
// //         },
// //         tasks: {
// //             total: Number(tasks?.count || 0),
// //             loaded: taskResults.length,
// //             status: taskStatus,
// //         },
// //         files: {
// //             total: Number(files?.count || 0),
// //         },
// //         generatedAt: new Date().toISOString(),
// //     };
// // }



// import { apiGet } from "@/api/client";

// const ACCOUNT_STATUSES = [
//     "active",
//     "banned",
//     "archived",
//     "suspended",
//     "pending",
// ];

// // Use the role names supported by your application.
// const USER_ROLES = [
//     "admin",
//     "user",
//     "moderator",
// ];

// async function getUserCount(filters = {}) {
//     const params = new URLSearchParams({
//         limit: "1",
//         offset: "0",
//         ...filters,
//     });

//     const response = await apiGet(`/users/?${params.toString()}`);

//     return Number(response?.count ?? 0);
// }

// async function getGroupedCounts(values, filterName) {
//     const entries = await Promise.all(
//         values.map(async (value) => {
//             const count = await getUserCount({
//                 [filterName]: value,
//             });

//             return [value, count];
//         })
//     );

//     return Object.fromEntries(entries);
// }

// export async function getDashboardData() {
//     const [
//         users,
//         tasks,
//         files,
//         userStatuses,
//         userRoles,
//     ] = await Promise.all([
//         apiGet("/users/?limit=1&offset=0"),
//         apiGet("/tasks/?limit=50&offset=0"),
//         apiGet("/files/?limit=1&offset=0"),

//         getGroupedCounts(
//             ACCOUNT_STATUSES,
//             "account_status"
//         ),

//         getGroupedCounts(
//             USER_ROLES,
//             "role"
//         ),
//     ]);

//     const taskResults = tasks?.results ?? [];

//     const taskStatus = taskResults.reduce((acc, task) => {
//         const status = task?.status || "unknown";
//         acc[status] = (acc[status] || 0) + 1;
//         return acc;
//     }, {});

//     const totalUsers = Number(users?.count ?? 0);

//     return {
//         users: {
//             total: totalUsers,
//             active: userStatuses.active ?? 0,
//             loaded: totalUsers,
//             status: userStatuses,
//             roles: userRoles,
//         },
//         tasks: {
//             total: Number(tasks?.count ?? 0),
//             loaded: taskResults.length,
//             status: taskStatus,
//         },
//         files: {
//             total: Number(files?.count ?? 0),
//         },
//         generatedAt: new Date().toISOString(),
//     };
// }


import { apiGet } from "@/api/client";

const CACHE_TTL_MS = 5 * 60 * 1000;

function getStoredCache(key) {
    try {
        const storageKey = `dashboard-cache:${encodeURIComponent(key)}`;
        const raw = sessionStorage.getItem(storageKey);

        if (!raw) return null;

        const cached = JSON.parse(raw);

        if (
            !cached?.data ||
            !Number.isFinite(cached.expiresAt) ||
            cached.expiresAt <= Date.now()
        ) {
            sessionStorage.removeItem(storageKey);
            return null;
        }

        return cached;
    } catch {
        return null;
    }
}

function setStoredCache(key, cached) {
    try {
        const storageKey = `dashboard-cache:${encodeURIComponent(key)}`;

        sessionStorage.setItem(storageKey, JSON.stringify(cached));
    } catch {
        // Continue with the in-memory cache if storage is unavailable.
    }
}

const ACCOUNT_STATUSES = [
    "active",
    "banned",
    "archived",
    "suspended",
    "pending",
];

const USER_ROLES = [
    "admin",
    "user",
    "guest",
];

// Cache and pending requests are shared by callers of this module.
const dashboardCache = new Map();
const pendingRequests = new Map();

/**
 * Extract a valid count from a paginated response or array.
 */
function getCount(response) {
    const value =
        response?.count ??
        response?.results?.length ??
        (Array.isArray(response) ? response.length : 0);

    const count = Number(value);

    return Number.isFinite(count) && count >= 0 ? count : 0;
}

/**
 * Return the number of users that match the supplied filters.
 *
 * Uses limit=1 because the API's count field provides the total.
 */
async function getUserCount(filters = {}) {
    const params = new URLSearchParams({
        limit: "1",
        offset: "0",
    });

    for (const [key, value] of Object.entries(filters)) {
        if (value != null && value !== "") {
            params.set(key, String(value));
        }
    }

    const response = await apiGet(
        `/users/?${params.toString()}`
    );

    return getCount(response);
}

/**
 * Count users by a specific field, such as account_status or role.
 */
async function getGroupedCounts(values, filterName) {
    const entries = await Promise.all(
        values.map(async (value) => {
            const count = await getUserCount({
                [filterName]: value,
            });

            return [value, count];
        })
    );

    return Object.fromEntries(entries);
}

/**
 * Fetch all dashboard data.
 *
 * Requests run concurrently to reduce total loading time.
 */
async function fetchDashboardData() {
    const [
        users,
        tasks,
        files,
        userStatuses,
        userRoles,
    ] = await Promise.all([
        apiGet("/users/?limit=1&offset=0"),
        apiGet("/tasks/?limit=50&offset=0"),
        apiGet("/files/?limit=1&offset=0"),

        getGroupedCounts(
            ACCOUNT_STATUSES,
            "account_status"
        ),

        getGroupedCounts(
            USER_ROLES,
            "role"
        ),
    ]);

    const taskResults = Array.isArray(tasks?.results)
        ? tasks.results
        : Array.isArray(tasks)
            ? tasks
            : [];

    const taskStatus = taskResults.reduce((counts, task) => {
        const status = task?.status || "unknown";

        counts[status] = (counts[status] || 0) + 1;

        return counts;
    }, {});

    const totalUsers = getCount(users);

    return {
        users: {
            total: totalUsers,
            active: userStatuses.active ?? 0,

            // Preserve the original field's meaning for existing charts.
            loaded: totalUsers,

            status: userStatuses,
            roles: userRoles,
        },

        tasks: {
            total: getCount(tasks),
            loaded: taskResults.length,
            status: taskStatus,
        },

        files: {
            total: getCount(files),
        },

        generatedAt: new Date().toISOString(),
    };
}

/**
 * Return dashboard data from the cache or fetch fresh data.
 *
 * @param {Object} options
 * @param {boolean} options.forceRefresh Ignore the cache.
 * @param {string|number} options.cacheKey Cache identifier for the user.
 */
export async function getDashboardData({
    forceRefresh = false,
    cacheKey = "default",
} = {}) {
    const key = String(cacheKey ?? "default");

    if (!forceRefresh) {
        // 1. Check the in-memory cache.
        const cached = dashboardCache.get(key);

        if (cached && cached.expiresAt > Date.now()) {
            return cached.data;
        }

        if (cached) {
            dashboardCache.delete(key);
        }

        // 2. Check sessionStorage. This also works after a page reload.
        const storedCache = getStoredCache(key);

        if (storedCache) {
            dashboardCache.set(key, storedCache);
            return storedCache.data;
        }

        // 3. Reuse an existing request when one is already running.
        const pendingRequest = pendingRequests.get(key);

        if (pendingRequest) {
            return pendingRequest;
        }
    } else {
        // A manual refresh must bypass the cache.
        dashboardCache.delete(key);
    }

    // 4. Fetch data only when no valid cache exists.
    const request = fetchDashboardData();

    pendingRequests.set(key, request);

    try {
        const result = await request;

        // Only the latest request can update the cache.
        if (pendingRequests.get(key) === request) {
            const cached = {
                data: result,
                expiresAt: Date.now() + CACHE_TTL_MS,
            };

            dashboardCache.set(key, cached);
            setStoredCache(key, cached);

            pendingRequests.delete(key);
        }

        return result;
    } catch (error) {
        if (pendingRequests.get(key) === request) {
            pendingRequests.delete(key);
        }

        throw error;
    }
}