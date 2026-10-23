import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import {
    FiActivity,
    FiArrowLeft,
    FiBriefcase,
    FiCalendar,
    FiCheck,
    FiCheckCircle,
    FiChevronRight,
    FiCreditCard,
    FiEdit3,
    FiGlobe,
    FiHardDrive,
    FiInfo,
    FiLock,
    FiMapPin,
    FiRefreshCw,
    FiSave,
    FiShield,
    FiUser,
    FiX,
} from "react-icons/fi";

import { apiGet, apiPatch } from "@/api/client";
import { RippleButton } from "@/components/RippleButton";

const PRIMARY_BUTTON = { hue: 270, saturation: 75, lightness: 55 };
const MUTED_BUTTON = { hue: 220, saturation: 12, lightness: 45 };

const EDITABLE_SECTIONS = [
    {
        id: "personal",
        title: "Personal information",
        description: "Name, profile image, and personal details.",
        icon: FiUser,
        fields: [
            { path: ["personal", "prefix"], label: "Prefix", placeholder: "Ms., Dr., etc." },
            { path: ["personal", "firstName"], label: "First name", required: true },
            { path: ["personal", "middle"], label: "Middle name" },
            { path: ["personal", "lastName"], label: "Last name", required: true },
            { path: ["personal", "suffix"], label: "Suffix" },
            { path: ["personal", "displayName"], label: "Display name" },
            { path: ["personal", "dob"], label: "Date of birth", type: "date" },
            { path: ["personal", "gender"], label: "Gender", type: "select", options: ["male", "female", "non_binary", "prefer_not_to_say"] },
            { path: ["personal", "genderType"], label: "Gender type", type: "select", options: ["male", "female", "non_binary", "prefer_not_to_say"] },
            { path: ["personal", "zodiac"], label: "Zodiac sign" },
            { path: ["personal", "avatar"], label: "Avatar URL", type: "url", span: 2 },
            { path: ["personal", "bio"], label: "Biography", type: "textarea", span: 2 },
        ],
    },
    {
        id: "contact",
        title: "Contact information",
        description: "Email addresses and other contact details.",
        icon: FiActivity,
        fields: [
            { path: ["contact", "email"], label: "Primary email", type: "email", required: true },
            { path: ["contact", "username"], label: "Username", required: true },
            { path: ["contact", "secondaryEmail"], label: "Secondary email", type: "email" },
            { path: ["contact", "phone"], label: "Phone", type: "tel" },
            { path: ["contact", "fax"], label: "Fax", type: "tel" },
            { path: ["contact", "website"], label: "Website", type: "url", span: 2 },
        ],
    },
    {
        id: "location",
        title: "Location",
        description: "Address, region, and geographic details.",
        icon: FiMapPin,
        fields: [
            { path: ["location", "address"], label: "Address", span: 2 },
            { path: ["location", "secondaryAddress"], label: "Address line 2", span: 2 },
            { path: ["location", "city"], label: "City" },
            { path: ["location", "state"], label: "State / province" },
            { path: ["location", "zip"], label: "Postal code" },
            { path: ["location", "country"], label: "Country" },
            { path: ["location", "countryCode"], label: "Country code" },
            { path: ["location", "continent"], label: "Continent" },
            { path: ["location", "timezone"], label: "Time zone" },
            { path: ["location", "latitude"], label: "Latitude", type: "number", step: "any" },
            { path: ["location", "longitude"], label: "Longitude", type: "number", step: "any" },
        ],
    },
    {
        id: "professional",
        title: "Professional information",
        description: "Employment, role, and company details.",
        icon: FiBriefcase,
        fields: [
            { path: ["professional", "jobTitle"], label: "Job title" },
            { path: ["professional", "jobDescriptor"], label: "Job descriptor" },
            { path: ["professional", "jobArea"], label: "Job area" },
            { path: ["professional", "jobType"], label: "Employment type" },
            { path: ["professional", "company", "name"], label: "Company name" },
            { path: ["professional", "company", "industry"], label: "Industry" },
            { path: ["professional", "company", "catchPhrase"], label: "Company summary", span: 2 },
            { path: ["professional", "company", "bs"], label: "Business description", span: 2 },
        ],
    },
    {
        id: "preferences",
        title: "Preferences",
        description: "Display and notification preferences.",
        icon: FiGlobe,
        fields: [
            { path: ["preferences", "color"], label: "Accent color" },
            { path: ["preferences", "colorHex"], label: "Accent color hex", type: "color" },
            { path: ["preferences", "language"], label: "Language", span: 2 },
            { path: ["preferences", "theme"], label: "Theme", type: "select", options: ["light", "dark", "system"] },
            { path: ["preferences", "notificationsEnabled"], label: "Notifications enabled", type: "checkbox" },
        ],
    },
    {
        id: "assets",
        title: "Vehicle and assets",
        description: "Vehicle information associated with the profile.",
        icon: FiHardDrive,
        fields: [
            { path: ["assets", "vehicle", "manufacturer"], label: "Manufacturer" },
            { path: ["assets", "vehicle", "model"], label: "Model" },
            { path: ["assets", "vehicle", "type"], label: "Vehicle type" },
            { path: ["assets", "vehicle", "fuel"], label: "Fuel type" },
            { path: ["assets", "vehicle", "color"], label: "Color" },
            { path: ["assets", "vehicle", "year"], label: "Year" },
            { path: ["assets", "vehicle", "vin"], label: "VIN", span: 2 },
        ],
    },
    {
        id: "financial",
        title: "Financial information",
        description: "Sensitive values are masked in view mode. CVV and PIN are never displayed or collected.",
        icon: FiCreditCard,
        fields: [
            { path: ["financial", "currency"], label: "Currency" },
            { path: ["financial", "currencyCode"], label: "Currency code" },
            { path: ["financial", "currencySymbol"], label: "Currency symbol" },
            { path: ["financial", "iban"], label: "IBAN", sensitive: true, sensitiveKind: "iban", span: 2 },
            { path: ["financial", "bic"], label: "BIC / SWIFT", sensitive: true },
            { path: ["financial", "accountNumber"], label: "Account number", sensitive: true },
            { path: ["financial", "routingNumber"], label: "Routing number", sensitive: true },
            { path: ["financial", "creditCard", "issuer"], label: "Card issuer" },
            { path: ["financial", "creditCard", "number"], label: "Card number", type: "secretReplace", sensitive: true, span: 2 },
            { path: ["financial", "creditCard", "expiration"], label: "Card expiration", type: "date" },
            { path: ["financial", "creditCard", "cvv"], label: "Card CVV", type: "protected" },
            { path: ["financial", "creditCard", "pin"], label: "Card PIN", type: "protected" },
        ],
    },
];

