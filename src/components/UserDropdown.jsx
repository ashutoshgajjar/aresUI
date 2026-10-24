import { useEffect, useId, useRef, useState } from "react";
import { Link } from "react-router";
import {
    FiUser,
    FiAlertCircle,
} from "react-icons/fi";
import { LuLogOut } from "react-icons/lu";
import { RippleButton } from "@/components/RippleButton";
import { FaGear, FaUser } from "react-icons/fa6";

function getDisplayName(user) {
    return (
        user?.personal?.firstName + " " + user?.personal?.lastName ||
        user?.contact?.username ||
        user?.contact?.email ||
        "My account"
    );
}

function getEmail(user) {
    return user?.contact?.email || user?.email || "";
}

function getInitials(user, displayName) {
    const name = String(displayName || "").trim();

    if (name && name !== "My account" && !name.includes("@")) {
        const parts = name.split(/\s+/).filter(Boolean).slice(0, 2);
        return parts.map((part) => part[0]).join("").toUpperCase();
    }

    const email = getEmail(user);
    return email ? email[0].toUpperCase() : "U";
}

function formatLabel(value) {
    if (value === null || value === undefined || value === "") return "Member";

    return String(value)
        .replace(/[_-]+/g, " ")
        .replace(/\b\w/g, (character) => character.toUpperCase());
}

function getStatusClasses(status) {
    const value = String(status ?? "").toLowerCase();

    if (["active", "enabled", "verified"].includes(value)) {
        return "bg-emerald-50 text-emerald-700 ring-emerald-600/20";
    }

    if (["pending", "invited", "unverified"].includes(value)) {
        return "bg-amber-50 text-amber-700 ring-amber-600/20";
    }

    if (["inactive", "disabled", "suspended", "blocked"].includes(value)) {
        return "bg-rose-50 text-rose-700 ring-rose-600/20";
    }

    return "bg-slate-100 text-slate-600 ring-slate-500/20";
}

/**
 * Reusable account dropdown.
 *
 * Props:
 * - user: authenticated user object
 * - onSignOut: async or sync callback that clears the application's auth state
 * - profileTo/settingsTo: route paths; set to null to hide an item
 * - onProfileClick/onSettingsClick: optional callbacks invoked before navigation
 * - align: "right" | "left"
 */
// export default function UserDropdown({
//     user,
//     onSignOut,
//     profileTo = "/profile",
//     settingsTo = "/settings",
//     onProfileClick,
//     onSettingsClick,
//     align = "right",
//     className = "",
// }) {
//     const [open, setOpen] = useState(false);
//     const [isSigningOut, setIsSigningOut] = useState(false);
//     const [signOutError, setSignOutError] = useState("");

//     const rootRef = useRef(null);
//     const triggerRef = useRef(null);
//     const menuRef = useRef(null);
//     const menuId = useId();

//     const displayName = getDisplayName(user);
//     const email = getEmail(user);
//     const initials = getInitials(user, displayName);
//     const role = formatLabel(user?.metadata?.role);
//     const status = user?.account_status ?? user?.data?.account_status;
//     const alignmentClass = align === "left" ? "left-0" : "right-0";

//     useEffect(() => {
//         if (!open) return undefined;

//         function handlePointerDown(event) {
//             if (rootRef.current && !rootRef.current.contains(event.target)) {
//                 setOpen(false);
//                 setSignOutError("");
//             }
//         }

//         function handleKeyDown(event) {
//             if (event.key === "Escape") {
//                 setOpen(false);
//                 setSignOutError("");
//                 triggerRef.current?.focus();
//                 return;
//             }

//             if (event.key === "ArrowDown" && menuRef.current) {
//                 const items = menuRef.current.querySelectorAll(
//                     'a[role="menuitem"], button[role="menuitem"]:not(:disabled)'
//                 );
//                 if (items.length) {
//                     event.preventDefault();
//                     items[0].focus();
//                 }
//             }
//         }

//         document.addEventListener("pointerdown", handlePointerDown);
//         document.addEventListener("keydown", handleKeyDown);

//         return () => {
//             document.removeEventListener("pointerdown", handlePointerDown);
//             document.removeEventListener("keydown", handleKeyDown);
//         };
//     }, [open]);

//     async function handleSignOut() {
//         if (!onSignOut || isSigningOut) return;

//         setSignOutError("");
//         setIsSigningOut(true);

//         try {
//             await onSignOut();
//             setOpen(false);
//         } catch (error) {
//             setSignOutError(
//                 error?.message || "Unable to sign out. Please try again."
//             );
//         } finally {
//             setIsSigningOut(false);
//         }
//     }

