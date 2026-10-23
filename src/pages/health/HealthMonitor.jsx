// import { useCallback, useEffect, useRef, useState } from "react";
// import {
//     FiActivity,
//     FiAlertCircle,
//     FiCheckCircle,
//     FiClock,
//     FiPauseCircle,
//     FiRefreshCw,
// } from "react-icons/fi";

// import { apiGet } from "@/api/client";
// import toast from "react-hot-toast";
// // import { useNotifications } from "@/components/notifications";

// const DEFAULT_INTERVAL_MS = 10 * 60 * 1000;
// const DEFAULT_TIMEOUT_MS = 15 * 1000;

// function formatTime(value) {
//     if (!value) return "Not checked yet";
//     return new Intl.DateTimeFormat(undefined, {
//         hour: "2-digit",
//         minute: "2-digit",
//         second: "2-digit",
//     }).format(value);
// }

// function formatCountdown(value, now) {
//     if (!value) return "Waiting for the first check";
//     const remaining = Math.max(0, value - now);
//     const minutes = Math.floor(remaining / 60000);
//     const seconds = Math.floor((remaining % 60000) / 1000);
//     return minutes > 0 ? `Next check in ${minutes}m ${seconds}s` : `Next check in ${seconds}s`;
// }

// function isUnhealthyPayload(payload) {
//     const raw = payload?.status ?? payload?.health ?? payload?.state;
//     if (typeof raw !== "string") return false;
//     return ["error", "unhealthy", "down", "failed", "unavailable", "critical"].includes(raw.toLowerCase());
// }

// const STATUS_STYLES = {
//     idle: {
//         label: "Paused",
//         icon: FiPauseCircle,
//         pill: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
//         dot: "bg-slate-400",
//     },
//     checking: {
//         label: "Checking",
//         icon: FiRefreshCw,
//         pill: "bg-sky-50 text-sky-700 dark:bg-sky-400/10 dark:text-sky-300",
//         dot: "bg-sky-500",
//     },
//     healthy: {
//         label: "Healthy",
//         icon: FiCheckCircle,
//         pill: "bg-emerald-50 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300",
//         dot: "bg-emerald-500",
//     },
//     unhealthy: {
//         label: "Unhealthy",
//         icon: FiAlertCircle,
//         pill: "bg-rose-50 text-rose-700 dark:bg-rose-400/10 dark:text-rose-300",
//         dot: "bg-rose-500",
//     },
// };

// /**
//  * Runs an immediate GET health check when enabled, then repeats at intervalMs.
//  * The next timer starts after the previous request finishes, so requests never overlap.
//  */
// export default function HealthMonitor({
//     healthPath = "/health/",
//     intervalMs = DEFAULT_INTERVAL_MS,
//     requestTimeoutMs = DEFAULT_TIMEOUT_MS,
//     title = "API health monitor",
// }) {
//     const [enabled, setEnabled] = useState(false);
//     const [status, setStatus] = useState("idle");
//     const [lastCheckedAt, setLastCheckedAt] = useState(null);
//     const [nextCheckAt, setNextCheckAt] = useState(null);
//     const [lastError, setLastError] = useState("");
//     const [lastResponse, setLastResponse] = useState(null);
//     const [isChecking, setIsChecking] = useState(false);
//     const [clock, setClock] = useState(() => Date.now());
//     const priorStatusRef = useRef("idle");

//     const checkHealth = useCallback(async (signal) => {
//         const response = await apiGet(healthPath, {
//             signal,
//             retryOn401: false,
//         });

//         if (isUnhealthyPayload(response)) {
//             throw new Error(`Health endpoint reported an unhealthy state: ${response.status ?? response.health ?? response.state}.`);
//         }

//         return response;
//     }, [healthPath]);

//     useEffect(() => {
//         if (!enabled) {
//             setStatus("idle");
//             setNextCheckAt(null);
//             setIsChecking(false);
//             return undefined;
//         }

//         let stopped = false;
//         let scheduleTimer = null;
//         let requestTimer = null;
//         let controller = null;

//         const runCheck = async () => {
//             if (stopped) return;

//             controller = new AbortController();
//             let timedOut = false;
//             setIsChecking(true);
//             setStatus("checking");

//             requestTimer = setTimeout(() => {
//                 timedOut = true;
//                 controller?.abort();
//             }, requestTimeoutMs);

//             try {
//                 const response = await checkHealth(controller.signal);
//                 if (stopped) return;

//                 const recovered = priorStatusRef.current === "unhealthy";
//                 priorStatusRef.current = "healthy";
//                 setStatus("healthy");
//                 setLastError("");
//                 setLastResponse(response);
//                 setLastCheckedAt(new Date());

//                 if (recovered) {
//                     toast.success({
//                         title: "API connection restored",
//                         message: `GET ${healthPath} returned a healthy response.`,
//                         duration: 4000,
//                     });
//                 }
//             } catch (error) {
//                 if (stopped || error?.name === "AbortError" && !timedOut) return;

