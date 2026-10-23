// import { useMemo } from "react";
// import {
//     Chart as ChartJS,
//     CategoryScale,
//     LinearScale,
//     BarElement,
//     Tooltip,
// } from "chart.js";
// import { Bar } from "react-chartjs-2";

// // Register the required Chart.js modules
// ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip);

// function formatLabel(value) {
//     return String(value ?? "Unknown")
//         .replace(/[_-]+/g, " ")
//         .replace(/\b\w/g, (character) => character.toUpperCase());
// }

// function getCount(value) {
//     const raw =
//         value && typeof value === "object"
//             ? value.count ?? value.total ?? value.users
//             : value;

//     if (raw === null || raw === undefined || raw === "") {
//         return null;
//     }

//     const count = Number(raw);

//     return Number.isFinite(count) && count >= 0 ? count : null;
// }

// function normalizeRoles(roles) {
//     if (!roles) return [];

//     // Support an array of user records: [{ role: "admin" }, ...].
//     if (
//         Array.isArray(roles) &&
//         roles.some(
//             (item) =>
//                 item &&
//                 typeof item === "object" &&
//                 (item.role || item.data?.role) &&
//                 item.count === undefined &&
//                 item.total === undefined
//         )
//     ) {
//         const counts = {};

//         for (const user of roles) {
//             const role = user?.role ?? user?.data?.role ?? "unknown";
//             counts[role] = (counts[role] || 0) + 1;
//         }

//         return Object.entries(counts)
//             .map(([name, count]) => ({ name, count }))
//             .sort((a, b) => b.count - a.count);
//     }

//     // Support [{ name: "admin", count: 5 }, ...].
//     if (Array.isArray(roles)) {
//         return roles
//             .map((item) => {
//                 if (!item || typeof item !== "object") {
//                     return null;
//                 }

//                 const name = item.name ?? item.role ?? item.label;
//                 const count = getCount(item);

//                 if (name === undefined || count === null) {
//                     return null;
//                 }

//                 return { name: String(name), count };
//             })
//             .filter(Boolean)
//             .sort((a, b) => b.count - a.count);
//     }

//     // Support { admin: 5, user: 20 } and nested count objects.
//     if (typeof roles === "object") {
//         return Object.entries(roles)
//             .map(([name, value]) => {
//                 const count = getCount(value);

//                 return count === null ? null : { name, count };
//             })
//             .filter(Boolean)
//             .sort((a, b) => b.count - a.count);
//     }

//     return [];
// }

// export default function UserRoleChart({
//     roles,
//     loaded = 0,
//     total = 0,
// }) {
//     const data = useMemo(() => normalizeRoles(roles), [roles]);
//     const hasData = data.some((item) => item.count > 0);

//     const numberFormatter = new Intl.NumberFormat();

//     const formattedLoaded = numberFormatter.format(Number(loaded) || 0);
//     const formattedTotal = numberFormatter.format(Number(total) || 0);

//     // Chart.js Data configuration
//     const chartData = {
//         labels: data.map((item) => formatLabel(item.name)),
//         datasets: [
//             {
//                 label: "Users",
//                 data: data.map((item) => item.count),
//                 backgroundColor: "#7c3aed",
//                 borderRadius: 6, // Automatically applies to top corners for vertical bars
//                 maxBarThickness: 64,
//                 minBarLength: 3,
//                 categoryPercentage: 0.7, // Equivalent to barCategoryGap="30%"
//             },
//         ],
//     };

//     // Chart.js Options configuration
//     const chartOptions = {
//         responsive: true,
//         maintainAspectRatio: false, // Ensures it fills the parent container's height
//         plugins: {
//             tooltip: {
//                 backgroundColor: "#ffffff",
//                 titleColor: "#334155",
//                 titleFont: { weight: "600", size: 12 },
//                 titleAlign: "left",
//                 bodyColor: "#6d28d9",
//                 bodyFont: { size: 13 },
//                 borderColor: "#e2e8f0",
//                 borderWidth: 1,
//                 padding: { top: 10, bottom: 10, left: 14, right: 14 },
//                 cornerRadius: 12,
//                 displayColors: false, // Hides the color square
//                 callbacks: {
//                     label: (context) => {
//                         return `${numberFormatter.format(context.raw)} Users`;
//                     },
//                 },
//             },
//         },
//         scales: {
//             x: {
//                 grid: {
//                     display: false, // Hides vertical grid lines
//                 },
//                 border: {
//                     display: false, // Hides x-axis base line
//                 },
//                 ticks: {
//                     color: "#64748b",
//                     font: { size: 12 },
//                     padding: 10,
//                 },
//             },
//             y: {
//                 beginAtZero: true,
//                 grid: {
//                     color: "rgba(148, 163, 184, 0.2)",
//                     tickLength: 0, // Removes tick marks pointing left
//                 },
//                 border: {
//                     display: false,
//                     dash: [3, 3], // Creates the dotted CartesianGrid effect
//                 },
//                 ticks: {
//                     color: "#64748b",
//                     font: { size: 12 },
//                     padding: 10,
//                     precision: 0, // Equivalent to allowDecimals={false}
//                     callback: (value) => numberFormatter.format(value),
//                 },
//             },
//         },
//     };

