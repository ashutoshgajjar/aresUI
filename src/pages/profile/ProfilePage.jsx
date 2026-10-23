// import { useCallback, useEffect, useMemo, useState } from "react";
// import { Link } from "react-router";
// import {
//     FiActivity,
//     FiBriefcase,
//     FiCalendar,
//     FiCheck,
//     FiCheckCircle,
//     FiChevronRight,
//     FiCreditCard,
//     FiEdit3,
//     FiGlobe,
//     FiHardDrive,
//     FiInfo,
//     FiLock,
//     FiMapPin,
//     FiRefreshCw,
//     FiSave,
//     FiShield,
//     FiUser,
//     FiUsers,
//     FiX,
// } from "react-icons/fi";

// import { apiGet, apiPatch } from "@/api/client";
// import { useAuth } from "@/context/AuthContext";
// import { RippleButton } from "@/components/RippleButton";
// import { FaArrowUp } from "react-icons/fa6";
// // import BreadcrumbBar from "@/components/navigation/BreadcrumbBar";

// const PRIMARY_BUTTON = { hue: 270, saturation: 75, lightness: 55 };
// const MUTED_BUTTON = { hue: 220, saturation: 12, lightness: 45 };

// const SECTIONS = [
//     {
//         id: "personal",
//         title: "Personal information",
//         description: "Your name, profile image, and personal details.",
//         icon: FiUser,
//         fields: [
//             { path: ["personal", "prefix"], label: "Prefix", placeholder: "Ms., Dr., etc." },
//             { path: ["personal", "firstName"], label: "First name", required: true },
//             { path: ["personal", "middle"], label: "Middle name" },
//             { path: ["personal", "lastName"], label: "Last name", required: true },
//             { path: ["personal", "suffix"], label: "Suffix" },
//             { path: ["personal", "displayName"], label: "Display name" },
//             { path: ["personal", "dob"], label: "Date of birth", type: "date" },
//             { path: ["personal", "gender"], label: "Gender", type: "select", options: ["male", "female", "non_binary", "prefer_not_to_say"] },
//             { path: ["personal", "genderType"], label: "Gender type", type: "select", options: ["male", "female", "non_binary", "prefer_not_to_say"] },
//             { path: ["personal", "zodiac"], label: "Zodiac sign" },
//             { path: ["personal", "avatar"], label: "Avatar URL", type: "url", span: 2 },
//             { path: ["personal", "bio"], label: "Biography", type: "textarea", span: 2 },
//         ],
//     },
//     {
//         id: "contact",
//         title: "Contact information",
//         description: "Email addresses and other contact details.",
//         icon: FiActivity,
//         fields: [
//             { path: ["contact", "email"], label: "Primary email", type: "email", required: true },
//             { path: ["contact", "username"], label: "Username", required: true },
//             { path: ["contact", "secondaryEmail"], label: "Secondary email", type: "email" },
//             { path: ["contact", "phone"], label: "Phone", type: "tel" },
//             { path: ["contact", "fax"], label: "Fax", type: "tel" },
//             { path: ["contact", "website"], label: "Website", type: "url", span: 2 },
//         ],
//     },
//     {
//         id: "location",
//         title: "Location",
//         description: "Address, region, and geographic details.",
//         icon: FiMapPin,
//         fields: [
//             { path: ["location", "address"], label: "Address", span: 2 },
//             { path: ["location", "secondaryAddress"], label: "Address line 2", span: 2 },
//             { path: ["location", "city"], label: "City" },
//             { path: ["location", "state"], label: "State / province" },
//             { path: ["location", "zip"], label: "Postal code" },
//             { path: ["location", "country"], label: "Country" },
//             { path: ["location", "countryCode"], label: "Country code" },
//             { path: ["location", "continent"], label: "Continent" },
//             { path: ["location", "timezone"], label: "Time zone" },
//             { path: ["location", "latitude"], label: "Latitude", type: "number", step: "any" },
//             { path: ["location", "longitude"], label: "Longitude", type: "number", step: "any" },
//         ],
//     },
//     {
//         id: "professional",
//         title: "Professional information",
//         description: "Your role, employment details, and company.",
//         icon: FiBriefcase,
//         fields: [
//             { path: ["professional", "jobTitle"], label: "Job title" },
//             { path: ["professional", "jobDescriptor"], label: "Job descriptor" },
//             { path: ["professional", "jobArea"], label: "Job area" },
//             { path: ["professional", "jobType"], label: "Employment type" },
//             { path: ["professional", "company", "name"], label: "Company name" },
//             { path: ["professional", "company", "industry"], label: "Industry" },
//             { path: ["professional", "company", "catchPhrase"], label: "Company summary", span: 2 },
//             { path: ["professional", "company", "bs"], label: "Business description", span: 2 },
//         ],
//     },
//     {
//         id: "preferences",
//         title: "Preferences",
//         description: "Customize your display and notification preferences.",
//         icon: FiGlobe,
//         fields: [
//             { path: ["preferences", "color"], label: "Accent color" },
//             { path: ["preferences", "colorHex"], label: "Accent color hex", type: "color" },
//             { path: ["preferences", "language"], label: "Language", span: 2 },
//             { path: ["preferences", "theme"], label: "Theme", type: "select", options: ["light", "dark", "system"] },
//             { path: ["preferences", "notificationsEnabled"], label: "Notifications enabled", type: "checkbox" },
//         ],
//     },
//     {
//         id: "assets",
//         title: "Vehicle and assets",
//         description: "Vehicle information associated with your profile.",
//         icon: FiHardDrive,
//         fields: [
//             { path: ["assets", "vehicle", "manufacturer"], label: "Manufacturer" },
//             { path: ["assets", "vehicle", "model"], label: "Model" },
//             { path: ["assets", "vehicle", "type"], label: "Vehicle type" },
//             { path: ["assets", "vehicle", "fuel"], label: "Fuel type" },
//             { path: ["assets", "vehicle", "color"], label: "Color" },
//             { path: ["assets", "vehicle", "year"], label: "Year" },
//             { path: ["assets", "vehicle", "vin"], label: "VIN", span: 2 },
//         ],
//     },
//     {
//         id: "financial",
//         title: "Financial information",
//         description: "Bank and payment details. Sensitive values are masked in view mode.",
//         icon: FiCreditCard,
//         fields: [
//             { path: ["financial", "currency"], label: "Currency" },
//             { path: ["financial", "currencyCode"], label: "Currency code" },
//             { path: ["financial", "currencySymbol"], label: "Currency symbol" },
//             { path: ["financial", "iban"], label: "IBAN", sensitive: true, span: 2 },
//             { path: ["financial", "bic"], label: "BIC / SWIFT", sensitive: true },
//             { path: ["financial", "accountNumber"], label: "Account number", sensitive: true },
//             { path: ["financial", "routingNumber"], label: "Routing number", sensitive: true },
//             { path: ["financial", "creditCard", "issuer"], label: "Card issuer" },
//             { path: ["financial", "creditCard", "number"], label: "Card number", type: "secretReplace", sensitive: true, span: 2 },
//             { path: ["financial", "creditCard", "expiration"], label: "Card expiration", type: "date" },
//             { path: ["financial", "creditCard", "cvv"], label: "Card CVV", type: "protected" },
//             { path: ["financial", "creditCard", "pin"], label: "Card PIN", type: "protected" },
//         ],
//     },
// ];

// const READ_ONLY_SECTIONS = [
//     {
//         id: "metadata",
//         title: "Account and system information",
//         description: "These fields are controlled by the system or an administrator.",
//         icon: FiShield,
//         readOnly: true,
//         fields: [
//             { path: ["id"], label: "User ID", copyable: true },
//             { path: ["metadata", "version"], label: "Schema version" },
//             { path: ["metadata", "createdAt"], label: "Account created", type: "datetime" },
//             { path: ["metadata", "updatedAt"], label: "Last updated", type: "datetime" },
//             { path: ["metadata", "accountStatus"], label: "Account status", badge: true },
//             { path: ["metadata", "accountTier"], label: "Account tier", badge: true },
//             { path: ["metadata", "role"], label: "Role", badge: true },
//             { path: ["metadata", "is_active"], label: "Active account", type: "boolean" },
//         ],
//     },
//     {
//         id: "network",
//         title: "Network information",
//         description: "Technical fields that are recorded by the application and are not editable here.",
//         icon: FiActivity,
//         readOnly: true,
//         fields: [
//             { path: ["network", "ipAddress"], label: "IP address", copyable: true },
//             { path: ["network", "ipv6"], label: "IPv6 address", copyable: true },
//             { path: ["network", "macAddress"], label: "MAC address", copyable: true },
//             { path: ["network", "domain"], label: "Domain" },
//             { path: ["network", "userAgent"], label: "User agent", span: 2 },
//         ],
//     },
//     {
//         id: "security",
//         title: "Security credentials",
//         description: "Credential hashes and verification secrets are never displayed or edited on this page.",
//         icon: FiLock,
//         readOnly: true,
//         fields: [
//             { path: ["password"], label: "Password", type: "credential" },
//         ],
//     },
// ];

// const ALL_SECTIONS = [...SECTIONS, ...READ_ONLY_SECTIONS];

// function getPath(object, path) {
//     return path.reduce((current, part) => current?.[part], object);
// }

// function setPath(object, path, value) {
//     let current = object;
//     path.forEach((part, index) => {
//         if (index === path.length - 1) {
//             current[part] = value;
//             return;
//         }
//         if (!current[part] || typeof current[part] !== "object") {
//             current[part] = {};
//         }
//         current = current[part];
//     });
// }

// function deepClone(value) {
//     if (typeof structuredClone === "function") return structuredClone(value ?? {});
//     return JSON.parse(JSON.stringify(value ?? {}));
// }

// function normalizeUser(raw) {
//     const source = raw?.user ?? raw?.data?.user ?? raw?.data ?? raw;
//     if (!source || typeof source !== "object") return null;
//     if (source.profile && typeof source.profile === "object" && !source.personal) {
//         return { id: source.id, ...source.profile };
//     }
//     return source;
// }

// function isTrue(value) {
//     return value === true || value === 1 || String(value).toLowerCase() === "true" || String(value).toLowerCase() === "yes";
// }

// function dateInputValue(value) {
//     if (!value) return "";
//     const date = new Date(value);
//     return Number.isNaN(date.getTime()) ? "" : date.toISOString().slice(0, 10);
// }

// function formatDate(value, withTime = false) {
//     if (!value) return "—";
//     const date = new Date(value);
//     if (Number.isNaN(date.getTime())) return String(value);
//     return new Intl.DateTimeFormat(undefined, {
//         day: "2-digit",
//         month: "short",
//         year: "numeric",
//         ...(withTime ? { hour: "2-digit", minute: "2-digit" } : {}),
//     }).format(date);
// }