//                 const message = timedOut
//                     ? `The health check timed out after ${Math.round(requestTimeoutMs / 1000)} seconds.`
//                     : error?.message || "The health check request failed.";
//                 const alreadyUnhealthy = priorStatusRef.current === "unhealthy";
//                 priorStatusRef.current = "unhealthy";
//                 setStatus("unhealthy");
//                 setLastError(message);
//                 setLastResponse(null);
//                 setLastCheckedAt(new Date());

//                 // Avoid repeating the same toast every 10 minutes during an outage.
//                 if (!alreadyUnhealthy) {
//                     toast.error({
//                         title: "API health check failed",
//                         message,
//                         duration: 8000,
//                     });
//                 }
//             } finally {
//                 clearTimeout(requestTimer);
//                 requestTimer = null;

//                 if (!stopped) {
//                     controller = null;
//                     setIsChecking(false);
//                     const nextAt = Date.now() + intervalMs;
//                     setNextCheckAt(nextAt);
//                     scheduleTimer = setTimeout(runCheck, intervalMs);
//                 }
//             }
//         };

//         // Check immediately when the switch turns on.
//         setNextCheckAt(null);
//         runCheck();

//         return () => {
//             stopped = true;
//             clearTimeout(scheduleTimer);
//             clearTimeout(requestTimer);
//             controller?.abort();
//         };
//     }, [enabled, intervalMs, requestTimeoutMs, healthPath, checkHealth, toast]);

//     useEffect(() => {
//         if (!enabled || !nextCheckAt) return undefined;
//         const timer = setInterval(() => setClock(Date.now()), 1000);
//         return () => clearInterval(timer);
//     }, [enabled, nextCheckAt]);

//     const currentStatus = isChecking ? "checking" : (STATUS_STYLES[status] ? status : "idle");
//     const StatusIcon = STATUS_STYLES[currentStatus].icon;
//     const summary = currentStatus === "healthy"
//         ? "The health endpoint returned a successful response."
//         : currentStatus === "unhealthy"
//             ? lastError || "The endpoint did not return a healthy response."
//             : currentStatus === "checking"
//                 ? "Sending a health check request..."
//                 : "Scheduled health checks are switched off.";

//     return (
//         <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900" aria-label={title}>
//             <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-start sm:justify-between sm:p-6">
//                 <div className="flex min-w-0 items-start gap-3.5">
//                     <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-700 ring-1 ring-inset ring-violet-100 dark:bg-violet-400/10 dark:text-violet-300 dark:ring-violet-400/15">
//                         <FiActivity size={20} />
//                     </div>
//                     <div className="min-w-0">
//                         <div className="flex flex-wrap items-center gap-2">
//                             <h2 className="text-base font-semibold tracking-tight text-slate-900 dark:text-white">{title}</h2>
//                             <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_STYLES[currentStatus].pill}`}>
//                                 <span className={`h-1.5 w-1.5 rounded-full ${STATUS_STYLES[currentStatus].dot} ${currentStatus === "checking" ? "animate-pulse" : ""}`} />
//                                 {STATUS_STYLES[currentStatus].label}
//                             </span>
//                         </div>
//                         <p className="mt-1.5 text-sm leading-5 text-slate-500 dark:text-slate-400">Send a GET request to the health endpoint every 10 minutes while enabled.</p>
//                         <code className="mt-3 inline-flex max-w-full items-center break-all rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-medium text-slate-600 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300">
//                             GET {healthPath}
//                         </code>
//                     </div>
//                 </div>

//                 <div className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 bg-slate-50/80 px-3.5 py-3 dark:border-slate-800 dark:bg-slate-950/60 sm:min-w-[150px]">
//                     <div>
//                         <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">Auto check</p>
//                         <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">{enabled ? "Enabled" : "Disabled"}</p>
//                     </div>
//                     <button
//                         type="button"
//                         role="switch"
//                         aria-checked={enabled}
//                         aria-label="Enable automatic health checks"
//                         onClick={() => setEnabled((value) => !value)}
//                         className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full border transition-colors duration-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-violet-200 dark:focus-visible:ring-violet-500/20 ${enabled ? "border-violet-600 bg-violet-600" : "border-slate-300 bg-slate-200 dark:border-slate-600 dark:bg-slate-700"}`}
//                     >
//                         <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform duration-200 ${enabled ? "translate-x-[22px]" : "translate-x-0.5"}`} />
//                     </button>
//                 </div>
//             </div>

