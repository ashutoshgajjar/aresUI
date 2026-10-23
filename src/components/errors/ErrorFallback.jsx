import { FaArrowLeft, FaShield } from "react-icons/fa6";
import { LuRotateCw, LuHouse, LuTriangleAlert } from "react-icons/lu";
import { RippleButton } from "@/components/RippleButton";

const PRIMARY_BUTTON = { hue: 270, saturation: 75, lightness: 55 };
const MUTED_BUTTON = { hue: 200, saturation: 15, lightness: 19 };

export default function ErrorFallback({
    status = 500,
    eyebrow = "Something went wrong",
    title = "We hit an unexpected problem",
    message = "The page could not be displayed. Try again, or return to a safe place in the app.",
    onRetry,
    onHome,
    homeLabel = "Go to dashboard",
    onBack,
    errorDetails,
    showDetails = false,
    requestId,
}) {
    const isForbidden = status === 401 || status === 403;
    const isNotFound = status === 404;
    const Icon = isForbidden ? FaShield : LuTriangleAlert;

    return (
        <main className="relative isolate flex min-h-[calc(100vh-4rem)] items-center justify-center overflow-hidden bg-slate-50 px-4 py-12 text-slate-900 dark:bg-slate-950 dark:text-white sm:px-6 lg:px-8">
            <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
                <div className="absolute left-1/2 top-0 h-80 w-[44rem] -translate-x-1/2 rounded-full bg-violet-200/40 blur-3xl dark:bg-violet-700/10" />
                <div className="absolute -bottom-28 -right-16 h-72 w-72 rounded-full bg-indigo-200/30 blur-3xl dark:bg-indigo-700/10" />
                <div className="absolute inset-0 bg-[radial-gradient(#94a3b8_0.7px,transparent_0.7px)] [background-size:22px_22px] opacity-[0.18] dark:opacity-[0.08]" />
            </div>

            <section className="w-full max-w-xl animate-[error-card-in_420ms_cubic-bezier(.2,.8,.2,1)_both] rounded-3xl border border-slate-200/80 bg-white/95 p-6 shadow-[0_24px_80px_-36px_rgba(15,23,42,0.28)] backdrop-blur sm:p-10 dark:border-slate-800 dark:bg-slate-900/95">
                <div className="flex flex-col items-start">
                    <div className={`relative flex h-14 w-14 items-center justify-center rounded-2xl ring-1 ring-inset ${isForbidden ? "bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-400/10 dark:text-amber-300 dark:ring-amber-400/20" : "bg-rose-50 text-rose-700 ring-rose-200 dark:bg-rose-400/10 dark:text-rose-300 dark:ring-rose-400/20"}`}>
                        <Icon size={26} strokeWidth={1.8} />
                        <span className="absolute -right-1 -top-1 h-3.5 w-3.5 rounded-full border-[3px] border-white bg-current dark:border-slate-900" />
                    </div>

                    <div className="mt-6 flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                            {eyebrow}
                        </span>
                        {Number.isFinite(Number(status)) && (
                            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold tabular-nums text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                                Error {status}
                            </span>
                        )}
                    </div>

                    <h1 className="mt-4 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl dark:text-white">
                        {title}
                    </h1>
                    <p className="mt-3 max-w-lg text-sm leading-6 text-slate-600 sm:text-base dark:text-slate-300">
                        {message}
                    </p>

                    {requestId && (
                        <p className="mt-4 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-400">
                            Reference ID: <span className="font-mono font-semibold text-slate-700 dark:text-slate-200">{requestId}</span>
                        </p>
                    )}

                    <div className="mt-7 flex w-full flex-col gap-2.5 sm:w-auto sm:flex-row">
                        {onRetry && (
                            <RippleButton
                                {...PRIMARY_BUTTON}
                                variant="solid"
                                size="sm"
                                onClick={onRetry}
                                className="rounded-xl"
                            >
                                <LuRotateCw size={16} />
                                Try again
                            </RippleButton>
                        )}
                        {onHome && (
                            <RippleButton
                                {...MUTED_BUTTON}
                                variant="outline"
                                size="sm"
                                onClick={onHome}
                                className="rounded-xl"
                            >
                                <LuHouse size={16} />
                                {homeLabel}
                            </RippleButton>
                        )}
                        {onBack && (
                            <RippleButton
                                {...MUTED_BUTTON}
                                variant="ghost"
                                size="sm"
                                onClick={onBack}
                                className="rounded-xl"
                            >
                                <FaArrowLeft size={16} />
                                Go back
                            </RippleButton>
                        )}
                    </div>

                    {showDetails && errorDetails && (
                        <details className="mt-7 w-full rounded-xl border border-slate-200 bg-slate-50 text-left dark:border-slate-700 dark:bg-slate-950/70">
                            <summary className="cursor-pointer select-none px-4 py-3 text-xs font-semibold text-slate-600 outline-none hover:text-slate-900 focus-visible:ring-2 focus-visible:ring-violet-400 dark:text-slate-300 dark:hover:text-white">
                                Technical details (development only)
                            </summary>
                            <pre className="max-h-56 overflow-auto border-t border-slate-200 p-4 text-xs leading-5 text-rose-700 dark:border-slate-700 dark:text-rose-300">
                                {String(errorDetails)}
                            </pre>
                        </details>
                    )}
                </div>

                <div className="mt-8 flex items-center justify-between border-t border-slate-100 pt-5 text-xs text-slate-400 dark:border-slate-800 dark:text-slate-500">
                    <span className="inline-flex items-center gap-2">
                        <span className={`h-1.5 w-1.5 rounded-full ${isNotFound ? "bg-amber-500" : "bg-violet-500"}`} />
                        This screen did not complete normally.
                    </span>
                    <span className="hidden font-medium sm:inline">Please try again</span>
                </div>
            </section>

            <style>{`
                @keyframes error-card-in {
                    from { opacity: 0; transform: translateY(10px) scale(.99); }
                    to { opacity: 1; transform: translateY(0) scale(1); }
                }
                @media (prefers-reduced-motion: reduce) {
                    [class*="error-card-in"] { animation: none !important; }
                }
            `}</style>
        </main>
    );
}
