import {
    createContext,
    useCallback,
    useContext,
    useMemo,
    useRef,
    useState,
} from "react";
import {
    FiAlertCircle,
    FiAlertTriangle,
    FiCheckCircle,
    FiInfo,
    FiRefreshCw,
    FiUploadCloud,
} from "react-icons/fi";

import "./notifications.css";
import NotificationToast from "./NotificationToast";

const NotificationContext = createContext(null);

const DEFAULT_TITLES = {
    success: "Success",
    error: "Something went wrong",
    warning: "Attention",
    info: "Information",
    update: "Update available",
    loading: "Working...",
};

const TYPE_ICONS = {
    success: FiCheckCircle,
    error: FiAlertCircle,
    warning: FiAlertTriangle,
    info: FiInfo,
    update: FiUploadCloud,
    loading: FiRefreshCw,
};

const TYPE_STYLES = {
    success: {
        accent: "bg-emerald-500",
        icon: "bg-emerald-50 text-emerald-700 dark:bg-emerald-400/15 dark:text-emerald-300",
        progress: "bg-emerald-500",
    },
    error: {
        accent: "bg-rose-500",
        icon: "bg-rose-50 text-rose-700 dark:bg-rose-400/15 dark:text-rose-300",
        progress: "bg-rose-500",
    },
    warning: {
        accent: "bg-amber-500",
        icon: "bg-amber-50 text-amber-700 dark:bg-amber-400/15 dark:text-amber-300",
        progress: "bg-amber-500",
    },
    info: {
        accent: "bg-sky-500",
        icon: "bg-sky-50 text-sky-700 dark:bg-sky-400/15 dark:text-sky-300",
        progress: "bg-sky-500",
    },
    update: {
        accent: "bg-violet-500",
        icon: "bg-violet-50 text-violet-700 dark:bg-violet-400/15 dark:text-violet-300",
        progress: "bg-violet-500",
    },
    loading: {
        accent: "bg-slate-400",
        icon: "bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-200",
        progress: "bg-violet-500",
    },
};

const POSITIONS = [
    "top-right",
    "top-left",
    "bottom-right",
    "bottom-left",
    "top-center",
    "bottom-center",
];

function normalizeType(type) {
    return Object.hasOwn(TYPE_STYLES, type) ? type : "info";
}

function runDismissCallback(notification, reason) {
    try {
        notification.onDismiss?.(reason);
    } catch {
        // Consumer callbacks must not interrupt notification state updates.
    }
}

function normalizeOptions(input, type, defaultDuration) {
    const options = typeof input === "string" ? { message: input } : (input || {});
    const resolvedType = normalizeType(options.type || type || "info");
    const hasProgress = options.progress !== undefined && options.progress !== null;
    let fallbackDuration = resolvedType === "loading" || hasProgress ? 0 : defaultDuration;
    if (resolvedType === "error") fallbackDuration = Math.max(fallbackDuration, 7000);
    if (options.action || options.secondaryAction) fallbackDuration = Math.max(fallbackDuration, 6500);
    const rawDuration = options.duration ?? fallbackDuration;
    const parsedDuration = Number(rawDuration);

    return {
        title: options.title ?? DEFAULT_TITLES[resolvedType],
        message: options.message ?? options.description ?? "",
        type: resolvedType,
        duration: Number.isFinite(parsedDuration) ? Math.max(0, parsedDuration) : defaultDuration,
        action: options.action || null,
        secondaryAction: options.secondaryAction || null,
        dismissible: options.dismissible !== false,
        onDismiss: typeof options.onDismiss === "function" ? options.onDismiss : undefined,
        progress: hasProgress ? Math.min(100, Math.max(0, Number(options.progress) || 0)) : undefined,
        progressLabel: options.progressLabel || "",
        image: options.image || null,
        avatar: options.avatar || null,
        iconVariant: ["default", "gray", "brand", "none"].includes(options.iconVariant)
            ? options.iconVariant
            : "default",
        createdAt: Date.now(),
        timerKey: 0,
    };
}

function toMessagePatch(value, fallbackTitle) {
    if (typeof value === "string" || typeof value === "number") {
        return { title: fallbackTitle, message: String(value) };
    }

    if (value && typeof value === "object") {
        return {
            ...value,
            title: value.title ?? fallbackTitle,
            message: value.message ?? value.description ?? "",
        };
    }

    return { title: fallbackTitle, message: "" };
}