// function friendlyLanguage(value) {
//     if (typeof value !== "string") return value;
//     try {
//         const parsed = JSON.parse(value.replace(/&quot;/g, '"'));
//         if (parsed?.name) return parsed.alpha2 ? `${parsed.name} (${parsed.alpha2})` : parsed.name;
//     } catch {
//         // Leave non-JSON language values unchanged.
//     }
//     return value.replace(/&quot;/g, '"');
// }

// function maskValue(value, type) {
//     if (value === null || value === undefined || value === "") return "—";
//     const text = String(value);
//     if (type === "card") {
//         const digits = text.replace(/\D/g, "");
//         return digits ? `•••• •••• •••• ${digits.slice(-4)}` : "Saved card";
//     }
//     const visible = type === "iban" ? 4 : 3;
//     return text.length <= visible ? "•".repeat(text.length) : `${"•".repeat(Math.min(12, text.length - visible))}${text.slice(-visible)}`;
// }

// function readableValue(value, field) {
//     if (field.type === "credential") return "Managed securely. The password hash is never displayed.";
//     if (field.type === "protected") return "Not returned or displayed for security.";
//     if (field.type === "secretReplace") return maskValue(value, "card");
//     if (field.sensitive) return maskValue(value, field.path.at(-1) === "iban" ? "iban" : "sensitive");
//     if (field.type === "datetime") return formatDate(value, true);
//     if (field.type === "date") return formatDate(value);
//     if (field.type === "boolean") return isTrue(value) ? "Yes" : "No";
//     if (field.path.join(".") === "preferences.language") return friendlyLanguage(value) || "—";
//     if (value === null || value === undefined || value === "") return "—";
//     return String(value);
// }

// function statusClasses(value) {
//     const status = String(value ?? "").toLowerCase();
//     if (["active", "enabled", "verified", "true"].includes(status)) return "bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-400/10 dark:text-emerald-300";
//     if (["pending", "invited", "unverified"].includes(status)) return "bg-amber-50 text-amber-700 ring-amber-600/20 dark:bg-amber-400/10 dark:text-amber-300";
//     if (["banned", "blocked", "suspended", "disabled", "inactive", "false"].includes(status)) return "bg-rose-50 text-rose-700 ring-rose-600/20 dark:bg-rose-400/10 dark:text-rose-300";
//     return "bg-slate-100 text-slate-700 ring-slate-500/20 dark:bg-slate-800 dark:text-slate-300";
// }

// function FieldControl({ field, value, onChange, sensitiveValue, onSensitiveChange }) {
//     const baseClass = "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-violet-400 focus:ring-4 focus:ring-violet-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-violet-500 dark:focus:ring-violet-500/10";

//     if (field.type === "protected" || field.type === "credential") {
//         return (
//             <div className="flex min-h-11 items-center gap-2 rounded-xl border border-dashed border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-950/60 dark:text-slate-400">
//                 <FiLock size={15} className="shrink-0" />
//                 {readableValue(value, field)}
//             </div>
//         );
//     }

//     if (field.type === "secretReplace") {
//         return (
//             <div className="space-y-2">
//                 <div className="rounded-lg bg-slate-100 px-3 py-2 text-xs text-slate-500 dark:bg-slate-800 dark:text-slate-400">
//                     Saved value: {maskValue(value, "card")}
//                 </div>
//                 <input
//                     className={baseClass}
//                     type="password"
//                     autoComplete="off"
//                     inputMode="numeric"
//                     value={sensitiveValue || ""}
//                     onChange={(event) => onSensitiveChange(event.target.value)}
//                     placeholder="Enter a replacement card number"
//                 />
//                 <p className="text-xs leading-5 text-slate-500">Leave blank to keep the current value. CVV and PIN are not collected here.</p>
//             </div>
//         );
//     }

//     if (field.type === "textarea") {
//         return (
//             <textarea
//                 className={`${baseClass} min-h-28 resize-y`}
//                 value={value ?? ""}
//                 onChange={(event) => onChange(event.target.value)}
//                 placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
//                 rows={4}
//                 required={field.required}
//             />
//         );
//     }

//     if (field.type === "checkbox") {
//         return (
//             <label className="flex min-h-11 cursor-pointer items-center justify-between rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 dark:border-slate-700 dark:bg-slate-950">
//                 <span className="text-sm text-slate-600 dark:text-slate-300">{isTrue(value) ? "Enabled" : "Disabled"}</span>
//                 <input
//                     type="checkbox"
//                     checked={isTrue(value)}
//                     onChange={(event) => onChange(event.target.checked)}
//                     className="h-4 w-4 rounded border-slate-300 text-violet-600 focus:ring-violet-500"
//                 />
//             </label>
//         );
//     }

//     if (field.type === "select") {
//         return (
//             <select className={baseClass} value={value ?? ""} onChange={(event) => onChange(event.target.value)}>
//                 <option value="">Select {field.label.toLowerCase()}</option>
//                 {field.options.map((option) => <option key={option} value={option}>{option.replace(/[_-]+/g, " ").replace(/\b\w/g, (character) => character.toUpperCase())}</option>)}
//             </select>
//         );
//     }

//     const inputType = field.type === "datetime" ? "text" : (field.type || "text");
//     const inputValue = field.type === "date" ? dateInputValue(value) : (value ?? "");

//     return (
//         <div className="flex items-center gap-2">
//             {field.type === "color" && (
//                 <input
//                     type="color"
//                     value={/^#[0-9a-f]{6}$/i.test(String(inputValue)) ? inputValue : "#7c3aed"}
//                     onChange={(event) => onChange(event.target.value)}
//                     aria-label={field.label}
//                     className="h-11 w-12 shrink-0 cursor-pointer rounded-lg border border-slate-200 bg-white p-1 dark:border-slate-700 dark:bg-slate-950"
//                 />
//             )}
//             <input
//                 className={baseClass}
//                 type={inputType === "color" ? "text" : inputType}
//                 step={field.step}
//                 value={inputValue}
//                 onChange={(event) => onChange(event.target.value)}
//                 placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
//                 required={field.required}
//                 inputMode={field.type === "number" ? "decimal" : undefined}
//                 autoComplete="off"
//             />
//         </div>
//     );
// }

// function ProfileField({ field, profile, editing, draft, onFieldChange, sensitiveEdits, onSensitiveChange }) {
//     const value = getPath(editing ? draft : profile, field.path);
//     const isEditable = editing && !field.readOnly && field.type !== "protected" && field.type !== "credential";
//     const displayValue = readableValue(value, field);

//     return (
//         <div className={`min-w-0 ${field.span === 2 ? "sm:col-span-2" : ""}`}>
//             <dt className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
//                 {field.label}
//                 {field.required && editing && <span className="text-rose-500">*</span>}
//                 {field.sensitive && !editing && <FiLock size={11} aria-label="Sensitive value masked" />}
//             </dt>
//             <dd>
//                 {isEditable ? (
//                     <FieldControl
//                         field={field}
//                         value={value}
//                         onChange={(nextValue) => onFieldChange(field.path, nextValue)}
//                         sensitiveValue={sensitiveEdits[field.path.join(".")]}
//                         onSensitiveChange={(nextValue) => onSensitiveChange(field.path.join("."), nextValue)}
//                     />
//                 ) : (
//                     <div className="flex min-h-11 items-center gap-2 rounded-xl border border-transparent bg-slate-50/80 px-3.5 py-2.5 dark:bg-slate-950/50">
//                         {field.badge ? (
//                             <span className={`inline-flex max-w-full items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${statusClasses(value)}`}>
//                                 {displayValue === "—" ? displayValue : displayValue.replace(/[_-]+/g, " ").replace(/\b\w/g, (character) => character.toUpperCase())}
//                             </span>
//                         ) : (
//                             <span className="min-w-0 whitespace-pre-wrap break-words text-sm leading-5 text-slate-800 dark:text-slate-200">
//                                 {displayValue}
//                             </span>
//                         )}
//                         {field.copyable && value && (
//                             <button
//                                 type="button"
//                                 onClick={async () => {
//                                     try { await navigator.clipboard.writeText(String(value)); } catch { /* Clipboard can be unavailable. */ }
//                                 }}
//                                 className="ml-auto shrink-0 text-xs font-semibold text-violet-700 hover:text-violet-900 dark:text-violet-300"
//                             >
//                                 Copy
//                             </button>
//                         )}
//                     </div>
//                 )}
//                 {field.type === "secretReplace" && !editing && null}
//             </dd>
//         </div>
//     );
// }

// function ProfileSection({ section, profile, editing, draft, onFieldChange, sensitiveEdits, onSensitiveChange }) {
//     const Icon = section.icon;

//     return (
//         <section id={section.id} className="scroll-mt-24 overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
//             <header className="flex items-start gap-3 border-b border-slate-100 px-5 py-5 dark:border-slate-800 sm:px-6">
//                 <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-700 dark:bg-violet-500/10 dark:text-violet-300">
//                     <Icon size={19} />
//                 </div>
//                 <div className="min-w-0 flex-1">
//                     <h2 className="text-base font-semibold text-slate-900 dark:text-white">{section.title}</h2>
//                     <p className="mt-1 text-sm leading-5 text-slate-500 dark:text-slate-400">{section.description}</p>
//                 </div>
//                 {editing && !section.readOnly && (
//                     <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-violet-50 px-2 py-1 text-[11px] font-semibold text-violet-700 dark:bg-violet-500/10 dark:text-violet-300">
//                         <FiEdit3 size={11} /> Editing
//                     </span>
//                 )}
//             </header>

//             <dl className="grid grid-cols-1 gap-x-6 gap-y-5 p-5 sm:grid-cols-2 sm:p-6">
//                 {section.fields.map((field) => (
//                     <ProfileField
//                         key={field.path.join(".")}
//                         field={{ ...field, readOnly: field.readOnly || section.readOnly }}
//                         profile={profile}
//                         editing={editing}
//                         draft={draft}
//                         onFieldChange={onFieldChange}
//                         sensitiveEdits={sensitiveEdits}
//                         onSensitiveChange={onSensitiveChange}
//                     />
//                 ))}
//             </dl>
//         </section>
//     );
// }

// function buildEditablePatch(draft) {
//     const payload = {};

//     for (const section of SECTIONS) {
//         for (const field of section.fields) {
//             if (field.type === "protected" || field.type === "credential" || field.type === "secretReplace") continue;
//             const value = getPath(draft, field.path);
//             if (value !== undefined) setPath(payload, field.path, value);
//         }
//     }

//     return payload;
// }

// function mergeProfile(current, patch) {
//     const result = deepClone(current || {});
//     function merge(target, source) {
//         Object.entries(source || {}).forEach(([key, value]) => {
//             if (value && typeof value === "object" && !Array.isArray(value)) {
//                 if (!target[key] || typeof target[key] !== "object" || Array.isArray(target[key])) target[key] = {};
//                 merge(target[key], value);
//             } else {
//                 target[key] = value;
//             }
//         });
//         return target;
//     }
//     return merge(result, patch);
// }