//     return (
//         <section className="min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 text-slate-900 shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:text-white sm:p-6">
//             <div className="mb-5 flex items-start justify-between gap-4">
//                 <div className="min-w-0">
//                     <h2 className="text-base font-semibold text-slate-950 dark:text-white">
//                         Users by role
//                     </h2>

//                     <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
//                         Role distribution from {formattedLoaded} loaded user
//                         records.
//                     </p>
//                 </div>

//                 <span className="shrink-0 rounded-full bg-violet-50 px-2.5 py-1 text-xs font-semibold text-violet-700 dark:bg-violet-500/15 dark:text-violet-300">
//                     {formattedTotal} total
//                 </span>
//             </div>

//             <div className="h-72 min-w-0 w-full">
//                 {!hasData ? (
//                     <div className="flex h-full flex-col items-center justify-center gap-2 text-center">
//                         <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
//                             No user role data available
//                         </p>

//                         <p className="max-w-xs text-xs leading-5 text-slate-500 dark:text-slate-400">
//                             Check that the API returns role counts and that
//                             each count is a valid number greater than zero.
//                         </p>
//                     </div>
//                 ) : (
//                     <Bar data={chartData} options={chartOptions} />
//                 )}
//             </div>

//             {hasData && (
//                 <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3 text-xs text-slate-500 dark:border-slate-700 dark:text-slate-400">
//                     <span>
//                         {data.length} role{data.length === 1 ? "" : "s"} represented
//                     </span>

//                     <span>
//                         {numberFormatter.format(
//                             data.reduce((sum, item) => sum + item.count, 0)
//                         )}{" "}
//                         users in chart
//                     </span>
//                 </div>
//             )}
//         </section>
//     );
// }

// import { useMemo } from "react";
// import {
//     Chart as ChartJS,
//     CategoryScale,
//     LinearScale,
//     BarElement,
//     ArcElement, // Required for Pie charts
//     Tooltip,
//     Legend,     // Required for Legends
// } from "chart.js";
// import { Bar, Pie } from "react-chartjs-2";

// // Register all required Chart.js modules
// ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

// function formatLabel(value) {
//     return String(value ?? "Unknown")
//         .replace(/[_-]+/g, " ")
//         .replace(/\b\w/g, (character) => character.toUpperCase());
// }

// function getCount(value) {
//     const raw =
//         value && typeof value === "object"
//             ? value.count ?? value.total ?? value.users
//             : value;

//     if (raw === null || raw === undefined || raw === "") {
//         return null;
//     }

//     const count = Number(raw);
//     return Number.isFinite(count) && count >= 0 ? count : null;
// }

// // Generalized to handle both 'roles' and 'statuses'
// function normalizeChartData(inputData) {
//     if (!inputData) return [];

//     // Support an array of user records: [{ role: "admin" }, { status: "active" }]
//     if (
//         Array.isArray(inputData) &&
//         inputData.some(
//             (item) =>
//                 item &&
//                 typeof item === "object" &&
//                 (item.role || item.status || item.data?.role || item.data?.status) &&
//                 item.count === undefined &&
//                 item.total === undefined
//         )
//     ) {
//         const counts = {};

//         for (const item of inputData) {
//             const key = item?.role ?? item?.status ?? item?.data?.role ?? item?.data?.status ?? "unknown";
//             counts[key] = (counts[key] || 0) + 1;
//         }

//         return Object.entries(counts)
//             .map(([name, count]) => ({ name, count }))
//             .sort((a, b) => b.count - a.count);
//     }

