
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import {
    FiAlertCircle,
    FiArrowLeft,
    FiArrowUpRight,
    FiCalendar,
    FiCheckCircle,
    FiChevronRight,
    FiClock,
    FiFile,
    FiFileText,
    FiFolder,
    FiHardDrive,
    FiInfo,
    FiRefreshCw,
    FiShield,
    FiX,
} from "react-icons/fi";
import { FaFileSignature, FaDownload, FaShield, FaTrashCan } from "react-icons/fa6";
import { FaHistory} from "react-icons/fa";
import { filesApi } from "@/api/files.api";
import Loader from "@/components/UI/Loader";
import { RippleButton } from "@/components/RippleButton";

const PRIMARY_BUTTON = {
    hue: 270,
    saturation: 75,
    lightness: 55,
};

function getFileName(file) {
    return (
        file?.name ||
        file?.original_name ||
        file?.filename ||
        `File ${file?.id ?? ""}`
    );
}

function formatBytes(value) {
    if (value === null || value === undefined || value === "") {
        return "—";
    }

    const bytes = Number(value);

    if (!Number.isFinite(bytes) || bytes < 0) {
        return "—";
    }

    if (bytes === 0) return "0 B";

    const units = ["B", "KB", "MB", "GB", "TB"];
    const index = Math.min(
        Math.floor(Math.log(bytes) / Math.log(1024)),
        units.length - 1
    );

    return `${(bytes / 1024 ** index).toFixed(
        index === 0 ? 0 : 1
    )} ${units[index]}`;
}

function formatDate(value, includeTime = false) {
    if (!value) return "—";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return "—";

    return new Intl.DateTimeFormat(undefined, {
        day: "2-digit",
        month: "short",
        year: "numeric",
        ...(includeTime
            ? {
                  hour: "2-digit",
                  minute: "2-digit",
              }
            : {}),
    }).format(date);
}

function formatLabel(value) {
    if (value === null || value === undefined || value === "") {
        return "Unknown";
    }

    return String(value)
        .replace(/[_-]+/g, " ")
        .replace(/\b\w/g, (character) => character.toUpperCase());
}

function getFileType(file) {
    return (
        file?.content_type ||
        file?.mime_type ||
        "Unknown type"
    );
}

function getVersionSize(version) {
    return (
        version?.size_bytes ??
        version?.size ??
        version?.file_size
    );
}

function getVersionDate(version) {
    return (
        version?.created_at ||
        version?.uploaded_at ||
        version?.created ||
        version?.updated_at
    );
}

function DetailItem({ label, value, icon, copyable = false }) {
    const [copied, setCopied] = useState(false);

    async function copyValue() {
        if (
            value === null ||
            value === undefined ||
            value === "—"
        ) {
            return;
        }

        try {
            await navigator.clipboard.writeText(String(value));
            setCopied(true);
            setTimeout(() => setCopied(false), 1600);
        } catch {
            // Clipboard access may be unavailable in the current browser.
            setCopied(false);
        }
    }

    return (
        <div className="min-w-0 rounded-xl border border-slate-200 bg-white p-4 transition-colors hover:border-slate-300">
            <div className="flex items-center gap-2 text-slate-500">
                {icon}
                <span className="text-xs font-medium uppercase tracking-wider">
                    {label}
                </span>
            </div>

            <div className="mt-2 flex items-start justify-between gap-2">
                <p className="min-w-0 break-words text-sm font-semibold text-slate-900">
                    {value === null || value === undefined || value === ""
                        ? "—"
                        : String(value)}
                </p>

                {copyable && value && value !== "—" && (
                    <RippleButton
                        hue={270}
                        saturation={25}
                        lightness={45}
                        variant="ghost"
                        size="sm"
                        onClick={copyValue}
                        aria-label={`Copy ${label}`}
                        title={`Copy ${label}`}
                        className="shrink-0 rounded-md p-1 text-slate-400 hover:text-violet-700"
                    >
                        {copied ? (
                            <FiCheckCircle size={15} />
                        ) : (
                            <FiFileText size={15} />
                        )}
                    </RippleButton>
                )}
            </div>

            {copied && (
                <p className="mt-1 text-xs text-emerald-600" role="status">
                    Copied
                </p>
            )}
        </div>
    );
}