const READ_ONLY_SECTIONS = [
    {
        id: "account",
        title: "Account and system information",
        description: "System-controlled fields and account-level attributes.",
        icon: FiShield,
        fields: [
            { path: ["id"], label: "User ID", copyable: true },
            { path: ["metadata", "version"], label: "Schema version" },
            { path: ["metadata", "createdAt"], label: "Account created", type: "datetime" },
            { path: ["metadata", "updatedAt"], label: "Last updated", type: "datetime" },
            { path: ["metadata", "accountStatus"], label: "Account status", badge: true },
            { path: ["metadata", "accountTier"], label: "Account tier", badge: true },
            { path: ["metadata", "role"], label: "Role", badge: true },
            { path: ["metadata", "is_active"], label: "Active account", type: "boolean" },
        ],
    },
    {
        id: "network",
        title: "Network information",
        description: "Technical fields recorded by the application. These values are read-only.",
        icon: FiActivity,
        fields: [
            { path: ["network", "ipAddress"], label: "IP address", copyable: true },
            { path: ["network", "ipv6"], label: "IPv6 address", copyable: true },
            { path: ["network", "macAddress"], label: "MAC address", copyable: true },
            { path: ["network", "domain"], label: "Domain" },
            { path: ["network", "userAgent"], label: "User agent", span: 2 },
        ],
    },
    {
        id: "security",
        title: "Security credentials",
        description: "Credential hashes and verification secrets are never displayed or edited here.",
        icon: FiLock,
        fields: [
            { path: ["password"], label: "Password", type: "credential" },
        ],
    },
];

const ALL_SECTIONS = [...EDITABLE_SECTIONS, ...READ_ONLY_SECTIONS];

function getPath(object, path) {
    return path.reduce((current, part) => current?.[part], object);
}

function setPath(object, path, value) {
    let current = object;
    path.forEach((part, index) => {
        if (index === path.length - 1) {
            current[part] = value;
            return;
        }
        if (!current[part] || typeof current[part] !== "object" || Array.isArray(current[part])) {
            current[part] = {};
        }
        current = current[part];
    });
}

function deepClone(value) {
    if (typeof structuredClone === "function") return structuredClone(value ?? {});
    return JSON.parse(JSON.stringify(value ?? {}));
}