// export default function ProfilePage() {
//     const auth = useAuth();
//     const authUser = normalizeUser(auth?.user);

//     const [profile, setProfile] = useState(() => authUser || null);
//     const [draft, setDraft] = useState(null);
//     const [isLoading, setIsLoading] = useState(!authUser);
//     const [isSaving, setIsSaving] = useState(false);
//     const [isEditing, setIsEditing] = useState(false);
//     const [error, setError] = useState("");
//     const [success, setSuccess] = useState("");
//     const [sensitiveEdits, setSensitiveEdits] = useState({});
//     const [activeSection, setActiveSection] = useState("personal");
//     const [showScrollTop, setShowScrollTop] = useState(false); // Scroll to top state

//     const loadProfile = useCallback(async () => {
//         if (authUser?.id) {
//             setProfile(authUser);
//             setIsLoading(false);
//             return;
//         }

//         setIsLoading(true);
//         setError("");
//         try {
//             const result = normalizeUser(await apiGet("/auth/me/"));
//             setProfile(result);
//         } catch (err) {
//             setError(err?.message || "Unable to load your profile.");
//         } finally {
//             setIsLoading(false);
//         }
//     }, [authUser]);

//     useEffect(() => {
//         let active = true;

//         async function load() {
//             if (authUser?.id) {
//                 setProfile(authUser);
//                 setIsLoading(false);
//                 return;
//             }

//             setIsLoading(true);
//             try {
//                 const result = normalizeUser(await apiGet("/auth/me/"));
//                 if (active) setProfile(result);
//             } catch (err) {
//                 if (active) setError(err?.message || "Unable to load your profile.");
//             } finally {
//                 if (active) setIsLoading(false);
//             }
//         }

//         load();
//         return () => { active = false; };
//     }, [authUser?.id]);

//     const onFieldChange = useCallback((path, value) => {
//         setDraft((current) => {
//             const next = deepClone(current || profile || {});
//             setPath(next, path, value);
//             return next;
//         });
//     }, [profile]);

//     const onSensitiveChange = useCallback((key, value) => {
//         setSensitiveEdits((current) => ({ ...current, [key]: value }));
//     }, []);

//     function startEditing() {
//         setDraft(deepClone(profile || {}));
//         setSensitiveEdits({});
//         setError("");
//         setSuccess("");
//         setIsEditing(true);
//     }

//     function cancelEditing() {
//         setDraft(null);
//         setSensitiveEdits({});
//         setError("");
//         setIsEditing(false);
//     }

//     async function handleSave(event) {
//         event.preventDefault();
//         if (!draft || isSaving) return;

//         setIsSaving(true);
//         setError("");
//         setSuccess("");

//         try {
//             const payload = buildEditablePatch(draft);
//             const replacementCardNumber = sensitiveEdits["financial.creditCard.number"]?.trim();
//             if (replacementCardNumber) {
//                 setPath(payload, ["financial", "creditCard", "number"], replacementCardNumber);
//             }

//             const response = await apiPatch("/auth/me/", payload);
//             let saved = normalizeUser(response);
//             if (!saved?.id) saved = mergeProfile(profile, payload);

//             setProfile(saved);
//             setDraft(deepClone(saved));
//             setSensitiveEdits({});
//             setIsEditing(false);
//             setSuccess("Your profile has been updated.");

//             // Refresh shared auth state when the application's AuthContext exposes a refresh method.
//             if (typeof auth?.refreshUser === "function") {
//                 try {
//                     const refreshed = normalizeUser(await auth.refreshUser());
//                     if (refreshed?.id) setProfile(refreshed);
//                 } catch {
//                     // The saved profile remains visible even if context refresh fails.
//                 }
//             } else if (typeof auth?.setUser === "function") {
//                 auth.setUser(saved);
//             }
//         } catch (err) {
//             setError(err?.message || "Unable to save your profile. Please try again.");
//         } finally {
//             setIsSaving(false);
//         }
//     }

//     const scrollToTop = useCallback(() => {
//         window.scrollTo({ top: 150, behavior: "smooth" });
//     }, []);

//     const displayProfile = isEditing ? (draft || profile || {}) : (profile || {});
//     const personal = displayProfile.personal || {};
//     const contact = displayProfile.contact || {};
//     const metadata = displayProfile.metadata || {};
//     const fullName = personal.displayName || [personal.prefix, personal.firstName, personal.middle, personal.lastName, personal.suffix].filter(Boolean).join(" ") || contact.username || contact.email || "Your profile";
//     const initials = fullName.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase() || "U";
//     const avatar = personal.avatar;

//     const anchors = useMemo(() => ALL_SECTIONS.map(({ id, title, icon }) => ({ id, title, icon })), []);

//     // Keep the section navigation highlight synchronized with the visible section.
//     useEffect(() => {
//         const updateActiveSection = () => {
//             setShowScrollTop(window.scrollY > 1000);
            
//             const atPageBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;
//             if (atPageBottom) {
//                 setActiveSection(ALL_SECTIONS[ALL_SECTIONS.length - 1].id);
//                 return;
//             }

//             const activationLine = window.scrollY + Math.min(window.innerHeight * 0.32, 260);
//             let nextActiveSection = ALL_SECTIONS[0].id;

//             for (const section of ALL_SECTIONS) {
//                 const element = document.getElementById(section.id);
//                 if (!element) continue;
//                 if (element.getBoundingClientRect().top + window.scrollY <= activationLine) {
//                     nextActiveSection = section.id;
//                 } else {
//                     break;
//                 }
//             }

//             setActiveSection((current) => current === nextActiveSection ? current : nextActiveSection);
//         };

//         updateActiveSection();
//         window.addEventListener("scroll", updateActiveSection, { passive: true });
//         window.addEventListener("resize", updateActiveSection);
//         return () => {
//             window.removeEventListener("scroll", updateActiveSection);
//             window.removeEventListener("resize", updateActiveSection);
//         };
//     }, [profile, isLoading]);

//     if (isLoading) {
//         return (
//             <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 dark:bg-slate-950">
//                 <div className="flex flex-col items-center gap-3 rounded-2xl border border-slate-200 bg-white px-10 py-10 shadow-sm dark:border-slate-800 dark:bg-slate-900">
//                     <FiRefreshCw size={24} className="animate-spin text-violet-600" />
//                     <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Loading your profile...</p>
//                 </div>
//             </main>
//         );
//     }

//     if (!profile) {
//         return (
//             <main className="min-h-screen bg-slate-50 px-4 py-8 dark:bg-slate-950 sm:px-6 lg:px-8">
//                 <div className="mx-auto max-w-3xl">
//                     {/* <BreadcrumbBar items={[{ label: "Profile" }]} /> */}
//                     <div role="alert" className="mt-6 rounded-2xl border border-rose-200 bg-white p-6 dark:border-rose-900/50 dark:bg-slate-900">
//                         <h1 className="text-lg font-semibold text-slate-900 dark:text-white">Could not load your profile</h1>
//                         <p className="mt-2 text-sm text-rose-700 dark:text-rose-300">{error || "Your account information is not available."}</p>
//                         <RippleButton {...PRIMARY_BUTTON} variant="solid" size="sm" onClick={loadProfile} className="mt-5 inline-flex items-center gap-2 rounded-xl text-white">
//                             <FiRefreshCw size={15} /> Try again
//                         </RippleButton>
//                     </div>
//                 </div>
//             </main>
//         );
//     }

//     return (
//         <main className="min-h-screen bg-slate-50/80 px-4 py-6 text-slate-900 dark:bg-slate-950 dark:text-white sm:px-6 lg:px-8">
//             <div className="mx-auto max-w-7xl space-y-6">
//                 {/* <BreadcrumbBar items={[{ label: "Profile" }]} /> */}

//                 <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
//                     <div>
//                         <p className="text-sm font-semibold text-violet-700 dark:text-violet-300">Account settings</p>
//                         <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-950 dark:text-white sm:text-4xl">My profile</h1>
//                         <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400">
//                             View and manage your personal information, contact details, preferences, and account data.
//                         </p>
//                     </div>

//                     <div className="flex flex-wrap items-center gap-2">
//                         {isEditing ? (
//                             <>
//                                 <RippleButton {...MUTED_BUTTON} variant="outline" size="sm" disabled={isSaving} onClick={cancelEditing} className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
//                                     <FiX size={16} /> Cancel
//                                 </RippleButton>
//                                 <RippleButton {...PRIMARY_BUTTON} variant="solid" size="sm" type="submit" form="profile-form" disabled={isSaving} className="inline-flex h-10 items-center gap-2 rounded-xl px-4 text-sm font-semibold text-white disabled:opacity-60">
//                                     {isSaving ? <FiRefreshCw size={16} className="animate-spin" /> : <FiSave size={16} />}
//                                     {isSaving ? "Saving..." : "Save changes"}
//                                 </RippleButton>
//                             </>
//                         ) : (
//                             <RippleButton {...PRIMARY_BUTTON} variant="solid" size="sm" onClick={startEditing} className="inline-flex h-10 items-center gap-2 rounded-xl px-4 text-sm font-semibold text-white">
//                                 <FiEdit3 size={16} /> Edit profile
//                             </RippleButton>
//                         )}
//                     </div>
//                 </header>

//                 {error && (
//                     <div role="alert" className="flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 dark:border-rose-900/60 dark:bg-rose-950/30">
//                         <FiInfo size={18} className="mt-0.5 shrink-0 text-rose-600 dark:text-rose-300" />
//                         <p className="text-sm leading-5 text-rose-800 dark:text-rose-200">{error}</p>
//                     </div>
//                 )}

//                 {success && (
//                     <div role="status" className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 dark:border-emerald-900/60 dark:bg-emerald-950/30">
//                         <FiCheckCircle size={18} className="shrink-0 text-emerald-600 dark:text-emerald-300" />
//                         <p className="text-sm font-medium text-emerald-800 dark:text-emerald-200">{success}</p>
//                         <button type="button" onClick={() => setSuccess("")} className="ml-auto text-xs font-semibold text-emerald-700 hover:text-emerald-900 dark:text-emerald-300">Dismiss</button>
//                     </div>
//                 )}