//             <div className="grid grid-cols-1 divide-y divide-slate-100 border-t border-slate-100 bg-slate-50/60 dark:divide-slate-800 dark:border-slate-800 dark:bg-slate-950/40 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
//                 <div className="flex items-start gap-3 p-4 sm:p-5">
//                     <span className="mt-0.5 text-slate-400"><FiClock size={16} /></span>
//                     <div className="min-w-0">
//                         <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Last checked</p>
//                         <p className="mt-1 text-sm font-semibold text-slate-800 dark:text-slate-200">{formatTime(lastCheckedAt)}</p>
//                     </div>
//                 </div>
//                 <div className="flex items-start gap-3 p-4 sm:p-5">
//                     <span className="mt-0.5 text-slate-400"><FiRefreshCw size={16} className={currentStatus === "checking" ? "animate-spin" : ""} /></span>
//                     <div className="min-w-0">
//                         <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Next check</p>
//                         <p className="mt-1 text-sm font-semibold text-slate-800 dark:text-slate-200">{enabled ? formatCountdown(nextCheckAt, clock) : "Paused"}</p>
//                     </div>
//                 </div>
//                 <div className="flex items-start gap-3 p-4 sm:p-5">
//                     <span className={`mt-0.5 ${currentStatus === "unhealthy" ? "text-rose-500" : currentStatus === "healthy" ? "text-emerald-500" : "text-slate-400"}`}><StatusIcon size={16} /></span>
//                     <div className="min-w-0">
//                         <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Latest result</p>
//                         <p className="mt-1 break-words text-sm font-semibold text-slate-800 dark:text-slate-200">{summary}</p>
//                     </div>
//                 </div>
//             </div>
//         </section>
//     );
// }

import { useCallback, useEffect, useRef, useState } from "react";
import { apiGet } from "@/api/client";
import toast from "react-hot-toast";
import { RippleButton } from "@/components/RippleButton";

const POLL_INTERVAL_MS = 10 * 60 * 1000;
const MONITORING_STORAGE_KEY = "system-health-monitor-state";

function readMonitoringState() {
    if (typeof window === "undefined") return {};

    try {
        const value = window.sessionStorage.getItem(MONITORING_STORAGE_KEY);
        if (!value) return {};

        const parsed = JSON.parse(value);
        return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
    } catch {
        return {};
    }
}

function saveMonitoringState(update) {
    if (typeof window === "undefined") return;

    try {
        const current = readMonitoringState();
        window.sessionStorage.setItem(
            MONITORING_STORAGE_KEY,
            JSON.stringify({ ...current, ...update }),
        );
    } catch {
        // Monitoring still works if browser storage is unavailable.
    }
}

function advanceDeadline(deadline, currentTime = Date.now()) {
    if (deadline > currentTime) return deadline;

    const missedIntervals = Math.floor((currentTime - deadline) / POLL_INTERVAL_MS) + 1;
    return deadline + missedIntervals * POLL_INTERVAL_MS;
}

const SERVICES = [
    {
        key: "api",
        name: "API service",
        description: "Confirms that the health endpoint is responding.",
    },
    {
        key: "database",
        name: "PostgreSQL database",
        description: "Checks database connectivity with a simple query.",
    },
    {
        key: "cloudflare_r2",
        name: "Cloudflare R2 storage",
        description: "Checks access to the configured health-check object.",
    },
];

function unwrapPayload(value) {
    if (
        value &&
        typeof value === "object" &&
        value.data &&
        typeof value.data === "object" &&
        ("status" in value.data || "checks" in value.data)
    ) {
        return value.data;
    }

    return value;
}

function isHealthPayload(value) {
    return Boolean(
        value &&
            typeof value === "object" &&
            ("status" in value || "checks" in value),
    );
}

function getStatusConfig(status) {
    const normalized = String(status || "unknown").toLowerCase();

    const configs = {
        ok: {
            label: "Healthy",
            badge: "border-emerald-200 bg-emerald-50 text-emerald-700",
            dot: "bg-emerald-500",
        },
        degraded: {
            label: "Degraded",
            badge: "border-amber-200 bg-amber-50 text-amber-800",
            dot: "bg-amber-500",
        },
        unavailable: {
            label: "Unavailable",
            badge: "border-red-200 bg-red-50 text-red-700",
            dot: "bg-red-500",
        },
        unreachable: {
            label: "Unreachable",
            badge: "border-red-200 bg-red-50 text-red-700",
            dot: "bg-red-500",
        },
        not_configured: {
            label: "Not configured",
            badge: "border-amber-200 bg-amber-50 text-amber-800",
            dot: "bg-amber-500",
        },
        unknown: {
            label: "Unknown",
            badge: "border-slate-200 bg-slate-100 text-slate-600",
            dot: "bg-slate-400",
        },
    };

    return configs[normalized] || {
        label: normalized.replaceAll("_", " "),
        badge: "border-slate-200 bg-slate-100 text-slate-600",
        dot: "bg-slate-400",
    };
}

