// import {
//     Bar,
//     BarChart,
//     CartesianGrid,
//     ResponsiveContainer,
//     Tooltip,
//     XAxis,
//     YAxis,
// } from "recharts";

// export default function TaskStatusChart({ status, loaded, total }) {
//     const data = Object.entries(status).map(([name, count]) => ({
//         name,
//         count,
//     }));

//     return (
//         <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
//             <div className="mb-5 flex items-start justify-between gap-4">
//                 <div>
//                     <h2 className="text-base font-semibold text-slate-950 dark:text-white">
//                         Task status
//                     </h2>
//                     <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
//                         Distribution from the latest {loaded.toLocaleString()} task records.
//                     </p>
//                 </div>
//                 <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600 dark:bg-slate-900 dark:text-slate-400">
//                     {total.toLocaleString()} total
//                 </span>
//             </div>

//             <div className="h-72 w-full">
//                 {data.length === 0 ? (
//                     <div className="flex h-full items-center justify-center text-sm text-slate-500">
//                         No task data available.
//                     </div>
//                 ) : (
//                     <ResponsiveContainer width="100%" height="100%">
//                         <BarChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 8 }}>
//                             <CartesianGrid strokeDasharray="3 3" vertical={false} />
//                             <XAxis dataKey="name" tickLine={false} axisLine={false} />
//                             <YAxis allowDecimals={false} tickLine={false} axisLine={false} />
//                             <Tooltip />
//                             <Bar dataKey="count" name="Tasks" radius={[6, 6, 0, 0]} />
//                         </BarChart>
//                     </ResponsiveContainer>
//                 )}
//             </div>
//         </section>
//     );
// }