//                 <form id="profile-form" onSubmit={handleSave}>
//                     <section className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
//                         <div className="h-28 bg-gradient-to-r from-violet-600 via-indigo-500 to-fuchsia-500 sm:h-36" />
//                         <div className="px-5 pb-5 sm:px-7 sm:pb-7">
//                             <div className="-mt-12 flex flex-col gap-4 sm:-mt-14 sm:flex-row sm:items-end sm:justify-between">
//                                 <div className="flex min-w-0 items-end gap-4">
//                                     {avatar ? (
//                                         <img src={avatar} alt={`${fullName} avatar`} className="h-24 w-24 shrink-0 rounded-2xl border-4 border-white bg-white object-cover shadow-md dark:border-slate-900 sm:h-28 sm:w-28" onError={(event) => { event.currentTarget.style.display = "none"; }} />
//                                     ) : (
//                                         <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-2xl border-4 border-white bg-gradient-to-br from-violet-600 to-indigo-600 text-2xl font-bold text-white shadow-md dark:border-slate-900 sm:h-28 sm:w-28">
//                                             {initials}
//                                         </div>
//                                     )}
//                                     <div className="min-w-0 pb-1">
//                                         <h2 className="truncate text-xl font-bold text-slate-950 dark:text-white sm:text-2xl">{fullName}</h2>
//                                         <p className="mt-1 truncate text-sm text-slate-500 dark:text-slate-400">{contact.email || "No email address"}</p>
//                                         <div className="mt-2 flex flex-wrap items-center gap-2">
//                                             {metadata.role && <span className="rounded-full bg-violet-50 px-2.5 py-1 text-xs font-semibold text-violet-700 dark:bg-violet-500/10 dark:text-violet-300">{String(metadata.role).replace(/\b\w/g, (character) => character.toUpperCase())}</span>}
//                                             {metadata.accountStatus && <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${statusClasses(metadata.accountStatus)}`}>{String(metadata.accountStatus).replace(/\b\w/g, (character) => character.toUpperCase())}</span>}
//                                         </div>
//                                     </div>
//                                 </div>

//                                 <div className="grid grid-cols-2 gap-3 sm:min-w-64">
//                                     <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-3 dark:border-slate-800 dark:bg-slate-950/60">
//                                         <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Account tier</p>
//                                         <p className="mt-1 text-sm font-semibold capitalize text-slate-900 dark:text-slate-100">{metadata.accountTier || "Standard"}</p>
//                                     </div>
//                                     <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-3 dark:border-slate-800 dark:bg-slate-950/60">
//                                         <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Member since</p>
//                                         <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-slate-100">{formatDate(metadata.createdAt)}</p>
//                                     </div>
//                                 </div>
//                             </div>
//                             {isEditing && <p className="mt-5 text-xs leading-5 text-slate-500 dark:text-slate-400">Edit the fields below and select Save changes. System fields, network information, password hashes, CVV, and PIN remain protected.</p>}
//                         </div>
//                     </section>

//                     <div className="mt-6 grid grid-cols-1 items-start gap-6 lg:grid-cols-[240px_minmax(0,1fr)]">
//                         <aside className="lg:sticky lg:top-6">
//                             <nav aria-label="Profile sections" className="rounded-2xl border border-slate-200/90 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-900">
//                                 <p className="px-3 pb-2 pt-1 text-xs font-semibold uppercase tracking-wider text-slate-400">Profile sections</p>
//                                 <div className="grid grid-cols-2 gap-1 sm:grid-cols-3 lg:grid-cols-1">
//                                     {anchors.map(({ id, title, icon: Icon }) => {
//                                         const isActive = activeSection === id;
//                                         return (
//                                             <a
//                                                 key={id}
//                                                 href={`#${id}`}
//                                                 aria-current={isActive ? "location" : undefined}
//                                                 onClick={() => setActiveSection(id)}
//                                                 className={`group flex min-w-0 items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-300 ${
//                                                     isActive
//                                                         ? "bg-violet-100 text-violet-800 shadow-sm ring-1 ring-inset ring-violet-200 dark:bg-violet-500/15 dark:text-violet-200 dark:ring-violet-400/20"
//                                                         : "text-slate-600 hover:bg-violet-50 hover:text-violet-700 dark:text-slate-300 dark:hover:bg-violet-500/10 dark:hover:text-violet-300"
//                                                 }`}
//                                             >
//                                                 <Icon size={16} className={`shrink-0 ${isActive ? "text-violet-700 dark:text-violet-300" : "text-slate-400 group-hover:text-violet-600 dark:group-hover:text-violet-300"}`} />
//                                                 <span className="truncate">{title}</span>
//                                                 <FiChevronRight size={14} className={`ml-auto hidden shrink-0 lg:block ${isActive ? "text-violet-500 dark:text-violet-300" : "text-slate-300"}`} />
//                                             </a>
//                                         );
//                                     })}
//                                 </div>
//                             </nav>

//                             <div className="mt-4 rounded-2xl border border-violet-100 bg-violet-50/70 p-4 dark:border-violet-400/15 dark:bg-violet-500/5">
//                                 <div className="flex items-center gap-2 text-violet-800 dark:text-violet-200">
//                                     <FiShield size={17} />
//                                     <h3 className="text-sm font-semibold">Privacy and security</h3>
//                                 </div>
//                                 <p className="mt-2 text-xs leading-5 text-violet-800/80 dark:text-violet-200/75">
//                                     Password hashes, card CVV, and card PIN are not displayed. Network and account-control fields are read-only.
//                                 </p>
//                                 <Link to="/settings" className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-violet-700 hover:text-violet-900 dark:text-violet-300 dark:hover:text-violet-100">
//                                     Account settings <FiChevronRight size={13} />
//                                 </Link>
//                             </div>
//                         </aside>

//                         <div className="min-w-0 space-y-6">
//                             {SECTIONS.map((section) => (
//                                 <ProfileSection
//                                     key={section.id}
//                                     section={section}
//                                     profile={profile}
//                                     editing={isEditing}
//                                     draft={draft}
//                                     onFieldChange={onFieldChange}
//                                     sensitiveEdits={sensitiveEdits}
//                                     onSensitiveChange={onSensitiveChange}
//                                 />
//                             ))}
//                             {READ_ONLY_SECTIONS.map((section) => (
//                                 <ProfileSection
//                                     key={section.id}
//                                     section={section}
//                                     profile={profile}
//                                     editing={isEditing}
//                                     draft={draft}
//                                     onFieldChange={onFieldChange}
//                                     sensitiveEdits={sensitiveEdits}
//                                     onSensitiveChange={onSensitiveChange}
//                                 />
//                             ))}
//                         </div>
//                     </div>

//                     {isEditing && (
//                         <div className="sticky bottom-4 z-20 mt-6 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-xl shadow-slate-900/10 backdrop-blur sm:flex-row sm:items-center sm:justify-between dark:border-slate-700 dark:bg-slate-900/95">
//                             <p className="text-xs leading-5 text-slate-500 dark:text-slate-400">Only editable profile fields will be sent to the API. Account permissions and network values are not changed.</p>
//                             <div className="flex shrink-0 items-center justify-end gap-2">
//                                 <RippleButton {...MUTED_BUTTON} variant="outline" size="sm" disabled={isSaving} onClick={cancelEditing} className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
//                                     <FiX size={15} /> Cancel
//                                 </RippleButton>
//                                 <RippleButton {...PRIMARY_BUTTON} variant="solid" size="sm" type="submit" disabled={isSaving} className="inline-flex h-10 items-center gap-2 rounded-xl px-4 text-sm font-semibold text-white disabled:opacity-60">
//                                     {isSaving ? <FiRefreshCw size={15} className="animate-spin" /> : <FiCheck size={16} />}
//                                     {isSaving ? "Saving..." : "Save changes"}
//                                 </RippleButton>
//                             </div>
//                         </div>
//                     )}
//                 </form>

//                 <p className="text-center text-xs text-slate-400">Profile information is loaded from your authenticated account.</p>
                
