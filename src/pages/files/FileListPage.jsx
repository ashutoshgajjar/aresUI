import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router";
import {
    FiAlertCircle,
    FiArchive,
    FiCheckCircle,
    FiChevronLeft,
    FiChevronRight,
    FiClock,
    FiEye,
    FiFile,
    FiFileText,
    FiFolder,
    FiHardDrive,
    FiImage,
    FiMusic,
    FiRefreshCw,
    FiSearch,
    FiUploadCloud,
    FiVideo,
    FiX,
} from "react-icons/fi";
import Header from '@/components/layout/Header';
import { filesApi } from "@/api/files.api";
import { RippleButton } from "@/components/RippleButton";
import toast from 'react-hot-toast';
import { FaDownload, FaArrowUpRightFromSquare } from "react-icons/fa6";

const PAGE_SIZE = 50;

const buttonColors = {
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

function getContentType(file) {
    return (
        file?.content_type ||
        file?.mime_type ||
        "Unknown type"
    );
}

function getFileCategory(file) {
    const type = getContentType(file).toLowerCase();
    const name = getFileName(file).toLowerCase();

    if (type.startsWith("image/")) return "Image";
    if (type.startsWith("video/")) return "Video";
    if (type.startsWith("audio/")) return "Audio";

    if (type.includes("pdf") || name.endsWith(".pdf")) {
        return "PDF";
    }

    if (
        type.includes("spreadsheet") ||
        type.includes("excel") ||
        /\.(xlsx?|csv)$/.test(name)
    ) {
        return "Spreadsheet";
    }

    if (
        type.includes("word") ||
        type.includes("document") ||
        /\.(docx?|odt|rtf)$/.test(name)
    ) {
        return "Document";
    }

    if (
        type.includes("zip") ||
        type.includes("compressed") ||
        /\.(zip|rar|7z|tar|gz)$/.test(name)
    ) {
        return "Archive";
    }

    if (type === "application/json" || name.endsWith(".json")) {
        return "JSON";
    }

    if (
        type.startsWith("text/") ||
        /\.(txt|md|log)$/.test(name)
    ) {
        return "Text";
    }

    return "File";
}

function getFileIcon(file, size = 20) {
    const icons = {
        Image: FiImage,
        Video: FiVideo,
        Audio: FiMusic,
        PDF: FiFileText,
        Document: FiFileText,
        Spreadsheet: FiFileText,
        Archive: FiArchive,
        JSON: FiFileText,
        Text: FiFileText,
        File: FiFile,
    };

    const Icon = icons[getFileCategory(file)] || FiFile;

    return <Icon size={size} aria-hidden="true" />;
}

function getFileIconClasses(file) {
    const styles = {
        Image: "bg-fuchsia-50 text-fuchsia-700 ring-fuchsia-100",
        Video: "bg-purple-50 text-purple-700 ring-purple-100",
        Audio: "bg-pink-50 text-pink-700 ring-pink-100",
        PDF: "bg-rose-50 text-rose-700 ring-rose-100",
        Document: "bg-blue-50 text-blue-700 ring-blue-100",
        Spreadsheet: "bg-emerald-50 text-emerald-700 ring-emerald-100",
        Archive: "bg-amber-50 text-amber-700 ring-amber-100",
        JSON: "bg-orange-50 text-orange-700 ring-orange-100",
        Text: "bg-slate-100 text-slate-700 ring-slate-200",
        File: "bg-violet-50 text-violet-700 ring-violet-100",
    };

    return styles[getFileCategory(file)] || styles.File;
}

function getFileSize(file) {
    const value =
        file?.size_bytes ??
        file?.size ??
        file?.file_size;

    if (
        typeof value === "number" &&
        Number.isFinite(value) &&
        value >= 0
    ) {
        return value;
    }

    if (
        typeof value === "string" &&
        /^\d+(\.\d+)?$/.test(value.trim())
    ) {
        return Number(value);
    }

    return null;
}

function formatBytes(bytes) {
    if (
        bytes === null ||
        bytes === undefined ||
        !Number.isFinite(bytes) ||
        bytes < 0
    ) {
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

function formatDateTime(value) {
    if (!value) return "—";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return "—";

    return new Intl.DateTimeFormat(undefined, {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    }).format(date);
}

function SummaryCard({ title, value, description, icon, iconClasses }) {
    return (
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
            <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-500">
                        {title}
                    </p>

                    <p className="mt-2 truncate text-3xl font-bold tracking-tight text-slate-900">
                        {value}
                    </p>

                    <p className="mt-2 text-xs leading-5 text-slate-500">
                        {description}
                    </p>
                </div>

                <div className={`shrink-0 rounded-xl p-3 ${iconClasses}`}>
                    {icon}
                </div>
            </div>
        </div>
    );
}

function LoadingRows() {
    return Array.from({ length: 5 }, (_, index) => (
        <tr key={index} className="animate-pulse">
            <td className="px-6 py-5">
                <div className="flex items-center gap-3">
                    <div className="h-11 w-11 rounded-xl bg-slate-200" />

                    <div className="space-y-2">
                        <div className="h-3 w-40 rounded bg-slate-200" />
                        <div className="h-3 w-28 rounded bg-slate-100" />
                    </div>
                </div>
            </td>

            <td className="px-6 py-5">
                <div className="h-6 w-20 rounded-full bg-slate-200" />
            </td>

            <td className="px-6 py-5">
                <div className="h-3 w-16 rounded bg-slate-200" />
            </td>

            <td className="px-6 py-5">
                <div className="h-3 w-24 rounded bg-slate-200" />
            </td>

            <td className="px-6 py-5">
                <div className="ml-auto h-8 w-24 rounded-lg bg-slate-200" />
            </td>
        </tr>
    ));
}

export default function FileListPage() {
    const fileInputRef = useRef(null);
    const refreshToastRef = useRef(false);;

    const [data, setData] = useState(null);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [selectedFile, setSelectedFile] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isUploading, setIsUploading] = useState(false);
    const [downloadingId, setDownloadingId] = useState(null);

    const [query, setQuery] = useState("");
    const [debouncedQuery, setDebouncedQuery] = useState("");
    const [offset, setOffset] = useState(0);
    const [refreshKey, setRefreshKey] = useState(0);

    // Debounce search to avoid sending a request for every keystroke.
    useEffect(() => {
        const timer = setTimeout(() => {
            setOffset(0);
            setDebouncedQuery(query.trim());
        }, 300);

        return () => clearTimeout(timer);
    }, [query]);

    // Load the current page. Ignore responses from outdated requests.
    useEffect(() => {
        let active = true;

        async function loadFiles() {
            setIsLoading(true);
            setError("");

            const shouldShowToast = refreshToastRef.current;
            refreshToastRef.current = false;

            try {
                const request = Promise.resolve().then(() => filesApi.list({
                    limit: PAGE_SIZE,
                    offset,
                    q: debouncedQuery,
                    sort_by: "created_at",
                    sort_order: "desc",
                }));


                const result = shouldShowToast ? 
                    await toast.promise(request, {
                        loading: "Refreshing files...",
                        success: "Files refreshed successfully.",
                        error: (err) =>
                            err?.message || "Unable to refresh files. Please try again.",
                    }) : await request;


                if (active) {
                    setData(result);
                }
            } catch (err) {
                if (active) {
                    setError(
                        err?.message ||
                        "Unable to load files. Please try again."
                    );
                }
            } finally {
                if (active) {
                    setIsLoading(false);
                }
            }
        }

        loadFiles();

        return () => {
            active = false;
        };
    }, [offset, debouncedQuery, refreshKey]);

    const files = data?.results ?? [];
    const total = Number(data?.count ?? 0);

    const currentPage = Math.floor(offset / PAGE_SIZE) + 1;
    const startRecord = files.length > 0 ? offset + 1 : 0;
    const endRecord = offset + files.length;

    const canGoPrevious = offset > 0;
    const canGoNext = Boolean(data?.next);

    const pageStats = useMemo(() => {
        const categories = new Set();
        let totalBytes = 0;
        let knownSizeCount = 0;

        for (const file of files) {
            categories.add(getFileCategory(file));

            const size = getFileSize(file);

            if (size !== null) {
                totalBytes += size;
                knownSizeCount += 1;
            }
        }

        return {
            typeCount: categories.size,
            totalBytes: knownSizeCount > 0 ? totalBytes : null,
        };
    }, [files]);

    function handleRefresh() {
        setSuccess("");
        refreshToastRef.current = true;
        setRefreshKey((current) => current + 1);
    }

    // async function handleUpload(event) {
    //     const input = event.currentTarget;
    //     const file = input.files?.[0];

    //     if (!file) return;

    //     setError("");
    //     setSuccess("");
    //     setIsUploading(true);
    //     const uploadPromise = filesApi.upload({
    //         file,
    //         name: file.name,
    //         metadata: {
    //             source: "react",
    //         },
    //     });

    //     toast.promise(uploadPromise, {
    //         loading: "Uploading...",
    //         success: <b>File uploaded!</b>,
    //         error: <b>File upload failed. Please try again.</b>,
    //     });

    //     try {
    //         await filesApi.upload({
    //             file,
    //             name: file.name,
    //             metadata: {
    //                 source: "react",
    //             },
    //         });

    //         setSuccess(`"${file.name}" uploaded successfully.`);

    //         setOffset(0);
    //         setQuery("");
    //         setDebouncedQuery("");
    //         setRefreshKey((current) => current + 1);
    //     } catch (err) {
    //         setError(
    //             err?.message ||
    //             "File upload failed. Please try again."
    //         );
    //     } finally {
    //         setIsUploading(false);
    //         input.value = "";
    //     }
    // }

    async function handleUpload(event) {
        const input = event.currentTarget;
        const file = input.files?.[0];

        if (!file) return;

        setError("");
        setSuccess("");
        setIsUploading(true);

        const toastId = toast.loading("Uploading...");

        try {
            await filesApi.upload({
                file,
                name: file.name,
                metadata: {
                    source: "react",
                },
            });

            toast.success(<b>File uploaded successfully!</b>, {
                id: toastId,
            });

            setSuccess(`"${file.name}" uploaded successfully.`);

            setOffset(0);
            setQuery("");
            setDebouncedQuery("");
            setRefreshKey((current) => current + 1);
        } catch (err) {
            const message =
                err?.message || "File upload failed. Please try again.";

            toast.error(<b>{message}</b>, {
                id: toastId,
            });

            setError(message);
        } finally {
            setIsUploading(false);
            input.value = "";
        }
    }
    async function handleDownload(file) {
        setError("");
        setSuccess("");
        setDownloadingId(file.id);

        try {
            const result = await filesApi.downloadUrl(file.id);

            if (!result?.url) {
                throw new Error(
                    "The server did not return a download URL."
                );
            }

            const newWindow = window.open(
                result.url,
                "_blank",
                "noopener,noreferrer"
            );

            if (!newWindow) {
                setSuccess(
                    "The download link was requested. Check whether your browser blocked the new tab."
                );
            }
        } catch (err) {
            setError(
                err?.message ||
                "Unable to download this file. Please try again."
            );
        } finally {
            setDownloadingId(null);
        }
    }

    function handlePrevious() {
        if (!canGoPrevious || isLoading) return;

        setOffset((current) => Math.max(0, current - PAGE_SIZE));
    }

    function handleNext() {
        if (!canGoNext || isLoading) return;

        setOffset((current) => current + PAGE_SIZE);
    }

    function clearSearch() {
        setQuery("");
        setDebouncedQuery("");
        setOffset(0);
    }

    const metadata =
        selectedFile?.metadata &&
        typeof selectedFile.metadata === "object"
            ? selectedFile.metadata
            : null;

    const createdAt =
        selectedFile?.created_at ||
        selectedFile?.uploaded_at ||
        selectedFile?.updated_at;

    return (
        <>
            <Header Title='Files' onRefresh={() => handleRefresh()} disabled={isLoading} />        
            <main className="min-h-screen bg-slate-50/80 px-4 py-6 text-slate-900 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-7xl space-y-7">
                    {/* Page heading */}
                    <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <div className="mb-2 flex items-center gap-2 text-sm font-medium text-violet-700">
                                <FiFolder size={16} />
                                File management
                            </div>

                            <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                                Files
                            </h1>

                            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
                                Upload, browse, inspect, and download your stored files.
                            </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                            {/* <RippleButton
                                {...buttonColors}
                                variant="outline"
                                size="sm"
                                disabled={isLoading}
                                onClick={handleRefresh}
                                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-violet-200 hover:bg-violet-50 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                <FiRefreshCw
                                    size={16}
                                    className={isLoading ? "animate-spin" : ""}
                                />
                                Refresh
                            </RippleButton> */}

                            <input
                                ref={fileInputRef}
                                type="file"
                                className="hidden"
                                onChange={handleUpload}
                                aria-label="Choose a file to upload"
                            />

                            <RippleButton
                                {...buttonColors}
                                variant="solid"
                                size="sm"
                                disabled={isUploading}
                                onClick={() => fileInputRef.current?.click()}
                                className="shadow-sm disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {isUploading ? (
                                    <FiRefreshCw
                                        size={17}
                                        className="animate-spin"
                                    />
                                ) : (
                                    <FiUploadCloud size={18} />
                                )}
                                {isUploading ? "Uploading..." : "Upload file"}
                            </RippleButton>
                        </div>
                    </header>

                    {/* Summary cards */}
                    <section
                        aria-label="File library summary"
                        className="grid grid-cols-1 gap-4 sm:grid-cols-3"
                    >
                        <SummaryCard
                            title="Total files"
                            value={
                                data ? total.toLocaleString() : "—"
                            }
                            description="Files matching the current search"
                            icon={<FiFolder size={21} />}
                            iconClasses="bg-violet-50 text-violet-700"
                        />

                        <SummaryCard
                            title="File types on this page"
                            value={
                                data
                                    ? pageStats.typeCount.toLocaleString()
                                    : "—"
                            }
                            description="Distinct categories in this result"
                            icon={<FiFile size={21} />}
                            iconClasses="bg-sky-50 text-sky-700"
                        />

                        <SummaryCard
                            title="Size on this page"
                            value={
                                data
                                    ? formatBytes(pageStats.totalBytes)
                                    : "—"
                            }
                            description="Combined size where available"
                            icon={<FiHardDrive size={21} />}
                            iconClasses="bg-emerald-50 text-emerald-700"
                        />
                    </section>

                    {/* Error alert */}
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
                                        Something went wrong
                                    </p>

                                    <p className="mt-1 text-sm text-rose-700">
                                        {error}
                                    </p>
                                </div>
                            </div>

                            <RippleButton
                                {...buttonColors}
                                variant="outline"
                                size="sm"
                                disabled={isLoading}
                                onClick={handleRefresh}
                                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg border border-rose-200 bg-white px-3 py-2 text-sm font-semibold text-rose-700"
                            >
                                <FiRefreshCw size={14} />
                                Retry
                            </RippleButton>
                        </div>
                    )}

                    {/* Upload success */}
                    {success && (
                        <div
                            role="status"
                            className="flex items-center justify-between gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4"
                        >
                            <div className="flex items-center gap-3">
                                <FiCheckCircle
                                    size={19}
                                    className="shrink-0 text-emerald-600"
                                />

                                <p className="text-sm font-medium text-emerald-800">
                                    {success}
                                </p>
                            </div>

                            <RippleButton
                                hue={150}
                                saturation={60}
                                lightness={40}
                                variant="ghost"
                                size="sm"
                                onClick={() => setSuccess("")}
                                aria-label="Dismiss success message"
                                className="rounded-lg p-1 text-emerald-700"
                            >
                                <FiX size={17} />
                            </RippleButton>
                        </div>
                    )}

                    {/* Main file table */}
                    <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
                        <div className="flex flex-col gap-4 border-b border-slate-100 p-5 sm:p-6 lg:flex-row lg:items-center lg:justify-between">
                            <div>
                                <h2 className="text-lg font-bold text-slate-900">
                                    All files
                                </h2>

                                <p className="mt-1 text-sm text-slate-500">
                                    Search files and manage individual records.
                                </p>
                            </div>

                            <div className="relative w-full lg:max-w-sm">
                                <FiSearch
                                    size={18}
                                    aria-hidden="true"
                                    className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                                />

                                <input
                                    type="search"
                                    value={query}
                                    onChange={(event) => setQuery(event.target.value)}
                                    placeholder="Search files..."
                                    aria-label="Search files"
                                    className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50/70 pl-10 pr-10 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-100"
                                />

                                {query && (
                                    <RippleButton
                                        hue={270}
                                        saturation={15}
                                        lightness={45}
                                        variant="ghost"
                                        size="sm"
                                        onClick={clearSearch}
                                        aria-label="Clear search"
                                        className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400"
                                    >
                                        <FiX size={16} />
                                    </RippleButton>
                                )}
                            </div>
                        </div>

                        {/* Table */}
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[800px] border-collapse text-left">
                                <thead>
                                    <tr className="border-b border-slate-100 bg-slate-50/80">
                                        <th
                                            scope="col"
                                            className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500"
                                        >
                                            File
                                        </th>

                                        <th
                                            scope="col"
                                            className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500"
                                        >
                                            Type
                                        </th>

                                        <th
                                            scope="col"
                                            className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500"
                                        >
                                            Size
                                        </th>

                                        <th
                                            scope="col"
                                            className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500"
                                        >
                                            Uploaded
                                        </th>

                                        <th
                                            scope="col"
                                            className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-slate-500"
                                        >
                                            Actions
                                        </th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-slate-100">
                                    {isLoading && !data && <LoadingRows />}

                                    {!isLoading &&
                                        !error &&
                                        files.map((file) => {
                                            const name = getFileName(file);
                                            const type = getContentType(file);
                                            const category = getFileCategory(file);

                                            const uploadedAt =
                                                file.created_at ||
                                                file.uploaded_at ||
                                                file.updated_at;

                                            return (
                                                <tr
                                                    key={file.id}
                                                    className="group transition-colors hover:bg-violet-50/40"
                                                >
                                                    <td className="px-6 py-4">
                                                        <div className="flex min-w-0 items-center gap-3">
                                                            <div
                                                                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ring-1 ring-inset ${getFileIconClasses(file)}`}
                                                            >
                                                                {getFileIcon(file, 21)}
                                                            </div>

                                                            <div className="min-w-0">
                                                                <Link
                                                                    to={`/files/${file.id}`}
                                                                    title={name}
                                                                    className="block max-w-sm truncate text-sm font-semibold text-slate-900 transition hover:text-violet-700"
                                                                >
                                                                    {name}
                                                                </Link>

                                                                <p
                                                                    title={type}
                                                                    className="mt-1 max-w-sm truncate text-xs text-slate-500"
                                                                >
                                                                    {type}
                                                                </p>

                                                                <p className="mt-1 text-xs text-slate-400">
                                                                    ID: {file.id}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </td>

                                                    <td className="px-6 py-4">
                                                        <span className="inline-flex items-center rounded-lg bg-slate-100 px-2.5 py-1.5 text-xs font-semibold text-slate-700">
                                                            {category}
                                                        </span>
                                                    </td>

                                                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-slate-600">
                                                        {formatBytes(getFileSize(file))}
                                                    </td>

                                                    <td className="whitespace-nowrap px-6 py-4">
                                                        <div className="flex items-center gap-2 text-sm text-slate-600">
                                                            <FiClock
                                                                size={14}
                                                                className="shrink-0 text-slate-400"
                                                            />

                                                            {formatDate(uploadedAt)}
                                                        </div>
                                                    </td>

                                                    <td className="whitespace-nowrap px-6 py-4">
                                                        <div className="flex items-center justify-end gap-2">
                                                            <RippleButton
                                                                hue={270}
                                                                saturation={30}
                                                                lightness={40}
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => setSelectedFile(file)}
                                                                aria-label={`View details for ${name}`}
                                                                title="View details"
                                                                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white p-0 text-slate-600 shadow-sm hover:border-violet-200 hover:bg-violet-50 hover:text-violet-700"
                                                            >
                                                                <FiEye size={16} />
                                                            </RippleButton>

                                                            <RippleButton
                                                                {...buttonColors}
                                                                variant="solid"
                                                                size="sm"
                                                                disabled={downloadingId === file.id}
                                                                onClick={() => handleDownload(file)}
                                                                aria-label={`Download ${name}`}
                                                                className="h-10 rounded-xl px-4"
                                                            >
                                                                {downloadingId === file.id ? (
                                                                    <FiRefreshCw
                                                                        size={14}
                                                                        className="animate-spin"
                                                                    />
                                                                ) : (
                                                                    <FaDownload size={14} />
                                                                )}
                                                                Download
                                                            </RippleButton>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}

                                    {!isLoading && !error && files.length === 0 && (
                                        <tr>
                                            <td
                                                colSpan={5}
                                                className="px-6 py-16 text-center"
                                            >
                                                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                                                    <FiFolder size={26} />
                                                </div>

                                                <h3 className="mt-4 text-sm font-semibold text-slate-900">
                                                    {debouncedQuery
                                                        ? "No matching files found"
                                                        : "Your file library is empty"}
                                                </h3>

                                                <p className="mx-auto mt-1 max-w-sm text-sm leading-6 text-slate-500">
                                                    {debouncedQuery
                                                        ? "Try another filename or clear your search."
                                                        : "Upload a file to get started. Uploaded files will appear here."}
                                                </p>

                                                {debouncedQuery ? (
                                                    <RippleButton
                                                        {...buttonColors}
                                                        variant="soft"
                                                        size="sm"
                                                        onClick={clearSearch}
                                                        className="mt-4 inline-flex items-center gap-2 rounded-xl text-sm font-semibold text-violet-700"
                                                    >
                                                        <FiX size={15} />
                                                        Clear search
                                                    </RippleButton>
                                                ) : (
                                                    <RippleButton
                                                        {...buttonColors}
                                                        variant="solid"
                                                        size="sm"
                                                        onClick={() => fileInputRef.current?.click()}
                                                        className="mt-4 inline-flex items-center gap-2 rounded-xl text-sm font-semibold text-white"
                                                    >
                                                        <FiUploadCloud size={16} />
                                                        Upload your first file
                                                    </RippleButton>
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
                                files
                            </p>

                            <div className="flex items-center gap-2">
                                <RippleButton
                                    hue={270}
                                    saturation={30}
                                    lightness={40}
                                    variant="outline"
                                    size="sm"
                                    disabled={!canGoPrevious || isLoading}
                                    onClick={handlePrevious}
                                    className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 text-sm font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
                                >
                                    <FiChevronLeft size={17} />
                                    Previous
                                </RippleButton>

                                <span className="min-w-10 text-center text-sm font-semibold text-slate-600">
                                    {currentPage}
                                </span>

                                <RippleButton
                                    {...buttonColors}
                                    variant="solid"
                                    size="sm"
                                    disabled={!canGoNext || isLoading}
                                    onClick={handleNext}
                                    className="inline-flex h-10 items-center justify-center gap-2 rounded-xl text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40"
                                >
                                    Next
                                    <FiChevronRight size={17} />
                                </RippleButton>
                            </div>
                        </footer>
                    </section>

                    <p className="text-center text-xs text-slate-400">
                        File management · File information is provided by the server
                    </p>
                </div>

                {/* File details modal */}
                {selectedFile && (
                    <div
                        className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm"
                        onMouseDown={(event) => {
                            if (event.target === event.currentTarget) {
                                setSelectedFile(null);
                            }
                        }}
                    >
                        <section
                            role="dialog"
                            aria-modal="true"
                            aria-labelledby="file-details-title"
                            className="max-h-200 w-full max-w-2xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
                        >
                            <header className="flex items-start justify-between gap-4 border-b border-slate-100 p-5 sm:p-6">
                                <div className="flex min-w-0 items-center gap-3">
                                    <div
                                        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ring-1 ring-inset ${getFileIconClasses(selectedFile)}`}
                                    >
                                        {getFileIcon(selectedFile, 23)}
                                    </div>

                                    <div className="min-w-0">
                                        <h2
                                            id="file-details-title"
                                            className="text-lg font-bold text-slate-900"
                                        >
                                            File details
                                        </h2>

                                        <p
                                            title={getFileName(selectedFile)}
                                            className="mt-1 truncate text-sm text-slate-500"
                                        >
                                            {getFileName(selectedFile)}
                                        </p>
                                    </div>
                                </div>

                                <RippleButton
                                    hue={270}
                                    saturation={20}
                                    lightness={45}
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setSelectedFile(null)}
                                    aria-label="Close file details"
                                    className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                                >
                                    <FiX size={20} />
                                </RippleButton>
                            </header>

                            <div className="max-h-[calc(90vh-160px)] space-y-6 overflow-y-auto p-5 sm:p-6">
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
                                        <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
                                            File type
                                        </p>

                                        <p className="mt-2 break-words text-sm font-semibold text-slate-900">
                                            {getContentType(selectedFile)}
                                        </p>
                                    </div>

                                    <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
                                        <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
                                            File size
                                        </p>

                                        <p className="mt-2 text-sm font-semibold text-slate-900">
                                            {formatBytes(getFileSize(selectedFile))}
                                        </p>
                                    </div>

                                    <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
                                        <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
                                            File ID
                                        </p>

                                        <p className="mt-2 break-all text-sm font-semibold text-slate-900">
                                            {String(selectedFile.id ?? "—")}
                                        </p>
                                    </div>

                                    <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
                                        <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
                                            Uploaded
                                        </p>

                                        <p className="mt-2 text-sm font-semibold text-slate-900">
                                            {formatDateTime(createdAt)}
                                        </p>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="mb-3 text-sm font-bold text-slate-900">
                                        Metadata
                                    </h3>

                                    {metadata && Object.keys(metadata).length > 0 ? (
                                        <pre className="max-h-64 overflow-auto rounded-xl border border-slate-200 bg-slate-950 p-4 text-xs leading-6 text-slate-100">
                                            {JSON.stringify(metadata, null, 2)}
                                        </pre>
                                    ) : (
                                        <p className="rounded-xl border border-dashed border-slate-300 px-4 py-8 text-center text-sm text-slate-500">
                                            No additional metadata available.
                                        </p>
                                    )}

                                    <details className="mt-4 rounded-xl border border-slate-200">
                                        <summary className="cursor-pointer px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                                            View complete file response
                                        </summary>

                                        <pre className="max-h-72 overflow-auto border-t border-slate-200 bg-slate-950 p-4 text-xs leading-5 text-slate-100">
                                            {JSON.stringify(selectedFile, null, 2)}
                                        </pre>
                                    </details>
                                </div>
                            </div>

                            <footer className="flex flex-col-reverse gap-3 border-t border-slate-100 bg-slate-50/70 p-5 sm:flex-row sm:justify-end sm:p-6">
                                <RippleButton
                                    hue={270}
                                    saturation={25}
                                    lightness={40}
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setSelectedFile(null)}
                                    className="rounded-xl"
                                >
                                    Close
                                </RippleButton>

                                <Link
                                    to={`/files/${selectedFile.id}`}
                                    onClick={() => setSelectedFile(null)}
                                >
                                    <RippleButton
                                        hue={270}
                                        saturation={25}
                                        lightness={40}
                                        variant="outline"
                                        size="sm"
                                        className="h-10 rounded-xl px-4"
                                    >
                                        Open full details
                                        <FaArrowUpRightFromSquare size={15} />
                                    </RippleButton>
                                </Link>

                                <RippleButton
                                    {...buttonColors}
                                    variant="solid"
                                    size="sm"
                                    disabled={downloadingId === selectedFile.id}
                                    onClick={() => handleDownload(selectedFile)}
                                    className="h-10 rounded-xl px-4"
                                >
                                    {downloadingId === selectedFile.id ? (
                                        <FiRefreshCw
                                            size={15}
                                            className="animate-spin"
                                        />
                                    ) : (
                                        <FaDownload size={15} />
                                    )}
                                    Download
                                </RippleButton>
                            </footer>
                        </section>
                    </div>
                )}
            </main>
        </>
    );
}
