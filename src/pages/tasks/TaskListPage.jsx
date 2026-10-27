// import { useEffect, useState } from "react";
// import { Link } from "react-router";
// import { tasksApi } from "@/api/tasks.api";

// export default function TaskListPage() {
//   const [data, setData] = useState(null);
//   const [error, setError] = useState("");
//   useEffect(() => {
//     tasksApi.list({ limit: 50 })
//       .then(setData)
//       .catch((err) => setError(err.message));
//   }, []);

//   return (
//     <main>
//       <h1>Tasks</h1>
//       {error && <p role="alert">{error}</p>}
//       <ul>{data?.results?.map((task) => <li key={task.id}><Link to={`/tasks/${task.id}`}>{task.title}</Link> — {task.status}</li>)}</ul>
//     </main>
//   );
// }

import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import {
    FiAlertCircle,
    FiCheckCircle,
    FiChevronLeft,
    FiChevronRight,
    FiClock,
    FiClipboard,
    FiFilter,
    FiPlus,
    FiRefreshCw,
    FiSearch,
    FiTarget,
    FiX,
    FiArrowUpRight,
} from "react-icons/fi";

import { tasksApi } from "@/api/tasks.api";
import { FaRotate } from "react-icons/fa6";
import { RippleButton } from "@/components/RippleButton";

const PAGE_SIZE_OPTIONS = [20, 50, 100];

const TASK_STATUSES = [
    { value: "", label: "All statuses" },
    { value: "new", label: "New" },
    { value: "pending", label: "Pending" },
    { value: "in_progress", label: "In Progress" },
    { value: "completed", label: "Completed" },
    { value: "cancelled", label: "Cancelled" },
];

function formatLabel(value) {
    if (value === null || value === undefined || value === "") {
        return "Unknown";
    }

    return String(value)
        .replace(/[_-]+/g, " ")
        .replace(/\b\w/g, (character) => character.toUpperCase());
}

function getStatusClasses(status) {
    const value = String(status ?? "").toLowerCase();

    const styles = {
        new: "bg-sky-50 text-sky-700 ring-sky-600/20",
        pending: "bg-amber-50 text-amber-700 ring-amber-600/20",
        in_progress: "bg-violet-50 text-violet-700 ring-violet-600/20",
        completed: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
        cancelled: "bg-rose-50 text-rose-700 ring-rose-600/20",
    };

    return (
        styles[value] ||
        "bg-slate-100 text-slate-600 ring-slate-500/20"
    );
}

function getStatusIcon(status) {
    const value = String(status ?? "").toLowerCase();

    if (value === "completed") {
        return <FiCheckCircle size={13} />;
    }

    if (value === "pending" || value === "in_progress") {
        return <FiClock size={13} />;
    }

    return <FiTarget size={13} />;
}

function formatDate(value) {
    if (!value) return "—";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return "—";

    return new Intl.DateTimeFormat(undefined, {
        day: "2-digit",
        month: "short",
        year: "numeric",
    }).format(date);
}

function getTaskDescription(task) {
    return (
        task?.description ||
        task?.data?.description ||
        "No description provided."
    );
}

function TaskSkeletonRows() {
    return Array.from({ length: 5 }, (_, index) => (
        <tr key={index} className="animate-pulse">
            <td className="px-6 py-5">
                <div className="flex items-start gap-3">
                    <div className="mt-1 h-9 w-9 rounded-xl bg-slate-200" />
                    <div className="space-y-2">
                        <div className="h-3 w-44 rounded bg-slate-200" />
                        <div className="h-3 w-64 max-w-full rounded bg-slate-100" />
                    </div>
                </div>
            </td>
            <td className="px-6 py-5">
                <div className="h-6 w-24 rounded-full bg-slate-200" />
            </td>
            <td className="px-6 py-5">
                <div className="h-3 w-24 rounded bg-slate-200" />
            </td>
            <td className="px-6 py-5">
                <div className="ml-auto h-8 w-20 rounded-lg bg-slate-200" />
            </td>
        </tr>
    ));
}

function SummaryCard({ title, value, description, icon, iconClass }) {
    return (
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
            <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-500">
                        {title}
                    </p>

                    <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
                        {value}
                    </p>

                    <p className="mt-2 text-xs leading-5 text-slate-500">
                        {description}
                    </p>
                </div>

                <div className={`shrink-0 rounded-xl p-3 ${iconClass}`}>
                    {icon}
                </div>
            </div>
        </div>
    );
}

