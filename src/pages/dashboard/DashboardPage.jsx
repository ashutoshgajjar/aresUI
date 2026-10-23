import { useCallback, useEffect, useState } from "react";
import { FiActivity, FiRefreshCw, FiShield } from "react-icons/fi";

import { getDashboardData } from "@/api/dashboard.api";
import { useAuth } from "@/context/AuthContext";
import { useRoot } from '@/context/RootContext';

import Header from '@/components/layout/Header';
import Sidebar from "@/components/layout/Sidebar";
import MetricCard from "@/pages/dashboard/MetricCard";
// import TaskStatusChart from "@/pages/dashboard/TaskStatusChart";
import Chart from "./UserRoleChart";

function formatDate(value) {
    if (!value) return "—";

    return new Intl.DateTimeFormat(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
    }).format(new Date(value));
}

export default function DashboardPage() {
    // const { user, role, logout } = useRoot();
    const { user, logout } = useAuth();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState("");

    const loadDashboard = useCallback(async (isRefresh = false) => {
        setError("");
        isRefresh ? setRefreshing(true) : setLoading(true);

        try {
            const result = await getDashboardData();
            setData(result);
        } catch (err) {
            setError(err?.message || "Unable to load dashboard data.");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        loadDashboard();
    }, [loadDashboard]);

    const metrics = data || {
        users: { total: 0 },
        tasks: { total: 0, loaded: 0, status: {} },
        files: { total: 0 },
        generatedAt: null,
    };

    return (
        <div className="flex min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-900 dark:text-white">
            <Sidebar role={user?.metadata?.role} onLogout={logout} />
            <main className="min-w-0 flex-1">
            <Header Title="Dashboard" Desc="Operational overview and system activity." onRefresh={() => loadDashboard(true)} 
                    disabled={refreshing}/>

                {/* <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur dark:border-slate-800 dark:bg-slate-950/90">
                    <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-4 px-5 py-4 lg:px-8">
                        <div>
                            <div className="flex items-center gap-2">
                                <FiShield className="text-indigo-600" size={20} />
                                <h1 className="text-xl font-bold tracking-tight">
                                    Dashboard
                                </h1>
                            </div>
                            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                                Operational overview and system activity.
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={() => loadDashboard(true)}
                            disabled={refreshing}
                            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                        >
                            <FiRefreshCw className={refreshing ? "animate-spin" : ""} size={16} />
                            Refresh
                        </button>
                    </div>
                </header> */}

                <div className="mx-auto max-w-[1600px] space-y-6 px-5 py-6 lg:px-8">
                    {error && (
                        <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">
                            {error}
                        </div>
                    )}

                    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                        <MetricCard
                            title="Total users"
                            value={metrics.users.total}
                            type="users"
                            description="Current user records available to your account."
                            loading={loading}
                        />
                        <MetricCard
                            title="Total tasks"
                            value={metrics.tasks.total}
                            type="tasks"
                            description="Tasks currently available through the API."
                            loading={loading}
                        />
                        <MetricCard
                            title="Stored files"
                            value={metrics.files.total}
                            type="files"
                            description="Active files available through the file service."
                            loading={loading}
                        />
                        <MetricCard
                            title="Active Users"
                            value={metrics.users.active}
                            type="active"
                            description="Currently active users on the system."
                            loading={loading}
                        />
                    </section>
                    <section className="grid gap-6">
                        {/* <TaskStatusChart
                            status={metrics.tasks.status}
                            loaded={metrics.tasks.loaded}
                            total={metrics.tasks.total}
                        /> */}

                        <Chart
                            statuses={metrics.users.status}
                            roles={metrics.users.roles}
                            loaded={metrics.users.loaded}
                            total={metrics.users.total}
                        />
                    </section>
                    <section className="grid gap-6">
                        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
                            <div className="flex items-center gap-2">
                                <FiActivity className="text-indigo-600" size={18} />
                                <h2 className="text-base font-semibold">
                                    System information
                                </h2>
                            </div>

                            <dl className="mt-5 divide-y divide-slate-100 dark:divide-slate-800">
                                <div className="flex items-center justify-between gap-4 py-3">
                                    <dt className="text-sm text-slate-500">Signed in as</dt>
                                    <dd className="max-w-[60%] truncate text-right text-sm font-medium">
                                        {user?.personal?.firstName + " " + user?.personal?.lastName || "—"}
                                    </dd>
                                </div>
                                <div className="flex items-center justify-between gap-4 py-3">
                                    <dt className="text-sm text-slate-500">Role</dt>
                                    <dd className="text-sm font-medium capitalize">
                                        {user?.metadata?.role || "—"}
                                    </dd>
                                </div>
                                <div className="flex items-center justify-between gap-4 py-3">
                                    <dt className="text-sm text-slate-500">Account status</dt>
                                    <dd className="text-sm font-medium capitalize">
                                        {user?.account_status || "active"}
                                    </dd>
                                </div>
                                <div className="flex items-center justify-between gap-4 py-3">
                                    <dt className="text-sm text-slate-500">Last refresh</dt>
                                    <dd className="text-right text-sm font-medium">
                                        {formatDate(metrics.generatedAt)}
                                    </dd>
                                </div>
                            </dl>
                        </section>
                    </section>
                </div>
            </main>
        </div>
    );
}
