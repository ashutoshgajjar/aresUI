import { FiArrowUpRight, FiCheckCircle, FiFile, FiList, FiUsers } from "react-icons/fi";
import { FaUserCheck } from "react-icons/fa6";

const icons = {
    users: FiUsers,
    tasks: FiList,
    files: FiFile,
    active: FaUserCheck,
};

export default function MetricCard({ title, value, description, type, loading }) {
    const Icon = icons[type] || FiArrowUpRight;

    return (
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                        {title}
                    </p>
                    <div className="mt-2 text-3xl font-bold tracking-tight text-slate-950 dark:text-white">
                        {loading ? (
                            <span className="inline-block h-9 w-20 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
                        ) : (
                            value?.toLocaleString() ?? '0'
                        )}
                    </div>
                </div>

                <div className="rounded-xl bg-indigo-50 p-2.5 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-300">
                    <Icon size={20} />
                </div>
            </div>

            <p className="mt-4 text-xs text-slate-500 dark:text-slate-400">
                {description}
            </p>
        </article>
    );
}