//     // Support [{ name: "admin", count: 5 }, { status: "active", count: 10 }]
//     if (Array.isArray(inputData)) {
//         return inputData
//             .map((item) => {
//                 if (!item || typeof item !== "object") return null;

//                 const name = item.name ?? item.role ?? item.status ?? item.label;
//                 const count = getCount(item);

//                 if (name === undefined || count === null) return null;

//                 return { name: String(name), count };
//             })
//             .filter(Boolean)
//             .sort((a, b) => b.count - a.count);
//     }

//     // Support { admin: 5, user: 20 } and { active: 10, pending: 2 }
//     if (typeof inputData === "object") {
//         return Object.entries(inputData)
//             .map(([name, value]) => {
//                 const count = getCount(value);
//                 return count === null ? null : { name, count };
//             })
//             .filter(Boolean)
//             .sort((a, b) => b.count - a.count);
//     }

//     return [];
// }

// // A vibrant, Tailwind-inspired color palette for the Pie chart
// const PIE_COLORS = [
//     "#10b981", // Emerald (Active)
//     "#f59e0b", // Amber (Pending)
//     "#64748b", // Slate (Inactive)
//     "#f43f5e", // Rose (Suspended)
//     "#3b82f6", // Blue
//     "#8b5cf6", // Violet
//     "#06b6d4", // Cyan
// ];

// export default function UserOverviewCharts({
//     roles,
//     statuses, // New prop for pie chart data
//     loaded = 0,
//     total = 0,
// }) {
//     // Process Data
//     const roleData = useMemo(() => normalizeChartData(roles), [roles]);
//     const statusData = useMemo(() => normalizeChartData(statuses), [statuses]);

//     const hasRoleData = roleData.some((item) => item.count > 0);
//     const hasStatusData = statusData.some((item) => item.count > 0);

//     const numberFormatter = new Intl.NumberFormat();
//     const formattedLoaded = numberFormatter.format(Number(loaded) || 0);
//     const formattedTotal = numberFormatter.format(Number(total) || 0);

//     // --- Bar Chart Configuration (Roles) ---
//     const barChartData = {
//         labels: roleData.map((item) => formatLabel(item.name)),
//         datasets: [
//             {
//                 label: "Users",
//                 data: roleData.map((item) => item.count),
//                 backgroundColor: "#7c3aed",
//                 borderRadius: 6,
//                 maxBarThickness: 64,
//                 minBarLength: 3,
//                 categoryPercentage: 0.7,
//             },
//         ],
//     };

//     const barOptions = {
//         responsive: true,
//         maintainAspectRatio: false,
//         plugins: {
//             legend: { display: false }, // Hide legend for single-color bar chart
//             tooltip: {
//                 backgroundColor: "#ffffff",
//                 titleColor: "#334155",
//                 titleFont: { weight: "600", size: 12 },
//                 bodyColor: "#6d28d9",
//                 bodyFont: { size: 13 },
//                 borderColor: "#e2e8f0",
//                 borderWidth: 1,
//                 padding: 12,
//                 cornerRadius: 12,
//                 displayColors: false,
//                 callbacks: {
//                     label: (context) => `${numberFormatter.format(context.raw)} Users`,
//                 },
//             },
//         },
//         scales: {
//             x: {
//                 grid: { display: false },
//                 border: { display: false },
//                 ticks: { color: "#64748b", font: { size: 12 }, padding: 10 },
//             },
//             y: {
//                 beginAtZero: true,
//                 grid: { color: "rgba(148, 163, 184, 0.2)", tickLength: 0 },
//                 border: { display: false, dash: [3, 3] },
//                 ticks: {
//                     color: "#64748b",
//                     font: { size: 12 },
//                     padding: 10,
//                     precision: 0,
//                     callback: (value) => numberFormatter.format(value),
//                 },
//             },
//         },
//     };

//     // --- Pie Chart Configuration (Statuses) ---
//     const pieChartData = {
//         labels: statusData.map((item) => formatLabel(item.name)),
//         datasets: [
//             {
//                 data: statusData.map((item) => item.count),
//                 backgroundColor: PIE_COLORS,
//                 borderWidth: 2,
//                 borderColor: "#ffffff", // Matches the chart background for clean separation
//                 hoverOffset: 4,
//             },
//         ],
//     };