//                 {showScrollTop && (
//                     <RippleButton
//                         hue={270}
//                         saturation={75}
//                         lightness={50}
//                         variant="soft"
//                         onClick={scrollToTop}
//                         aria-label="Scroll to top"
//                         className={`fixed right-6 z-50 h-12 w-12 rounded-full shadow-xl shadow-violet-900/20 transition-all duration-1000 hover:-translate-y-1 ${
//                             isEditing ? "bottom-24" : "bottom-6"
//                         }`}
//                     >
//                         <FaArrowUp size={24} />
//                     </RippleButton>
//                 )}
//             </div>
//         </main>
//     );
// }
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import {
    FiActivity,
    FiAlertCircle,
    FiBriefcase,
    FiCheck,
    FiCheckCircle,
    FiChevronDown,
    FiChevronRight,
    FiCopy,
    FiCreditCard,
    FiEdit3,
    FiEye,
    FiEyeOff,
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
import { FaArrowUp } from "react-icons/fa6";

import { apiGet, apiPatch } from "@/api/client";
import { useAuth } from "@/context/AuthContext";
import { RippleButton } from "@/components/RippleButton";
// import BreadcrumbBar from "@/components/navigation/BreadcrumbBar";

const PRIMARY_BUTTON = { hue: 270, saturation: 75, lightness: 55 };
const MUTED_BUTTON = { hue: 220, saturation: 12, lightness: 45 };

const SECTIONS = [
    {
        id: "personal",
        title: "Personal information",
        description: "Your name, profile image, and personal identity details.",
        icon: FiUser,
        fields: [
            { path: ["personal", "prefix"], label: "Prefix", placeholder: "Ms., Dr., etc." },
            { path: ["personal", "firstName"], label: "First name", required: true },
            { path: ["personal", "middle"], label: "Middle name" },
            { path: ["personal", "lastName"], label: "Last name", required: true },
            { path: ["personal", "suffix"], label: "Suffix", placeholder: "Jr., III, etc." },
            { path: ["personal", "displayName"], label: "Display name" },
            { path: ["personal", "dob"], label: "Date of birth", type: "date" },
            { path: ["personal", "gender"], label: "Gender", type: "select", options: ["male", "female", "non_binary", "prefer_not_to_say"] },
            { path: ["personal", "genderType"], label: "Gender identity", type: "select", options: ["male", "female", "non_binary", "prefer_not_to_say"] },
            { path: ["personal", "zodiac"], label: "Zodiac sign" },
            { path: ["personal", "avatar"], label: "Avatar URL", type: "url", span: 2, placeholder: "https://example.com/avatar.jpg" },
            { path: ["personal", "bio"], label: "Biography", type: "textarea", span: 2, placeholder: "Write a short introduction about yourself..." },
        ],
    },
    {
        id: "contact",
        title: "Contact information",
        description: "Primary communication channels and public links.",
        icon: FiActivity,
        fields: [
            { path: ["contact", "email"], label: "Primary email", type: "email", required: true },
            { path: ["contact", "username"], label: "Username", required: true, mono: true },
            { path: ["contact", "secondaryEmail"], label: "Secondary email", type: "email" },
            { path: ["contact", "phone"], label: "Phone", type: "tel" },
            { path: ["contact", "fax"], label: "Fax", type: "tel" },
            { path: ["contact", "website"], label: "Website", type: "url", span: 2, placeholder: "https://yourdomain.com" },
        ],
    },
    {
        id: "location",
        title: "Location",
        description: "Residential address, regional settings, and coordinates.",
        icon: FiMapPin,
        fields: [
            { path: ["location", "address"], label: "Street address", span: 2 },
            { path: ["location", "secondaryAddress"], label: "Apartment, suite, etc.", span: 2 },
            { path: ["location", "city"], label: "City" },
            { path: ["location", "state"], label: "State / Province" },
            { path: ["location", "zip"], label: "Postal code", mono: true },
            { path: ["location", "country"], label: "Country" },
            { path: ["location", "countryCode"], label: "Country code", mono: true },
            { path: ["location", "continent"], label: "Continent" },
            { path: ["location", "timezone"], label: "Time zone" },
            { path: ["location", "latitude"], label: "Latitude", type: "number", step: "any", mono: true },
            { path: ["location", "longitude"], label: "Longitude", type: "number", step: "any", mono: true },
        ],
    },
    {
        id: "professional",
        title: "Professional information",
        description: "Your current role, organization details, and industry focus.",
        icon: FiBriefcase,
        fields: [
            { path: ["professional", "jobTitle"], label: "Job title" },
            { path: ["professional", "jobDescriptor"], label: "Seniority / Level" },
            { path: ["professional", "jobArea"], label: "Department / Area" },
            { path: ["professional", "jobType"], label: "Employment type" },
            { path: ["professional", "company", "name"], label: "Company name" },
            { path: ["professional", "company", "industry"], label: "Industry" },
            { path: ["professional", "company", "catchPhrase"], label: "Company tagline", span: 2 },
            { path: ["professional", "company", "bs"], label: "Business focus", span: 2 },
        ],
    },
    {
        id: "preferences",
        title: "Preferences",
        description: "Customize your interface theme, language, and alerts.",
        icon: FiGlobe,
        fields: [
            { path: ["preferences", "color"], label: "Accent color name" },
            { path: ["preferences", "colorHex"], label: "Accent color hex", type: "color", mono: true },
            { path: ["preferences", "language"], label: "Language", span: 2 },
            { path: ["preferences", "theme"], label: "Interface theme", type: "select", options: ["light", "dark", "system"] },
            { path: ["preferences", "notificationsEnabled"], label: "Notifications", type: "checkbox" },
        ],
    },
    {
        id: "assets",
        title: "Vehicle and assets",
        description: "Registered vehicle details associated with your profile.",
        icon: FiHardDrive,
        fields: [
            { path: ["assets", "vehicle", "manufacturer"], label: "Manufacturer" },
            { path: ["assets", "vehicle", "model"], label: "Model" },
            { path: ["assets", "vehicle", "type"], label: "Body type" },
            { path: ["assets", "vehicle", "fuel"], label: "Fuel type" },
            { path: ["assets", "vehicle", "color"], label: "Exterior color" },
            { path: ["assets", "vehicle", "year"], label: "Model year" },
            { path: ["assets", "vehicle", "vin"], label: "VIN (Vehicle Identification Number)", span: 2, mono: true, copyable: true },
        ],
    },
    {
        id: "financial",
        title: "Financial information",
        description: "Banking and payment methods. Sensitive numbers are masked by default.",
        icon: FiCreditCard,
        fields: [
            { path: ["financial", "currency"], label: "Currency name" },
            { path: ["financial", "currencyCode"], label: "ISO code", mono: true },
            { path: ["financial", "currencySymbol"], label: "Symbol" },
            { path: ["financial", "iban"], label: "IBAN", sensitive: true, span: 2, mono: true },
            { path: ["financial", "bic"], label: "BIC / SWIFT", sensitive: true, mono: true },
            { path: ["financial", "accountNumber"], label: "Account number", sensitive: true, mono: true },
            { path: ["financial", "routingNumber"], label: "Routing number", sensitive: true, mono: true },
            { path: ["financial", "creditCard", "issuer"], label: "Card network" },
            { path: ["financial", "creditCard", "number"], label: "Card number", type: "secretReplace", sensitive: true, span: 2, mono: true },
            { path: ["financial", "creditCard", "expiration"], label: "Expiration date", type: "date" },
            { path: ["financial", "creditCard", "cvv"], label: "Security code (CVV)", type: "protected" },
            { path: ["financial", "creditCard", "pin"], label: "Card PIN", type: "protected" },
        ],
    },
];

const READ_ONLY_SECTIONS = [
    {
        id: "metadata",
        title: "Account & system metadata",
        description: "Managed automatically by the platform and organization administrators.",
        icon: FiShield,
        readOnly: true,
        fields: [
            { path: ["id"], label: "User ID", copyable: true, mono: true },
            { path: ["metadata", "version"], label: "Schema version", mono: true },
            { path: ["metadata", "createdAt"], label: "Account created", type: "datetime" },
            { path: ["metadata", "updatedAt"], label: "Last modified", type: "datetime" },
            { path: ["metadata", "accountStatus"], label: "Account status", badge: true },
            { path: ["metadata", "accountTier"], label: "Subscription tier", badge: true },
            { path: ["metadata", "role"], label: "System role", badge: true },
            { path: ["metadata", "is_active"], label: "Active status", type: "boolean", badge: true },
        ],
    },
    {
        id: "network",
        title: "Network telemetry",
        description: "Session and device telemetry recorded for security auditing.",
        icon: FiActivity,
        readOnly: true,
        fields: [
            { path: ["network", "ipAddress"], label: "IPv4 address", copyable: true, mono: true },
            { path: ["network", "ipv6"], label: "IPv6 address", copyable: true, mono: true },
            { path: ["network", "macAddress"], label: "MAC address", copyable: true, mono: true },
            { path: ["network", "domain"], label: "Domain", mono: true },
            { path: ["network", "userAgent"], label: "User agent string", span: 2, mono: true },
        ],
    },
    {
        id: "security",
        title: "Security credentials",
        description: "Cryptographic hashes and secrets are never exposed to the client.",
        icon: FiLock,
        readOnly: true,
        fields: [
            { path: ["password"], label: "Password hash", type: "credential" },
        ],
    },
];

const ALL_SECTIONS = [...SECTIONS, ...READ_ONLY_SECTIONS];

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
        if (!current[part] || typeof current[part] !== "object") {
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
    const source = raw?.user ?? raw?.data?.user ?? raw?.data ?? raw;
    if (!source || typeof source !== "object") return null;
    if (source.profile && typeof source.profile === "object" && !source.personal) {
        return { id: source.id, ...source.profile };
    }
    return source;
}

function isTrue(value) {
    return value === true || value === 1 || String(value).toLowerCase() === "true" || String(value).toLowerCase() === "yes";
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

function friendlyLanguage(value) {
    if (typeof value !== "string") return value;
    try {
        const parsed = JSON.parse(value.replace(/&quot;/g, '"'));
        if (parsed?.name) return parsed.alpha2 ? `${parsed.name} (${parsed.alpha2})` : parsed.name;
    } catch {
        // Leave non-JSON language values unchanged.
    }
    return value.replace(/&quot;/g, '"');
}

function maskValue(value, type) {
    if (value === null || value === undefined || value === "") return "—";
    const text = String(value);
    if (type === "card") {
        const digits = text.replace(/\D/g, "");
        return digits ? `•••• •••• •••• ${digits.slice(-4)}` : "Saved card";
    }
    const visible = type === "iban" ? 4 : 3;
    return text.length <= visible ? "•".repeat(text.length) : `${"•".repeat(Math.min(12, text.length - visible))}${text.slice(-visible)}`;
}

function readableValue(value, field) {
    if (field.type === "credential") return "Protected via one-way cryptographic hash";
    if (field.type === "protected") return "Omitted from client response for PCI security";
    if (field.type === "secretReplace") return maskValue(value, "card");
    if (field.sensitive) return maskValue(value, field.path.at(-1) === "iban" ? "iban" : "sensitive");
    if (field.type === "datetime") return formatDate(value, true);
    if (field.type === "date") return formatDate(value);
    if (field.type === "boolean" || field.type === "checkbox") return isTrue(value) ? "Enabled" : "Disabled";
    if (field.path.join(".") === "preferences.language") return friendlyLanguage(value) || "—";
    if (value === null || value === undefined || value === "") return "—";
    return String(value);
}

function statusClasses(value) {
    const status = String(value ?? "").toLowerCase();
    if (["active", "enabled", "verified", "true", "yes"].includes(status)) {
        return "bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-400/20";
    }
    if (["pending", "invited", "unverified"].includes(status)) {
        return "bg-amber-50 text-amber-700 ring-amber-600/20 dark:bg-amber-500/10 dark:text-amber-300 dark:ring-amber-400/20";
    }
    if (["banned", "blocked", "suspended", "disabled", "inactive", "false", "no"].includes(status)) {
        return "bg-rose-50 text-rose-700 ring-rose-600/20 dark:bg-rose-500/10 dark:text-rose-300 dark:ring-rose-400/20";
    }
    return "bg-violet-50 text-violet-700 ring-violet-600/20 dark:bg-violet-500/10 dark:text-violet-300 dark:ring-violet-400/20";
}

function CopyButton({ value, label }) {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(String(value));
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            // Clipboard unavailable
        }
    };

    return (
        <button
            type="button"
            onClick={handleCopy}
            aria-label={`Copy ${label}`}
            className={`inline-flex shrink-0 items-center gap-1.5 rounded-lg border px-2 py-1 text-xs font-medium transition-all ${
                copied
                    ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300"
                    : "border-slate-200/80 bg-white text-slate-600 hover:border-violet-200 hover:bg-violet-50 hover:text-violet-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400 dark:hover:border-violet-500/30 dark:hover:bg-violet-500/10 dark:hover:text-violet-300"
            }`}
        >
            {copied ? <FiCheck size={12} className="text-emerald-600 dark:text-emerald-400" /> : <FiCopy size={12} />}
            <span>{copied ? "Copied" : "Copy"}</span>
        </button>
    );
}