function VersionSkeleton() {
    return (
        <div className="animate-pulse space-y-4">
            {Array.from({ length: 3 }, (_, index) => (
                <div
                    key={index}
                    className="flex items-center gap-4 rounded-xl border border-slate-200 p-4"
                >
                    <div className="h-10 w-10 rounded-xl bg-slate-200" />

                    <div className="flex-1 space-y-2">
                        <div className="h-3 w-32 rounded bg-slate-200" />
                        <div className="h-3 w-48 max-w-full rounded bg-slate-100" />
                    </div>

                    <div className="h-9 w-24 rounded-lg bg-slate-200" />
                </div>
            ))}
        </div>
    );
}

export default function FileDetailPage() {
    const { fileId } = useParams();
    const navigate = useNavigate();

    const [file, setFile] = useState(null);
    const [history, setHistory] = useState(null);

    const [error, setError] = useState("");
    const [historyError, setHistoryError] = useState("");
    const [actionError, setActionError] = useState("");
    const [success, setSuccess] = useState("");

    const [isLoading, setIsLoading] = useState(true);
    const [isDeleting, setIsDeleting] = useState(false);
    const [downloadingVersion, setDownloadingVersion] = useState(null);
    const [refreshKey, setRefreshKey] = useState(0);

    // Load the file and its history independently, so a history
    // request failure does not hide valid file details.
    useEffect(() => {
        let active = true;

        async function loadFileDetails() {
            setIsLoading(true);
            setError("");
            setHistoryError("");
            setActionError("");

            const [fileResult, historyResult] = await Promise.allSettled([
                filesApi.get(fileId),
                filesApi.history(fileId),
            ]);

            if (!active) return;

            if (fileResult.status === "fulfilled") {
                setFile(fileResult.value);
            } else {
                setFile(null);
                setError(
                    fileResult.reason?.message ||
                    "Unable to load this file. It may have been deleted or you may not have permission to access it."
                );
            }

            if (historyResult.status === "fulfilled") {
                setHistory(historyResult.value);
            } else {
                setHistory(null);
                setHistoryError(
                    historyResult.reason?.message ||
                    "Unable to load file version history."
                );
            }

            setIsLoading(false);
        }

        loadFileDetails();

        return () => {
            active = false;
        };
    }, [fileId, refreshKey]);

    const versions = useMemo(() => {
        if (Array.isArray(history)) return history;

        return (
            history?.results ||
            history?.versions ||
            []
        );
    }, [history]);

    const totalVersions =
        history?.count ??
        history?.total ??
        versions.length;

    const currentVersion = file?.current_version;

    const fileSize =
        file?.size_bytes ??
        file?.size ??
        file?.file_size;

    const metadata =
        file?.metadata &&
        typeof file.metadata === "object"
            ? file.metadata
            : null;

    const createdAt =
        file?.created_at ||
        file?.uploaded_at ||
        file?.created;

    const updatedAt = file?.updated_at;

    async function handleDownload(version = currentVersion) {
        setActionError("");
        setSuccess("");

        if (version === null || version === undefined) {
            setActionError("A valid file version is not available.");
            return;
        }

        setDownloadingVersion(version);

        try {
            const result = await filesApi.downloadUrl(fileId, version);

            if (!result?.url) {
                throw new Error(
                    "The server did not return a download URL."
                );
            }

            window.open(
                result.url,
                "_blank",
                "noopener,noreferrer"
            );
        } catch (err) {
            setActionError(
                err?.message ||
                `Unable to download version ${version}. Please try again.`
            );
        } finally {
            setDownloadingVersion(null);
        }
    }

    async function handleDelete() {
        const confirmed = window.confirm(
            `Delete "${getFileName(file)}"? This action may not be reversible.`
        );

        if (!confirmed) return;

        setIsDeleting(true);
        setActionError("");
        setSuccess("");

        try {
            await filesApi.remove(fileId);
            navigate("/files", { replace: true });
        } catch (err) {
            setActionError(
                err?.message ||
                "Unable to delete this file. Please try again."
            );
        } finally {
            setIsDeleting(false);
        }
    }

    function handleRefresh() {
        setRefreshKey((current) => current + 1);
    }

    if (isLoading && !file) {
        return (
            <Loader />
        );
    }

    if (error && !file) {
        return (
            <main className="min-h-screen bg-slate-50/80 px-4 py-8 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-3xl">
                    <Link
                        to="/files"
                        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-violet-700"
                    >
                        <FiArrowLeft size={17} />
                        Back to files
                    </Link>

                    <section
                        role="alert"
                        className="mt-8 rounded-2xl border border-rose-200 bg-white p-6 shadow-sm sm:p-8"
                    >
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
                            <FiAlertCircle size={24} />
                        </div>

                        <h1 className="mt-5 text-xl font-bold text-slate-900">
                            Unable to open file
                        </h1>

                        <p className="mt-2 text-sm leading-6 text-slate-600">
                            {error}
                        </p>

                        <div className="mt-6 flex flex-wrap gap-3">
                            <RippleButton
                                {...PRIMARY_BUTTON}
                                variant="solid"
                                size="sm"
                                onClick={handleRefresh}
                                className="inline-flex items-center gap-2 rounded-xl text-sm font-semibold text-white"
                            >
                                <FiRefreshCw size={15} />
                                Try again
                            </RippleButton>

                            <RippleButton
                                hue={270}
                                saturation={25}
                                lightness={40}
                                variant="outline"
                                size="sm"
                                onClick={() => navigate("/files")}
                                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-700"
                            >
                                <FiArrowLeft size={15} />
                                Back to files
                            </RippleButton>
                        </div>
                    </section>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-slate-50/80 px-4 py-6 text-slate-900 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-7xl space-y-7">
                {/* Breadcrumb and actions */}
                <header className="space-y-5">
                    <nav
                        aria-label="Breadcrumb"
                        className="flex flex-wrap items-center gap-2 text-sm text-slate-500"
                    >
                        <Link
                            to="/files"
                            className="font-medium transition hover:text-violet-700"
                        >
                            Files
                        </Link>

                        <FiChevronRight
                            size={15}
                            className="text-slate-400"
                        />

                        <span className="max-w-[240px] truncate font-medium text-slate-700">
                            {getFileName(file)}
                        </span>
                    </nav>

                    <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                        <div className="flex min-w-0 items-start gap-4">
                            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-violet-50 text-violet-700 ring-1 ring-inset ring-violet-100">
                                <FiFile size={27} />
                            </div>

                            <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                    <p className="text-sm font-medium text-violet-700">
                                        File details
                                    </p>

                                    {currentVersion !== null &&
                                        currentVersion !== undefined && (
                                            <span className="inline-flex items-center rounded-full bg-violet-50 px-2.5 py-1 text-xs font-semibold text-violet-700 ring-1 ring-inset ring-violet-200">
                                                Version {currentVersion}
                                            </span>
                                        )}
                                </div>

                                <h1 className="mt-1 break-words text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                                    {getFileName(file)}
                                </h1>

                                <p className="mt-2 break-all text-sm text-slate-500">
                                    {getFileType(file)}
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                            <RippleButton
                                hue={270}
                                saturation={25}
                                lightness={40}
                                variant="outline"
                                size="sm"
                                disabled={isLoading}
                                onClick={handleRefresh}
                                className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm disabled:opacity-60"
                            >
                                <FiRefreshCw
                                    size={15}
                                    className={isLoading ? "animate-spin" : ""}
                                />
                                Refresh
                            </RippleButton>

                            <RippleButton
                                {...PRIMARY_BUTTON}
                                variant="solid"
                                size="sm"
                                disabled={downloadingVersion !== null}
                                onClick={() => handleDownload(currentVersion)}
                                className="inline-flex h-10 items-center gap-2 rounded-xl px-4 text-sm font-semibold text-white shadow-sm disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {downloadingVersion !== null ? (
                                    <FiRefreshCw
                                        size={15}
                                        className="animate-spin"
                                    />
                                ) : (
                                    <FaDownload size={16} />
                                )}
                                Download current
                            </RippleButton>
                        </div>
                    </div>
                </header>

                {/* Action notifications */}
                {actionError && (
                    <div
                        role="alert"
                        className="flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4"
                    >
                        <FiAlertCircle
                            size={20}
                            className="mt-0.5 shrink-0 text-rose-600"
                        />

                        <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold text-rose-800">
                                Action failed
                            </p>
                            <p className="mt-1 break-words text-sm text-rose-700">
                                {actionError}
                            </p>
                        </div>

                        <RippleButton
                            hue={0}
                            saturation={35}
                            lightness={40}
                            variant="ghost"
                            size="sm"
                            onClick={() => setActionError("")}
                            aria-label="Dismiss error"
                            className="rounded-md p-1 text-rose-600"
                        >
                            <FiX size={17} />
                        </RippleButton>
                    </div>
                )}

                {success && (
                    <div
                        role="status"
                        className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4"
                    >
                        <FiCheckCircle
                            size={19}
                            className="shrink-0 text-emerald-600"
                        />
                        <p className="text-sm font-medium text-emerald-800">
                            {success}
                        </p>
                    </div>
                )}

                {/* Summary cards */}
                <section
                    aria-label="File summary"
                    className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
                >
                    <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <p className="text-sm font-medium text-slate-500">
                                    File size
                                </p>
                                <p className="mt-2 text-2xl font-bold text-slate-900">
                                    {formatBytes(fileSize)}
                                </p>
                                <p className="mt-2 text-xs text-slate-500">
                                    Current file
                                </p>
                            </div>

                            <div className="rounded-xl bg-sky-50 p-3 text-sky-700">
                                <FiHardDrive size={21} />
                            </div>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <p className="text-sm font-medium text-slate-500">
                                    Current version
                                </p>
                                <p className="mt-2 text-2xl font-bold text-slate-900">
                                    {currentVersion ?? "—"}
                                </p>
                                <p className="mt-2 text-xs text-slate-500">
                                    Latest version identifier
                                </p>
                            </div>

                            <div className="rounded-xl bg-violet-50 p-3 text-violet-700">
                                <FaHistory size={21} />
                            </div>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <p className="text-sm font-medium text-slate-500">
                                    Total versions
                                </p>
                                <p className="mt-2 text-2xl font-bold text-slate-900">
                                    {history
                                        ? Number(totalVersions).toLocaleString()
                                        : "—"}
                                </p>
                                <p className="mt-2 text-xs text-slate-500">
                                    Recorded file versions
                                </p>
                            </div>

                            <div className="rounded-xl bg-emerald-50 p-3 text-emerald-700">
                                <FiFolder size={21} />
                            </div>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
                        <div className="flex items-start justify-between gap-4">
                            <div className="min-w-0">
                                <p className="text-sm font-medium text-slate-500">
                                    Created
                                </p>
                                <p className="mt-2 text-lg font-bold text-slate-900">
                                    {formatDate(createdAt)}
                                </p>
                                <p className="mt-2 text-xs text-slate-500">
                                    Original upload date
                                </p>
                            </div>

                            <div className="rounded-xl bg-amber-50 p-3 text-amber-700">
                                <FiCalendar size={21} />
                            </div>
                        </div>
                    </div>
                </section>

                {/* File information */}
                <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
                    <header className="border-b border-slate-100 p-5 sm:p-6">
                        <div className="flex items-center gap-3">
                            <div className="rounded-xl bg-violet-50 p-2.5 text-violet-700">
                                <FiInfo size={20} />
                            </div>

                            <div>
                                <h2 className="text-lg font-bold text-slate-900">
                                    File information
                                </h2>
                                <p className="mt-1 text-sm text-slate-500">
                                    Technical details and file attributes.
                                </p>
                            </div>
                        </div>
                    </header>

                    <div className="grid grid-cols-1 gap-4 bg-slate-50/40 p-5 sm:grid-cols-2 sm:p-6 xl:grid-cols-3">
                        {/* <DetailItem
                            label="File name"
                            value={getFileName(file)}
                            icon={<FiFileText size={15} />}
                            copyable
                        /> */}

                        <DetailItem
                            label="Content type"
                            value={getFileType(file)}
                            icon={<FiFile size={15} />}
                            copyable
                        />

                        {/* <DetailItem
                            label="File ID"
                            value={file.id}
                            icon={<FiFolder size={15} />}
                            copyable
                        /> */}

                        <DetailItem
                            label="File size"
                            value={formatBytes(fileSize)}
                            icon={<FiHardDrive size={15} />}
                        />

                        <DetailItem
                            label="Created at"
                            value={formatDate(createdAt, true)}
                            icon={<FiCalendar size={15} />}
                        />

                        <DetailItem
                            label="Last updated"
                            value={formatDate(updatedAt, true)}
                            icon={<FiClock size={15} />}
                        />

                        <DetailItem
                            label="Current version"
                            value={currentVersion ?? "—"}
                            icon={<FaHistory size={15} />}
                        />

                        {/* <DetailItem
                            label="Checksum"
                            value={file.checksum || file.sha256}
                            icon={<FaFileSignature size={15} />}
                            copyable
                        /> */}

                        <DetailItem
                            label="Original filename"
                            value={file.original_name}
                            icon={<FiFileText size={15} />}
                            copyable
                        />
                    </div>
                </section>

                {/* Metadata */}
                <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
                    <header className="border-b border-slate-100 p-5 sm:p-6">
                        <div className="flex items-center gap-3">
                            <div className="rounded-xl bg-sky-50 p-2.5 text-sky-700">
                                <FiFileText size={20} />
                            </div>

                            <div>
                                <h2 className="text-lg font-bold text-slate-900">
                                    Metadata
                                </h2>
                                <p className="mt-1 text-sm text-slate-500">
                                    Additional attributes associated with this file.
                                </p>
                            </div>
                        </div>
                    </header>

                    <div className="p-5 sm:p-6">
                        {metadata && Object.keys(metadata).length > 0 ? (
                            <pre className="max-h-96 overflow-auto rounded-xl border border-slate-200 bg-slate-950 p-4 text-xs leading-6 text-slate-100">
                                {JSON.stringify(metadata, null, 2)}
                            </pre>
                        ) : (
                            <div className="rounded-xl border border-dashed border-slate-300 px-4 py-10 text-center">
                                <FiFileText
                                    size={26}
                                    className="mx-auto text-slate-400"
                                />

                                <p className="mt-3 text-sm font-semibold text-slate-700">
                                    No metadata available
                                </p>

                                <p className="mt-1 text-sm text-slate-500">
                                    This file does not have additional metadata.
                                </p>
                            </div>
                        )}
                    </div>
                </section>

                {/* Version history */}
                <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
                    <header className="flex flex-col gap-4 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
                        <div className="flex items-center gap-3">
                            <div className="rounded-xl bg-violet-50 p-2.5 text-violet-700">
                                <FaHistory size={21} />
                            </div>

                            <div>
                                <h2 className="text-lg font-bold text-slate-900">
                                    Version history
                                </h2>

                                <p className="mt-1 text-sm text-slate-500">
                                    Review earlier versions and download a specific revision.
                                </p>
                            </div>
                        </div>

                        {history && (
                            <span className="inline-flex w-fit items-center rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600">
                                {Number(totalVersions).toLocaleString()} version
                                {Number(totalVersions) === 1 ? "" : "s"}
                            </span>
                        )}
                    </header>

                    <div className="p-5 sm:p-6">
                        {historyError && (
                            <div
                                role="alert"
                                className="mb-5 flex flex-col gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 sm:flex-row sm:items-center sm:justify-between"
                            >
                                <div className="flex items-start gap-3">
                                    <FiAlertCircle
                                        size={19}
                                        className="mt-0.5 shrink-0 text-amber-600"
                                    />

                                    <div>
                                        <p className="text-sm font-semibold text-amber-800">
                                            Version history unavailable
                                        </p>
                                        <p className="mt-1 text-sm text-amber-700">
                                            {historyError}
                                        </p>
                                    </div>
                                </div>

                                <RippleButton
                                    {...PRIMARY_BUTTON}
                                    variant="outline"
                                    size="sm"
                                    onClick={handleRefresh}
                                    className="inline-flex items-center gap-2 rounded-lg border border-amber-200 bg-white text-sm font-semibold text-amber-800"
                                >
                                    <FiRefreshCw size={14} />
                                    Retry
                                </RippleButton>
                            </div>
                        )}

                        {isLoading && !history ? (
                            <VersionSkeleton />
                        ) : !historyError && versions.length > 0 ? (
                            <div className="space-y-3">
                                {versions.map((version) => {
                                    const versionNumber = version.version;
                                    const isCurrent =
                                        String(versionNumber) ===
                                        String(currentVersion);

                                    const originalName =
                                        version.original_name ||
                                        version.name ||
                                        getFileName(file);

                                    const versionDate =
                                        getVersionDate(version);

                                    return (
                                        <article
                                            key={
                                                version.id ??
                                                version.version
                                            }
                                            className={`flex flex-col gap-4 rounded-xl border p-4 transition-colors sm:flex-row sm:items-center sm:justify-between ${
                                                isCurrent
                                                    ? "border-violet-200 bg-violet-50/50"
                                                    : "border-slate-200 bg-white hover:bg-slate-50/70"
                                            }`}
                                        >
                                            <div className="flex min-w-0 items-start gap-3">
                                                <div
                                                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                                                        isCurrent
                                                            ? "bg-violet-100 text-violet-700"
                                                            : "bg-slate-100 text-slate-600"
                                                    }`}
                                                >
                                                    <FiFileText size={20} />
                                                </div>

                                                <div className="min-w-0">
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <h3 className="text-sm font-bold text-slate-900">
                                                            Version {versionNumber}
                                                        </h3>

                                                        {isCurrent && (
                                                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-200">
                                                                <FiCheckCircle size={12} />
                                                                Current
                                                            </span>
                                                        )}
                                                    </div>

                                                    <p
                                                        title={originalName}
                                                        className="mt-1 max-w-xl truncate text-sm text-slate-600"
                                                    >
                                                        {originalName}
                                                    </p>

                                                    <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                                                        <span className="inline-flex items-center gap-1.5">
                                                            <FiHardDrive size={13} />
                                                            {formatBytes(
                                                                getVersionSize(version)
                                                            )}
                                                        </span>

                                                        <span className="inline-flex items-center gap-1.5">
                                                            <FiClock size={13} />
                                                            {formatDate(
                                                                versionDate,
                                                                true
                                                            )}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex shrink-0 items-center justify-end">
                                                <RippleButton
                                                    {...PRIMARY_BUTTON}
                                                    variant={
                                                        isCurrent
                                                            ? "solid"
                                                            : "outline"
                                                    }
                                                    size="sm"
                                                    disabled={
                                                        downloadingVersion !== null
                                                    }
                                                    onClick={() =>
                                                        handleDownload(
                                                            versionNumber
                                                        )
                                                    }
                                                    className={`inline-flex items-center justify-center gap-2 rounded-lg text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60 ${
                                                        isCurrent
                                                            ? "text-white"
                                                            : "border border-slate-200 bg-white text-slate-700"
                                                    }`}
                                                >
                                                    {String(downloadingVersion) ===
                                                    String(versionNumber) ? (
                                                        <FiRefreshCw
                                                            size={15}
                                                            className="animate-spin"
                                                        />
                                                    ) : (
                                                        <FaDownload size={15} />
                                                    )}
                                                    Download
                                                </RippleButton>
                                            </div>
                                        </article>
                                    );
                                })}
                            </div>
                        ) : !historyError ? (
                            <div className="rounded-xl border border-dashed border-slate-300 px-4 py-10 text-center">
                                <FaHistory
                                    size={26}
                                    className="mx-auto text-slate-400"
                                />

                                <h3 className="mt-3 text-sm font-semibold text-slate-800">
                                    No version history
                                </h3>

                                <p className="mt-1 text-sm text-slate-500">
                                    No version records were returned for this file.
                                </p>
                            </div>
                        ) : null}
                    </div>
                </section>

                {/* Footer actions */}
                <footer className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-6">
                    <div>
                        <h2 className="text-sm font-bold text-slate-900">
                            File actions
                        </h2>
                        <p className="mt-1 text-sm text-slate-500">
                            Download the file or remove it from your file library.
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-3">
                        <Link
                            to="/files"
                            className=""
                        >
                          <RippleButton
                            {...PRIMARY_BUTTON}
                            variant="ghost"
                            size="md"
                            disabled={
                                downloadingVersion !== null ||
                                currentVersion === null ||
                                currentVersion === undefined
                            }
                            onClick={() => handleDownload(currentVersion)}
                            className=""
                          >
                              <FiArrowLeft size={16} />
                              Back to files
                          </RippleButton>
                        </Link>

                        <RippleButton
                            {...PRIMARY_BUTTON}
                            variant="solid"
                            size="sm"
                            disabled={
                                downloadingVersion !== null ||
                                currentVersion === null ||
                                currentVersion === undefined
                            }
                            onClick={() => handleDownload(currentVersion)}
                            className=""
                        >
                            <FaDownload size={16} />
                            Download
                        </RippleButton>

                        <RippleButton
                            hue={0}
                            saturation={70}
                            lightness={48}
                            variant="outline"
                            size="sm"
                            disabled={isDeleting}
                            onClick={handleDelete}
                            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-rose-200 bg-white px-4 text-sm font-semibold text-rose-700 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {isDeleting ? (
                                <FiRefreshCw
                                    size={16}
                                    className="animate-spin"
                                />
                            ) : (
                                <FaTrashCan size={16} />
                            )}
                            {isDeleting ? "Deleting..." : "Delete file"}
                        </RippleButton>
                    </div>
                </footer>

                <p className="text-center text-xs text-slate-400">
                    File management · File details and version information are provided by the server
                </p>
            </div>
        </main>
    );
}