//     const pieOptions = {
//         responsive: true,
//         maintainAspectRatio: false,
//         plugins: {
//             legend: {
//                 display: true,
//                 position: "right", // Puts the legend on the right side
//                 labels: {
//                     color: "#475569",
//                     usePointStyle: true, // Uses circles instead of boxes for legend color markers
//                     padding: 20,
//                     font: { size: 12 },
//                 },
//             },
//             tooltip: {
//                 backgroundColor: "#ffffff",
//                 titleColor: "#334155",
//                 titleFont: { weight: "600", size: 12 },
//                 bodyColor: "#475569",
//                 bodyFont: { size: 13 },
//                 borderColor: "#e2e8f0",
//                 borderWidth: 1,
//                 padding: 12,
//                 cornerRadius: 12,
//                 displayColors: true, // Show color dot on pie tooltips
//                 usePointStyle: true,
//                 callbacks: {
//                     label: (context) => ` ${numberFormatter.format(context.raw)} Users`,
//                 },
//             },
//         },
//     };

//     return (
//         <section className="min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 text-slate-900 shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:text-white sm:p-6">
            
//             {/* Header */}
//             <div className="mb-8 flex items-start justify-between gap-4">
//                 <div className="min-w-0">
//                     <h2 className="text-base font-semibold text-slate-950 dark:text-white">
//                         User Overview
//                     </h2>
//                     <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
//                         Role and status distribution from {formattedLoaded} loaded user records.
//                     </p>
//                 </div>
//                 <span className="shrink-0 rounded-full bg-violet-50 px-2.5 py-1 text-xs font-semibold text-violet-700 dark:bg-violet-500/15 dark:text-violet-300">
//                     {formattedTotal} total
//                 </span>
//             </div>

//             {/* Charts Grid */}
//             <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                
//                 {/* Left side: Bar Chart */}
//                 <div className="flex h-72 min-w-0 flex-col">
//                     <h3 className="mb-4 text-center text-sm font-medium text-slate-700 dark:text-slate-300">
//                         By Role
//                     </h3>
//                     <div className="flex-1 min-h-0 w-full">
//                         {!hasRoleData ? (
//                             <div className="flex h-full flex-col items-center justify-center gap-2 text-center">
//                                 <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
//                                     No role data available
//                                 </p>
//                             </div>
//                         ) : (
//                             <Bar data={barChartData} options={barOptions} />
//                         )}
//                     </div>
//                 </div>

//                 {/* Right side: Pie Chart */}
//                 <div className="flex h-72 min-w-0 flex-col">
//                     <h3 className="mb-4 text-center text-sm font-medium text-slate-700 dark:text-slate-300">
//                         By Status
//                     </h3>
//                     <div className="flex-1 min-h-0 w-full">
//                         {!hasStatusData ? (
//                             <div className="flex h-full flex-col items-center justify-center gap-2 text-center">
//                                 <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
//                                     No status data available
//                                 </p>
//                             </div>
//                         ) : (
//                             <Pie data={pieChartData} options={pieOptions} />
//                         )}
//                     </div>
//                 </div>

//             </div>
//         </section>
//     );
// }

import { useMemo } from "react";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    ArcElement,
    Tooltip,
    Legend,
} from "chart.js";
import { Bar, Doughnut } from "react-chartjs-2";
import { FaChartBar } from "react-icons/fa6";

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    ArcElement,
    Tooltip,
    Legend
);

const numberFormatter = new Intl.NumberFormat();

const PIE_COLORS = [
    "#10b981",
    "#f59e0b",
    "#64748b",
    "#f43f5e",
    "#3b82f6",
    "#8b5cf6",
    "#06b6d4",
];

function formatLabel(value) {
    return String(value ?? "Unknown")
        .replace(/[_-]+/g, " ")
        .replace(/\b\w/g, (character) => character.toUpperCase());
}

function getCount(value) {
    const raw =
        value && typeof value === "object"
            ? value.count ?? value.total ?? value.users
            : value;

    if (raw === null || raw === undefined || raw === "") {
        return null;
    }

    const count = Number(raw);

    return Number.isFinite(count) && count >= 0 ? count : null;
}