function normalizeUser(raw) {
    const candidate = raw?.user ?? raw?.data?.user ?? raw;
    if (!candidate || typeof candidate !== "object" || Array.isArray(candidate)) return null;

    const profileData =
        candidate.profile && typeof candidate.profile === "object"
            ? candidate.profile
            : candidate.data && typeof candidate.data === "object" && !Array.isArray(candidate.data)
              ? candidate.data
              : {};

    const normalized = { ...profileData, ...candidate };
    normalized.id = candidate.id ?? profileData.id ?? raw?.id;

    if (normalized.profile && typeof normalized.profile === "object") {
        Object.assign(normalized, normalized.profile);
    }

    if (normalized.data && typeof normalized.data === "object") {
        // Support serializers that return the dynamic profile under `data`.
        for (const [key, value] of Object.entries(normalized.data)) {
            if (normalized[key] === undefined) normalized[key] = value;
        }
    }

    return normalized;
}

function isTrue(value) {
    return value === true || value === 1 || ["true", "yes", "1"].includes(String(value).toLowerCase());
}

function dateInputValue(value) {
    if (!value) return "";
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? "" : date.toISOString().slice(0, 10);
}

function formatDate(value, withTime = false) {
    if (!value) return "—";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return String(value);
    return new Intl.DateTimeFormat(undefined, {
        day: "2-digit",
        month: "short",
        year: "numeric",
        ...(withTime ? { hour: "2-digit", minute: "2-digit" } : {}),
    }).format(date);
}

function maskValue(value, kind = "sensitive") {
    if (value === null || value === undefined || value === "") return "—";
    const text = String(value);
    if (kind === "card") {
        const digits = text.replace(/\D/g, "");
        return digits ? `•••• •••• •••• ${digits.slice(-4)}` : "Saved card";
    }
    const visible = kind === "iban" ? 4 : 3;
    return text.length <= visible
        ? "•".repeat(text.length)
        : `${"•".repeat(Math.min(12, text.length - visible))}${text.slice(-visible)}`;
}

function formatLabel(value) {
    if (value === null || value === undefined || value === "") return "Unknown";
    return String(value)
        .replace(/[_-]+/g, " ")
        .replace(/\b\w/g, (character) => character.toUpperCase());
}

function statusClasses(value) {
    const status = String(value ?? "").toLowerCase();
    if (["active", "enabled", "verified", "true"].includes(status)) {
        return "bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-400/10 dark:text-emerald-300";
    }
    if (["pending", "invited", "unverified"].includes(status)) {
        return "bg-amber-50 text-amber-700 ring-amber-600/20 dark:bg-amber-400/10 dark:text-amber-300";
    }
    if (["banned", "blocked", "suspended", "disabled", "inactive", "false"].includes(status)) {
        return "bg-rose-50 text-rose-700 ring-rose-600/20 dark:bg-rose-400/10 dark:text-rose-300";
    }
    return "bg-slate-100 text-slate-700 ring-slate-500/20 dark:bg-slate-800 dark:text-slate-300";
}

function readableValue(value, field) {
    if (field.type === "credential") return "Managed securely. The password hash is never displayed.";
    if (field.type === "protected") return "Not returned or displayed for security.";
    if (field.type === "secretReplace") return maskValue(value, "card");
    if (field.sensitive) return maskValue(value, field.sensitiveKind);
    if (field.type === "datetime") return formatDate(value, true);
    if (field.type === "date") return formatDate(value);
    if (field.type === "boolean") return isTrue(value) ? "Yes" : "No";
    if (value === null || value === undefined || value === "") return "—";
    if (typeof value === "object") return JSON.stringify(value);
    return String(value);
}

