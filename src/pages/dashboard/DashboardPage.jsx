import { useCallback, useEffect, useRef, useState } from "react";
import { FiActivity, FiRefreshCw, FiShield } from "react-icons/fi";
import { FaRotate } from 'react-icons/fa6';

import toast from "react-hot-toast";

import { getDashboardData } from "@/api/dashboard.api";
import { useAuth } from "@/context/AuthContext";
import Sidebar from "@/components/layout/Sidebar";
import MetricCard from "@/pages/dashboard/MetricCard";
import Chart from "./UserRoleChart";
import { RippleButton } from "@/components/RippleButton";

const EMPTY_DASHBOARD = {
    users: {
        total: null,
        active: null,
        loaded: 0,
        status: {},
        roles: {},
    },
    tasks: {
        total: null,
        loaded: 0,
        status: {},
    },
    files: {
        total: null,
    },
    generatedAt: null,
};

function formatDate(value) {
    if (!value) return "—";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "—";
    }

    return new Intl.DateTimeFormat(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
    }).format(date);
}

function metricValue(value) {
    return value == null ? "—" : value;
}

export default function DashboardPage() {
    const { user, logout } = useAuth();

    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState("");

    // Identifies the latest request.
    // Older requests cannot overwrite its result.
    const requestIdRef = useRef(0);

    const loadDashboard = useCallback(
        async (isRefresh = false) => {
            const requestId = ++requestIdRef.current;

            setError("");

            if (isRefresh) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }

            try {
                const result = await getDashboardData({
                    forceRefresh: isRefresh,
                    cacheKey:
                        user?.id ??
                        user?.contact?.email ??
                        "default",
                });

                if (requestId !== requestIdRef.current) {
                    return;
                }

                setData(result);

                if (isRefresh) {
                    toast.success("Dashboard refreshed successfully.");
                }
                if (!isRefresh) {
                    toast.success("Dashboard loaded successfully.");
                }
            } catch (err) {
                if (requestId !== requestIdRef.current) {
                    return;
                }

                const message =
                    err?.message || "Unable to load dashboard data.";

                setError(message);

                if (isRefresh) {
                    toast.error(message);
                }
            } finally {
                // Only the latest request can update loading states.
                if (requestId === requestIdRef.current) {
                    setLoading(false);
                    setRefreshing(false);
                }
            }
        },
        [user?.id, user?.contact?.email]
    );

    useEffect(() => {
        void loadDashboard();

        return () => {
            // Invalidate any request still in progress on cleanup.
            requestIdRef.current += 1;
        };
    }, [loadDashboard]);

    const metrics = data ?? EMPTY_DASHBOARD;

    const userName =
        [
            user?.personal?.firstName,
            user?.personal?.lastName,
        ]
            .filter(Boolean)
            .join(" ") ||
        user?.contact?.email ||
        "—";

    const userRole = user?.metadata?.role || "—";
    const accountStatus = user?.account_status || "—";

    return (
        <div className="flex min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-900 dark:text-white">
            <Sidebar
                role={user?.metadata?.role}
                onLogout={logout}
            />

            <main className="min-w-0 flex-1">
                <header className="border-b border-slate-200 bg-white/90 backdrop-blur dark:border-slate-800 dark:bg-slate-950/90">
                    <div className="mx-auto flex max-w-[1600px] flex-col gap-4 px-5 py-1.5 sm:flex-row sm:items-center sm:justify-between lg:px-8">
                        <div>
                            <div className="flex items-center gap-2">
                                <FiShield
                                    className="shrink-0 text-indigo-600"
                                    size={20}
                                    aria-hidden="true"
                                />

                                <h1 className="text-lg font-bold tracking-tight">
                                    Dashboard
                                </h1>
                            </div>

                            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                                Operational overview and system activity.
                            </p>
                        </div>

                        <RippleButton
                            hue={270}
                            saturation={100}
                            lightness={50}
                            variant='outline'
                            size='sm'
                            type='button'
                            name='Refresh'
                            aria-label='Refresh dashboard data'
                            onClick={() => void loadDashboard(true)}
                            disabled={refreshing}
                            className='inline-flex items-center gap-1.5 px-2.5 py-1.5 disabled:cursor-not-allowed disabled:opacity-60'
                        >
                            <FaRotate
                                className={refreshing ? 'animate-spin' : ''}
                                size={13}
                                aria-hidden="true"
                            />
                            <span className='hidden sm:inline'>
                                {refreshing ? "Refreshing..." : "Refresh"}
                            </span>
                        </RippleButton>
                    </div>
                </header>

                <div className="mx-auto max-w-[1600px] space-y-6 px-5 py-6 lg:px-8">
                    {error && (
                        <div
                            role="alert"
                            className="flex flex-col gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 sm:flex-row sm:items-center sm:justify-between dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300"
                        >
                            <p>{error}</p>

                            <button
                                type="button"
                                onClick={() => void loadDashboard(true)}
                                disabled={refreshing}
                                className="shrink-0 font-medium underline underline-offset-4 disabled:opacity-60"
                            >
                                Try again
                            </button>
                        </div>
                    )}

                    <section
                        aria-label="Dashboard metrics"
                        className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
                    >
                        <MetricCard
                            title="Total users"
                            value={metricValue(metrics.users.total)}
                            type="users"
                            description="Total user records available through the API."
                            loading={loading}
                        />

                        <MetricCard
                            title="Total tasks"
                            value={metricValue(metrics.tasks.total)}
                            type="tasks"
                            description="Tasks currently available through the API."
                            loading={loading}
                        />

                        <MetricCard
                            title="Stored files"
                            value={metricValue(metrics.files.total)}
                            type="files"
                            description="Files available through the file service."
                            loading={loading}
                        />

                        <MetricCard
                            title="Active users"
                            value={metricValue(metrics.users.active)}
                            type="active"
                            description="User accounts with an active account status."
                            loading={loading}
                        />
                    </section>

                    <section
                        aria-label="User statistics"
                        className="grid gap-6"
                    >
                        <Chart
                            statuses={metrics.users.status}
                            roles={metrics.users.roles}
                            loaded={metrics.users.loaded}
                            total={metrics.users.total ?? 0}
                        />
                    </section>

                    <section
                        aria-label="System information"
                        className="grid gap-6"
                    >
                        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
                            <div className="flex items-center gap-2">
                                <FiActivity
                                    className="text-indigo-600"
                                    size={18}
                                    aria-hidden="true"
                                />

                                <h2 className="text-base font-semibold">
                                    System information
                                </h2>
                            </div>

                            <dl className="mt-5 divide-y divide-slate-100 dark:divide-slate-800">
                                <div className="flex items-center justify-between gap-4 py-3">
                                    <dt className="text-sm text-slate-500 dark:text-slate-400">
                                        Signed in as
                                    </dt>

                                    <dd className="max-w-[60%] truncate text-right text-sm font-medium">
                                        {userName}
                                    </dd>
                                </div>

                                <div className="flex items-center justify-between gap-4 py-3">
                                    <dt className="text-sm text-slate-500 dark:text-slate-400">
                                        Role
                                    </dt>

                                    <dd className="text-sm font-medium capitalize">
                                        {userRole}
                                    </dd>
                                </div>

                                <div className="flex items-center justify-between gap-4 py-3">
                                    <dt className="text-sm text-slate-500 dark:text-slate-400">
                                        Account status
                                    </dt>

                                    <dd className="text-sm font-medium capitalize">
                                        {accountStatus}
                                    </dd>
                                </div>

                                <div className="flex items-center justify-between gap-4 py-3">
                                    <dt className="text-sm text-slate-500 dark:text-slate-400">
                                        Last refresh
                                    </dt>

                                    <dd className="text-right text-sm font-medium">
                                        {formatDate(metrics.generatedAt)}
                                    </dd>
                                </div>
                            </dl>
                        </div>
                    </section>
                </div>
            </main>
        </div>
    );
}