function normalizeChartData(inputData) {
    if (!inputData) return [];

    // Support arrays of user records.
    if (
        Array.isArray(inputData) &&
        inputData.some(
            (item) =>
                item &&
                typeof item === "object" &&
                (
                    item.role != null ||
                    item.status != null ||
                    item.data?.role != null ||
                    item.data?.status != null
                ) &&
                item.count === undefined &&
                item.total === undefined &&
                item.users === undefined
        )
    ) {
        const counts = new Map();

        for (const item of inputData) {
            const key = String(
                item?.role ??
                item?.status ??
                item?.data?.role ??
                item?.data?.status ??
                "unknown"
            );

            counts.set(key, (counts.get(key) ?? 0) + 1);
        }

        return Array.from(counts, ([name, count]) => ({
            name,
            count,
        })).sort((a, b) => b.count - a.count);
    }

    // Support arrays of aggregated values.
    if (Array.isArray(inputData)) {
        return inputData
            .map((item) => {
                if (!item || typeof item !== "object") return null;

                const name =
                    item.name ??
                    item.role ??
                    item.status ??
                    item.label;

                const count = getCount(item);

                if (name === undefined || count === null) {
                    return null;
                }

                return {
                    name: String(name),
                    count,
                };
            })
            .filter(Boolean)
            .sort((a, b) => b.count - a.count);
    }

    // Support objects such as { admin: 5, user: 20 }.
    if (typeof inputData === "object") {
        return Object.entries(inputData)
            .map(([name, value]) => {
                const count = getCount(value);

                return count === null ? null : { name, count };
            })
            .filter(Boolean)
            .sort((a, b) => b.count - a.count);
    }

    return [];
}

const STATUS_COLORS = {
    active: "#50C878",
    archived: "#CCCCFF",
    banned: "#FA8072",
    suspended: "#8B8589",
    pending: "#FFD800",
};

function getStatusColor(name, index) {
    const status = String(name ?? "unknown")
        .trim()
        .toLowerCase();

    return STATUS_COLORS[status] ?? PIE_COLORS[index % PIE_COLORS.length];
}

const STATUS_ORDER = [
    "active",
    "pending",
    "archived",
    "suspended",
    "banned",
];

// Display the total number of users inside the doughnut.
const doughnutCenterPlugin = {
    id: "doughnutCenter",

    afterDraw(chart, _args, options) {
        const { ctx, chartArea } = chart;

        if (!chartArea) return;

        const centerX = (chartArea.left + chartArea.right) / 2;
        const centerY = (chartArea.top + chartArea.bottom) / 2;

        let textColor = "#0f172a";

        if (typeof window !== "undefined") {
            textColor = window.getComputedStyle(chart.canvas).color || textColor;
        }

        const value = String(options?.value ?? "0");
        const fontSize = value.length > 7 ? 15 : value.length > 5 ? 19 : 22;

        ctx.save();
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        ctx.fillStyle = textColor;
        ctx.font = `700 ${fontSize}px Inter, system-ui, sans-serif`;
        ctx.fillText(value, centerX, centerY - 6);

        ctx.globalAlpha = 0.7;
        ctx.font = "600 10px Inter, system-ui, sans-serif";
        ctx.fillText("USERS", centerX, centerY + 15);

        ctx.restore();
    },
};

function EmptyState({ title, description }) {
    return (
        <div className="flex h-full min-h-[260px] flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50/70 px-4 text-center dark:border-slate-700 dark:bg-slate-800/30">
            <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800">
                <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    className="h-5 w-5 text-slate-500 dark:text-slate-400"
                    aria-hidden="true"
                >
                    <path
                        d="M4 19V5m0 14h16M8 15v-4m4 4V7m4 8v-6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </svg>
            </div>

            <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                {title}
            </p>

            <p className="mt-1 max-w-xs text-xs leading-5 text-slate-500 dark:text-slate-400">
                {description}
            </p>
        </div>
    );
}

function ChartCard({ title, description, badge, children }) {
    return (
        <div className="flex min-w-0 flex-col rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-shadow duration-200 hover:shadow-md dark:border-slate-700 dark:bg-slate-900 sm:p-5">
            <div className="mb-5 flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                        {title}
                    </h3>

                    <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
                        {description}
                    </p>
                </div>

                <span className="shrink-0 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-semibold text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                    {badge}
                </span>
            </div>

            {children}
        </div>
    );
}