function FieldControl({ field, value, onChange, sensitiveValue, onSensitiveChange }) {
    const baseClass = "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-violet-400 focus:ring-4 focus:ring-violet-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-violet-500 dark:focus:ring-violet-500/10";

    if (field.type === "protected" || field.type === "credential") {
        return (
            <div className="flex min-h-11 items-center gap-2 rounded-xl border border-dashed border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-950/60 dark:text-slate-400">
                <FiLock size={15} className="shrink-0" />
                {readableValue(value, field)}
            </div>
        );
    }

    if (field.type === "secretReplace") {
        return (
            <div className="space-y-2">
                <div className="rounded-lg bg-slate-100 px-3 py-2 text-xs text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                    Saved value: {maskValue(value, "card")}
                </div>
                <input
                    className={baseClass}
                    type="password"
                    autoComplete="off"
                    inputMode="numeric"
                    value={sensitiveValue || ""}
                    onChange={(event) => onSensitiveChange(event.target.value)}
                    placeholder="Enter a replacement card number"
                />
                <p className="text-xs leading-5 text-slate-500">Leave blank to keep the current value. CVV and PIN are not collected here.</p>
            </div>
        );
    }

    if (field.type === "textarea") {
        return (
            <textarea
                className={`${baseClass} min-h-28 resize-y`}
                value={value ?? ""}
                onChange={(event) => onChange(event.target.value)}
                placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
                rows={4}
                required={field.required}
            />
        );
    }

    if (field.type === "checkbox") {
        return (
            <label className="flex min-h-11 cursor-pointer items-center justify-between rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 dark:border-slate-700 dark:bg-slate-950">
                <span className="text-sm text-slate-600 dark:text-slate-300">{isTrue(value) ? "Enabled" : "Disabled"}</span>
                <input
                    type="checkbox"
                    checked={isTrue(value)}
                    onChange={(event) => onChange(event.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-violet-600 focus:ring-violet-500"
                />
            </label>
        );
    }

    if (field.type === "select") {
        return (
            <select className={baseClass} value={value ?? ""} onChange={(event) => onChange(event.target.value)}>
                <option value="">Select {field.label.toLowerCase()}</option>
                {field.options.map((option) => (
                    <option key={option} value={option}>
                        {option.replace(/[_-]+/g, " ").replace(/\b\w/g, (character) => character.toUpperCase())}
                    </option>
                ))}
            </select>
        );
    }

    const inputValue = field.type === "date" ? dateInputValue(value) : (value ?? "");

    return (
        <div className="flex items-center gap-2">
            {field.type === "color" && (
                <input
                    type="color"
                    value={/^#[0-9a-f]{6}$/i.test(String(inputValue)) ? inputValue : "#7c3aed"}
                    onChange={(event) => onChange(event.target.value)}
                    aria-label={field.label}
                    className="h-11 w-12 shrink-0 cursor-pointer rounded-lg border border-slate-200 bg-white p-1 dark:border-slate-700 dark:bg-slate-950"
                />
            )}
            <input
                className={baseClass}
                type={field.type === "color" ? "text" : (field.type || "text")}
                step={field.step}
                value={inputValue}
                onChange={(event) => onChange(event.target.value)}
                placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
                required={field.required}
                inputMode={field.type === "number" ? "decimal" : undefined}
                autoComplete="off"
            />
        </div>
    );
}

function ProfileField({ field, profile, editing, draft, onFieldChange, sensitiveEdits, onSensitiveChange }) {
    const value = getPath(editing ? draft : profile, field.path);
    const isEditable = editing && !field.readOnly && field.type !== "protected" && field.type !== "credential";
    const displayValue = readableValue(value, field);

    return (
        <div className={`min-w-0 ${field.span === 2 ? "sm:col-span-2" : ""}`}>
            <dt className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                {field.label}
                {field.required && editing && <span className="text-rose-500">*</span>}
                {field.sensitive && !editing && <FiLock size={11} aria-label="Sensitive value masked" />}
            </dt>
            <dd>
                {isEditable ? (
                    <FieldControl
                        field={field}
                        value={value}
                        onChange={(nextValue) => onFieldChange(field.path, nextValue)}
                        sensitiveValue={sensitiveEdits[field.path.join(".")]}
                        onSensitiveChange={(nextValue) => onSensitiveChange(field.path.join("."), nextValue)}
                    />
                ) : (
                    <div className="flex min-h-11 items-center gap-2 rounded-xl border border-transparent bg-slate-50/80 px-3.5 py-2.5 dark:bg-slate-950/50">
                        {field.badge ? (
                            <span className={`inline-flex max-w-full items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${statusClasses(value)}`}>
                                {displayValue === "—" ? displayValue : displayValue.replace(/[_-]+/g, " ").replace(/\b\w/g, (character) => character.toUpperCase())}
                            </span>
                        ) : (
                            <span className="min-w-0 whitespace-pre-wrap break-words text-sm leading-5 text-slate-800 dark:text-slate-200">
                                {displayValue}
                            </span>
                        )}
                        {field.copyable && value !== null && value !== undefined && value !== "" && (
                            <button
                                type="button"
                                onClick={async () => {
                                    try {
                                        await navigator.clipboard.writeText(String(value));
                                    } catch {
                                        // Clipboard access can be unavailable in insecure contexts.
                                    }
                                }}
                                className="ml-auto shrink-0 text-xs font-semibold text-violet-700 hover:text-violet-900 dark:text-violet-300"
                            >
                                Copy
                            </button>
                        )}
                    </div>
                )}
            </dd>
        </div>
    );
}

function ProfileSection({ section, profile, editing, draft, onFieldChange, sensitiveEdits, onSensitiveChange }) {
    const Icon = section.icon;

    return (
        <section id={section.id} className="scroll-mt-24 overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <header className="flex items-start gap-3 border-b border-slate-100 px-5 py-5 dark:border-slate-800 sm:px-6">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-700 dark:bg-violet-500/10 dark:text-violet-300">
                    <Icon size={19} />
                </div>
                <div className="min-w-0 flex-1">
                    <h2 className="text-base font-semibold text-slate-900 dark:text-white">{section.title}</h2>
                    <p className="mt-1 text-sm leading-5 text-slate-500 dark:text-slate-400">{section.description}</p>
                </div>
                {editing && !section.readOnly && (
                    <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-violet-50 px-2 py-1 text-[11px] font-semibold text-violet-700 dark:bg-violet-500/10 dark:text-violet-300">
                        <FiEdit3 size={11} /> Editing
                    </span>
                )}
            </header>
            <dl className="grid grid-cols-1 gap-x-6 gap-y-5 p-5 sm:grid-cols-2 sm:p-6">
                {section.fields.map((field) => (
                    <ProfileField
                        key={field.path.join(".")}
                        field={{ ...field, readOnly: field.readOnly || section.readOnly }}
                        profile={profile}
                        editing={editing}
                        draft={draft}
                        onFieldChange={onFieldChange}
                        sensitiveEdits={sensitiveEdits}
                        onSensitiveChange={onSensitiveChange}
                    />
                ))}
            </dl>
        </section>
    );
}

function buildEditablePatch(draft) {
    const payload = {};
    for (const section of EDITABLE_SECTIONS) {
        for (const field of section.fields) {
            if (["protected", "credential", "secretReplace"].includes(field.type)) continue;
            const value = getPath(draft, field.path);
            if (value !== undefined) setPath(payload, field.path, value);
        }
    }
    return payload;
}

function mergeProfile(current, patch) {
    const result = deepClone(current || {});
    function merge(target, source) {
        Object.entries(source || {}).forEach(([key, value]) => {
            if (value && typeof value === "object" && !Array.isArray(value)) {
                if (!target[key] || typeof target[key] !== "object" || Array.isArray(target[key])) target[key] = {};
                merge(target[key], value);
            } else {
                target[key] = value;
            }
        });
        return target;
    }
    return merge(result, patch);
}

function getUserName(user) {
    const personal = user?.personal || {};
    const contact = user?.contact || {};
    return personal.displayName ||
        [personal.prefix, personal.firstName, personal.middle, personal.lastName, personal.suffix].filter(Boolean).join(" ") ||
        user?.name || user?.full_name || contact.username || contact.email || `User ${user?.id ?? ""}`;
}

export default function UserDetailsPage() {
    const params = useParams();
    const userId = params.userId ?? params.id;
    const navigate = useNavigate();

    const [profile, setProfile] = useState(null);
    const [draft, setDraft] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [sensitiveEdits, setSensitiveEdits] = useState({});
    const [activeSection, setActiveSection] = useState("personal");
    const [refreshKey, setRefreshKey] = useState(0);

    useEffect(() => {
        let active = true;
        async function load() {
            if (!userId) {
                if (active) {
                    setError("A user ID is required to open this page.");
                    setProfile(null);
                    setIsLoading(false);
                }
                return;
            }
            if (active) {
                setIsLoading(true);
                setError("");
            }
            try {
                const result = normalizeUser(await apiGet(`/users/${encodeURIComponent(userId)}/`));
                if (!result) throw new Error("The server returned an invalid user record.");
                if (active) setProfile(result);
            } catch (err) {
                if (active) {
                    setProfile(null);
                    setError(err?.message || "Unable to load this user. Please try again.");
                }
            } finally {
                if (active) setIsLoading(false);
            }
        }
        load();
        return () => { active = false; };
    }, [userId, refreshKey]);

    const onFieldChange = useCallback((path, value) => {
        setDraft((current) => {
            const next = deepClone(current || profile || {});
            setPath(next, path, value);
            return next;
        });
    }, [profile]);

    const onSensitiveChange = useCallback((key, value) => {
        setSensitiveEdits((current) => ({ ...current, [key]: value }));
    }, []);

    function startEditing() {
        setDraft(deepClone(profile || {}));
        setSensitiveEdits({});
        setError("");
        setSuccess("");
        setIsEditing(true);
    }

    function cancelEditing() {
        setDraft(null);
        setSensitiveEdits({});
        setError("");
        setIsEditing(false);
    }

    async function handleSave(event) {
        event.preventDefault();
        if (!draft || isSaving || !userId) return;

        setIsSaving(true);
        setError("");
        setSuccess("");

        try {
            const payload = buildEditablePatch(draft);
            const replacementCardNumber = sensitiveEdits["financial.creditCard.number"]?.trim();
            if (replacementCardNumber) {
                setPath(payload, ["financial", "creditCard", "number"], replacementCardNumber);
            }

            const response = await apiPatch(`/users/${encodeURIComponent(userId)}/`, payload);
            const savedResponse = normalizeUser(response);
            const saved = savedResponse?.id !== undefined
                ? mergeProfile(profile, savedResponse)
                : mergeProfile(profile, payload);

            setProfile(saved);
            setDraft(deepClone(saved));
            setSensitiveEdits({});
            setIsEditing(false);
            setSuccess("User details have been updated successfully.");
        } catch (err) {
            setError(err?.message || "Unable to save user details. Please try again.");
        } finally {
            setIsSaving(false);
        }
    }

    const anchors = useMemo(() => ALL_SECTIONS.map(({ id, title, icon }) => ({ id, title, icon })), []);

    useEffect(() => {
        const updateActiveSection = () => {
            const activationLine = window.scrollY + Math.min(window.innerHeight * 0.32, 260);
            let nextActiveSection = ALL_SECTIONS[0].id;
            for (const section of ALL_SECTIONS) {
                const element = document.getElementById(section.id);
                if (!element) continue;
                if (element.getBoundingClientRect().top + window.scrollY <= activationLine) {
                    nextActiveSection = section.id;
                } else {
                    break;
                }
            }
            setActiveSection((current) => current === nextActiveSection ? current : nextActiveSection);
        };
        updateActiveSection();
        window.addEventListener("scroll", updateActiveSection, { passive: true });
        window.addEventListener("resize", updateActiveSection);
        return () => {
            window.removeEventListener("scroll", updateActiveSection);
            window.removeEventListener("resize", updateActiveSection);
        };
    }, [profile, isLoading]);

    if (isLoading) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 dark:bg-slate-950">
                <div className="flex flex-col items-center gap-3 rounded-2xl border border-slate-200 bg-white px-10 py-10 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                    <FiRefreshCw size={24} className="animate-spin text-violet-600" />
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Loading user details...</p>
                </div>
            </main>
        );
    }

    if (!profile) {
        return (
            <main className="min-h-screen bg-slate-50 px-4 py-8 dark:bg-slate-950 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-3xl">
                    <Link to="/users" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-violet-700 dark:text-slate-300 dark:hover:text-violet-300">
                        <FiArrowLeft size={16} /> Back to users
                    </Link>
                    <div role="alert" className="mt-6 rounded-2xl border border-rose-200 bg-white p-6 shadow-sm dark:border-rose-900/50 dark:bg-slate-900">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-300"><FiInfo size={21} /></div>
                        <h1 className="mt-4 text-lg font-semibold text-slate-900 dark:text-white">Could not load user details</h1>
                        <p className="mt-2 text-sm leading-6 text-rose-700 dark:text-rose-300">{error || "This user record is not available."}</p>
                        <div className="mt-5 flex flex-wrap gap-2">
                            <RippleButton {...PRIMARY_BUTTON} variant="solid" size="sm" onClick={() => setRefreshKey((value) => value + 1)} className="inline-flex items-center gap-2 rounded-xl text-white">
                                <FiRefreshCw size={15} /> Try again
                            </RippleButton>
                            <RippleButton {...MUTED_BUTTON} variant="outline" size="sm" onClick={() => navigate("/users")} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
                                <FiArrowLeft size={15} /> Back to users
                            </RippleButton>
                        </div>
                    </div>
                </div>
            </main>
        );
    }

    const displayProfile = isEditing ? (draft || profile) : profile;
    const personal = displayProfile.personal || {};
    const contact = displayProfile.contact || {};
    const metadata = displayProfile.metadata || {};
    const fullName = getUserName(displayProfile);
    const initials = fullName.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase() || "U";
    const avatar = personal.avatar;
    const role = metadata.role ?? displayProfile.role ?? "—";
    const accountStatus = metadata.accountStatus ?? displayProfile.account_status ?? "—";
    const accountTier = metadata.accountTier ?? displayProfile.account_tier ?? "Standard";
    const createdAt = metadata.createdAt ?? displayProfile.created_at;

    return (
        <main className="min-h-screen bg-slate-50/80 px-4 py-6 text-slate-900 dark:bg-slate-950 dark:text-white sm:px-6 lg:px-8">
            <div className="mx-auto max-w-7xl space-y-6">
                <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                    <Link to="/users" className="font-medium transition hover:text-violet-700 dark:hover:text-violet-300">Users</Link>
                    <FiChevronRight size={14} />
                    <span className="max-w-[260px] truncate font-medium text-slate-700 dark:text-slate-200">{fullName}</span>
                </nav>

                <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <p className="text-sm font-semibold text-violet-700 dark:text-violet-300">User management</p>
                        <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-950 dark:text-white sm:text-4xl">User details</h1>
                        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400">Review account information, manage profile data, and inspect system-controlled attributes.</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        <RippleButton {...MUTED_BUTTON} variant="outline" size="sm" onClick={() => navigate("/users")} className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
                            <FiArrowLeft size={15} /> Back to users
                        </RippleButton>
                        <RippleButton {...MUTED_BUTTON} variant="outline" size="sm" disabled={isLoading || isSaving} onClick={() => setRefreshKey((value) => value + 1)} className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
                            <FiRefreshCw size={15} className={isLoading ? "animate-spin" : ""} /> Refresh
                        </RippleButton>
                        {isEditing ? (
                            <>
                                <RippleButton {...MUTED_BUTTON} variant="outline" size="sm" disabled={isSaving} onClick={cancelEditing} className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
                                    <FiX size={15} /> Cancel
                                </RippleButton>
                                <RippleButton {...PRIMARY_BUTTON} variant="solid" size="sm" type="submit" form="user-details-form" disabled={isSaving} className="inline-flex h-10 items-center gap-2 rounded-xl px-4 text-sm font-semibold text-white disabled:opacity-60">
                                    {isSaving ? <FiRefreshCw size={15} className="animate-spin" /> : <FiSave size={15} />}
                                    {isSaving ? "Saving..." : "Save changes"}
                                </RippleButton>
                            </>
                        ) : (
                            <RippleButton {...PRIMARY_BUTTON} variant="solid" size="sm" onClick={startEditing} className="inline-flex h-10 items-center gap-2 rounded-xl px-4 text-sm font-semibold text-white">
                                <FiEdit3 size={15} /> Edit user
                            </RippleButton>
                        )}
                    </div>
                </header>

                {error && (
                    <div role="alert" className="flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 dark:border-rose-900/60 dark:bg-rose-950/30">
                        <FiInfo size={18} className="mt-0.5 shrink-0 text-rose-600 dark:text-rose-300" />
                        <p className="text-sm leading-5 text-rose-800 dark:text-rose-200">{error}</p>
                    </div>
                )}
                {success && (
                    <div role="status" className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 dark:border-emerald-900/60 dark:bg-emerald-950/30">
                        <FiCheckCircle size={18} className="shrink-0 text-emerald-600 dark:text-emerald-300" />
                        <p className="text-sm font-medium text-emerald-800 dark:text-emerald-200">{success}</p>
                        <button type="button" onClick={() => setSuccess("")} className="ml-auto text-xs font-semibold text-emerald-700 hover:text-emerald-900 dark:text-emerald-300">Dismiss</button>
                    </div>
                )}

                <form id="user-details-form" onSubmit={handleSave}>
                    <section className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
                        <div className="h-28 bg-gradient-to-r from-violet-600 via-indigo-500 to-fuchsia-500 sm:h-36" />
                        <div className="px-5 pb-5 sm:px-7 sm:pb-7">
                            <div className="-mt-12 flex flex-col gap-4 sm:-mt-14 sm:flex-row sm:items-end sm:justify-between">
                                <div className="flex min-w-0 items-end gap-4">
                                    {avatar ? (
                                        <img src={avatar} alt={`${fullName} avatar`} className="h-24 w-24 shrink-0 rounded-2xl border-4 border-white bg-white object-cover shadow-md dark:border-slate-900 sm:h-28 sm:w-28" onError={(event) => { event.currentTarget.style.display = "none"; }} />
                                    ) : (
                                        <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-2xl border-4 border-white bg-gradient-to-br from-violet-600 to-indigo-600 text-2xl font-bold text-white shadow-md dark:border-slate-900 sm:h-28 sm:w-28">{initials}</div>
                                    )}
                                    <div className="min-w-0 pb-1">
                                        <h2 className="truncate text-xl font-bold text-slate-950 dark:text-white sm:text-2xl">{fullName}</h2>
                                        <p className="mt-1 truncate text-sm text-slate-500 dark:text-slate-400">{contact.email || displayProfile.email || "No email address"}</p>
                                        <div className="mt-2 flex flex-wrap items-center gap-2">
                                            {role !== "—" && <span className="rounded-full bg-violet-50 px-2.5 py-1 text-xs font-semibold text-violet-700 dark:bg-violet-500/10 dark:text-violet-300">{formatLabel(role)}</span>}
                                            {accountStatus !== "—" && <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${statusClasses(accountStatus)}`}>{formatLabel(accountStatus)}</span>}
                                        </div>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-3 sm:min-w-64">
                                    <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-3 dark:border-slate-800 dark:bg-slate-950/60">
                                        <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Account tier</p>
                                        <p className="mt-1 text-sm font-semibold capitalize text-slate-900 dark:text-slate-100">{accountTier}</p>
                                    </div>
                                    <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-3 dark:border-slate-800 dark:bg-slate-950/60">
                                        <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Member since</p>
                                        <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-slate-100">{formatDate(createdAt)}</p>
                                    </div>
                                </div>
                            </div>
                            {isEditing && <p className="mt-5 text-xs leading-5 text-slate-500 dark:text-slate-400">Only profile fields below are submitted. Account/system fields, network values, password hashes, CVV, and PIN remain protected.</p>}
                        </div>
                    </section>

                    <div className="mt-6 grid grid-cols-1 items-start gap-6 lg:grid-cols-[240px_minmax(0,1fr)]">
                        <aside className="lg:sticky lg:top-6">
                            <nav aria-label="User detail sections" className="rounded-2xl border border-slate-200/90 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                                <p className="px-3 pb-2 pt-1 text-xs font-semibold uppercase tracking-wider text-slate-400">User sections</p>
                                <div className="grid grid-cols-2 gap-1 sm:grid-cols-3 lg:grid-cols-1">
                                    {anchors.map(({ id, title, icon: Icon }) => {
                                        const isActive = activeSection === id;
                                        return (
                                            <a
                                                key={id}
                                                href={`#${id}`}
                                                aria-current={isActive ? "location" : undefined}
                                                onClick={() => setActiveSection(id)}
                                                className={`group flex min-w-0 items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-300 ${isActive ? "bg-violet-100 text-violet-800 shadow-sm ring-1 ring-inset ring-violet-200 dark:bg-violet-500/15 dark:text-violet-200 dark:ring-violet-400/20" : "text-slate-600 hover:bg-violet-50 hover:text-violet-700 dark:text-slate-300 dark:hover:bg-violet-500/10 dark:hover:text-violet-300"}`}
                                            >
                                                <Icon size={16} className={`shrink-0 ${isActive ? "text-violet-700 dark:text-violet-300" : "text-slate-400 group-hover:text-violet-600 dark:group-hover:text-violet-300"}`} />
                                                <span className="truncate">{title}</span>
                                                <FiChevronRight size={14} className={`ml-auto hidden shrink-0 lg:block ${isActive ? "text-violet-500 dark:text-violet-300" : "text-slate-300"}`} />
                                            </a>
                                        );
                                    })}
                                </div>
                            </nav>
                            <div className="mt-4 rounded-2xl border border-violet-100 bg-violet-50/70 p-4 dark:border-violet-400/15 dark:bg-violet-500/5">
                                <div className="flex items-center gap-2 text-violet-800 dark:text-violet-200">
                                    <FiShield size={17} />
                                    <h3 className="text-sm font-semibold">Privacy and security</h3>
                                </div>
                                <p className="mt-2 text-xs leading-5 text-violet-800/80 dark:text-violet-200/75">Sensitive values are masked in view mode. Password hashes, CVV, and PIN are not displayed. System and network fields are read-only.</p>
                            </div>
                        </aside>

                        <div className="min-w-0 space-y-6">
                            {EDITABLE_SECTIONS.map((section) => (
                                <ProfileSection
                                    key={section.id}
                                    section={section}
                                    profile={profile}
                                    editing={isEditing}
                                    draft={draft}
                                    onFieldChange={onFieldChange}
                                    sensitiveEdits={sensitiveEdits}
                                    onSensitiveChange={onSensitiveChange}
                                />
                            ))}
                            {READ_ONLY_SECTIONS.map((section) => (
                                <ProfileSection
                                    key={section.id}
                                    section={{ ...section, readOnly: true }}
                                    profile={profile}
                                    editing={isEditing}
                                    draft={draft}
                                    onFieldChange={onFieldChange}
                                    sensitiveEdits={sensitiveEdits}
                                    onSensitiveChange={onSensitiveChange}
                                />
                            ))}
                        </div>
                    </div>

                    {isEditing && (
                        <div className="sticky bottom-4 z-20 mt-6 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-xl shadow-slate-900/10 backdrop-blur sm:flex-row sm:items-center sm:justify-between dark:border-slate-700 dark:bg-slate-900/95">
                            <p className="text-xs leading-5 text-slate-500 dark:text-slate-400">Only editable profile fields are sent to the API. System permissions and network values are not changed here.</p>
                            <div className="flex shrink-0 items-center justify-end gap-2">
                                <RippleButton {...MUTED_BUTTON} variant="outline" size="sm" disabled={isSaving} onClick={cancelEditing} className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
                                    <FiX size={15} /> Cancel
                                </RippleButton>
                                <RippleButton {...PRIMARY_BUTTON} variant="solid" size="sm" type="submit" disabled={isSaving} className="inline-flex h-10 items-center gap-2 rounded-xl px-4 text-sm font-semibold text-white disabled:opacity-60">
                                    {isSaving ? <FiRefreshCw size={15} className="animate-spin" /> : <FiCheck size={16} />}
                                    {isSaving ? "Saving..." : "Save changes"}
                                </RippleButton>
                            </div>
                        </div>
                    )}
                </form>

                <p className="text-center text-xs text-slate-400">User information is loaded from the application API. Permissions are enforced by the server.</p>
            </div>
        </main>
    );
}