export function NotificationProvider({
    children,
    position = "top-right",
    maxNotifications = 4,
    defaultDuration = 5000,
}) {
    const [notifications, setNotifications] = useState([]);
    const notificationsRef = useRef([]);
    const nextId = useRef(1);

    const setNotificationList = useCallback((updater) => {
        const current = notificationsRef.current;
        const next = typeof updater === "function" ? updater(current) : updater;
        notificationsRef.current = next;
        setNotifications(next);
    }, []);

    const dismiss = useCallback((id, reason = "dismiss") => {
        const dismissed = notificationsRef.current.find((item) => item.id === id);
        if (!dismissed) return;

        setNotificationList((current) => current.filter((item) => item.id !== id));
        runDismissCallback(dismissed, reason);
    }, [setNotificationList]);

    const dismissAll = useCallback(() => {
        const current = notificationsRef.current;
        setNotificationList([]);
        current.forEach((item) => runDismissCallback(item, "dismiss-all"));
    }, [setNotificationList]);

    const push = useCallback((input, type = "info") => {
        const normalized = normalizeOptions(input, type, defaultDuration);
        const id = `notification-${Date.now()}-${nextId.current++}`;
        const notification = { ...normalized, id };
        const max = Math.max(1, Math.floor(Number(maxNotifications) || 4));
        const current = notificationsRef.current;
        const next = [notification, ...current].slice(0, max);
        const visibleIds = new Set(next.map((item) => item.id));
        const overflowed = current.filter((item) => !visibleIds.has(item.id));

        setNotificationList(next);
        overflowed.forEach((item) => runDismissCallback(item, "overflow"));
        return id;
    }, [defaultDuration, maxNotifications, setNotificationList]);

    const notify = useCallback((input, options = {}) => {
        if (typeof input === "string") return push({ ...options, message: input }, "info");
        return push(input, "info");
    }, [push]);

    const success = useCallback((input, options = {}) => push(
        typeof input === "string" ? { ...options, message: input, type: "success" } : { ...input, type: "success" },
        "success"
    ), [push]);

    const error = useCallback((input, options = {}) => push(
        typeof input === "string" ? { ...options, message: input, type: "error" } : { ...input, type: "error" },
        "error"
    ), [push]);

    const warning = useCallback((input, options = {}) => push(
        typeof input === "string" ? { ...options, message: input, type: "warning" } : { ...input, type: "warning" },
        "warning"
    ), [push]);

    const info = useCallback((input, options = {}) => push(
        typeof input === "string" ? { ...options, message: input, type: "info" } : { ...input, type: "info" },
        "info"
    ), [push]);

    const updateNotice = useCallback((input, options = {}) => push(
        typeof input === "string" ? { ...options, message: input, type: "update" } : { ...input, type: "update" },
        "update"
    ), [push]);

    const loading = useCallback((input, options = {}) => push(
        typeof input === "string"
            ? { ...options, message: input, type: "loading", duration: 0 }
            : { ...input, type: "loading", duration: 0 },
        "loading"
    ), [push]);

    const update = useCallback((id, changes = {}) => {
        setNotificationList((current) => current.map((item) => {
            if (item.id !== id) return item;

            const next = typeof changes === "string" ? { message: changes } : changes;
            const type = normalizeType(next.type ?? item.type);
            const typeChanged = next.type !== undefined && type !== item.type;
            const nextDuration = next.duration === undefined
                ? (typeChanged ? (type === "loading" ? 0 : defaultDuration) : item.duration)
                : Math.max(0, Number(next.duration) || 0);
            const nextHasProgress = next.progress !== undefined && next.progress !== null;

            return {
                ...item,
                ...next,
                type,
                title: next.title ?? (typeChanged ? DEFAULT_TITLES[type] : item.title),
                message: next.message ?? next.description ?? item.message,
                duration: nextHasProgress && next.duration === undefined ? 0 : nextDuration,
                progress: next.progress === null ? undefined : next.progress === undefined ? item.progress : Math.min(100, Math.max(0, Number(next.progress) || 0)),
                timerKey: item.timerKey + 1,
            };
        }));
    }, [defaultDuration, setNotificationList]);

    const promise = useCallback(async (promiseOrFunction, messages = {}, options = {}) => {
        const loadingContent = toMessagePatch(messages.loading ?? "Working...", DEFAULT_TITLES.loading);
        const id = push({ ...options, ...loadingContent, type: "loading", duration: 0 }, "loading");

        try {
            const result = await (typeof promiseOrFunction === "function" ? promiseOrFunction() : promiseOrFunction);
            const rawSuccess = typeof messages.success === "function"
                ? messages.success(result)
                : messages.success ?? "Completed successfully.";
            const successPatch = toMessagePatch(rawSuccess, DEFAULT_TITLES.success);

            update(id, {
                ...successPatch,
                type: "success",
                duration: options.successDuration ?? defaultDuration,
                progress: null,
            });
            return result;
        } catch (caught) {
            const rawError = typeof messages.error === "function"
                ? messages.error(caught)
                : messages.error ?? caught?.message ?? "The operation could not be completed.";
            const errorPatch = toMessagePatch(rawError, DEFAULT_TITLES.error);

            update(id, {
                ...errorPatch,
                type: "error",
                duration: options.errorDuration ?? Math.max(defaultDuration, 7000),
                progress: null,
            });
            throw caught;
        }
    }, [defaultDuration, push, update]);

    const api = useMemo(() => ({
        notify,
        success,
        error,
        warning,
        info,
        updateNotice,
        loading,
        promise,
        update,
        dismiss,
        dismissAll,
    }), [notify, success, error, warning, info, updateNotice, loading, promise, update, dismiss, dismissAll]);

    const safePosition = POSITIONS.includes(position) ? position : "top-right";

    return (
        <NotificationContext.Provider value={api}>
            {children}
            <div
                className={`notification-viewport notification-viewport--${safePosition}`}
                role="region"
                aria-label="Notifications"
            >
                {notifications.map((notification) => {
                    const Icon = TYPE_ICONS[notification.type] || FiInfo;
                    const styles = TYPE_STYLES[notification.type] || TYPE_STYLES.info;

                    return (
                        <NotificationToast
                            key={notification.id}
                            notification={notification}
                            Icon={Icon}
                            styles={styles}
                            onDismiss={dismiss}
                        />
                    );
                })}
            </div>
        </NotificationContext.Provider>
    );
}

export function useNotifications() {
    const context = useContext(NotificationContext);

    if (!context) {
        throw new Error("useNotifications must be used inside NotificationProvider.");
    }

    return context;
}