export default function TaskListPage() {
    const [data, setData] = useState(null);
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(true);

    const [query, setQuery] = useState("");
    const [debouncedQuery, setDebouncedQuery] = useState("");
    const [status, setStatus] = useState("");
    const [limit, setLimit] = useState(50);
    const [offset, setOffset] = useState(0);
    const [refreshKey, setRefreshKey] = useState(0);

    // Debounce search input.
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedQuery(query.trim());
        }, 300);

        return () => clearTimeout(timer);
    }, [query]);

    // Load tasks using the current filters and pagination.
    useEffect(() => {
        let active = true;

        async function loadTasks() {
            setIsLoading(true);
            setError("");

            try {
                const result = await tasksApi.list({
                    limit,
                    offset,
                    q: debouncedQuery,
                    ...(status ? { status } : {}),
                });

                if (active) {
                    setData(result);
                }
            } catch (err) {
                if (active) {
                    setError(
                        err?.message ||
                        "Unable to load tasks. Please try again."
                    );
                }
            } finally {
                if (active) {
                    setIsLoading(false);
                }
            }
        }

        loadTasks();

        return () => {
            active = false;
        };
    }, [limit, offset, debouncedQuery, status, refreshKey]);

    const tasks = data?.results ?? [];
    const total = Number(data?.count ?? 0);

    const currentPage = Math.floor(offset / limit) + 1;
    const startRecord = tasks.length > 0 ? offset + 1 : 0;
    const endRecord = offset + tasks.length;

    const canGoPrevious = offset > 0;
    const canGoNext = Boolean(data?.next);

    // These counts apply only to the currently loaded page.
    const pageStats = useMemo(() => {
        return tasks.reduce(
            (counts, task) => {
                const value = String(task?.status ?? "").toLowerCase();

                if (value === "completed") {
                    counts.completed += 1;
                } else if (
                    value !== "cancelled" &&
                    value !== "completed"
                ) {
                    counts.open += 1;
                }

                return counts;
            },
            { completed: 0, open: 0 }
        );
    }, [tasks]);

    function handleSearchChange(event) {
        setQuery(event.target.value);
        setOffset(0);
    }

    function handleStatusChange(event) {
        setStatus(event.target.value);
        setOffset(0);
    }

    function handleLimitChange(event) {
        setLimit(Number(event.target.value));
        setOffset(0);
    }

    function handleRefresh() {
        setRefreshKey((current) => current + 1);
    }

    function handlePrevious() {
        if (!canGoPrevious || isLoading) return;

        setOffset((current) => Math.max(0, current - limit));
    }

    function handleNext() {
        if (!canGoNext || isLoading) return;

        setOffset((current) => current + limit);
    }

    function clearFilters() {
        setQuery("");
        setDebouncedQuery("");
        setStatus("");
        setOffset(0);
    }

    const hasFilters = Boolean(query || status);

    return (
        <main className="min-h-screen bg-slate-50/80 px-4 py-6 text-slate-900 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-7xl space-y-7">
                {/* Page header */}
                <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <div className="mb-2 flex items-center gap-2 text-sm font-medium text-violet-700">
                            <FiClipboard size={16} />
                            Work management
                        </div>

                        <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                            Tasks
                        </h1>

                        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
                            Track task progress, review details, and find the
                            work that needs your attention.
                        </p>
                    </div>
                    <RippleButton
                            type="button"
                            hue={270}
                            saturation={100}
                            lightness={50}
                            variant='outline'
                            size='sm'
                            onClick={handleRefresh}
                            disabled={isLoading}
                            // className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg border border-rose-200 bg-white px-3 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-100 disabled:opacity-60"
                            className='inline-flex items-center gap-1.5 px-2.5 py-1.5 disabled:cursor-not-allowed disabled:opacity-60'
                        >
                            <FaRotate size={14} />
                            Refresh
                    </RippleButton>
                </header>

                {/* Summary cards */}
                <section
                    aria-label="Task list summary"
                    className="grid grid-cols-1 gap-4 sm:grid-cols-3"
                >
                    <SummaryCard
                        title="Matching tasks"
                        value={
                            data ? total.toLocaleString() : "—"
                        }
                        description="Tasks matching the current filters"
                        icon={<FiClipboard size={21} />}
                        iconClass="bg-violet-50 text-violet-700"
                    />

                    <SummaryCard
                        title="Open on this page"
                        value={data ? pageStats.open.toLocaleString() : "—"}
                        description="Not completed or cancelled in this result"
                        icon={<FiClock size={21} />}
                        iconClass="bg-amber-50 text-amber-700"
                    />

                    <SummaryCard
                        title="Completed on this page"
                        value={
                            data
                                ? pageStats.completed.toLocaleString()
                                : "—"
                        }
                        description="Completed tasks in the current result"
                        icon={<FiCheckCircle size={21} />}
                        iconClass="bg-emerald-50 text-emerald-700"
                    />
                </section>

                {/* Error state */}
                {error && (
                    <div
                        role="alert"
                        className="flex flex-col gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 sm:flex-row sm:items-center sm:justify-between"
                    >
                        <div className="flex items-start gap-3">
                            <FiAlertCircle
                                size={20}
                                className="mt-0.5 shrink-0 text-rose-600"
                            />

                            <div>
                                <p className="text-sm font-semibold text-rose-800">
                                    Could not load tasks
                                </p>

                                <p className="mt-1 text-sm text-rose-700">
                                    {error}
                                </p>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={handleRefresh}
                            disabled={isLoading}
                            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg border border-rose-200 bg-white px-3 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-100 disabled:opacity-60"
                        >
                            <FaRotate size={14} />
                            Retry
                        </button>
                    </div>
                )}

                {/* Task table */}
                <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
                    <div className="flex flex-col gap-4 border-b border-slate-100 p-5 sm:p-6 xl:flex-row xl:items-center xl:justify-between">
                        <div>
                            <h2 className="text-lg font-bold text-slate-900">
                                All tasks
                            </h2>

                            <p className="mt-1 text-sm text-slate-500">
                                Search tasks or narrow the list by status.
                            </p>
                        </div>

                        <div className="flex flex-col gap-3 sm:flex-row">
                            {/* Search */}
                            <div className="relative min-w-0 sm:w-72">
                                <FiSearch
                                    size={18}
                                    aria-hidden="true"
                                    className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                                />

                                <input
                                    type="search"
                                    value={query}
                                    onChange={handleSearchChange}
                                    placeholder="Search tasks..."
                                    aria-label="Search tasks"
                                    className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50/70 pl-10 pr-10 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-100"
                                />

                                {query && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setQuery("");
                                            setOffset(0);
                                        }}
                                        aria-label="Clear search"
                                        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-700"
                                    >
                                        <FiX size={16} />
                                    </button>
                                )}
                            </div>

                            {/* Status filter */}
                            <label className="flex h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3">
                                <FiFilter
                                    size={15}
                                    className="shrink-0 text-slate-400"
                                />

                                <select
                                    value={status}
                                    onChange={handleStatusChange}
                                    aria-label="Filter tasks by status"
                                    className="min-w-0 cursor-pointer bg-transparent text-sm font-medium text-slate-700 outline-none"
                                >
                                    {TASK_STATUSES.map((item) => (
                                        <option
                                            key={item.value || "all"}
                                            value={item.value}
                                        >
                                            {item.label}
                                        </option>
                                    ))}
                                </select>
                            </label>

                            {/* Page size */}
                            <label className="flex h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3">
                                <span className="whitespace-nowrap text-xs font-medium text-slate-500">
                                    Show
                                </span>

                                <select
                                    value={limit}
                                    onChange={handleLimitChange}
                                    aria-label="Tasks per page"
                                    className="min-w-12 cursor-pointer bg-transparent text-sm font-semibold text-slate-700 outline-none"
                                >
                                    {PAGE_SIZE_OPTIONS.map((size) => (
                                        <option key={size} value={size}>
                                            {size}
                                        </option>
                                    ))}
                                </select>
                            </label>
                        </div>
                    </div>

                    {/* Active filter summary */}
                    {hasFilters && (
                        <div className="flex flex-wrap items-center gap-2 border-b border-slate-100 px-5 py-3 sm:px-6">
                            <span className="text-xs font-medium text-slate-500">
                                Active filters:
                            </span>

                            {query && (
                                <span className="inline-flex items-center gap-1.5 rounded-lg bg-violet-50 px-2.5 py-1.5 text-xs font-semibold text-violet-700">
                                    Search: {query}
                                    <button
                                        type="button"
                                        onClick={() => setQuery("")}
                                        aria-label="Remove search filter"
                                        className="rounded hover:text-violet-950"
                                    >
                                        <FiX size={13} />
                                    </button>
                                </span>
                            )}

                            {status && (
                                <span className="inline-flex items-center gap-1.5 rounded-lg bg-violet-50 px-2.5 py-1.5 text-xs font-semibold text-violet-700">
                                    Status: {formatLabel(status)}
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setStatus("");
                                            setOffset(0);
                                        }}
                                        aria-label="Remove status filter"
                                        className="rounded hover:text-violet-950"
                                    >
                                        <FiX size={13} />
                                    </button>
                                </span>
                            )}

                            <button
                                type="button"
                                onClick={clearFilters}
                                className="ml-auto text-xs font-semibold text-slate-500 transition hover:text-violet-700"
                            >
                                Clear all
                            </button>
                        </div>
                    )}

                    {/* Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[760px] border-collapse text-left">
                            <thead>
                                <tr className="border-b border-slate-100 bg-slate-50/80">
                                    <th
                                        scope="col"
                                        className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500"
                                    >
                                        Task
                                    </th>

                                    <th
                                        scope="col"
                                        className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500"
                                    >
                                        Status
                                    </th>

                                    <th
                                        scope="col"
                                        className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500"
                                    >
                                        Created
                                    </th>

                                    <th
                                        scope="col"
                                        className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-slate-500"
                                    >
                                        Action
                                    </th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-slate-100">
                                {isLoading && !data && <TaskSkeletonRows />}

                                {!isLoading &&
                                    !error &&
                                    tasks.map((task) => {
                                        const statusValue =
                                            task?.status || "unknown";

                                        return (
                                            <tr
                                                key={task.id}
                                                className="group transition-colors hover:bg-violet-50/40"
                                            >
                                                <td className="px-6 py-4">
                                                    <div className="flex min-w-0 items-start gap-3">
                                                        <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-700 ring-1 ring-inset ring-violet-100">
                                                            <FiClipboard size={19} />
                                                        </div>

                                                        <div className="min-w-0">
                                                            <Link
                                                                to={`/tasks/${task.id}`}
                                                                className="block max-w-lg truncate text-sm font-semibold text-slate-900 transition hover:text-violet-700"
                                                                title={
                                                                    task.title ||
                                                                    `Task ${task.id}`
                                                                }
                                                            >
                                                                {task.title ||
                                                                    `Task ${task.id}`}
                                                            </Link>

                                                            <p
                                                                className="mt-1 max-w-lg truncate text-xs leading-5 text-slate-500"
                                                                title={getTaskDescription(task)}
                                                            >
                                                                {getTaskDescription(task)}
                                                            </p>

                                                            <p className="mt-1 text-xs text-slate-400">
                                                                ID: {task.id}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>

                                                <td className="px-6 py-4">
                                                    <span
                                                        className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1.5 text-xs font-semibold ring-1 ring-inset ${getStatusClasses(statusValue)}`}
                                                    >
                                                        {getStatusIcon(statusValue)}
                                                        {formatLabel(statusValue)}
                                                    </span>
                                                </td>

                                                <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-600">
                                                    {formatDate(
                                                        task.created_at ||
                                                        task.created ||
                                                        task.created_on
                                                    )}
                                                </td>

                                                <td className="whitespace-nowrap px-6 py-4 text-right">
                                                    <Link
                                                        to={`/tasks/${task.id}`}
                                                        className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:border-violet-200 hover:bg-violet-50 hover:text-violet-700 focus:outline-none focus:ring-4 focus:ring-violet-100"
                                                    >
                                                        View
                                                        <FiArrowUpRight size={14} />
                                                    </Link>
                                                </td>
                                            </tr>
                                        );
                                    })}

                                {!isLoading && !error && tasks.length === 0 && (
                                    <tr>
                                        <td
                                            colSpan={4}
                                            className="px-6 py-16 text-center"
                                        >
                                            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                                                <FiClipboard size={26} />
                                            </div>

                                            <h3 className="mt-4 text-sm font-semibold text-slate-900">
                                                {hasFilters
                                                    ? "No matching tasks found"
                                                    : "No tasks available"}
                                            </h3>

                                            <p className="mx-auto mt-1 max-w-sm text-sm leading-6 text-slate-500">
                                                {hasFilters
                                                    ? "Try changing the search text or selecting a different status."
                                                    : "Tasks will appear here when they are available."}
                                            </p>

                                            {hasFilters && (
                                                <button
                                                    type="button"
                                                    onClick={clearFilters}
                                                    className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-violet-700 transition hover:text-violet-800"
                                                >
                                                    <FiX size={15} />
                                                    Clear filters
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <footer className="flex flex-col gap-4 border-t border-slate-100 bg-white px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                        <p className="text-sm text-slate-500">
                            Showing{" "}
                            <span className="font-semibold text-slate-800">
                                {startRecord.toLocaleString()}–
                                {endRecord.toLocaleString()}
                            </span>{" "}
                            of{" "}
                            <span className="font-semibold text-slate-800">
                                {total.toLocaleString()}
                            </span>{" "}
                            tasks
                        </p>

                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={handlePrevious}
                                disabled={!canGoPrevious || isLoading}
                                className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 text-sm font-semibold text-slate-700 transition hover:border-violet-200 hover:bg-violet-50 hover:text-violet-700 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                                <FiChevronLeft size={17} />
                                Previous
                            </button>

                            <span className="min-w-10 text-center text-sm font-semibold text-slate-600">
                                {currentPage}
                            </span>

                            <button
                                type="button"
                                onClick={handleNext}
                                disabled={!canGoNext || isLoading}
                                className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-violet-600 px-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500 disabled:shadow-none"
                            >
                                Next
                                <FiChevronRight size={17} />
                            </button>
                        </div>
                    </footer>
                </section>

                <p className="text-center text-xs text-slate-400">
                    Task management · Task information is provided by the server
                </p>
            </div>
        </main>
    );
}
