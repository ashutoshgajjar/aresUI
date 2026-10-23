import { useCallback, useEffect, useRef, useState } from "react";
import {
    FiArrowUpRight,
    FiPause,
    FiPlay,
    FiRefreshCw,
    FiX,
} from "react-icons/fi";

import { RippleButton } from "@/components/RippleButton";

const EXIT_ANIMATION_MS = 190;

const BUTTON_COLORS = {
    hue: 263,
    saturation: 70,
    lightness: 52,
};

const CLOSE_BUTTON_COLORS = {
    hue: 220,
    saturation: 12,
    lightness: 45,
};

function getIconStyle(iconVariant, typeStyles) {
    if (iconVariant === "none") return "hidden";
    if (iconVariant === "gray") {
        return "bg-slate-100 text-slate-700 ring-1 ring-inset ring-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:ring-slate-700";
    }
    if (iconVariant === "brand") {
        return "bg-violet-50 text-violet-700 ring-1 ring-inset ring-violet-100 dark:bg-violet-400/15 dark:text-violet-300 dark:ring-violet-400/20";
    }
    return typeStyles.icon;
}

function getMediaSource(media) {
    if (typeof media === "string") return media;
    if (media && typeof media === "object") return media.src || media.url || "";
    return "";
}

export default function NotificationToast({ notification, Icon, styles, onDismiss }) {
    const {
        id,
        title,
        message,
        type,
        duration,
        action,
        secondaryAction,
        dismissible,
        timerKey,
        progress,
        progressLabel,
        image,
        avatar,
        iconVariant = "default",
    } = notification;

    const timerRef = useRef(null);
    const exitTimerRef = useRef(null);
    const deadlineRef = useRef(0);
    const remainingRef = useRef(duration);
    const pausedRef = useRef(false);
    const hoveredRef = useRef(false);
    const focusedRef = useRef(false);
    const exitingRef = useRef(false);
    const exitReasonRef = useRef("dismiss");
    const onDismissRef = useRef(onDismiss);
    const deliveredExitRef = useRef(false);

    const [isPaused, setIsPaused] = useState(false);
    const [isExiting, setIsExiting] = useState(false);
    const [loadingAction, setLoadingAction] = useState(null);
    const [actionError, setActionError] = useState("");

    onDismissRef.current = onDismiss;

    const clearTimer = useCallback(() => {
        if (timerRef.current !== null) {
            clearTimeout(timerRef.current);
            timerRef.current = null;
        }
    }, []);

    const clearExitTimer = useCallback(() => {
        if (exitTimerRef.current !== null) {
            clearTimeout(exitTimerRef.current);
            exitTimerRef.current = null;
        }
    }, []);

    const requestDismiss = useCallback((reason = "dismiss") => {
        if (exitingRef.current) return;

        exitingRef.current = true;
        deliveredExitRef.current = false;
        exitReasonRef.current = reason;
        pausedRef.current = true;
        clearTimer();
        setIsPaused(true);
        setIsExiting(true);
        clearExitTimer();

        exitTimerRef.current = setTimeout(() => {
            exitTimerRef.current = null;
            if (deliveredExitRef.current) return;
            deliveredExitRef.current = true;
            onDismissRef.current?.(id, reason);
        }, EXIT_ANIMATION_MS + 60);
    }, [clearExitTimer, clearTimer, id]);

    const scheduleDismiss = useCallback((delay) => {
        clearTimer();
        if (!(delay > 0) || pausedRef.current || exitingRef.current) return;

        remainingRef.current = delay;
        deadlineRef.current = Date.now() + delay;
        timerRef.current = setTimeout(() => {
            timerRef.current = null;
            requestDismiss("timeout");
        }, delay);
    }, [clearTimer, requestDismiss]);

    const pauseTimer = useCallback(() => {
        if (pausedRef.current || !(duration > 0) || exitingRef.current) return;

        pausedRef.current = true;
        clearTimer();
        remainingRef.current = Math.max(0, deadlineRef.current - Date.now());
        setIsPaused(true);
    }, [clearTimer, duration]);

    const resumeTimer = useCallback(() => {
        if (!pausedRef.current || !(duration > 0) || exitingRef.current) return;

        pausedRef.current = false;
        setIsPaused(false);
        scheduleDismiss(remainingRef.current);
    }, [duration, scheduleDismiss]);

    useEffect(() => {
        clearTimer();
        clearExitTimer();
        exitingRef.current = false;
        deliveredExitRef.current = false;
        setIsExiting(false);
        setActionError("");
        setLoadingAction(null);

        const shouldPause = hoveredRef.current || focusedRef.current;
        pausedRef.current = shouldPause;
        setIsPaused(shouldPause);
        remainingRef.current = duration;

        if (duration > 0 && progress === undefined && !shouldPause) {
            scheduleDismiss(duration);
        }

        return () => {
            clearTimer();
            clearExitTimer();
        };
    }, [id, duration, timerKey, progress, clearTimer, clearExitTimer, scheduleDismiss]);

    useEffect(() => () => {
        clearTimer();
        clearExitTimer();
    }, [clearTimer, clearExitTimer]);

    const runAction = useCallback(async (selectedAction, actionKey) => {
        if (!selectedAction?.onClick || loadingAction || exitingRef.current) return;

        setActionError("");
        setLoadingAction(actionKey);

        try {
            await selectedAction.onClick(notification);
            if (selectedAction.closeOnClick !== false) {
                requestDismiss("action");
            }
        } catch (err) {
            setActionError(err?.message || "The action could not be completed. Please try again.");
        } finally {
            setLoadingAction(null);
        }
    }, [loadingAction, notification, requestDismiss]);

    function handleMouseEnter() {
        hoveredRef.current = true;
        pauseTimer();
    }

    function handleMouseLeave() {
        hoveredRef.current = false;
        if (!focusedRef.current) resumeTimer();
    }

    function handleFocusCapture() {
        focusedRef.current = true;
        pauseTimer();
    }

    function handleBlurCapture(event) {
        if (!event.currentTarget.contains(event.relatedTarget)) {
            focusedRef.current = false;
            if (!hoveredRef.current) resumeTimer();
        }
    }

    const isUrgent = type === "error" || type === "warning";
    const describedBy = message ? `${id}-message` : undefined;
    const hasAction = Boolean(action?.label && typeof action.onClick === "function");
    const hasSecondaryAction = Boolean(
        secondaryAction?.label && typeof secondaryAction.onClick === "function"
    );
    const hasProgress = typeof progress === "number" && Number.isFinite(progress);
    const hasMedia = Boolean(getMediaSource(image));
    const avatarSrc = getMediaSource(avatar);
    const iconClasses = getIconStyle(iconVariant, styles);
    const showFooter = hasAction || hasSecondaryAction || duration > 0 || hasProgress || Boolean(progressLabel);

    return (
        <article
            data-notification-id={id}
            data-state={isExiting ? "exiting" : "visible"}
            data-type={type}
            role={isUrgent ? "alert" : "status"}
            aria-live={isUrgent ? "assertive" : "polite"}
            aria-atomic="true"
            aria-describedby={describedBy}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onFocusCapture={handleFocusCapture}
            onBlurCapture={handleBlurCapture}
            onAnimationEnd={(event) => {
                if (
                    isExiting &&
                    event.currentTarget === event.target &&
                    event.animationName.includes("notification-exit")
                ) {
                    clearExitTimer();
                    if (!deliveredExitRef.current) {
                        deliveredExitRef.current = true;
                        onDismissRef.current?.(id, exitReasonRef.current);
                    }
                }
            }}
            className={`notification-toast pointer-events-auto relative overflow-hidden rounded-2xl border border-slate-200 bg-white text-slate-900 shadow-[0_8px_30px_rgba(15,23,42,0.08)] ring-1 ring-black/[0.02] transition-[box-shadow,border-color] duration-200 hover:border-slate-300 hover:shadow-[0_12px_36px_rgba(15,23,42,0.12)] dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:shadow-black/25 dark:hover:border-slate-600 ${isExiting ? "notification-toast--exiting" : ""}`}
        >
            <div className={`notification-toast__accent absolute inset-x-0 top-0 h-[3px] ${styles.accent}`} aria-hidden="true" />

            <div className="flex gap-3.5 p-4 sm:gap-4 sm:p-4">
                {avatarSrc ? (
                    <img
                        src={avatarSrc}
                        alt={avatar?.alt || avatar?.name || ""}
                        className="notification-toast__icon h-10 w-10 shrink-0 rounded-full object-cover ring-1 ring-inset ring-slate-200 dark:ring-slate-700"
                    />
                ) : iconVariant !== "none" ? (
                    <div
                        key={`${id}-${type}`}
                        className={`notification-toast__icon mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${iconClasses}`}
                        aria-hidden="true"
                    >
                        <Icon size={19} className={type === "loading" ? "notification-spin" : ""} />
                    </div>
                ) : null}

                <div className="min-w-0 flex-1 pt-0.5">
                    <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                            {title && (
                                <h3 className="break-words text-sm font-semibold leading-5 tracking-[-0.01em] text-slate-900 dark:text-slate-100">
                                    {title}
                                </h3>
                            )}

                            {message && (
                                <p
                                    id={describedBy}
                                    className={`${title ? "mt-1" : ""} whitespace-pre-line break-words text-[13px] leading-5 text-slate-600 dark:text-slate-300`}
                                >
                                    {message}
                                </p>
                            )}
                        </div>

                        {dismissible && (
                            <RippleButton
                                {...CLOSE_BUTTON_COLORS}
                                variant="ghost"
                                size="sm"
                                onClick={() => requestDismiss("close")}
                                disabled={isExiting}
                                aria-label="Dismiss notification"
                                title="Dismiss notification"
                                className="-mr-2 -mt-2 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg p-0 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100 dark:focus-visible:ring-offset-slate-900"
                            >
                                <FiX size={16} />
                            </RippleButton>
                        )}
                    </div>

                    {hasMedia && (
                        <img
                            src={getMediaSource(image)}
                            alt={image?.alt || ""}
                            className="mt-3 max-h-36 w-full rounded-xl border border-slate-200 object-cover dark:border-slate-700"
                        />
                    )}

                    {showFooter && (
                        <div className="notification-toast__footer mt-3 flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
                            <div className="flex min-w-0 flex-wrap items-center gap-2">
                                {hasSecondaryAction && (
                                    <RippleButton
                                        hue={220}
                                        saturation={12}
                                        lightness={45}
                                        variant="ghost"
                                        size="sm"
                                        disabled={loadingAction !== null || isExiting}
                                        onClick={() => runAction(secondaryAction, "secondary")}
                                        className="inline-flex min-h-8 items-center justify-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-60 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
                                    >
                                        {loadingAction === "secondary" ? (
                                            <FiRefreshCw size={13} className="notification-spin" />
                                        ) : null}
                                        {secondaryAction.label}
                                    </RippleButton>
                                )}

                                {hasAction && (
                                    <RippleButton
                                        {...BUTTON_COLORS}
                                        variant="solid"
                                        size="sm"
                                        disabled={loadingAction !== null || isExiting}
                                        onClick={() => runAction(action, "primary")}
                                        className="inline-flex min-h-8 items-center justify-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:-translate-y-px hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                        {loadingAction === "primary" ? (
                                            <>
                                                <FiRefreshCw size={13} className="notification-spin" />
                                                Working...
                                            </>
                                        ) : (
                                            <>
                                                {action.label}
                                                <FiArrowUpRight size={13} />
                                            </>
                                        )}
                                    </RippleButton>
                                )}
                            </div>

                            {(hasProgress || progressLabel) ? (
                                <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                                    {progressLabel || `${Math.round(progress)}% complete`}
                                </span>
                            ) : duration > 0 ? (
                                <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-slate-400 dark:text-slate-500" aria-live="off">
                                    {isPaused ? <FiPause size={11} /> : <FiPlay size={11} />}
                                    {isPaused ? "Paused" : "Auto-dismiss"}
                                </span>
                            ) : null}
                        </div>
                    )}

                    {actionError && (
                        <p className="mt-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-medium leading-5 text-rose-700 dark:border-rose-400/20 dark:bg-rose-400/10 dark:text-rose-300" role="alert">
                            {actionError}
                        </p>
                    )}
                </div>
            </div>

            {hasProgress ? (
                <div className="notification-progress-track h-1.5 w-full bg-slate-100 dark:bg-slate-800" role="progressbar" aria-label={progressLabel || "Progress"} aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(progress)}>
                    <div
                        className={`notification-progress-determinate h-full ${styles.progress}`}
                        style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
                    />
                </div>
            ) : duration > 0 ? (
                <div className="notification-progress-track h-1 w-full bg-slate-100 dark:bg-slate-800" aria-hidden="true">
                    <div
                        key={`${id}-${timerKey}`}
                        className={`notification-progress h-full origin-left ${styles.progress}`}
                        style={{
                            animationDuration: `${duration}ms`,
                            animationPlayState: isPaused || isExiting ? "paused" : "running",
                        }}
                    />
                </div>
            ) : null}
        </article>
    );
}