//     function closeMenu() {
//         setOpen(false);
//         setSignOutError("");
//     }

//     const linkClasses =
//         "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-slate-700 transition hover:bg-violet-50 hover:text-violet-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-300";

//     return (
//         <div ref={rootRef} className={`relative inline-flex ${className}`}>
//             <button
//                 ref={triggerRef}
//                 type="button"
//                 aria-haspopup="menu"
//                 aria-expanded={open}
//                 aria-controls={menuId}
//                 aria-label={`Open account menu for ${displayName}`}
//                 onClick={() => {
//                     setOpen((current) => !current);
//                     setSignOutError("");
//                 }}
//                 className="group inline-flex max-w-full items-center gap-2.5 rounded-xl border border-transparent bg-white p-1.5 pr-2.5 text-left transition hover:border-slate-200 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-violet-100"
//             >
//                 <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 text-sm font-bold text-white shadow-sm ring-1 ring-inset ring-white/20">
//                     {initials || <FiUser size={18} />}
//                 </span>

//                 <span className="hidden min-w-0 text-left sm:block">
//                     <span className="block max-w-40 truncate text-sm font-semibold text-slate-800">
//                         {displayName}
//                     </span>
//                     <span className="mt-0.5 block max-w-40 truncate text-xs text-slate-500">
//                         {email || role}
//                     </span>
//                 </span>

//                 <FiChevronDown
//                     size={16}
//                     aria-hidden="true"
//                     className={`ml-0.5 shrink-0 text-slate-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
//                 />
//             </button>

//             {open && (
//                 <div ref={menuRef} id={menuId} role="menu" aria-label="Account menu" className={`absolute top-full z-50 mt-3 w-[min(20rem,calc(100vw-2rem))] ${alignmentClass} overflow-hidden rounded-xl border border-slate-300 bg-white shadow-xl shadow-slate-900/20`}>
//                     <div className="border-b border-slate-100 bg-slate-50/70 p-4">
//                         <div className="flex items-center gap-3">
//                             <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 text-sm font-bold text-white shadow-sm">
//                                 {initials}
//                             </span>

//                             <div className="min-w-0 flex-1">
//                                 <p className="truncate text-sm font-bold text-slate-900">
//                                     {displayName}
//                                 </p>
//                                 <p className="mt-1 truncate text-xs text-slate-500">
//                                     {email || "Signed-in account"}
//                                 </p>
//                                 <div className="mt-2 flex flex-wrap items-center gap-1.5">
//                                     <span className="inline-flex items-center rounded-full bg-violet-50 px-2 py-0.5 text-[11px] font-semibold text-violet-700 ring-1 ring-inset ring-violet-200">
//                                         {role}
//                                     </span>
//                                     {status && (
//                                         <span
//                                             className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1 ring-inset ${getStatusClasses(status)}`}
//                                         >
//                                             {formatLabel(status)}
//                                         </span>
//                                     )}
//                                 </div>
//                             </div>
//                         </div>
//                     </div>

//                     <div className="space-y-1 p-2.5">
//                         {profileTo && (
//                             <Link
//                                 to={profileTo}
//                                 role="menuitem"
//                                 onClick={() => {
//                                     onProfileClick?.();
//                                     closeMenu();
//                                 }}
//                                 className={linkClasses}
//                             >
//                                 <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
//                                     <FiUser size={17} />
//                                 </span>
//                                 <span className="min-w-0 flex-1">
//                                     <span className="block">My profile</span>
//                                     <span className="mt-0.5 block text-xs font-normal text-slate-500">
//                                         View your account details
//                                     </span>
//                                 </span>
//                                 <FiChevronDown
//                                     size={15}
//                                     className="-rotate-90 text-slate-400"
//                                 />
//                             </Link>
//                         )}

//                         {settingsTo && (
//                             <Link
//                                 to={settingsTo}
//                                 role="menuitem"
//                                 onClick={() => {
//                                     onSettingsClick?.();
//                                     closeMenu();
//                                 }}
//                                 className={linkClasses}
//                             >
//                                 <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
//                                     <FiSettings size={17} />
//                                 </span>
//                                 <span className="min-w-0 flex-1">
//                                     <span className="block">Settings</span>
//                                     <span className="mt-0.5 block text-xs font-normal text-slate-500">
//                                         Manage your preferences
//                                     </span>
//                                 </span>
//                                 <FiChevronDown
//                                     size={15}
//                                     className="-rotate-90 text-slate-400"
//                                 />
//                             </Link>
//                         )}
//                     </div>