function StatusBadge({ status }) {
    const config = getStatusConfig(status);

    return (
        <span
            className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold ${config.badge}`}
        >
            <span className={`h-1.5 w-1.5 rounded-full ${config.dot}`} />
            {config.label}
        </span>
    );
}

function formatDateTime(value) {
    if (!value) return "—";

    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) return "—";

    return date.toLocaleString(undefined, {
        year: "numeric",
        month: "short",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
    });
}

function formatDuration(value) {
    if (value === null || value === undefined || value === "") return "—";
    const number = Number(value);
    return Number.isFinite(number) ? `${number.toFixed(2)} ms` : "—";
}

function formatCountdown(totalSeconds) {
    if (totalSeconds === null || totalSeconds === undefined) return "—";

    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function SummaryCard({ label, value, detail, accent = "slate" }) {
    const accentClasses = {
        slate: "bg-slate-100 text-slate-600",
        green: "bg-emerald-50 text-emerald-700",
        blue: "bg-blue-50 text-blue-700",
        amber: "bg-amber-50 text-amber-800",
    };

    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-900/[0.02]">
            <div className="flex items-start justify-between gap-3">
                <p className="text-sm font-medium text-slate-500">{label}</p>
                <span className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ${accentClasses[accent]}`}>
                    {label === "Services healthy" ? "Services" : label === "Check duration" ? "Latency" : label === "Health log" ? "Logging" : "Status"}
                </span>
            </div>
            <p className="mt-4 text-2xl font-semibold tracking-tight text-slate-900">{value}</p>
            <p className="mt-1 text-xs leading-5 text-slate-500">{detail}</p>
        </div>
    );
}

function ServiceCard({ service, data }) {
    const status = data?.status || "unknown";
    const config = getStatusConfig(status);
    const message = data?.message || service.description;
    const hasLatency = data?.latency_ms !== null && data?.latency_ms !== undefined;

    return (
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-900/[0.02] transition-shadow hover:shadow-md hover:shadow-slate-900/[0.04]">
            <div className="flex items-start justify-between gap-4">
                <div className="flex min-w-0 items-start gap-3">
                    <span className={`mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${config.badge}`}>
                        <span className={`h-2.5 w-2.5 rounded-full ${config.dot}`} />
                    </span>
                    <div className="min-w-0">
                        <h3 className="font-semibold text-slate-900">{service.name}</h3>
                        <p className="mt-1 text-sm leading-5 text-slate-500">{message}</p>
                    </div>
                </div>
                <StatusBadge status={status} />
            </div>

            <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
                <span className="text-xs font-medium uppercase tracking-wide text-slate-400">Response latency</span>
                <span className="font-mono text-sm font-semibold tabular-nums text-slate-700">
                    {hasLatency ? formatDuration(data.latency_ms) : "Not reported"}
                </span>
            </div>
        </article>
    );
}

function WarnIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20">
            <path d="M0 0h20v20H0z" fill="none" />
            <g fill="none">
                <path fill="url(#SVGBgt2jgoN)" d="M8.681 2.785c.568-1.047 2.071-1.047 2.638 0l6.5 12.002A1.5 1.5 0 0 1 16.502 17H3.498a1.5 1.5 0 0 1-1.319-2.215z" />
                <path fill="url(#SVGfhIOtbPc)" d="M10.5 7.5a.5.5 0 0 0-1 0v4a.5.5 0 0 0 1 0z" />
                <path fill="url(#SVGpyan8cfW)" d="M10 14.5a.75.75 0 1 0 0-1.5a.75.75 0 0 0 0 1.5" />
                <defs>
                    <linearGradient id="SVGBgt2jgoN" x1="4.497" x2="13.972" y1="-.344" y2="18.914" gradientUnits="userSpaceOnUse">
                        <stop stop-color="#ffcd0f" />
                        <stop offset="1" stop-color="#fe8401" />
                    </linearGradient>
                    <linearGradient id="SVGfhIOtbPc" x1="8" x2="11.603" y1="7" y2="14.686" gradientUnits="userSpaceOnUse">
                        <stop stop-color="#4a4a4a" />
                        <stop offset="1" stop-color="#212121" />
                    </linearGradient>
                    <linearGradient id="SVGpyan8cfW" x1="8" x2="11.603" y1="7" y2="14.686" gradientUnits="userSpaceOnUse">
                        <stop stop-color="#4a4a4a" />
                        <stop offset="1" stop-color="#242424" />
                    </linearGradient>
                </defs>
            </g>
        </svg>
    );
}