export default function UserCharts({
    roles,
    statuses,
    loaded = 0,
    total = 0,
}) {
    const roleData = useMemo(
        () => normalizeChartData(roles),
        [roles]
    );

    const statusData = useMemo(() => {
        return normalizeChartData(statuses).sort((a, b) => {
            const indexA = STATUS_ORDER.indexOf(
                String(a.name).trim().toLowerCase()
            );

            const indexB = STATUS_ORDER.indexOf(
                String(b.name).trim().toLowerCase()
            );

            const orderA = indexA === -1 ? STATUS_ORDER.length : indexA;
            const orderB = indexB === -1 ? STATUS_ORDER.length : indexB;

            // Keep the requested order. Sort unknown statuses by count.
            return orderA - orderB || b.count - a.count;
        });
    }, [statuses]);

    const safeLoaded = getCount(loaded) ?? 0;
    const safeTotal = getCount(total) ?? 0;

    const roleTotal = roleData.reduce(
        (sum, item) => sum + item.count,
        0
    );

    const statusTotal = statusData.reduce(
        (sum, item) => sum + item.count,
        0
    );

    const hasRoleData = roleTotal > 0;
    const hasStatusData = statusTotal > 0;

    const formattedLoaded = numberFormatter.format(safeLoaded);
    const formattedTotal = numberFormatter.format(safeTotal);
    const formattedStatusTotal = numberFormatter.format(statusTotal);

    // Role chart.
    const barChartData = useMemo(
        () => ({
            labels: roleData.map((item) => formatLabel(item.name)),
            datasets: [
                {
                    label: "Users",
                    data: roleData.map((item) => item.count),
                    backgroundColor: "#7c3aed",
                    hoverBackgroundColor: "#6d28d9",
                    borderRadius: 6,
                    borderSkipped: false,
                    maxBarThickness: 26,
                    categoryPercentage: 0.72,
                    barPercentage: 0.82,
                },
            ],
        }),
        [roleData]
    );

    const barOptions = useMemo(
        () => ({
            indexAxis: "y",
            responsive: true,
            maintainAspectRatio: false,

            animation: {
                duration: 800,
                easing: "easeOutQuart",
                delay: (context) => {
                    if (context.type !== "data" || context.mode !== "default") {
                        return 0;
                    }

                    return context.dataIndex * 150;
                },
            },

            layout: {
                padding: {
                    top: 4,
                    right: 12,
                    bottom: 4,
                },
            },

            plugins: {
                legend: {
                    display: true,
                    position: "bottom",
                    align: "center",

                    labels: {
                        // color: "#64748b",
                        usePointStyle: true,
                        pointStyle: "rectRounded",
                        // boxWidth: 8,
                        boxHeight: 10,
                        padding: 12,
                    },
                },

                tooltip: {
                    backgroundColor: "#0f172a",
                    titleColor: "#f8fafc",
                    bodyColor: "#e2e8f0",
                    borderColor: "#334155",
                    borderWidth: 1,
                    padding: 12,
                    cornerRadius: 10,
                    displayColors: false,

                    callbacks: {
                        label: (context) =>
                            `${numberFormatter.format(context.raw)} users`,
                    },
                },
            },

            scales: {
                x: {
                    beginAtZero: true,
                    grid: {
                        color: "rgba(148, 163, 184, 0.16)",
                        tickLength: 0,
                    },
                    border: {
                        display: false,
                    },
                    ticks: {
                        color: "#64748b",
                        padding: 8,
                        precision: 0,
                        font: {
                            size: 11,
                        },
                        callback: (value) =>
                            numberFormatter.format(value),
                    },
                },

                y: {
                    grid: {
                        display: false,
                    },
                    border: {
                        display: false,
                    },
                    ticks: {
                        color: "#64748b",
                        padding: 8,
                        font: {
                            size: 12,
                        },
                    },
                },
            },
        }),
        []
    );

    // Status chart.
    const doughnutChartData = useMemo(
        () => ({
            labels: statusData.map((item) => formatLabel(item.name)),
            datasets: [
                {
                    data: statusData.map((item) => item.count),

                    backgroundColor: statusData.map(
                        (item, index) => getStatusColor(item.name, index)
                    ),

                    borderWidth: 3,
                    borderColor: "rgba(148, 163, 184, 0.12)",
                    hoverOffset: 6,
                    spacing: 3,
                },
            ],
        }),
        [statusData]
    );

    const doughnutOptions = useMemo(
        () => ({
            responsive: true,
            maintainAspectRatio: false,
            cutout: "72%",

            animation: {
                animateRotate: true,
                duration: 800,
                easing: "easeOutQuart",
                // delay: (context) => {
                //     if (context.type !== "data" || context.mode !== "default") {
                //         return 0;
                //     }

                //     return context.dataIndex * 150;
                // },
            },

            plugins: {
                doughnutCenter: {
                    value: formattedStatusTotal,
                },

                legend: {
                    display: true,
                    position: "bottom",
                    align: "center",

                    labels: {
                        // color: "#64748b",
                        usePointStyle: true,
                        pointStyle: "rectRounded",
                        // boxWidth: 8,
                        boxHeight: 10,
                        padding: 12,
                    },
                },

                tooltip: {
                    backgroundColor: "#0f172a",
                    titleColor: "#f8fafc",
                    bodyColor: "#e2e8f0",
                    borderColor: "#334155",
                    borderWidth: 1,
                    padding: 12,
                    cornerRadius: 10,
                    displayColors: true,
                    usePointStyle: true,

                    callbacks: {
                        label: (context) => {
                            const value = Number(context.raw) || 0;

                            const sum = context.dataset.data.reduce(
                                (result, item) => result + (Number(item) || 0),
                                0
                            );

                            const percentage = sum
                                ? Math.round((value / sum) * 100)
                                : 0;

                            return ` ${numberFormatter.format(value)} users (${percentage}%)`;
                        },
                    },
                },
            },
        }),
        [formattedStatusTotal]
    );

    return (
        <section
            aria-labelledby="user-overview-title"
            className="min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 text-slate-900 shadow-sm dark:border-slate-800 dark:bg-slate-950 dark:text-white sm:rounded-3xl sm:p-6"
        >
            {/* Header */}
            <header className="mb-6 flex flex-col gap-5 border-b border-slate-200 pb-5 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                    <p className="mb-1 text-xs font-bold uppercase tracking-[0.16em] text-violet-600 dark:text-violet-400">
                        <span className="inline-flex items-center gap-2">
                            <FaChartBar />
                            User Analytics
                        </span>
                    </p>

                    <h2
                        id="user-overview-title"
                        className="text-lg font-bold tracking-tight text-slate-900 dark:text-white sm:text-xl"
                    >
                        User Overview
                    </h2>

                    <p className="mt-1.5 max-w-lg text-sm leading-6 text-slate-500 dark:text-slate-400">
                        View user distribution by role and account status.
                    </p>
                </div>

                {/* Summary metrics */}
                <div className="grid grid-cols-2 gap-3 sm:min-w-[270px]">
                    <div className="rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3 dark:border-slate-800 dark:bg-slate-900">
                        <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                            Loaded Records
                        </p>

                        <p className="mt-1 text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                            {formattedLoaded}
                        </p>
                    </div>

                    <div className="rounded-xl border border-violet-100 bg-violet-50/70 px-3.5 py-3 dark:border-violet-500/20 dark:bg-violet-500/10">
                        <p className="text-[11px] font-medium text-violet-700 dark:text-violet-300">
                            Total Users
                        </p>

                        <p className="mt-1 text-xl font-bold tracking-tight text-violet-800 dark:text-violet-200">
                            {formattedTotal}
                        </p>
                    </div>
                </div>
            </header>

            {/* Charts */}
            <div className="grid min-w-0 grid-cols-1 gap-4 lg:grid-cols-2">
                {/* Users by role */}
                <ChartCard
                    title="Users by Role"
                    description="Compare the number of users in each role."
                    badge={`${roleData.length} ${roleData.length === 1 ? "role" : "roles"}`}
                >
                    <div className="h-[300px] min-h-0 w-full">
                        {hasRoleData ? (
                            <Bar
                                data={barChartData}
                                options={barOptions}
                                role="img"
                                aria-label="Horizontal bar chart showing user counts by role"
                            />
                        ) : (
                            <EmptyState
                                title="No role data available"
                                description="Role counts will appear here when user data is available."
                            />
                        )}
                    </div>
                </ChartCard>

                {/* Users by status */}
                <ChartCard
                    title="Users by Status"
                    description="View the distribution of account statuses."
                    badge={`${statusData.length} ${statusData.length === 1 ? "status" : "statuses"}`}
                >
                    <div className="h-[300px] min-h-0 w-full">
                        {hasStatusData ? (
                            <Doughnut
                                data={doughnutChartData}
                                options={doughnutOptions}
                                plugins={[doughnutCenterPlugin]}
                                role="img"
                                aria-label="Doughnut chart showing user counts by account status"
                            />
                        ) : (
                            <EmptyState
                                title="No status data available"
                                description="Account status counts will appear here when data is available."
                            />
                        )}
                    </div>
                </ChartCard>
            </div>
        </section>
    );
}