//                     {signOutError && (
//                         <div
//                             role="alert"
//                             className="mx-3 mb-2 flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700"
//                         >
//                             <FiAlertCircle size={16} className="mt-0.5 shrink-0" />
//                             <span>{signOutError}</span>
//                         </div>
//                     )}

//                     {onSignOut && (
//                         <div className="border-t border-slate-100 p-2.5">
//                             <RippleButton
//                                 hue={0}
//                                 saturation={65}
//                                 lightness={48}
//                                 variant="soft"
//                                 size="sm"
//                                 disabled={isSigningOut}
//                                 onClick={handleSignOut}
//                                 role="menuitem"
//                                 className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-rose-700 hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60"
//                             >
//                                 <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-rose-50 text-rose-700">
//                                     {isSigningOut ? (
//                                         <span className="h-4 w-4 animate-spin rounded-full border-2 border-rose-300 border-t-rose-700" />
//                                     ) : (
//                                         <FiLogOut size={17} />
//                                     )}
//                                 </span>
//                                 <span>
//                                     {isSigningOut ? "Signing out..." : "Sign out"}
//                                 </span>
//                             </RippleButton>
//                         </div>
//                     )}
//                 </div>
//             )}
//         </div>
//     );
// }
export default function UserDropdown({
    user,
    onSignOut,
    profileTo = "/profile",
    settingsTo = "/settings",
    onProfileClick,
    onSettingsClick,
    align = "right",
    className = "",
    btnClassName = "",
}) {
    const [open, setOpen] = useState(false);
    const [isSigningOut, setIsSigningOut] = useState(false);
    const [signOutError, setSignOutError] = useState("");

    const rootRef = useRef(null);
    const triggerRef = useRef(null);
    const menuRef = useRef(null);
    const menuId = useId();

    const displayName = getDisplayName(user);
    const email = getEmail(user);
    const initials = getInitials(user, displayName);
    const role = formatLabel(user?.metadata?.role);
    const status = user?.account_status ?? user?.data?.account_status;
    const alignmentClass = align === "left" ? "left-0" : "right-0";

    useEffect(() => {
        if (!open) return undefined;

        function handlePointerDown(event) {
            if (rootRef.current && !rootRef.current.contains(event.target)) {
                closeMenu();
            }
        }

        function handleKeyDown(event) {
            if (event.key === "Escape") {
                closeMenu();
                triggerRef.current?.focus();
                return;
            }

            if (event.key === "ArrowDown" && menuRef.current) {
                const items = menuRef.current.querySelectorAll(
                    'a[role="menuitem"], button[role="menuitem"]:not(:disabled)'
                );
                if (items.length) {
                    event.preventDefault();
                    items[0].focus();
                }
            }
        }

        document.addEventListener("pointerdown", handlePointerDown);
        document.addEventListener("keydown", handleKeyDown);

        return () => {
            document.removeEventListener("pointerdown", handlePointerDown);
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [open]);

    async function handleSignOut() {
        if (!onSignOut || isSigningOut) return;

        setSignOutError("");
        setIsSigningOut(true);

        try {
            await onSignOut();
            setOpen(false);
        } catch (error) {
            setSignOutError(
                error?.message || "Unable to sign out. Please try again."
            );
        } finally {
            setIsSigningOut(false);
        }
    }

    function closeMenu() {
        setOpen(false);
        setSignOutError("");
    }

    // Extracted shared link classes for cleaner JSX
    const menuItemClasses = 
        "group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-slate-600 outline-none transition-all duration-200 hover:bg-slate-50 hover:text-slate-900 focus-visible:bg-slate-50 focus-visible:text-slate-900 focus-visible:ring-2 focus-visible:ring-violet-500/30";

    return (
        <div ref={rootRef} className={`relative inline-flex ${className}`}>
            {/* TRIGGER BUTTON */}
            <RippleButton
                hue={270}
                saturation={70}
                lightness={50}
                variant="ghost"
                ref={triggerRef}
                type="button"
                aria-haspopup="menu"
                aria-expanded={open}
                aria-controls={menuId}
                aria-label={`Open account menu for ${displayName}`}
                onClick={() => {
                    setOpen((current) => !current);
                    setSignOutError("");
                }}
                className={`group flex items-center gap-2.5 rounded-full p-0.5 shadow-sm transition-all duration-200 focus-visible:outline focus-visible:outline-[hsl(270,50%,60%)] ${open ? "bg-purple-200" : ''} ${btnClassName}`}
            >
                {/* Avatar Pill */}
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-violet-600 to-indigo-500 text-sm font-semibold text-white shadow-inner">
                    {initials || <FiUser size={16} />}
                </span>

                {/* <span className="hidden min-w-0 text-left sm:block">
                    <span className="block max-w-[120px] truncate text-sm font-semibold text-slate-700 group-hover:text-slate-900 transition-colors">
                        {displayName}
                    </span>
                </span> */}

                {/* <FaChevronDown
                    size={12}
                    aria-hidden="true"
                    className={`ml-1 shrink-0 text-slate-400 transition-transform duration-300 ease-[cubic-bezier(0.87,_0,_0.13,_1)] ${open ? "rotate-x-180" : ""}`}
                /> */}
            </RippleButton>

            {/* DROPDOWN MENU */}
            {open && (
                <div 
                    ref={menuRef} 
                    id={menuId} 
                    role="menu" 
                    aria-label="Account menu" 
                    // Added a subtle animation and premium shadow
                    className={`absolute top-full z-50 mt-2 w-72 ${alignmentClass} animate-[fade-in_0.15s_ease-out] overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-[0_4px_12px_rgba(0,0,0,0.15)]`}
                >
                    {/* Header Section */}
                    <div className="border-b border-gray-100 bg-black/3 p-4">
                        <div className="flex items-center gap-3.5">
                            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-violet-600 to-indigo-500 text-base font-bold text-white shadow-sm ring-2 ring-white">
                                {initials || <FiUser size={18} />}
                            </span>

                            <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-semibold text-slate-900">
                                    {displayName}
                                </p>
                                <p className="truncate text-xs font-medium text-slate-500">
                                    {email || "Signed-in account"}
                                </p>
                                
                                {/* Badges */}
                                <div className="mt-2.5 flex flex-wrap items-center gap-2">
                                    {role && (
                                        <span className="inline-flex items-center rounded-md bg-white px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-violet-700 shadow-sm ring-1 ring-inset ring-slate-200/60">
                                            {role}
                                        </span>
                                    )}
                                    {status && (
                                        <span className={`inline-flex items-center rounded-md bg-white px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider shadow-sm ring-1 ring-inset ring-slate-200/60 ${getStatusClasses(status)}`}>
                                            <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-current opacity-70"></span>
                                            {formatLabel(status)}
                                        </span>
                                    )}
                                    
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Links Section */}
                    <div className="p-2">
                        {profileTo && (
                            <Link
                                to={profileTo}
                                role="menuitem"
                                onClick={() => {
                                    onProfileClick?.();
                                    closeMenu();
                                }}
                                className={menuItemClasses}
                            >
                                <FaUser size={18} className="transition-colors group-hover:fill-violet-600 group-focus-visible:fill-violet-600" />
                                <span>My Profile</span>
                            </Link>
                        )}

                        {settingsTo && (
                            <Link
                                to={settingsTo}
                                role="menuitem"
                                onClick={() => {
                                    onSettingsClick?.();
                                    closeMenu();
                                }}
                                className={menuItemClasses}
                            >
                                <FaGear size={18} className="transition-colors group-hover:fill-violet-600 group-focus-visible:fill-violet-600" />
                                <span>Account Settings</span>
                            </Link>
                        )}
                    </div>

                    {/* Error Banner */}
                    {signOutError && (
                        <div
                            role="alert"
                            className="mx-2 mb-2 flex items-start gap-2 rounded-lg border border-rose-200/60 bg-rose-50/50 p-2.5 text-xs text-rose-700"
                        >
                            <FiAlertCircle size={14} className="mt-0.5 shrink-0" />
                            <span className="leading-relaxed">{signOutError}</span>
                        </div>
                    )}

                    {/* Footer / Sign Out */}
                    {onSignOut && (
                        <div className="border-t border-slate-100 p-2">
                            {/* Assuming RippleButton accepts standard className passthrough */}
                            <RippleButton
                                hue={348} // Red-ish hue for sign out
                                saturation={70}
                                lightness={50}
                                variant="soft"
                                size="sm"
                                disabled={isSigningOut}
                                onClick={handleSignOut}
                                role="menuitem"
                                className="w-full focus-visible:bg-rose-50 focus-visible:ring-2 focus-visible:ring-rose-500/30 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {isSigningOut ? (
                                    <span className="h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-rose-200 border-t-rose-600" />
                                ) : (
                                    <LuLogOut size={18} />
                                )}
                                <span>{isSigningOut ? "Signing out..." : "Sign out"}</span>
                            </RippleButton>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}