export default function Health() {
    // Restore the last report and schedule from this tab before starting effects.
    // A reload must not cause a new request by itself.
    const [savedMonitoringState] = useState(() => readMonitoringState());
    const [health, setHealth] = useState(() => savedMonitoringState.health || null);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [autoRefresh, setAutoRefresh] = useState(() =>
        typeof savedMonitoringState.enabled === "boolean" ? savedMonitoringState.enabled : true,
    );
    const [lastCheckedAt, setLastCheckedAt] = useState(() => savedMonitoringState.lastCheckedAt || null);
    const [nextCheckAt, setNextCheckAt] = useState(() => {
        const deadline = Number(savedMonitoringState.nextCheckAt);
        return Number.isFinite(deadline) && deadline > 0 ? deadline : null;
    });
    const [now, setNow] = useState(Date.now());
    const [connectionError, setConnectionError] = useState(() => savedMonitoringState.connectionError || "");
    const [logs, setLogs] = useState([]);
    const [logsCount, setLogsCount] = useState(0);
    const [logsOffset, setLogsOffset] = useState(0);
    const [logsLoading, setLogsLoading] = useState(false);
    const [logsError, setLogsError] = useState("");
    const [logsLoaded, setLogsLoaded] = useState(false);
    const LOGS_PAGE_SIZE = 10;

    const requestInFlightRef = useRef(false);
    const hasCompletedRequestRef = useRef(Boolean(
        savedMonitoringState.health || savedMonitoringState.lastCheckedAt || savedMonitoringState.connectionError,
    ));
    const autoRefreshRef = useRef(autoRefresh);
    const timeoutRef = useRef(null);
    const scheduleNextRef = useRef(null);
    const mountedRef = useRef(false);

    const performHealthCheck = useCallback(async () => {
        if (requestInFlightRef.current) return null;

        requestInFlightRef.current = true;
        const checkedAt = new Date().toISOString();
        saveMonitoringState({ lastCheckedAt: checkedAt });

        if (mountedRef.current) {
            setRefreshing(true);
            setLastCheckedAt(checkedAt);
            if (!hasCompletedRequestRef.current) setLoading(true);
        }

        try {
            const rawResponse = await apiGet("/health/");
            const payload = unwrapPayload(rawResponse);

            if (!isHealthPayload(payload)) {
                throw new Error("The health endpoint returned an invalid response.");
            }

            if (mountedRef.current) {
                setHealth(payload);
                setConnectionError("");
            }
            saveMonitoringState({ health: payload, lastCheckedAt: checkedAt, connectionError: "" });
            hasCompletedRequestRef.current = true;
            return payload;
        } catch (error) {
            // Django returns useful service details with HTTP 503 when a check is degraded.
            const errorPayload = unwrapPayload(error?.response?.data ?? error?.data);

            if (isHealthPayload(errorPayload)) {
                if (mountedRef.current) {
                    setHealth(errorPayload);
                    setConnectionError("");
                }
                saveMonitoringState({ health: errorPayload, lastCheckedAt: checkedAt, connectionError: "" });
                hasCompletedRequestRef.current = true;
                return errorPayload;
            }

            const message = String(
                error?.response?.data?.detail ||
                    error?.response?.data?.message ||
                    error?.message ||
                    "Unable to connect to the health endpoint.",
            );

            if (mountedRef.current) setConnectionError(message);
            saveMonitoringState({ lastCheckedAt: checkedAt, connectionError: message });
            hasCompletedRequestRef.current = true;
            return null;
        } finally {
            requestInFlightRef.current = false;
            if (mountedRef.current) {
                setRefreshing(false);
                setLoading(false);
            }
        }
    }, []);

    useEffect(() => {
        mountedRef.current = true;
        const clockInterval = window.setInterval(() => setNow(Date.now()), 1000);

        return () => {
            mountedRef.current = false;
            window.clearInterval(clockInterval);
            window.clearTimeout(timeoutRef.current);
        };
    }, []);

    useEffect(() => {
        autoRefreshRef.current = autoRefresh;

        if (!autoRefresh) {
            window.clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
            setNextCheckAt(null);
            scheduleNextRef.current = null;
            saveMonitoringState({ enabled: false, nextCheckAt: null, initialized: true });
            return undefined;
        }

        let cancelled = false;
        const saved = readMonitoringState();
        const savedDeadline = Number(saved.nextCheckAt);
        const hasPriorMonitoringState =
            saved.initialized === true ||
            typeof saved.enabled === "boolean" ||
            (Number.isFinite(savedDeadline) && savedDeadline > 0);
        const initialDeadline = Number.isFinite(savedDeadline) && savedDeadline > 0
            ? savedDeadline
            : Date.now() + POLL_INTERVAL_MS;

        // Persist the deadline before any first request. On reload, restore it
        // without requesting fresh data unless the saved timer has expired.
        setNextCheckAt(initialDeadline);
        saveMonitoringState({ enabled: true, nextCheckAt: initialDeadline, initialized: true });

        const scheduleAt = (deadline) => {
            if (cancelled || !autoRefreshRef.current) return;

            window.clearTimeout(timeoutRef.current);
            setNextCheckAt(deadline);
            saveMonitoringState({ enabled: true, nextCheckAt: deadline, initialized: true });

            timeoutRef.current = window.setTimeout(async () => {
                await performHealthCheck();
                if (cancelled || !autoRefreshRef.current) return;
                scheduleAt(advanceDeadline(deadline, Date.now()));
            }, Math.max(0, deadline - Date.now()));
        };

        scheduleNextRef.current = scheduleAt;

        if (!hasPriorMonitoringState) {
            // First activation: run one check now, then follow the 10-minute timer.
            const initializeMonitoring = async () => {
                await performHealthCheck();
                if (cancelled || !autoRefreshRef.current) return;
                scheduleAt(advanceDeadline(initialDeadline, Date.now()));
            };
            initializeMonitoring();
        } else {
            // Reloading does not trigger a request. If the timer expired while
            // the page was closed, its completed deadline triggers one check.
            scheduleAt(initialDeadline);
        }

        return () => {
            cancelled = true;
            window.clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
            if (scheduleNextRef.current === scheduleAt) {
                scheduleNextRef.current = null;
            }
        };
    }, [autoRefresh, performHealthCheck]);

    const handleToggleAutoRefresh = () => {
        const next = !autoRefresh;
        autoRefreshRef.current = next;

        window.clearTimeout(timeoutRef.current);
        timeoutRef.current = null;

        if (!next) {
            setNextCheckAt(null);
            saveMonitoringState({ enabled: false, nextCheckAt: null, initialized: true });
            // toast("Automatic health checks paused.");
            toast("Automatic health checks paused.", {
                icon: <WarnIcon />,
            });
        } else {
            // Enabling monitoring triggers one check and starts a new interval.
            const deadline = Date.now() + POLL_INTERVAL_MS;
            setNextCheckAt(deadline);
            saveMonitoringState({ enabled: true, nextCheckAt: deadline, initialized: true });
            toast.success("Automatic health checks enabled.");
            performHealthCheck();
        }

        setAutoRefresh(next);
    };

    const fetchHealthLogs = useCallback(async (offset = 0) => {
        setLogsLoading(true);
        setLogsError("");
        try {
            const response = await apiGet(`/health/logs/?limit=${LOGS_PAGE_SIZE}&offset=${offset}`);
            const payload = unwrapPayload(response);
            if (!payload || !Array.isArray(payload.results)) {
                throw new Error("The health logs endpoint returned an invalid response.");
            }
            setLogs(payload.results);
            setLogsCount(Number(payload.count) || 0);
            setLogsOffset(offset);
            setLogsLoaded(true);
        } catch (error) {
            const message = String(
                error?.response?.data?.detail ||
                error?.response?.data?.message ||
                error?.message ||
                "Unable to load health-check logs. Admin access may be required."
            );
            setLogsError(message);
            toast.error(message);
        } finally {
            setLogsLoading(false);
        }
    }, []);

    const secondsUntilNextCheck = nextCheckAt
        ? Math.max(0, Math.ceil((nextCheckAt - now) / 1000))
        : null;
    const progress = nextCheckAt
        ? Math.min(
              100,
              Math.max(0, ((POLL_INTERVAL_MS - Math.max(0, nextCheckAt - now)) / POLL_INTERVAL_MS) * 100),
          )
        : 0;

    const serviceCount = SERVICES.length;
    const healthyCount = SERVICES.filter((service) => health?.checks?.[service.key]?.status === "ok").length;
    const overallStatus = connectionError ? "unreachable" : health?.status || "unknown";
    const overallCopy = connectionError
        ? "The latest request could not reach the health endpoint. The service details below show the last received report, if available."
        : health?.status === "ok"
          ? "All monitored services are reporting healthy status."
          : health?.status === "degraded"
            ? "One or more checks need attention. Review the service details below."
            : loading
              ? "Loading the latest status from the backend."
              : "No health report is available yet.";

    const loggingPersisted = health?.logging?.persisted;
    const loggingValue =
        loggingPersisted === true ? "Persisted" : loggingPersisted === false ? "Not persisted" : "Unknown";

    return (
        <main className="min-h-screen bg-slate-50 text-slate-900">
            <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                <header className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-blue-700">
                            Platform operations
                        </p>
                        <h1 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
                            System health
                        </h1>
                        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
                            Monitor API availability, database connectivity, and Cloudflare R2 storage.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        <RippleButton
                            size="lg"
                            type="button"
                            onClick={handleToggleAutoRefresh}
                            className={`rounded-xl px-4 text-sm  shadow-sm transition focus:outline-none focus:ring-4 ${
                                autoRefresh
                                    ? "bg-slate-900 text-white hover:bg-slate-800 focus:ring-slate-200"
                                    : "bg-indigo-600 text-white hover:bg-blue-700 focus:ring-blue-100"
                            }`}
                        >
                            <span className={`h-2 w-2 rounded-full ${autoRefresh ? "bg-emerald-400" : "bg-yellow-400"}`} />
                            {autoRefresh ? "Pause monitoring" : "Resume monitoring"}
                        </RippleButton>
                    </div>
                </header>

                {connectionError && (
                    <div
                        role="alert"
                        className="mb-6 flex gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3.5 text-sm text-red-800"
                    >
                        <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-100 font-bold">!</span>
                        <div>
                            <p className="font-semibold">Could not fetch the latest health report</p>
                            <p className="mt-1 leading-5 text-red-700">{connectionError}</p>
                        </div>
                    </div>
                )}

                <main className="space-y-6">
                    <section className="mb-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm shadow-slate-900/[0.02]">
                        <div className="flex flex-col gap-5 p-5 sm:p-6 md:flex-row md:items-center md:justify-between">
                            <div className="flex items-start gap-4">
                                <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${getStatusConfig(overallStatus).badge}`}>
                                    {connectionError ? (
                                        <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" aria-hidden="true">
                                            <path d="M12 8v5m0 3h.01M10.3 3.9 2.9 17a2 2 0 0 0 1.7 3h14.8a2 2 0 0 0 1.7-3l-7.4-13.1a2 2 0 0 0-3.4 0Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    ) : (
                                        <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" aria-hidden="true">
                                            <path d="m5 12 4 4L19 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    )}
                                </div>
                                <div>
                                    <div className="mb-2 flex flex-wrap items-center gap-3">
                                        <h2 className="text-lg font-semibold text-slate-950">Overall status</h2>
                                        <StatusBadge status={overallStatus} />
                                    </div>
                                    <p className="max-w-2xl text-sm leading-6 text-slate-500">{overallCopy}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-3 border-t border-slate-100 pt-4 sm:grid-cols-2 md:min-w-[330px] md:border-l md:border-t-0 md:pl-6 md:pt-0">
                                <div>
                                    <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Last check attempt</p>
                                    <p className="mt-1.5 text-sm font-semibold text-slate-800">{formatDateTime(lastCheckedAt)}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Backend report time</p>
                                    <p className="mt-1.5 text-sm font-semibold text-slate-800">{formatDateTime(health?.timestamp)}</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-900/[0.02] sm:p-6">
                        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                            <div className="flex items-start gap-3">
                                <div className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${autoRefresh ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
                                    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
                                        <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.7" />
                                        <path d="M12 7v5l3.2 2" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </div>
                                <div>
                                    <div className="flex flex-wrap items-center gap-2">
                                        <h2 className="font-semibold text-slate-950">Automatic monitoring</h2>
                                        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${autoRefresh ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>
                                            {autoRefresh ? "Enabled" : "Paused"}
                                        </span>
                                    </div>
                                    <p className="mt-1 text-sm leading-6 text-slate-500">
                                        {autoRefresh
                                            ? "Checks run when monitoring is enabled and each 10-minute timer completes. Reloading the page does not trigger a request."
                                            : "Automatic checks are paused. Enable monitoring to run a health check."}
                                    </p>
                                </div>
                            </div>

                            <div className="min-w-[190px] md:text-right">
                                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{autoRefresh ? "Next check in" : "Next check"}</p>
                                <p className="mt-1 font-mono text-3xl font-semibold tabular-nums tracking-tight text-slate-900">
                                    {autoRefresh ? (secondsUntilNextCheck === null ? "--:--" : formatCountdown(secondsUntilNextCheck)) : "Paused"}
                                </p>
                                {autoRefresh && nextCheckAt && (
                                    <p className="mt-1 text-xs text-slate-500">At {formatDateTime(new Date(nextCheckAt))}</p>
                                )}
                            </div>
                        </div>

                        <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-slate-100" aria-label="Time until next health check">
                            <div
                                className={`h-full rounded-full transition-[width] duration-1000 ${autoRefresh ? "bg-blue-600" : "bg-slate-300"}`}
                                style={{ width: `${autoRefresh ? progress : 0}%` }}
                            />
                        </div>
                    </section>

                    <section aria-label="Health summary" className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                        <SummaryCard
                            label="Overall status"
                            value={connectionError ? "Connection error" : getStatusConfig(health?.status).label}
                            detail={connectionError ? "Latest request failed" : "Current backend report"}
                            accent={connectionError || health?.status === "degraded" ? "amber" : health?.status === "ok" ? "green" : "slate"}
                        />
                        <SummaryCard
                            label="Services healthy"
                            value={connectionError ? "—" : `${healthyCount} / ${serviceCount}`}
                            detail={connectionError ? "Latest service status is unknown" : "API, database, and object storage"}
                            accent={connectionError ? "amber" : healthyCount === serviceCount ? "green" : "blue"}
                        />
                        <SummaryCard
                            label="Check duration"
                            value={formatDuration(health?.duration_ms)}
                            detail="Total backend health-check time"
                            accent="blue"
                        />
                        <SummaryCard
                            label="Health log"
                            value={loggingValue}
                            detail="Whether the backend saved this check"
                            accent={loggingPersisted === true ? "green" : loggingPersisted === false ? "amber" : "slate"}
                        />
                    </section>

                    <section className="">
                        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                            <div>
                                <h2 className="text-lg font-semibold text-slate-950">Service checks</h2>
                                <p className="mt-1 text-sm text-slate-500">Status and response latency for each dependency.</p>
                            </div>
                            <p className="text-xs text-slate-400">{refreshing ? "Fetching latest report…" : "Values come from the latest health response."}</p>
                        </div>

                        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                            {SERVICES.map((service) => (
                                <ServiceCard
                                    key={service.key}
                                    service={service}
                                    data={health?.checks?.[service.key]}
                                />
                            ))}
                        </div>

                        {!health && loading && (
                            <div className="mt-4 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-500">
                                The first health check will run when monitoring is enabled.
                            </div>
                        )}
                    </section>

                    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-900/[0.02] sm:p-6">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <h2 className="text-lg font-semibold text-slate-950">Health-check log history</h2>
                                <p className="mt-1 text-sm leading-6 text-slate-500">
                                    Saved PostgreSQL health-check records, newest first. This history endpoint requires an admin account.
                                </p>
                            </div>
                            <RippleButton
                                hue={270}
                                saturation={100}
                                lightness={99}
                                variant="solid"
                                size="md"
                                type="button"
                                onClick={() => fetchHealthLogs(0)}
                                disabled={logsLoading}
                                className="shrink-0 text-sm md:text-md disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {logsLoading ? "Loading logs…" : logsLoaded ? "Refresh history" : "Load history"}
                            </RippleButton>
                        </div>

                        {logsError && (
                            <div role="alert" className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                                {logsError}
                            </div>
                        )}

                        {!logsLoaded && !logsLoading && !logsError && (
                            <div className="mt-5 rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center">
                                <p className="text-sm font-medium text-slate-700">Log history has not been loaded</p>
                                <p className="mt-1 text-sm text-slate-500">Select “Load history” to request saved logs. This does not trigger a health check.</p>
                            </div>
                        )}

                        {logsLoaded && (
                            <>
                                <div className="mt-5 overflow-x-auto rounded-xl border border-slate-200">
                                    <table className="w-full min-w-[760px] divide-y divide-slate-200 text-left text-sm">
                                        <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                                            <tr>
                                                <th className="px-4 py-3 font-semibold">Created</th>
                                                <th className="px-4 py-3 font-semibold">Status</th>
                                                <th className="px-4 py-3 font-semibold">HTTP</th>
                                                <th className="px-4 py-3 font-semibold">Duration</th>
                                                <th className="px-4 py-3 font-semibold">Method / route</th>
                                                <th className="px-4 py-3 font-semibold">Request ID</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 bg-white">
                                            {logs.map((log) => (
                                                <tr key={log.id} className="align-top hover:bg-slate-50/70">
                                                    <td className="whitespace-nowrap px-4 py-3 text-slate-600">{formatDateTime(log.created_at)}</td>
                                                    <td className="px-4 py-3"><StatusBadge status={log.status} /></td>
                                                    <td className="px-4 py-3 font-mono text-slate-600">{log.http_status ?? "—"}</td>
                                                    <td className="whitespace-nowrap px-4 py-3 font-mono text-slate-600">{formatDuration(log.duration_ms)}</td>
                                                    <td className="px-4 py-3">
                                                        <div className="font-semibold text-slate-700">{log.method || "—"}</div>
                                                        <div className="mt-0.5 break-all text-xs text-slate-500">{log.route || "—"}</div>
                                                    </td>
                                                    <td className="max-w-[180px] break-all px-4 py-3 font-mono text-xs text-slate-500">{log.request_id || "—"}</td>
                                                </tr>
                                            ))}
                                            {logs.length === 0 && (
                                                <tr><td colSpan={6} className="px-4 py-10 text-center text-sm text-slate-500">No health-check logs found.</td></tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                                <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                    <p className="text-xs text-slate-500">
                                        {logsCount === 0 ? "0 records" : `Showing ${logsOffset + 1}–${Math.min(logsOffset + logs.length, logsCount)} of ${logsCount} records`}
                                    </p>
                                    <div className="flex items-center gap-2">
                                        <button
                                            type="button"
                                            onClick={() => fetchHealthLogs(Math.max(0, logsOffset - LOGS_PAGE_SIZE))}
                                            disabled={logsLoading || logsOffset === 0}
                                            className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                                        >Previous</button>
                                        <button
                                            type="button"
                                            onClick={() => fetchHealthLogs(logsOffset + LOGS_PAGE_SIZE)}
                                            disabled={logsLoading || logsOffset + logs.length >= logsCount}
                                            className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                                        >Next</button>
                                    </div>
                                </div>
                            </>
                        )}
                    </section>
                </main>

                <footer className="mt-6 flex flex-col gap-1 text-xs leading-5 text-slate-400 sm:flex-row sm:items-center sm:justify-between">
                    <p>Health endpoint: <code className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-slate-600">/health/</code></p>
                    <p>The latest report and timer are saved in this tab. Reloading restores them without an immediate request.</p>
                </footer>
            </div>
        </main>
    );
}