function FieldControl({ field, value, onChange, sensitiveValue, onSensitiveChange }) {
    const [revealed, setRevealed] = useState(false);

    const baseClass = `w-full rounded-xl border border-slate-200/90 bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-2xs outline-none transition duration-150 placeholder:text-slate-400 hover:border-slate-300 focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 dark:border-slate-700/80 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500 dark:hover:border-slate-600 dark:focus:border-violet-400 dark:focus:ring-violet-500/15 ${
        field.mono ? "font-mono text-xs sm:text-sm" : ""
    }`;

    if (field.type === "protected" || field.type === "credential") {
        return (
            <div className="flex min-h-10.5 items-center gap-2.5 rounded-xl border border-dashed border-slate-200 bg-slate-50/70 px-3.5 py-2.5 text-xs text-slate-500 dark:border-slate-800 dark:bg-slate-950/50 dark:text-slate-400">
                <FiLock size={14} className="shrink-0 text-slate-400" />
                <span>{readableValue(value, field)}</span>
            </div>
        );
    }

    if (field.type === "secretReplace") {
        return (
            <div className="space-y-2 rounded-xl border border-slate-200/80 bg-slate-50/50 p-3 dark:border-slate-800 dark:bg-slate-950/40">
                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                    <span>Current saved card</span>
                    <span className="font-mono font-medium text-slate-700 dark:text-slate-300">{maskValue(value, "card")}</span>
                </div>
                <div className="relative">
                    <input
                        className={`${baseClass} pr-10`}
                        type={revealed ? "text" : "password"}
                        autoComplete="off"
                        inputMode="numeric"
                        value={sensitiveValue || ""}
                        onChange={(event) => onSensitiveChange(event.target.value)}
                        placeholder="Enter new card number to replace..."
                    />
                    <button
                        type="button"
                        onClick={() => setRevealed((r) => !r)}
                        aria-label={revealed ? "Hide card number" : "Show card number"}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    >
                        {revealed ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                    </button>
                </div>
                <p className="text-[11px] leading-4 text-slate-400 dark:text-slate-500">
                    Leave blank to keep your existing card. CVV and PIN are never stored in plain text.
                </p>
            </div>
        );
    }

    if (field.type === "textarea") {
        return (
            <textarea
                className={`${baseClass} min-h-28 resize-y leading-relaxed`}
                value={value ?? ""}
                onChange={(event) => onChange(event.target.value)}
                placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
                rows={4}
                required={field.required}
            />
        );
    }

    if (field.type === "checkbox") {
        const checked = isTrue(value);
        return (
            <button
                type="button"
                role="switch"
                aria-checked={checked}
                onClick={() => onChange(!checked)}
                className="flex min-h-10.5 w-full items-center justify-between rounded-xl border border-slate-200/90 bg-white px-3.5 py-2 text-left transition hover:border-slate-300 focus:outline-none focus:ring-4 focus:ring-violet-500/10 dark:border-slate-700/80 dark:bg-slate-950"
            >
                <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                    {checked ? "Enabled" : "Disabled"}
                </span>
                <span
                    className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-200 ${
                        checked ? "bg-violet-600" : "bg-slate-200 dark:bg-slate-700"
                    }`}
                >
                    <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-xs transition-transform duration-200 ${
                            checked ? "translate-x-6" : "translate-x-1"
                        }`}
                    />
                </span>
            </button>
        );
    }

    if (field.type === "select") {
        return (
            <div className="relative">
                <select
                    className={`${baseClass} appearance-none pr-10`}
                    value={value ?? ""}
                    onChange={(event) => onChange(event.target.value)}
                >
                    <option value="">Select {field.label.toLowerCase()}...</option>
                    {field.options.map((option) => (
                        <option key={option} value={option}>
                            {option.replace(/[_-]+/g, " ").replace(/\b\w/g, (char) => char.toUpperCase())}
                        </option>
                    ))}
                </select>
                <FiChevronDown
                    size={16}
                    className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />
            </div>
        );
    }

    if (field.sensitive) {
        return (
            <div className="relative">
                <input
                    className={`${baseClass} pr-10`}
                    type={revealed ? "text" : "password"}
                    value={value ?? ""}
                    onChange={(event) => onChange(event.target.value)}
                    placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
                    autoComplete="off"
                />
                <button
                    type="button"
                    onClick={() => setRevealed((r) => !r)}
                    aria-label={revealed ? `Hide ${field.label}` : `Show ${field.label}`}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                    {revealed ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                </button>
            </div>
        );
    }

    const inputType = field.type === "datetime" ? "text" : (field.type || "text");
    const inputValue = field.type === "date" ? dateInputValue(value) : (value ?? "");

    return (
        <div className="flex items-center gap-2.5">
            {field.type === "color" && (
                <label className="relative flex h-10.5 w-12 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-white p-1 shadow-2xs dark:border-slate-700 dark:bg-slate-950">
                    <input
                        type="color"
                        value={/^#[0-9a-f]{6}$/i.test(String(inputValue)) ? inputValue : "#7c3aed"}
                        onChange={(event) => onChange(event.target.value)}
                        aria-label={field.label}
                        className="h-full w-full cursor-pointer rounded-lg border-0 bg-transparent p-0"
                    />
                </label>
            )}
            <input
                className={baseClass}
                type={inputType === "color" ? "text" : inputType}
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
    const isEmpty = displayValue === "—";
    const isColorHex = field.type === "color" && /^#[0-9a-f]{6}$/i.test(String(value ?? ""));

    return (
        <div
            className={`group min-w-0 ${field.span === 2 ? "sm:col-span-2" : ""} ${
                !isEditable
                    ? "rounded-xl border border-slate-100 bg-slate-50/40 p-3.5 transition-colors hover:border-slate-200/80 hover:bg-slate-50/90 dark:border-slate-800/60 dark:bg-slate-900/40 dark:hover:border-slate-800 dark:hover:bg-slate-800/40"
                    : ""
            }`}
        >
            <dt className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400">
                <span>{field.label}</span>
                {field.required && editing && <span className="text-rose-500" title="Required field">*</span>}
                {field.sensitive && !editing && (
                    <FiLock size={11} className="text-slate-400" title="Masked for privacy" aria-label="Sensitive value masked" />
                )}
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
                    <div className="flex min-h-6 items-center justify-between gap-3">
                        {field.badge && !isEmpty ? (
                            <span
                                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${statusClasses(
                                    field.type === "boolean" ? isTrue(value) : value
                                )}`}
                            >
                                <span className="h-1.5 w-1.5 rounded-full bg-current opacity-75" />
                                {displayValue.replace(/[_-]+/g, " ").replace(/\b\w/g, (char) => char.toUpperCase())}
                            </span>
                        ) : (
                            <div className="flex min-w-0 items-center gap-2">
                                {isColorHex && (
                                    <span
                                        className="h-4 w-4 shrink-0 rounded-full border border-slate-300 shadow-2xs dark:border-slate-600"
                                        style={{ backgroundColor: value }}
                                    />
                                )}
                                <span
                                    className={`min-w-0 whitespace-pre-wrap break-words text-sm leading-relaxed ${
                                        isEmpty
                                            ? "italic text-slate-400 dark:text-slate-600"
                                            : field.type === "protected" || field.type === "credential"
                                            ? "text-xs italic text-slate-500 dark:text-slate-400"
                                            : "font-medium text-slate-900 dark:text-slate-100"
                                    } ${field.mono && !isEmpty ? "font-mono text-xs sm:text-[13px]" : ""}`}
                                >
                                    {displayValue}
                                </span>
                            </div>
                        )}

                        {field.copyable && value && !isEmpty && <CopyButton value={value} label={field.label} />}
                    </div>
                )}
            </dd>
        </div>
    );
}

function ProfileSection({ section, profile, editing, draft, onFieldChange, sensitiveEdits, onSensitiveChange }) {
    const Icon = section.icon;

    return (
        <section
            id={section.id}
            className="scroll-mt-24 overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xs transition-shadow hover:shadow-md dark:border-slate-800/90 dark:bg-slate-900"
        >
            <header className="flex items-start justify-between gap-4 border-b border-slate-100 bg-slate-50/40 px-5 py-4 dark:border-slate-800/80 dark:bg-slate-900/50 sm:px-6 sm:py-5">
                <div className="flex items-start gap-3.5">
                    <div
                        className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ring-1 ring-inset ${
                            section.readOnly
                                ? "bg-slate-100 text-slate-600 ring-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-700"
                                : "bg-violet-50 text-violet-600 ring-violet-500/15 dark:bg-violet-500/10 dark:text-violet-300 dark:ring-violet-400/20"
                        }`}
                    >
                        <Icon size={18} />
                    </div>
                    <div className="min-w-0">
                        <h2 className="text-base font-semibold tracking-tight text-slate-900 dark:text-white">
                            {section.title}
                        </h2>
                        <p className="mt-0.5 text-xs leading-5 text-slate-500 dark:text-slate-400 sm:text-sm">
                            {section.description}
                        </p>
                    </div>
                </div>

                {section.readOnly ? (
                    <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                        <FiLock size={11} /> System Read-Only
                    </span>
                ) : editing ? (
                    <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-violet-50 px-2.5 py-1 text-[11px] font-semibold text-violet-700 ring-1 ring-inset ring-violet-600/20 dark:bg-violet-500/10 dark:text-violet-300">
                        <FiEdit3 size={11} /> Editable
                    </span>
                ) : null}
            </header>

            <dl className={`grid grid-cols-1 gap-4 p-5 sm:grid-cols-2 sm:p-6 ${editing ? "gap-x-6 gap-y-5" : ""}`}>
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

function ProfileSkeleton() {
    return (
        <main className="min-h-screen bg-slate-50/80 px-4 py-8 dark:bg-slate-950 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-7xl animate-pulse space-y-6">
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                    <div className="space-y-2.5">
                        <div className="h-4 w-28 rounded-md bg-slate-200 dark:bg-slate-800" />
                        <div className="h-9 w-56 rounded-xl bg-slate-200 dark:bg-slate-800" />
                        <div className="h-4 w-80 max-w-full rounded-md bg-slate-200 dark:bg-slate-800" />
                    </div>
                    <div className="h-10 w-32 rounded-xl bg-slate-200 dark:bg-slate-800" />
                </div>

                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
                    <div className="h-32 bg-slate-200 dark:bg-slate-800" />
                    <div className="px-6 pb-6">
                        <div className="-mt-12 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                            <div className="flex items-end gap-4">
                                <div className="h-24 w-24 rounded-2xl border-4 border-white bg-slate-300 dark:border-slate-900 dark:bg-slate-700" />
                                <div className="space-y-2 pb-1">
                                    <div className="h-6 w-48 rounded-lg bg-slate-200 dark:bg-slate-800" />
                                    <div className="h-4 w-36 rounded-md bg-slate-200 dark:bg-slate-800" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3 sm:w-72">
                                <div className="h-16 rounded-xl bg-slate-100 dark:bg-slate-800/60" />
                                <div className="h-16 rounded-xl bg-slate-100 dark:bg-slate-800/60" />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-[250px_minmax(0,1fr)]">
                    <div className="h-96 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900" />
                    <div className="space-y-6">
                        <div className="h-72 rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900" />
                        <div className="h-64 rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900" />
                    </div>
                </div>
            </div>
        </main>
    );
}

function buildEditablePatch(draft) {
    const payload = {};

    for (const section of SECTIONS) {
        for (const field of section.fields) {
            if (field.type === "protected" || field.type === "credential" || field.type === "secretReplace") continue;
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

export default function ProfilePage() {
    const auth = useAuth();
    const authUser = normalizeUser(auth?.user);

    const [profile, setProfile] = useState(() => authUser || null);
    const [draft, setDraft] = useState(null);
    const [isLoading, setIsLoading] = useState(!authUser);
    const [isSaving, setIsSaving] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [sensitiveEdits, setSensitiveEdits] = useState({});
    const [activeSection, setActiveSection] = useState("personal");
    const [showScrollTop, setShowScrollTop] = useState(false);
    const [avatarError, setAvatarError] = useState(false);

    const loadProfile = useCallback(async () => {
        if (authUser?.id) {
            setProfile(authUser);
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        setError("");
        try {
            const result = normalizeUser(await apiGet("/auth/me/"));
            setProfile(result);
        } catch (err) {
            setError(err?.message || "Unable to load your profile.");
        } finally {
            setIsLoading(false);
        }
    }, [authUser]);

    useEffect(() => {
        let active = true;

        async function load() {
            if (authUser?.id) {
                setProfile(authUser);
                setIsLoading(false);
                return;
            }

            setIsLoading(true);
            try {
                const result = normalizeUser(await apiGet("/auth/me/"));
                if (active) setProfile(result);
            } catch (err) {
                if (active) setError(err?.message || "Unable to load your profile.");
            } finally {
                if (active) setIsLoading(false);
            }
        }

        load();
        return () => {
            active = false;
        };
    }, [authUser?.id]);

    // Auto-dismiss success banner after 5 seconds
    useEffect(() => {
        if (!success) return;
        const timer = setTimeout(() => setSuccess(""), 5000);
        return () => clearTimeout(timer);
    }, [success]);

    const onFieldChange = useCallback(
        (path, value) => {
            setDraft((current) => {
                const next = deepClone(current || profile || {});
                setPath(next, path, value);
                return next;
            });
        },
        [profile]
    );

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
        if (!draft || isSaving) return;

        setIsSaving(true);
        setError("");
        setSuccess("");

        try {
            const payload = buildEditablePatch(draft);
            const replacementCardNumber = sensitiveEdits["financial.creditCard.number"]?.trim();
            if (replacementCardNumber) {
                setPath(payload, ["financial", "creditCard", "number"], replacementCardNumber);
            }

            const response = await apiPatch("/auth/me/", payload);
            let saved = normalizeUser(response);
            if (!saved?.id) saved = mergeProfile(profile, payload);

            setProfile(saved);
            setDraft(deepClone(saved));
            setSensitiveEdits({});
            setIsEditing(false);
            setSuccess("Your profile changes have been saved.");

            if (typeof auth?.refreshUser === "function") {
                try {
                    const refreshed = normalizeUser(await auth.refreshUser());
                    if (refreshed?.id) setProfile(refreshed);
                } catch {
                    // Keep local saved state
                }
            } else if (typeof auth?.setUser === "function") {
                auth.setUser(saved);
            }
        } catch (err) {
            setError(err?.message || "Unable to save your profile. Please try again.");
        } finally {
            setIsSaving(false);
        }
    }

    const scrollToTop = useCallback(() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    }, []);

    const displayProfile = isEditing ? (draft || profile || {}) : (profile || {});
    const personal = displayProfile.personal || {};
    const contact = displayProfile.contact || {};
    const professional = displayProfile.professional || {};
    const location = displayProfile.location || {};
    const metadata = displayProfile.metadata || {};

    const fullName =
        personal.displayName ||
        [personal.prefix, personal.firstName, personal.middle, personal.lastName, personal.suffix].filter(Boolean).join(" ") ||
        contact.username ||
        contact.email ||
        "Your profile";
    const initials =
        fullName
            .split(/\s+/)
            .filter(Boolean)
            .slice(0, 2)
            .map((part) => part[0])
            .join("")
            .toUpperCase() || "U";
    const avatar = personal.avatar;

    useEffect(() => {
        setAvatarError(false);
    }, [avatar]);

    // Calculate profile completion percentage across editable standard fields
    const completionPercentage = useMemo(() => {
        if (!displayProfile) return 0;
        let total = 0;
        let filled = 0;
        for (const section of SECTIONS) {
            for (const field of section.fields) {
                if (field.type === "protected" || field.type === "credential") continue;
                total += 1;
                const val = getPath(displayProfile, field.path);
                if (val !== null && val !== undefined && String(val).trim() !== "") {
                    filled += 1;
                }
            }
        }
        return total > 0 ? Math.round((filled / total) * 100) : 0;
    }, [displayProfile]);

    // Track whether the user has modified any field in edit mode
    const hasUnsavedChanges = useMemo(() => {
        if (!isEditing || !draft || !profile) return false;
        const hasSensitiveInput = Object.values(sensitiveEdits).some((v) => String(v || "").trim() !== "");
        if (hasSensitiveInput) return true;
        return JSON.stringify(buildEditablePatch(draft)) !== JSON.stringify(buildEditablePatch(profile));
    }, [isEditing, draft, profile, sensitiveEdits]);

    // Synchronize active section with scroll position
    useEffect(() => {
        const updateActiveSection = () => {
            setShowScrollTop(window.scrollY > 600);

            const atPageBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4;
            if (atPageBottom) {
                setActiveSection(ALL_SECTIONS[ALL_SECTIONS.length - 1].id);
                return;
            }

            const activationLine = window.scrollY + Math.min(window.innerHeight * 0.3, 240);
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

            setActiveSection((current) => (current === nextActiveSection ? current : nextActiveSection));
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
        return <ProfileSkeleton />;
    }

    if (!profile) {
        return (
            <main className="min-h-screen bg-slate-50 px-4 py-12 dark:bg-slate-950 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-xl">
                    {/* <BreadcrumbBar items={[{ label: "Profile" }]} /> */}
                    <div
                        role="alert"
                        className="mt-6 rounded-2xl border border-rose-200/80 bg-white p-8 text-center shadow-sm dark:border-rose-900/50 dark:bg-slate-900"
                    >
                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400">
                            <FiAlertCircle size={24} />
                        </div>
                        <h1 className="mt-4 text-lg font-semibold text-slate-900 dark:text-white">
                            Could not load your profile
                        </h1>
                        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                            {error || "Your account information is temporarily unavailable."}
                        </p>
                        <RippleButton
                            {...PRIMARY_BUTTON}
                            variant="solid"
                            size="sm"
                            onClick={loadProfile}
                            className="mt-6 inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white"
                        >
                            <FiRefreshCw size={15} /> Retry connection
                        </RippleButton>
                    </div>
                </div>
            </main>
        );
    }

    const headlineRole = [professional.jobTitle, professional.company?.name].filter(Boolean).join(" at ");
    const headlineLocation = [location.city, location.country].filter(Boolean).join(", ");

    return (
        <main className="min-h-screen bg-slate-50/70 px-4 py-6 text-slate-900 dark:bg-slate-950 dark:text-white sm:px-6 sm:py-8 lg:px-8">
            <div className="mx-auto max-w-7xl space-y-6">
                {/* <BreadcrumbBar items={[{ label: "Profile" }]} /> */}

                {/* Top Page Header */}
                <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="inline-block h-2 w-2 rounded-full bg-violet-600 dark:bg-violet-400" />
                            <p className="text-xs font-semibold uppercase tracking-wider text-violet-700 dark:text-violet-300">
                                Account Workspace
                            </p>
                        </div>
                        <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-950 dark:text-white sm:text-3xl">
                            Profile & Identity
                        </h1>
                    </div>

                    <div className="flex flex-wrap items-center gap-2.5">
                        {isEditing ? (
                            <>
                                <RippleButton
                                    {...MUTED_BUTTON}
                                    variant="outline"
                                    size="sm"
                                    disabled={isSaving}
                                    onClick={cancelEditing}
                                    className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-2xs transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                                >
                                    <FiX size={16} /> Cancel
                                </RippleButton>
                                <RippleButton
                                    {...PRIMARY_BUTTON}
                                    variant="solid"
                                    size="sm"
                                    type="submit"
                                    form="profile-form"
                                    disabled={isSaving}
                                    className="inline-flex h-10 items-center gap-2 rounded-xl px-4 text-sm font-semibold text-white shadow-sm disabled:opacity-60"
                                >
                                    {isSaving ? <FiRefreshCw size={16} className="animate-spin" /> : <FiSave size={16} />}
                                    {isSaving ? "Saving..." : "Save changes"}
                                </RippleButton>
                            </>
                        ) : (
                            <RippleButton
                                {...PRIMARY_BUTTON}
                                variant="solid"
                                size="sm"
                                onClick={startEditing}
                                className="inline-flex h-10 items-center gap-2 rounded-xl px-4 text-sm font-semibold text-white shadow-sm"
                            >
                                <FiEdit3 size={15} /> Edit profile
                            </RippleButton>
                        )}
                    </div>
                </header>

                {/* Feedback Alerts */}
                {error && (
                    <div
                        role="alert"
                        className="flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50/90 p-4 text-rose-900 shadow-2xs dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-200"
                    >
                        <FiInfo size={18} className="mt-0.5 shrink-0 text-rose-600 dark:text-rose-400" />
                        <div className="flex-1 text-sm leading-5">{error}</div>
                        <button
                            type="button"
                            onClick={() => setError("")}
                            className="text-xs font-semibold text-rose-700 hover:underline dark:text-rose-300"
                        >
                            Dismiss
                        </button>
                    </div>
                )}

                {success && (
                    <div
                        role="status"
                        className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50/90 px-4 py-3.5 text-emerald-900 shadow-2xs dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-200"
                    >
                        <FiCheckCircle size={18} className="shrink-0 text-emerald-600 dark:text-emerald-400" />
                        <p className="text-sm font-medium">{success}</p>
                        <button
                            type="button"
                            onClick={() => setSuccess("")}
                            className="ml-auto text-xs font-semibold text-emerald-700 hover:text-emerald-900 dark:text-emerald-300"
                        >
                            Dismiss
                        </button>
                    </div>
                )}

                <form id="profile-form" onSubmit={handleSave}>
                    {/* Executive Hero Banner */}
                    <section className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900">
                        <div className="relative h-28 bg-gradient-to-r from-violet-700 via-indigo-600 to-purple-600 sm:h-36">
                            <div
                                className="absolute inset-0 opacity-20"
                                style={{
                                    backgroundImage:
                                        "radial-gradient(circle at 20% 50%, rgba(255,255,255,0.4) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255,255,255,0.3) 0%, transparent 40%)",
                                }}
                            />
                            {isEditing && (
                                <div className="absolute right-4 top-4 rounded-full bg-black/30 px-3 py-1 text-xs font-medium text-white backdrop-blur-md">
                                    Editing Mode Active
                                </div>
                            )}
                        </div>

                        <div className="px-5 pb-6 sm:px-7">
                            <div className="-mt-12 flex flex-col gap-6 sm:-mt-14 lg:flex-row lg:items-end lg:justify-between">
                                <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
                                    <div className="relative inline-block shrink-0">
                                        {avatar && !avatarError ? (
                                            <img
                                                src={avatar}
                                                alt={`${fullName} avatar`}
                                                className="h-24 w-24 rounded-2xl border-4 border-white bg-white object-cover shadow-md dark:border-slate-900 sm:h-28 sm:w-28"
                                                onError={() => setAvatarError(true)}
                                            />
                                        ) : (
                                            <div className="flex h-24 w-24 items-center justify-center rounded-2xl border-4 border-white bg-gradient-to-br from-violet-600 to-indigo-700 text-2xl font-bold tracking-tight text-white shadow-md dark:border-slate-900 sm:h-28 sm:w-28">
                                                {initials}
                                            </div>
                                        )}
                                        <span
                                            title={isTrue(metadata.is_active) ? "Active account" : "Account status"}
                                            className={`absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-white dark:border-slate-900 ${
                                                isTrue(metadata.is_active) ? "bg-emerald-500" : "bg-slate-400"
                                            }`}
                                        />
                                    </div>

                                    <div className="min-w-0 space-y-1.5 pt-1">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <h2 className="truncate text-xl font-bold tracking-tight text-slate-950 dark:text-white sm:text-2xl">
                                                {fullName}
                                            </h2>
                                            {metadata.role && (
                                                <span className="rounded-full bg-violet-50 px-2.5 py-0.5 text-xs font-semibold text-violet-700 ring-1 ring-inset ring-violet-600/20 dark:bg-violet-500/10 dark:text-violet-300">
                                                    {String(metadata.role).replace(/\b\w/g, (c) => c.toUpperCase())}
                                                </span>
                                            )}
                                            {metadata.accountStatus && (
                                                <span
                                                    className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${statusClasses(
                                                        metadata.accountStatus
                                                    )}`}
                                                >
                                                    {String(metadata.accountStatus).replace(/\b\w/g, (c) => c.toUpperCase())}
                                                </span>
                                            )}
                                        </div>

                                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-slate-400 sm:text-sm">
                                            <span>{contact.email || "No primary email"}</span>
                                            {headlineRole && (
                                                <span className="inline-flex items-center gap-1.5">
                                                    <FiBriefcase size={13} className="text-slate-400" />
                                                    {headlineRole}
                                                </span>
                                            )}
                                            {headlineLocation && (
                                                <span className="inline-flex items-center gap-1.5">
                                                    <FiMapPin size={13} className="text-slate-400" />
                                                    {headlineLocation}
                                                </span>
                                            )}
                                        </div>

                                        {personal.bio && (
                                            <p className="max-w-2xl pt-1 text-xs leading-relaxed text-slate-600 line-clamp-2 dark:text-slate-300 sm:text-sm">
                                                {personal.bio}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Summary Metrics */}
                                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:min-w-96">
                                    <div className="rounded-xl border border-slate-200/80 bg-slate-50/70 p-3 dark:border-slate-800 dark:bg-slate-950/50">
                                        <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400">
                                            Account Tier
                                        </p>
                                        <p className="mt-1 text-sm font-semibold capitalize text-slate-900 dark:text-slate-100">
                                            {metadata.accountTier || "Standard"}
                                        </p>
                                    </div>
                                    <div className="rounded-xl border border-slate-200/80 bg-slate-50/70 p-3 dark:border-slate-800 dark:bg-slate-950/50">
                                        <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400">
                                            Member Since
                                        </p>
                                        <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-slate-100">
                                            {formatDate(metadata.createdAt)}
                                        </p>
                                    </div>
                                    <div className="col-span-2 rounded-xl border border-slate-200/80 bg-slate-50/70 p-3 dark:border-slate-800 dark:bg-slate-950/50 sm:col-span-1">
                                        <div className="flex items-center justify-between text-[11px] font-medium uppercase tracking-wider text-slate-400">
                                            <span>Completeness</span>
                                            <span className="font-semibold text-violet-600 dark:text-violet-400">
                                                {completionPercentage}%
                                            </span>
                                        </div>
                                        <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                                            <div
                                                className="h-full rounded-full bg-gradient-to-r from-violet-600 to-indigo-500 transition-all duration-500"
                                                style={{ width: `${completionPercentage}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Main Layout Grid */}
                    <div className="mt-6 grid grid-cols-1 items-start gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
                        {/* Sticky Section Navigation */}
                        <aside className="lg:sticky lg:top-6">
                            <nav
                                aria-label="Profile sections"
                                className="rounded-2xl border border-slate-200/90 bg-white p-3 shadow-xs dark:border-slate-800 dark:bg-slate-900"
                            >
                                <p className="hidden px-3 pb-2 pt-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400 lg:block">
                                    Profile Details
                                </p>
                                <div className="flex gap-1.5 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible lg:pb-0">
                                    {SECTIONS.map(({ id, title, icon: Icon }) => {
                                        const isActive = activeSection === id;
                                        return (
                                            <a
                                                key={id}
                                                href={`#${id}`}
                                                aria-current={isActive ? "location" : undefined}
                                                onClick={() => setActiveSection(id)}
                                                className={`group flex shrink-0 items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium transition sm:text-sm ${
                                                    isActive
                                                        ? "bg-violet-600 text-white shadow-xs dark:bg-violet-600 dark:text-white"
                                                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800/70 dark:hover:text-white"
                                                }`}
                                            >
                                                <Icon
                                                    size={15}
                                                    className={`shrink-0 ${
                                                        isActive
                                                            ? "text-white"
                                                            : "text-slate-400 group-hover:text-violet-600 dark:group-hover:text-violet-300"
                                                    }`}
                                                />
                                                <span className="truncate">{title}</span>
                                                <FiChevronRight
                                                    size={14}
                                                    className={`ml-auto hidden shrink-0 lg:block ${
                                                        isActive ? "text-violet-200" : "text-slate-300 opacity-0 group-hover:opacity-100"
                                                    }`}
                                                />
                                            </a>
                                        );
                                    })}
                                </div>

                                <div className="my-2.5 hidden border-t border-slate-100 dark:border-slate-800 lg:block" />

                                <p className="hidden px-3 pb-2 pt-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400 lg:block">
                                    System & Security
                                </p>
                                <div className="mt-1 flex gap-1.5 overflow-x-auto lg:mt-0 lg:flex-col lg:overflow-visible">
                                    {READ_ONLY_SECTIONS.map(({ id, title, icon: Icon }) => {
                                        const isActive = activeSection === id;
                                        return (
                                            <a
                                                key={id}
                                                href={`#${id}`}
                                                aria-current={isActive ? "location" : undefined}
                                                onClick={() => setActiveSection(id)}
                                                className={`group flex shrink-0 items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium transition sm:text-sm ${
                                                    isActive
                                                        ? "bg-slate-900 text-white shadow-xs dark:bg-slate-800 dark:text-white"
                                                        : "text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/70 dark:hover:text-white"
                                                }`}
                                            >
                                                <Icon
                                                    size={15}
                                                    className={`shrink-0 ${
                                                        isActive ? "text-violet-300" : "text-slate-400"
                                                    }`}
                                                />
                                                <span className="truncate">{title}</span>
                                                <FiLock
                                                    size={11}
                                                    className={`ml-auto hidden shrink-0 lg:block ${
                                                        isActive ? "text-slate-400" : "text-slate-300 dark:text-slate-600"
                                                    }`}
                                                />
                                            </a>
                                        );
                                    })}
                                </div>
                            </nav>

                            <div className="mt-4 hidden rounded-2xl border border-violet-200/60 bg-gradient-to-br from-violet-50/90 to-indigo-50/50 p-4 dark:border-violet-500/15 dark:from-violet-500/10 dark:to-indigo-500/5 lg:block">
                                <div className="flex items-center gap-2 text-violet-900 dark:text-violet-200">
                                    <FiShield size={16} className="text-violet-600 dark:text-violet-400" />
                                    <h3 className="text-xs font-semibold uppercase tracking-wide">Data Protection</h3>
                                </div>
                                <p className="mt-2 text-xs leading-relaxed text-violet-900/75 dark:text-violet-200/75">
                                    Sensitive banking fields are masked in view mode. Password hashes, CVV, and PIN secrets are never sent to the browser.
                                </p>
                                <Link
                                    to="/settings"
                                    className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-violet-700 hover:text-violet-900 dark:text-violet-300 dark:hover:text-violet-100"
                                >
                                    Security settings <FiChevronRight size={13} />
                                </Link>
                            </div>
                        </aside>

                        {/* Form Sections */}
                        <div className="min-w-0 space-y-6">
                            {SECTIONS.map((section) => (
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
                                    section={section}
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

                    {/* Floating Action Bar in Edit Mode */}
                    {isEditing && (
                        <div className="sticky bottom-4 z-30 mt-6 flex flex-col gap-3 rounded-2xl border border-slate-200/90 bg-white/90 p-4 shadow-xl shadow-slate-900/10 backdrop-blur-md sm:flex-row sm:items-center sm:justify-between dark:border-slate-700 dark:bg-slate-900/90">
                            <div className="flex items-center gap-2.5">
                                <span
                                    className={`h-2.5 w-2.5 shrink-0 rounded-full ${
                                        hasUnsavedChanges ? "animate-pulse bg-amber-500" : "bg-slate-300 dark:bg-slate-600"
                                    }`}
                                />
                                <p className="text-xs font-medium text-slate-600 dark:text-slate-300">
                                    {hasUnsavedChanges
                                        ? "You have unsaved changes ready to be committed."
                                        : "Editing mode active. Modify any field above to save changes."}
                                </p>
                            </div>
                            <div className="flex shrink-0 items-center justify-end gap-2.5">
                                <RippleButton
                                    {...MUTED_BUTTON}
                                    variant="outline"
                                    size="sm"
                                    disabled={isSaving}
                                    onClick={cancelEditing}
                                    className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                                >
                                    <FiX size={15} /> Discard
                                </RippleButton>
                                <RippleButton
                                    {...PRIMARY_BUTTON}
                                    variant="solid"
                                    size="sm"
                                    type="submit"
                                    disabled={isSaving}
                                    className="inline-flex h-10 items-center gap-2 rounded-xl px-5 text-sm font-semibold text-white shadow-sm disabled:opacity-60"
                                >
                                    {isSaving ? <FiRefreshCw size={15} className="animate-spin" /> : <FiCheck size={16} />}
                                    {isSaving ? "Saving..." : "Save changes"}
                                </RippleButton>
                            </div>
                        </div>
                    )}
                </form>

                <footer className="pb-6 pt-2 text-center text-xs text-slate-400 dark:text-slate-500">
                    Profile data is synchronized with your authenticated session.
                </footer>

                {/* Scroll To Top Button */}
                {showScrollTop && (
                    <RippleButton
                        hue={270}
                        saturation={75}
                        lightness={50}
                        variant="soft"
                        onClick={scrollToTop}
                        aria-label="Scroll to top"
                        className={`fixed right-6 z-40 flex h-11 w-11 items-center justify-center rounded-full shadow-lg shadow-violet-950/20 transition-all duration-200 hover:-translate-y-1 ${
                            isEditing ? "bottom-24" : "bottom-6"
                        }`}
                    >
                        <FaArrowUp size={18} />
                    </RippleButton>
                )}
            </div>
        </main>
    );
}