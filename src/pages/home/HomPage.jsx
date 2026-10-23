import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import {
    FiActivity,
    FiArrowRight,
    FiArrowUpRight,
    FiBell,
    FiCheck,
    FiCheckCircle,
    FiChevronDown,
    FiChevronRight,
    FiClock,
    FiCommand,
    FiFileText,
    FiFilter,
    FiFolder,
    FiGrid,
    FiInfo,
    FiLayers,
    FiLock,
    FiMoreHorizontal,
    FiSearch,
    FiShield,
    FiSliders,
    FiUsers,
    FiZap,
} from 'react-icons/fi';
import { RippleButton } from '@/components/RippleButton';
import "@/assets/css/header.css"
import { FaArrowUp, FaX } from 'react-icons/fa6';
import { LuMenu } from 'react-icons/lu';


const PRIMARY_BUTTON = { hue: 263, saturation: 78, lightness: 54 };

const productAreas = [
    {
        id: 'people',
        icon: FiUsers,
        eyebrow: 'Directory & Access',
        title: 'Know who is in your workspace.',
        description:
            'Keep user records, role assignments, and account states easy to inspect. Filter large directories in seconds and open rich profile views when you need full context.',
        bullets: [
            'Centralized user directory & profiles',
            'Role and account-status filtering',
            'Masked sensitive fields by default',
        ],
        link: '/users',
        linkLabel: 'Explore users',
        tone: 'violet',
    },
    {
        id: 'work',
        icon: FiCheckCircle,
        eyebrow: 'Task Operations',
        title: 'Move work forward with less friction.',
        description:
            'Spot bottlenecks early, track task progression, and move seamlessly from high-level queues to individual execution details without losing your place.',
        bullets: [
            'Clear status & priority indicators',
            'Instant search and multi-criteria views',
            'Focused detail views for every task',
        ],
        link: '/tasks',
        linkLabel: 'Explore tasks',
        tone: 'blue',
    },
    {
        id: 'files',
        icon: FiFolder,
        eyebrow: 'Document Repository',
        title: 'Keep critical files within reach.',
        description:
            'Bring file storage, technical metadata, downloads, and version history into one structured repository. Verify file context before taking action.',
        bullets: [
            'Streamlined upload & download flows',
            'Complete checksum & metadata inspection',
            'Point-in-time version history',
        ],
        link: '/files',
        linkLabel: 'Explore files',
        tone: 'emerald',
    },
];

const capabilities = [
    {
        icon: FiSearch,
        title: 'Precision search & filtering',
        description:
            'Query across large datasets and narrow results with composable filters instead of scanning rows manually.',
    },
    {
        icon: FiSliders,
        title: 'Structured list controls',
        description:
            'Combine multi-column sorting, server-backed pagination, and saved view states to focus on high-priority records.',
    },
    {
        icon: FiActivity,
        title: 'Honest operational metrics',
        description:
            'Surface real-time counts and status distributions with clear distinctions between page samples and global totals.',
    },
    {
        icon: FiLayers,
        title: 'Seamless context switching',
        description:
            'Drill into individual user profiles, tasks, or file versions and return to your filtered list state without reloads.',
    },
    {
        icon: FiBell,
        title: 'Deterministic feedback',
        description:
            'Immediate toast notifications, progress indicators, and inline validation confirm the exact outcome of every mutation.',
    },
    {
        icon: FiZap,
        title: 'Predictable ergonomics',
        description:
            'Unified keyboard patterns, skeleton loading states, and actionable empty states keep daily operations fast.',
    },
];

const workflow = [
    {
        number: '01',
        title: 'Start with the overview',
        description:
            'Assess system-wide health, active queues, and recent updates from a unified operational dashboard.',
    },
    {
        number: '02',
        title: 'Isolate the signal',
        description:
            'Apply instant search queries, status filters, and sort orders to pinpoint the exact user, task, or document.',
    },
    {
        number: '03',
        title: 'Inspect full context',
        description:
            'Open dedicated record views to audit metadata, permissions, execution history, or prior file revisions.',
    },
    {
        number: '04',
        title: 'Execute with confidence',
        description:
            'Trigger updates or downloads with explicit state feedback that verifies completion or surfaces clear recovery steps.',
    },
];

const faqs = [
    {
        question: 'What core workflows can I manage from Nexa?',
        answer: 'Nexa unifies three foundational operational pillars: user directory management, task tracking, and file repository administration—complete with search, filtering, detailed record inspection, and state mutations.',
    },
    {
        question: 'How do search, filtering, and pagination work across lists?',
        answer: 'List views pass your search queries, sort parameters, and active filter criteria directly to the underlying API, ensuring fast responses and accurate pagination even across large record sets.',
    },
    {
        question: 'Does the file repository support version history?',
        answer: 'Yes. Every file record includes a dedicated version history ledger where you can inspect upload timestamps, file sizes, and metadata, or download specific historical revisions.',
    },
    {
        question: 'How are sensitive user fields and permissions protected?',
        answer: 'Sensitive profile attributes are masked in the UI, and restricted credentials (such as password hashes, PINs, or CVVs) are never rendered. All views work alongside strict server-side authorization and validation.',
    },
    {
        question:
            'How does the interface handle errors or empty search results?',
        answer: 'Nexa strictly separates empty query states from network or server failures—giving you one-click filter resets when a search returns no matches, and direct retry actions when a request fails.',
    },
];

const previewTabs = {
    overview: {
        eyebrow: 'OPERATIONAL PULSE',
        title: 'Workspace overview',
        subtitle: 'Real-time summary across directory, queues, and storage.',
        stats: [
            {
                label: 'Active Users',
                value: '1,284',
                delta: '+4.2%',
                icon: FiUsers,
                tone: 'violet',
            },
            {
                label: 'Open Tasks',
                value: '42',
                delta: '94% done',
                icon: FiCheckCircle,
                tone: 'blue',
            },
            {
                label: 'Indexed Files',
                value: '8,910',
                delta: '99.9% sync',
                icon: FiFolder,
                tone: 'emerald',
            },
        ],
        itemsHeader: 'Recent workspace activity',
        items: [
            {
                icon: FiUsers,
                title: 'Role permissions updated for Product Team',
                meta: 'Directory · 2m ago',
                badge: 'Verified',
                tone: 'violet',
            },
            {
                icon: FiCheckCircle,
                title: 'Q4 security audit checklist marked complete',
                meta: 'Tasks · 18m ago',
                badge: 'Completed',
                tone: 'emerald',
            },
            {
                icon: FiFileText,
                title: 'architecture-spec-v3.pdf uploaded',
                meta: 'Files · 45m ago',
                badge: 'v3.0',
                tone: 'blue',
            },
        ],
    },
    users: {
        eyebrow: 'DIRECTORY VIEW',
        title: 'User records',
        subtitle: 'Inspect account states, roles, and security posture.',
        stats: [
            {
                label: 'Verified',
                value: '1,240',
                delta: '96.5%',
                icon: FiCheckCircle,
                tone: 'emerald',
            },
            {
                label: 'Pending Invite',
                value: '32',
                delta: 'Active',
                icon: FiClock,
                tone: 'blue',
            },
            {
                label: 'Admin Roles',
                value: '12',
                delta: 'Audited',
                icon: FiShield,
                tone: 'violet',
            },
        ],
        itemsHeader: 'Recently inspected profiles',
        items: [
            {
                icon: FiUsers,
                title: 'Elena Rostova · Principal Engineer',
                meta: 'Role: Admin · MFA Enabled',
                badge: 'Active',
                tone: 'emerald',
            },
            {
                icon: FiUsers,
                title: 'Marcus Vance · Operations Lead',
                meta: 'Role: Editor · SSO Linked',
                badge: 'Active',
                tone: 'violet',
            },
            {
                icon: FiUsers,
                title: 'Aria Chen · Security Analyst',
                meta: 'Role: Auditor · Read-only',
                badge: 'Review',
                tone: 'blue',
            },
        ],
    },
    tasks: {
        eyebrow: 'EXECUTION QUEUE',
        title: 'Active tasks',
        subtitle: 'Track deliverables, owners, and completion velocity.',
        stats: [
            {
                label: 'In Progress',
                value: '19',
                delta: 'On track',
                icon: FiActivity,
                tone: 'blue',
            },
            {
                label: 'Due Today',
                value: '7',
                delta: 'High prio',
                icon: FiZap,
                tone: 'violet',
            },
            {
                label: 'Completed',
                value: '318',
                delta: 'This week',
                icon: FiCheckCircle,
                tone: 'emerald',
            },
        ],
        itemsHeader: 'Priority queue',
        items: [
            {
                icon: FiCheckCircle,
                title: 'Verify API rate-limit thresholds on prod',
                meta: 'Assigned to Platform · High',
                badge: 'In Progress',
                tone: 'blue',
            },
            {
                icon: FiCheckCircle,
                title: 'Rotate storage bucket access keys',
                meta: 'Assigned to SecOps · Urgent',
                badge: 'Ready',
                tone: 'violet',
            },
            {
                icon: FiCheckCircle,
                title: 'Archive deprecated onboarding documents',
                meta: 'Assigned to Ops · Normal',
                badge: 'Done',
                tone: 'emerald',
            },
        ],
    },
    files: {
        eyebrow: 'REPOSITORY LEDGER',
        title: 'Managed files',
        subtitle: 'Versioned assets, checksums, and access logs.',
        stats: [
            {
                label: 'Total Volume',
                value: '142 GB',
                delta: 'Encrypted',
                icon: FiFolder,
                tone: 'emerald',
            },
            {
                label: 'Revisions',
                value: '3,412',
                delta: 'Tracked',
                icon: FiLayers,
                tone: 'violet',
            },
            {
                label: 'Downloads',
                value: '892',
                delta: 'Last 7d',
                icon: FiActivity,
                tone: 'blue',
            },
        ],
        itemsHeader: 'Latest versioned assets',
        items: [
            {
                icon: FiFileText,
                title: 'soc2-compliance-report-2026.pdf',
                meta: '4.8 MB · SHA-256 verified',
                badge: 'v4.2',
                tone: 'emerald',
            },
            {
                icon: FiFileText,
                title: 'workspace-schema-migration.sql',
                meta: '128 KB · Updated by Elena R.',
                badge: 'v2.1',
                tone: 'violet',
            },
            {
                icon: FiFileText,
                title: 'q3-operational-metrics.csv',
                meta: '19.4 MB · Exported dataset',
                badge: 'v1.0',
                tone: 'blue',
            },
        ],
    },
};

function BrandMark({ light = false }) {
    return (
        <span
            className={`flex h-9 w-9 items-center justify-center rounded-xl transition-transform duration-200 group-hover:scale-105 ${
                light
                    ? 'bg-white/10 text-white ring-1 ring-white/20'
                    : 'bg-gradient-to-br from-violet-600 to-indigo-600 text-white shadow-md shadow-violet-600/25 ring-1 ring-inset ring-white/20'
            }`}
            aria-hidden='true'
        >
            <FiCommand size={18} strokeWidth={2.25} />
        </span>
    );
}

function SectionHeading({
    eyebrow,
    title,
    description,
    align = 'left',
    light = false,
}) {
    return (
        <div
            className={`max-w-3xl ${align === 'center' ? 'mx-auto text-center' : ''}`}
        >
            {eyebrow && (
                <div
                    className={`mb-3 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] ${
                        light ? 'text-violet-300' : 'text-violet-600'
                    }`}
                >
                    <span
                        className={`h-1.5 w-1.5 rounded-full ${
                            light ? 'bg-violet-400' : 'bg-violet-600'
                        }`}
                    />
                    {eyebrow}
                </div>
            )}
            <h2
                className={`text-3xl font-semibold tracking-[-0.025em] sm:text-4xl lg:text-[2.65rem] lg:leading-[1.15] ${
                    light ? 'text-white' : 'text-slate-950'
                }`}
            >
                {title}
            </h2>
            {description && (
                <p
                    className={`mt-4 text-base leading-relaxed sm:text-lg sm:leading-8 ${
                        light ? 'text-slate-300' : 'text-slate-600'
                    }`}
                >
                    {description}
                </p>
            )}
        </div>
    );
}

function ProductPreview() {
    const [activeTab, setActiveTab] = useState('overview');
    const currentView = previewTabs[activeTab];

    const sidebarNav = [
        { id: 'overview', icon: FiGrid, label: 'Overview' },
        { id: 'users', icon: FiUsers, label: 'Users' },
        { id: 'tasks', icon: FiCheckCircle, label: 'Tasks' },
        { id: 'files', icon: FiFolder, label: 'Files' },
    ];

    const toneBadgeStyles = {
        violet: 'bg-violet-50 text-violet-700 ring-violet-200/80',
        blue: 'bg-sky-50 text-sky-700 ring-sky-200/80',
        emerald: 'bg-emerald-50 text-emerald-700 ring-emerald-200/80',
    };

    return (
        <div className='relative mx-auto w-full max-w-[610px]'>
            {/* Ambient glow */}
            <div className='pointer-events-none absolute -inset-4 rounded-[2rem] bg-gradient-to-tr from-violet-500/25 via-fuchsia-500/10 to-sky-400/20 blur-2xl' />

            {/* Window frame */}
            <div className='relative overflow-hidden rounded-2xl border border-white/15 bg-white shadow-[0_25px_70px_-15px_rgba(15,23,42,0.65)] ring-1 ring-slate-950/5'>
                {/* Browser / App Chrome Bar */}
                <div className='flex items-center justify-between border-b border-slate-200/90 bg-slate-50/90 px-4 py-2.5'>
                    <div className='flex items-center gap-2'>
                        <span className='h-2.5 w-2.5 rounded-full bg-rose-500' />
                        <span className='h-2.5 w-2.5 rounded-full bg-yellow-500' />
                        <span className='h-2.5 w-2.5 rounded-full bg-emerald-500' />
                        <span className='ml-2 hidden rounded-md border border-slate-200/80 bg-white px-2.5 py-0.5 text-[11px] font-medium text-slate-500 sm:inline-block'>
                            nexa.workspace / {activeTab}
                        </span>
                    </div>
                    <div className='flex items-center gap-2'>
                        <div className='hidden items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[11px] text-slate-400 shadow-2xs sm:flex'>
                            <FiSearch size={12} />
                            <input
                                type='text'
                                placeholder='Quick search...'
                                className='w-16 placeholder:text-slate-400 truncate focus:outline-none'
                            />
                            <kbd className='ml-1.5 rounded bg-slate-100 px-1 py-0.5 font-sans text-[9px] font-semibold text-slate-500'>
                                ⌘K
                            </kbd>
                        </div>
                        <span className='inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-600/20'>
                            {/* <span className='h-1.5 w-1.5 rounded-full bg-emerald-500' /> */}
                            <span class="relative flex size-1.75">
                                <span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75"></span>
                                <span class="relative inline-flex size-1.75 rounded-full bg-emerald-500"></span>
                            </span>
                            Synced
                        </span>
                    </div>
                </div>

                {/* Workspace Body */}
                <div className='grid min-h-[370px] grid-cols-[88px_minmax(0,1fr)] sm:grid-cols-[148px_minmax(0,1fr)]'>
                    {/* Interactive Sidebar */}
                    <aside className='flex flex-col justify-between border-r border-slate-200/80 bg-slate-50/50 p-2.5 sm:p-3.5'>
                        <div>
                            <div className='mb-3 flex items-center gap-2 px-2 py-1'>
                                <span className='flex h-6 w-6 items-center justify-center rounded-lg bg-violet-600 text-white'>
                                    <FiCommand size={13} />
                                </span>
                                <span className='hidden text-xs font-bold tracking-tight text-slate-900 sm:inline'>
                                    Nexa Ops
                                </span>
                            </div>

                            <p className='mb-1.5 px-2 text-[9px] font-bold uppercase tracking-wider text-slate-400'>
                                Modules
                            </p>
                            <div className='space-y-1'>
                                {sidebarNav.map(({ id, icon: Icon, label }) => {
                                    const isActive = activeTab === id;
                                    return (
                                        <button
                                            key={id}
                                            type='button'
                                            onClick={() => setActiveTab(id)}
                                            className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-[11px] font-semibold transition sm:text-xs ${
                                                isActive
                                                    ? 'bg-violet-600 text-white shadow-xs shadow-violet-600/25'
                                                    : 'text-slate-600 hover:bg-slate-200/60 hover:text-slate-900'
                                            }`}
                                        >
                                            <Icon
                                                size={14}
                                                className='shrink-0'
                                            />
                                            <span className='truncate'>
                                                {label}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <div className='border-t border-slate-200/80 pt-3'>
                            <div className='rounded-lg bg-slate-100/80 p-2 text-[10px] text-slate-500'>
                                <p className='font-semibold text-slate-700'>
                                    Interactive Preview
                                </p>
                                <p className='mt-0.5 hidden leading-tight sm:block'>
                                    Click any module above to switch views.
                                </p>
                            </div>
                        </div>
                    </aside>

                    {/* Active Module Content */}
                    <div className='min-w-0 bg-white p-4 sm:p-5'>
                        <div className='flex flex-wrap items-start justify-between gap-2 border-b border-slate-100 pb-3.5'>
                            <div>
                                <p className='text-[10px] font-bold tracking-wider text-violet-600'>
                                    {currentView.eyebrow}
                                </p>
                                <h3 className='mt-0.5 text-base font-bold tracking-tight text-slate-900 sm:text-lg'>
                                    {currentView.title}
                                </h3>
                                <p className='mt-0.5 text-[11px] text-slate-500'>
                                    {currentView.subtitle}
                                </p>
                            </div>
                            <Link
                                to={
                                    activeTab === 'overview'
                                        ? '/dashboard'
                                        : `/${activeTab}`
                                }
                                className='m-0 p-0 rounded-xl'
                            >
                                <RippleButton
                                    hue={270}
                                    saturation={93.3}
                                    lightness={46.9}
                                    variant='outline'
                                    size='xs'
                                    className='px-2.5 py-1.5 border border-slate-200 text-[11px] text-black/70 hover:text-violet-700'
                                >
                                    Open view <FiArrowUpRight size={12} />
                                </RippleButton>
                            </Link>
                        </div>

                        {/* Metric Cards */}
                        <div className='mt-4 grid grid-cols-3 gap-2.5'>
                            {currentView.stats.map(
                                ({ label, value, delta, icon: Icon, tone }) => (
                                    <div
                                        key={label}
                                        className='rounded-xl border border-slate-200/80 bg-slate-50/40 p-2.5 sm:p-3'
                                    >
                                        <div className='flex items-center justify-between gap-1'>
                                            <span
                                                className={`flex h-6 w-6 items-center justify-center rounded-lg ring-1 ring-inset ${toneBadgeStyles[tone]}`}
                                            >
                                                <Icon size={13} />
                                            </span>
                                            <span className='hidden rounded-full bg-slate-100 px-1.5 py-0.5 text-[9px] font-semibold text-slate-600 sm:inline-block'>
                                                {delta}
                                            </span>
                                        </div>
                                        <p className='mt-2.5 truncate text-sm font-bold tracking-tight text-slate-900 sm:text-base'>
                                            {value}
                                        </p>
                                        <p className='truncate text-[10px] font-medium text-slate-500'>
                                            {label}
                                        </p>
                                    </div>
                                ),
                            )}
                        </div>

                        {/* Activity / Records List */}
                        <div className='mt-4 rounded-xl border border-slate-200/80 bg-white p-3'>
                            <div className='flex items-center justify-between pb-2.5'>
                                <p className='text-xs font-bold text-slate-900'>
                                    {currentView.itemsHeader}
                                </p>
                                <FiMoreHorizontal
                                    className='text-slate-400'
                                    size={14}
                                />
                            </div>
                            <div className='divide-y divide-slate-100'>
                                {currentView.items.map(
                                    ({
                                        icon: Icon,
                                        title,
                                        meta,
                                        badge,
                                        tone,
                                    }) => (
                                        <div
                                            key={title}
                                            className='flex items-center justify-between gap-2.5 py-2 first:pt-0 last:pb-0'
                                        >
                                            <div className='flex min-w-0 items-center gap-2.5'>
                                                <span
                                                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ring-1 ring-inset ${toneBadgeStyles[tone]}`}
                                                >
                                                    <Icon size={13} />
                                                </span>
                                                <div className='min-w-0'>
                                                    <p className='truncate text-[11px] font-semibold text-slate-800 sm:text-xs'>
                                                        {title}
                                                    </p>
                                                    <p className='truncate text-[10px] text-slate-400'>
                                                        {meta}
                                                    </p>
                                                </div>
                                            </div>
                                            <span
                                                className={`shrink-0 rounded-md px-2 py-0.5 text-[10px] font-semibold ring-1 ring-inset ${toneBadgeStyles[tone]}`}
                                            >
                                                {badge}
                                            </span>
                                        </div>
                                    ),
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function AreaCard({ area }) {
    const Icon = area.icon;
    const toneClasses = {
        violet: 'bg-violet-50 text-violet-700 ring-violet-200/80 group-hover:bg-violet-600 group-hover:text-white group-hover:ring-violet-600',
        blue: 'bg-sky-50 text-sky-700 ring-sky-200/80 group-hover:bg-sky-600 group-hover:text-white group-hover:ring-sky-600',
        emerald:
            'bg-emerald-50 text-emerald-700 ring-emerald-200/80 group-hover:bg-emerald-600 group-hover:text-white group-hover:ring-emerald-600',
    };

    return (
        <article className='group relative flex h-full flex-col rounded-2xl border border-slate-200/90 bg-white p-6 shadow-2xs transition-all duration-300 hover:-translate-y-1 hover:border-violet-300/80 hover:shadow-xl hover:shadow-slate-900/5 sm:p-8'>
            <div
                className={`flex h-12 w-12 items-center justify-center rounded-2xl ring-1 ring-inset transition-colors duration-300 ${toneClasses[area.tone]}`}
            >
                <Icon size={22} />
            </div>

            <p className='mt-6 text-xs font-bold uppercase tracking-[0.15em] text-violet-600'>
                {area.eyebrow}
            </p>
            <h3 className='mt-2 text-xl font-semibold leading-snug tracking-tight text-slate-950'>
                {area.title}
            </h3>
            <p className='mt-3 text-sm leading-relaxed text-slate-600'>
                {area.description}
            </p>

            <ul className='mt-6 space-y-2.5 border-t border-slate-100 pt-5'>
                {area.bullets.map((bullet) => (
                    <li
                        key={bullet}
                        className='flex items-start gap-2.5 text-sm text-slate-600'
                    >
                        <span className='mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 ring-1 ring-emerald-500/20'>
                            <FiCheck size={11} strokeWidth={3} />
                        </span>
                        <span>{bullet}</span>
                    </li>
                ))}
            </ul>

            <div className='mt-auto pt-7'>
                <Link
                    to={area.link}
                    className='inline-flex items-center gap-2 text-sm font-semibold text-violet-700 transition-all group-hover:gap-3 hover:text-violet-900'
                >
                    {area.linkLabel}
                    <FiArrowRight
                        size={16}
                        className='transition-transform group-hover:translate-x-0.5'
                    />
                </Link>
            </div>
        </article>
    );
}

export default function HomePage() {
    const navigate = useNavigate();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [openFaq, setOpenFaq] = useState(0);

    const navItems = [
        { label: 'Platform', id: 'platform' },
        { label: 'Capabilities', id: 'capabilities' },
        { label: 'How it works', id: 'workflow' },
        { label: 'Security', id: 'security' },
        { label: 'FAQ', id: 'faq' },
    ];

    const scrollTo = (event, id) => {
        event.preventDefault();
        setMobileMenuOpen(false);
        document
            .getElementById(id)
            ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    return (
        <div className='min-h-screen overflow-x-clip bg-white text-slate-900 antialiased selection:bg-violet-200 selection:text-violet-950'>
            {/* Sticky Navigation */}
            <header className='sticky top-0 z-50 bg-white shadow-[0px_3px_8px_rgba(0,0,0,0.24)]'>
                <div className='mx-auto flex h-[72px] max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8'>
                    <Link
                        to='/'
                        className='group flex items-center gap-2.5 focus-visible:outline-none'
                        aria-label='Nexa Workspace home'
                    >
                        <BrandMark />
                        <span className='text-lg font-bold tracking-tight text-slate-950'>
                            Nexa<span className='text-violet-600'>.</span>
                        </span>
                    </Link>

                    <nav
                        className='hidden items-center nav lg:flex'
                        aria-label='Main navigation'
                    >
                        <ul>
                        {navItems.map((item) => (
                            <li>
                                <a
                                    key={item.id}
                                    href={`#${item.id}`}
                                    onClick={(e) => scrollTo(e, item.id)}
                                    className='text-sm font-medium text-slate-600 transition-colors hover:text-violet-600'
                                >
                                    {item.label}
                                </a>
                            </li>
                        ))}
                        </ul>
                    </nav>

                    <div className='hidden items-center gap-3 lg:flex'>
                        <Link
                            to='/login'
                            className='m-0 p-0 rounded-xl'
                        >
                            <RippleButton
                                // {...PRIMARY_BUTTON}
                                size='sm'
                                variant='ghost'
                                className='px-4 py-2.5 text-slate-700 transition hover:bg-slate-100 hover:text-slate-950'
                            >
                                Sign in
                            </RippleButton>
                        </Link>
                        <RippleButton
                            {...PRIMARY_BUTTON}
                            size='md'
                            variant='solid'
                            onClick={() => navigate('/users')}
                            className='rounded-xl px-4 text-sm'
                        >
                            Open workspace <FiArrowUpRight size={15} />
                        </RippleButton>
                    </div>

                    <RippleButton
                        hue={210}
                        saturation={8}
                        lightness={50}
                        size='sm'
                        variant='outline'
                        type='button'
                        onClick={() => setMobileMenuOpen((current) => !current)}
                        aria-label={
                            mobileMenuOpen
                                ? 'Close navigation menu'
                                : 'Open navigation menu'
                        }
                        aria-expanded={mobileMenuOpen}
                        className='rounded-xl p-2 lg:hidden'
                    >
                        {mobileMenuOpen ? (
                            <FaX size={20} />
                        ) : (
                            <LuMenu size={20} />
                        )}
                    </RippleButton>
                </div>

                {/* Mobile Drawer */}
                {mobileMenuOpen && (
                    <div className='border-t border-slate-200 bg-white px-4 py-4 shadow-xl lg:hidden'>
                        <nav
                            className='mx-auto flex max-w-7xl flex-col gap-1'
                            aria-label='Mobile navigation'
                        >
                            {navItems.map((item) => (
                                <a
                                    key={item.id}
                                    href={`#${item.id}`}
                                    onClick={(e) => scrollTo(e, item.id)}
                                    className='rounded-xl px-3 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-violet-50 hover:text-violet-700'
                                >
                                    {item.label}
                                </a>
                            ))}
                            <div className='mt-3 grid grid-cols-2 gap-2.5 border-t border-slate-100 pt-3'>
                                <Link
                                    to='/login'
                                    onClick={() => setMobileMenuOpen(false)}
                                    className='flex h-10 items-center justify-center rounded-xl border border-slate-200 px-3 text-sm font-semibold text-slate-700 hover:bg-slate-50'
                                >
                                    Sign in
                                </Link>
                                <RippleButton
                                    {...PRIMARY_BUTTON}
                                    size='sm'
                                    onClick={() => {
                                        setMobileMenuOpen(false);
                                        navigate('/users');
                                    }}
                                    className='h-10 rounded-xl text-sm font-semibold text-white'
                                >
                                    Open workspace
                                </RippleButton>
                            </div>
                        </nav>
                    </div>
                )}
            </header>

            <main>
                {/* Hero Section */}
                <section className='relative isolate overflow-hidden bg-slate-950'>
                    {/* Ambient Lighting & Grid */}
                    <div className='pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_20%_15%,rgba(124,58,237,0.28),transparent_42%),radial-gradient(ellipse_at_85%_80%,rgba(14,165,233,0.18),transparent_45%)]' />
                    <div className='pointer-events-none absolute inset-0 -z-10 opacity-[0.12] [background-image:linear-gradient(rgba(255,255,255,.15)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.15)_1px,transparent_1px)] [background-size:48px_48px] [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_90%)]' />

                    <div className='mx-auto grid max-w-7xl items-center gap-14 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-[1.02fr_.98fr] lg:gap-12 lg:px-8 lg:py-24'>
                        <div className='max-w-2xl'>
                            <div className='inline-flex items-center gap-2 rounded-full border border-violet-400/25 bg-violet-500/10 px-3.5 py-1.5 text-xs font-semibold text-violet-200 shadow-2xs backdrop-blur-md'>
                                <span className='flex h-2 w-2 rounded-full bg-violet-400' />
                                Unified Operational Workspace
                                <FiChevronRight
                                    size={13}
                                    className='text-violet-300'
                                />
                            </div>

                            <h1 className='mt-6 text-4xl font-semibold leading-[1.08] tracking-[-0.04em] text-white sm:text-5xl lg:text-[4rem]'>
                                Bring your people, work, and files into{' '}
                                <span className='bg-gradient-to-r from-violet-300 via-fuchsia-200 to-sky-200 bg-clip-text text-transparent'>
                                    one clear view.
                                </span>
                            </h1>

                            <p className='mt-6 max-w-xl text-base leading-relaxed text-slate-300 sm:text-lg sm:leading-8'>
                                A high-clarity command center for everyday
                                operations. Locate any record in seconds,
                                inspect its full context, and execute the next
                                action without bouncing between disconnected
                                tools.
                            </p>

                            <div className='mt-8 flex flex-col gap-3.5 sm:flex-row sm:items-center'>
                                <RippleButton
                                    {...PRIMARY_BUTTON}
                                    size='lg'
                                    onClick={() => navigate('/users')}
                                    className='inline-flex h-12 items-center justify-center gap-2 rounded-xl px-6 text-sm font-semibold text-white shadow-lg shadow-violet-950/40'
                                >
                                    Explore the workspace{' '}
                                    <FiArrowRight size={16} />
                                </RippleButton>
                                <a
                                    href='#platform'
                                    onClick={(e) => scrollTo(e, 'platform')}
                                    className='inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/[0.05] px-5 text-sm font-semibold text-white backdrop-blur-xs transition hover:border-white/25 hover:bg-white/10'
                                >
                                    Explore platform modules{' '}
                                    <FiChevronDown size={16} />
                                </a>
                            </div>

                            <div className='mt-9 flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-white/10 pt-6 text-xs font-medium text-slate-400'>
                                <span className='inline-flex items-center gap-2'>
                                    <FiCheckCircle
                                        className='text-emerald-400'
                                        size={15}
                                    />
                                    Server-backed filtering
                                </span>
                                <span className='inline-flex items-center gap-2'>
                                    <FiCheckCircle
                                        className='text-emerald-400'
                                        size={15}
                                    />
                                    Point-in-time file versions
                                </span>
                                <span className='inline-flex items-center gap-2'>
                                    <FiCheckCircle
                                        className='text-emerald-400'
                                        size={15}
                                    />
                                    Role-based data masking
                                </span>
                            </div>
                        </div>

                        <div className='lg:pl-2'>
                            <ProductPreview />
                        </div>
                    </div>

                    {/* Hero Sub-bar */}
                    <div className='border-t border-white/10 bg-white/[0.02]'>
                        <div className='mx-auto grid max-w-7xl grid-cols-1 divide-y divide-white/10 px-4 sm:grid-cols-3 sm:divide-x sm:divide-y-0 sm:px-6 lg:px-8'>
                            {[
                                {
                                    icon: FiUsers,
                                    title: 'People in context',
                                    detail: 'Directory, roles, and account posture',
                                    link: '/users',
                                },
                                {
                                    icon: FiCheckCircle,
                                    title: 'Work in motion',
                                    detail: 'Structured task queues and status tracking',
                                    link: '/tasks',
                                },
                                {
                                    icon: FiFolder,
                                    title: 'Files in reach',
                                    detail: 'Metadata inspection and version history',
                                    link: '/files',
                                },
                            ].map(({ icon: Icon, title, detail, link }) => (
                                <Link
                                    key={title}
                                    to={link}
                                    className='group flex items-center justify-between gap-4 py-5 transition sm:px-6 first:sm:pl-0 last:sm:pr-0'
                                >
                                    <div className='flex items-center gap-3.5'>
                                        <span className='flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.05] text-violet-300 transition group-hover:border-violet-400/40 group-hover:bg-violet-500/15'>
                                            <Icon size={18} />
                                        </span>
                                        <div>
                                            <p className='text-sm font-semibold text-white group-hover:text-violet-200'>
                                                {title}
                                            </p>
                                            <p className='mt-0.5 text-xs text-slate-400'>
                                                {detail}
                                            </p>
                                        </div>
                                    </div>
                                    <FiArrowUpRight
                                        size={16}
                                        className='shrink-0 text-slate-500 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-violet-300'
                                    />
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Philosophy / Intro Section */}
                <section className='px-4 py-20 sm:px-6 sm:py-24 lg:px-8 lg:py-28'>
                    <div className='mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:items-start lg:gap-20'>
                        <div>
                            <div className='mb-3 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-violet-600'>
                                <span className='h-1.5 w-1.5 rounded-full bg-violet-600' />
                                Designed for momentum
                            </div>
                            <h2 className='text-3xl font-semibold leading-tight tracking-[-0.025em] text-slate-950 sm:text-4xl'>
                                Less hunting for information. More confidence in
                                the next step.
                            </h2>
                        </div>
                        <div className='space-y-5 text-base leading-relaxed text-slate-600 sm:text-lg sm:leading-8'>
                            <p>
                                When operational data is fragmented across
                                disconnected tables, modal forms, and
                                inconsistent detail views, routine decisions
                                take more effort than they should. A
                                well-engineered workspace makes the path from
                                overview to action effortless.
                            </p>
                            <p>
                                Nexa brings the core building blocks of daily
                                operations—people, tasks, and files—into a
                                single, cohesive architecture. While each domain
                                surfaces specialized metadata, every screen
                                shares identical patterns for filtering,
                                pagination, state feedback, and error recovery.
                            </p>
                            <div className='flex items-start gap-4 rounded-2xl border border-violet-200/80 bg-gradient-to-br from-violet-50/90 to-indigo-50/40 p-5 shadow-2xs'>
                                <span className='mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-violet-600 shadow-xs ring-1 ring-violet-100'>
                                    <FiCommand size={18} />
                                </span>
                                <p className='text-sm leading-relaxed text-slate-800'>
                                    <strong className='font-semibold text-slate-950'>
                                        Our core engineering principle:
                                    </strong>{' '}
                                    Surface the exact context operators need,
                                    make the primary action unmistakable, and
                                    provide deterministic feedback after every
                                    request.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Core Platform Areas */}
                <section
                    id='platform'
                    className='scroll-mt-20 border-y border-slate-200/80 bg-slate-50/70 px-4 py-20 sm:px-6 sm:py-24 lg:px-8 lg:py-28'
                >
                    <div className='mx-auto max-w-7xl'>
                        <SectionHeading
                            eyebrow='One connected platform'
                            title='The essentials, thoughtfully organized.'
                            description='Switch seamlessly between user administration, task orchestration, and document management without relearning the interface on every route.'
                        />
                        <div className='mt-12 grid grid-cols-1 gap-6 lg:grid-cols-3'>
                            {productAreas.map((area) => (
                                <AreaCard key={area.id} area={area} />
                            ))}
                        </div>
                    </div>
                </section>

                {/* Capability Grid */}
                <section
                    id='capabilities'
                    className='scroll-mt-20 px-4 py-20 sm:px-6 sm:py-24 lg:px-8 lg:py-28'
                >
                    <div className='mx-auto max-w-7xl'>
                        <div className='flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between'>
                            <SectionHeading
                                eyebrow='Built for daily use'
                                title='Small details make a better workflow.'
                                description='An operational tool is more than a collection of database views. It is the responsiveness, feedback loops, and list ergonomics that keep teams moving.'
                            />
                            <Link
                                to='/users'
                                className='inline-flex shrink-0 items-center gap-2 self-start rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-2xs transition hover:border-violet-200 hover:bg-violet-50 hover:text-violet-700 lg:mb-1'
                            >
                                Browse live directory{' '}
                                <FiArrowUpRight size={15} />
                            </Link>
                        </div>

                        <div className='mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3'>
                            {capabilities.map(
                                ({ icon: Icon, title, description }, index) => (
                                    <article
                                        key={title}
                                        className='group rounded-2xl border border-slate-200/80 bg-white p-6 transition-all duration-200 hover:border-violet-200 hover:shadow-md hover:shadow-slate-900/5'
                                    >
                                        <div className='flex items-center justify-between'>
                                            <span className='flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-700 transition-colors group-hover:bg-violet-600 group-hover:text-white'>
                                                <Icon size={20} />
                                            </span>
                                            <span className='font-mono text-xs font-semibold text-slate-300 transition-colors group-hover:text-violet-400'>
                                                0{index + 1}
                                            </span>
                                        </div>
                                        <h3 className='mt-5 text-lg font-semibold tracking-tight text-slate-950'>
                                            {title}
                                        </h3>
                                        <p className='mt-2 text-sm leading-relaxed text-slate-600'>
                                            {description}
                                        </p>
                                    </article>
                                ),
                            )}
                        </div>
                    </div>
                </section>

                {/* Dark Feature Spotlight */}
                <section className='px-4 pb-20 sm:px-6 sm:pb-24 lg:px-8 lg:pb-28'>
                    <div className='mx-auto max-w-7xl overflow-hidden rounded-[2rem] bg-slate-950 text-white shadow-2xl ring-1 ring-slate-900/10'>
                        <div className='grid lg:grid-cols-2'>
                            <div className='p-8 sm:p-12 lg:p-14 xl:p-16'>
                                <div className='inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-violet-300'>
                                    <span className='h-1.5 w-1.5 rounded-full bg-violet-400' />
                                    Progressive disclosure
                                </div>
                                <h2 className='mt-3 text-3xl font-semibold leading-tight tracking-[-0.025em] sm:text-4xl'>
                                    The right context, without the visual
                                    clutter.
                                </h2>
                                <p className='mt-4 max-w-xl text-base leading-relaxed text-slate-300'>
                                    Every record carries deep metadata behind
                                    the scenes. Nexa keeps list views scannable
                                    and lightweight, then surfaces complete
                                    technical details when you open a specific
                                    item.
                                </p>

                                <div className='mt-8 space-y-5'>
                                    {[
                                        {
                                            icon: FiSearch,
                                            title: 'Start broad, then narrow',
                                            description:
                                                'Combine instant text search with status and role filters to isolate exact subsets.',
                                        },
                                        {
                                            icon: FiFileText,
                                            title: 'Inspect records in depth',
                                            description:
                                                'Audit user permissions, task histories, and file version ledgers in dedicated detail views.',
                                        },
                                        {
                                            icon: FiCheckCircle,
                                            title: 'Deterministic state feedback',
                                            description:
                                                'Clear loading indicators and explicit confirmation banners remove guesswork after every action.',
                                        },
                                    ].map(
                                        ({
                                            icon: Icon,
                                            title,
                                            description,
                                        }) => (
                                            <div
                                                key={title}
                                                className='flex items-start gap-4'
                                            >
                                                <span className='flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.06] text-violet-300'>
                                                    <Icon size={18} />
                                                </span>
                                                <div>
                                                    <h3 className='text-sm font-semibold text-white'>
                                                        {title}
                                                    </h3>
                                                    <p className='mt-1 text-sm leading-relaxed text-slate-400'>
                                                        {description}
                                                    </p>
                                                </div>
                                            </div>
                                        ),
                                    )}
                                </div>

                                <div className='mt-9'>
                                    <RippleButton
                                        {...PRIMARY_BUTTON}
                                        size='md'
                                        onClick={() => navigate('/users')}
                                        className='inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white'
                                    >
                                        Launch workspace{' '}
                                        <FiArrowRight size={16} />
                                    </RippleButton>
                                </div>
                            </div>

                            {/* Visual Stack Illustration */}
                            <div className='relative flex min-h-[400px] flex-col justify-center overflow-hidden border-t border-white/10 bg-gradient-to-br from-violet-950/70 via-slate-900 to-sky-950/70 p-6 sm:p-10 lg:border-l lg:border-t-0 lg:p-12'>
                                <div className='pointer-events-none absolute -right-20 -top-16 h-64 w-64 rounded-full bg-violet-500/20 blur-3xl' />
                                <div className='pointer-events-none absolute -bottom-16 -left-16 h-64 w-64 rounded-full bg-sky-500/15 blur-3xl' />

                                <div className='relative space-y-4'>
                                    {/* Card 1: User Record */}
                                    <div className='rounded-2xl border border-white/15 bg-white/[0.07] p-5 shadow-xl backdrop-blur-md'>
                                        <div className='flex items-center justify-between gap-3'>
                                            <div className='flex items-center gap-3'>
                                                <div className='flex h-10 w-10 items-center justify-center rounded-xl bg-violet-400/20 text-violet-200 ring-1 ring-violet-300/30'>
                                                    <FiUsers size={19} />
                                                </div>
                                                <div>
                                                    <p className='text-sm font-semibold text-white'>
                                                        Elena Rostova
                                                    </p>
                                                    <p className='mt-0.5 text-xs text-slate-300'>
                                                        elena.r@nexa.workspace ·
                                                        ID #USR-8492
                                                    </p>
                                                </div>
                                            </div>
                                            <span className='rounded-full bg-emerald-400/15 px-2.5 py-1 text-[10px] font-semibold text-emerald-300 ring-1 ring-emerald-400/30'>
                                                Active
                                            </span>
                                        </div>
                                        <div className='mt-4 grid grid-cols-2 gap-3'>
                                            <div className='rounded-xl border border-white/10 bg-slate-950/40 p-3'>
                                                <p className='text-[10px] font-medium uppercase tracking-wider text-slate-400'>
                                                    Access Role
                                                </p>
                                                <p className='mt-1 text-sm font-semibold text-white'>
                                                    Workspace Admin
                                                </p>
                                            </div>
                                            <div className='rounded-xl border border-white/10 bg-slate-950/40 p-3'>
                                                <p className='text-[10px] font-medium uppercase tracking-wider text-slate-400'>
                                                    Sensitive Data
                                                </p>
                                                <p className='mt-1 font-mono text-sm font-semibold text-slate-300'>
                                                    •••• •••• 4829
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Card 2: File Version Ledger */}
                                    <div className='ml-4 rounded-2xl border border-white/15 bg-slate-950/85 p-5 shadow-2xl backdrop-blur-md sm:ml-10'>
                                        <div className='flex items-center justify-between gap-3'>
                                            <div className='flex items-center gap-3'>
                                                <div className='flex h-10 w-10 items-center justify-center rounded-xl bg-sky-400/15 text-sky-200 ring-1 ring-sky-300/30'>
                                                    <FiFolder size={19} />
                                                </div>
                                                <div>
                                                    <p className='text-sm font-semibold text-white'>
                                                        infrastructure-audit-2026.pdf
                                                    </p>
                                                    <p className='mt-0.5 text-xs text-slate-400'>
                                                        Revision v3.2 · 4.8 MB ·
                                                        Verified checksum
                                                    </p>
                                                </div>
                                            </div>
                                            <span className='rounded-md bg-sky-400/15 px-2 py-1 font-mono text-[10px] font-semibold text-sky-300'>
                                                v3.2
                                            </span>
                                        </div>
                                        <div className='mt-4 space-y-2'>
                                            <div className='flex items-center justify-between text-[11px] text-slate-400'>
                                                <span>
                                                    Storage replication status
                                                </span>
                                                <span className='font-semibold text-violet-300'>
                                                    100%
                                                </span>
                                            </div>
                                            <div className='h-1.5 w-full overflow-hidden rounded-full bg-white/10'>
                                                <div className='h-full w-full rounded-full bg-gradient-to-r from-violet-400 to-sky-400' />
                                            </div>
                                        </div>
                                    </div>

                                    <div className='flex items-center gap-2 pl-2 pt-1 text-xs text-slate-300'>
                                        <FiCheckCircle
                                            className='text-emerald-400'
                                            size={15}
                                        />
                                        Unified inspection patterns across every
                                        module
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Workflow Steps */}
                <section
                    id='workflow'
                    className='scroll-mt-20 border-y border-slate-200/80 bg-[#f8f7fc] px-4 py-20 sm:px-6 sm:py-24 lg:px-8 lg:py-28'
                >
                    <div className='mx-auto max-w-7xl'>
                        <SectionHeading
                            eyebrow='How it works'
                            title='A natural path from question to action.'
                            description='A predictable four-step operational loop lets your team spend less time navigating menus and more time closing out work.'
                        />
                        <div className='relative mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4'>
                            <div className='pointer-events-none absolute left-8 right-8 top-12 hidden border-t border-dashed border-violet-300 lg:block' />
                            {workflow.map((step) => (
                                <article
                                    key={step.number}
                                    className='relative flex flex-col rounded-2xl border border-slate-200/90 bg-white p-6 shadow-2xs transition hover:border-violet-200 hover:shadow-md'
                                >
                                    <div className='relative z-10 flex h-12 w-12 items-center justify-center rounded-2xl border border-violet-200 bg-violet-50 font-mono text-sm font-bold text-violet-700 shadow-2xs'>
                                        {step.number}
                                    </div>
                                    <h3 className='mt-6 text-lg font-semibold tracking-tight text-slate-950'>
                                        {step.title}
                                    </h3>
                                    <p className='mt-2.5 text-sm leading-relaxed text-slate-600'>
                                        {step.description}
                                    </p>
                                </article>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Data Clarity Section */}
                <section className='px-4 py-20 sm:px-6 sm:py-24 lg:px-8 lg:py-28'>
                    <div className='mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.92fr_1.08fr] lg:items-center lg:gap-20'>
                        <div>
                            <SectionHeading
                                eyebrow='Clarity over noise'
                                title='Make information easier to act on.'
                                description='An operational interface should always be transparent about what data is being shown, where it originates, and what each action will trigger.'
                            />
                            <p className='mt-5 text-sm leading-relaxed text-slate-600'>
                                That means never conflating paginated samples
                                with global totals, keeping search and sort
                                controls anchored to the lists they govern, and
                                clearly distinguishing an empty filter result
                                from an API error.
                            </p>
                            <a
                                href='#principles'
                                onClick={(e) => scrollTo(e, 'principles')}
                                className='mt-6 inline-flex items-center gap-2 text-sm font-semibold text-violet-700 transition hover:gap-3 hover:text-violet-900'
                            >
                                Explore our product principles{' '}
                                <FiArrowRight size={15} />
                            </a>
                        </div>

                        <div className='space-y-3.5'>
                            {[
                                {
                                    icon: FiFilter,
                                    title: 'Self-documenting filters',
                                    detail: 'Active search terms and filter pills remain visible at the top of every list with one-click reset controls.',
                                },
                                {
                                    icon: FiClock,
                                    title: 'Responsive loading states',
                                    detail: 'Layout-preserving skeletons and inline spinners communicate exactly when data is being fetched or mutated.',
                                },
                                {
                                    icon: FiCheckCircle,
                                    title: 'Accurate metric summaries',
                                    detail: 'Page-level record counts are explicitly labeled and kept distinct from server-wide aggregations.',
                                },
                                {
                                    icon: FiInfo,
                                    title: 'Actionable empty & error states',
                                    detail: 'Contextual guidance tells you whether to broaden a filter query, retry a network request, or create a new record.',
                                },
                            ].map(({ icon: Icon, title, detail }) => (
                                <div
                                    key={title}
                                    className='flex items-start gap-4 rounded-2xl border border-slate-200/90 bg-white p-5 transition hover:border-violet-200 hover:shadow-md hover:shadow-slate-900/5'
                                >
                                    <span className='flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-700 ring-1 ring-violet-100'>
                                        <Icon size={19} />
                                    </span>
                                    <div>
                                        <h3 className='text-sm font-semibold text-slate-950'>
                                            {title}
                                        </h3>
                                        <p className='mt-1 text-sm leading-relaxed text-slate-600'>
                                            {detail}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Security Section */}
                <section
                    id='security'
                    className='scroll-mt-20 bg-slate-950 px-4 py-20 text-white sm:px-6 sm:py-24 lg:px-8 lg:py-28'
                >
                    <div className='mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:gap-20'>
                        <div>
                            <div className='flex h-12 w-12 items-center justify-center rounded-2xl border border-emerald-400/20 bg-emerald-400/10 text-emerald-300'>
                                <FiShield size={23} />
                            </div>
                            <p className='mt-6 text-xs font-bold uppercase tracking-[0.16em] text-emerald-300'>
                                Security & Governance
                            </p>
                            <h2 className='mt-3 text-3xl font-semibold leading-tight tracking-[-0.025em] sm:text-4xl'>
                                A clearer interface that respects the data it
                                handles.
                            </h2>
                            <p className='mt-5 text-base leading-relaxed text-slate-300'>
                                User directories and organizational files
                                require disciplined handling. Nexa is
                                architected around least-privilege visibility,
                                deliberate field masking, and strict
                                server-enforced authorization.
                            </p>
                            <p className='mt-4 text-sm leading-relaxed text-slate-400'>
                                Thoughtful client-side ergonomics prevent
                                accidental shoulder-surfing exposure while
                                deferring all access control, validation, and
                                cryptographic verification to hardened backend
                                endpoints.
                            </p>
                        </div>

                        <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
                            {[
                                {
                                    icon: FiLock,
                                    title: 'Sensitive field masking',
                                    description:
                                        'Automatically redact sensitive personal identifiers and never expose raw password hashes, PINs, or card verification codes.',
                                },
                                {
                                    icon: FiShield,
                                    title: 'Server-side enforcement',
                                    description:
                                        'Every query and mutation is authenticated and authorized at the API layer—never relying solely on hidden UI buttons.',
                                },
                                {
                                    icon: FiCheckCircle,
                                    title: 'Auditable outcomes',
                                    description:
                                        'Surface unambiguous status codes and confirmation messages so operators know the exact state of every transaction.',
                                },
                                {
                                    icon: FiLayers,
                                    title: 'Scoped data payloads',
                                    description:
                                        'Keep high-level list payloads lightweight and fetch detailed attributes only when an authorized user inspects a record.',
                                },
                            ].map(({ icon: Icon, title, description }) => (
                                <div
                                    key={title}
                                    className='rounded-2xl border border-white/10 bg-white/[0.04] p-6 transition hover:border-emerald-400/30 hover:bg-white/[0.07]'
                                >
                                    <Icon
                                        size={21}
                                        className='text-emerald-300'
                                    />
                                    <h3 className='mt-4 text-base font-semibold text-white'>
                                        {title}
                                    </h3>
                                    <p className='mt-2 text-sm leading-relaxed text-slate-400'>
                                        {description}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Product Principles */}
                <section
                    id='principles'
                    className='scroll-mt-20 px-4 py-20 sm:px-6 sm:py-24 lg:px-8 lg:py-28'
                >
                    <div className='mx-auto max-w-7xl'>
                        <SectionHeading
                            eyebrow='Product principles'
                            title='Software that feels dependable every day.'
                            description="A professional workspace isn't measured only by its feature checklist—it's measured by how calmly and predictably your team can run operations."
                        />
                        <div className='mt-12 grid grid-cols-1 gap-6 md:grid-cols-3'>
                            {[
                                {
                                    number: '01',
                                    title: 'Clarity',
                                    description:
                                        'Direct typography, high-contrast status badges, and honest data labels ensure every screen explains itself at a glance.',
                                },
                                {
                                    number: '02',
                                    title: 'Consistency',
                                    description:
                                        'Shared navigation patterns, filter bars, and detail drawers mean mastering one module teaches you the entire platform.',
                                },
                                {
                                    number: '03',
                                    title: 'Control',
                                    description:
                                        'Explicit confirmation states and non-destructive filter resets give operators full confidence over every action.',
                                },
                            ].map((item) => (
                                <article
                                    key={item.number}
                                    className='rounded-2xl border border-slate-200/90 bg-slate-50/40 p-7 transition hover:border-violet-200 hover:bg-white hover:shadow-md'
                                >
                                    <span className='inline-flex rounded-lg bg-violet-100/80 px-2.5 py-1 font-mono text-xs font-bold text-violet-700'>
                                        {item.number}
                                    </span>
                                    <h3 className='mt-5 text-xl font-semibold tracking-tight text-slate-950'>
                                        {item.title}
                                    </h3>
                                    <p className='mt-3 text-sm leading-relaxed text-slate-600'>
                                        {item.description}
                                    </p>
                                </article>
                            ))}
                        </div>
                    </div>
                </section>

                {/* FAQ Section */}
                <section
                    id='faq'
                    className='scroll-mt-20 border-t border-slate-200/80 bg-slate-50/70 px-4 py-20 sm:px-6 sm:py-24 lg:px-8 lg:py-28'
                >
                    <div className='mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.78fr_1.22fr] lg:gap-20'>
                        <div>
                            <div className='mb-3 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-violet-600'>
                                <span className='h-1.5 w-1.5 rounded-full bg-violet-600' />
                                FAQ
                            </div>
                            <h2 className='text-3xl font-semibold tracking-[-0.025em] text-slate-950 sm:text-4xl'>
                                Frequently asked questions.
                            </h2>
                            <p className='mt-4 text-base leading-relaxed text-slate-600'>
                                Everything you need to know about how the
                                workspace is structured and how modules
                                interact.
                            </p>
                            <div className='mt-8 rounded-2xl border border-slate-200/90 bg-white p-6 shadow-2xs'>
                                <p className='text-sm font-semibold text-slate-950'>
                                    Ready to see it in action?
                                </p>
                                <p className='mt-1.5 text-sm leading-relaxed text-slate-600'>
                                    Jump directly into the live workspace to
                                    explore user directories, task queues, and
                                    file repositories.
                                </p>
                                <Link
                                    to='/users'
                                    className='mt-4 inline-flex items-center gap-2 text-sm font-semibold text-violet-700 transition hover:gap-3 hover:text-violet-900'
                                >
                                    Open live workspace{' '}
                                    <FiArrowRight size={15} />
                                </Link>
                            </div>
                        </div>

                        <div className='divide-y divide-slate-200/90 rounded-2xl border border-slate-200/90 bg-white px-6 shadow-2xs sm:px-8'>
                            {faqs.map((faq, index) => {
                                const isOpen = openFaq === index;
                                return (
                                    <div key={faq.question} className='py-5'>
                                        <button
                                            type='button'
                                            aria-expanded={isOpen}
                                            onClick={() =>
                                                setOpenFaq(isOpen ? -1 : index)
                                            }
                                            className='flex w-full items-center justify-between gap-4 text-left focus-visible:outline-none'
                                        >
                                            <span className='text-sm font-semibold leading-6 text-slate-950 sm:text-base'>
                                                {faq.question}
                                            </span>
                                            <span
                                                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border transition-all duration-200 ${
                                                    isOpen
                                                        ? 'rotate-180 border-violet-200 bg-violet-50 text-violet-700'
                                                        : 'border-slate-200 text-slate-500 hover:bg-slate-50'
                                                }`}
                                            >
                                                <FiChevronDown size={16} />
                                            </span>
                                        </button>
                                        <div
                                            className={`grid transition-all duration-200 ease-out ${
                                                isOpen
                                                    ? 'grid-rows-[1fr] pt-3 opacity-100'
                                                    : 'grid-rows-[0fr] opacity-0'
                                            }`}
                                        >
                                            <div className='overflow-hidden'>
                                                <p className='max-w-2xl pr-8 text-sm leading-relaxed text-slate-600'>
                                                    {faq.answer}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </section>

                {/* Final Call to Action */}
                <section className='px-4 py-20 sm:px-6 sm:py-24 lg:px-8 lg:py-28'>
                    <div className='relative mx-auto max-w-7xl overflow-hidden rounded-[2rem] bg-gradient-to-br from-violet-700 via-violet-700 to-indigo-900 px-6 py-14 text-center shadow-2xl shadow-violet-950/20 sm:px-12 sm:py-18 lg:px-20 lg:py-22'>
                        <div className='pointer-events-none absolute -left-20 -top-24 h-72 w-72 rounded-full bg-white/15 blur-3xl' />
                        <div className='pointer-events-none absolute -bottom-28 -right-12 h-72 w-72 rounded-full bg-sky-400/15 blur-3xl' />

                        <div className='relative mx-auto max-w-3xl'>
                            <div className='mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-white/20 bg-white/10 text-white shadow-inner'>
                                <FiZap size={22} />
                            </div>
                            <h2 className='mt-6 text-3xl font-semibold leading-tight tracking-[-0.03em] text-white sm:text-4xl lg:text-5xl'>
                                Ready to streamline your daily operations?
                            </h2>
                            <p className='mx-auto mt-5 max-w-2xl text-base leading-relaxed text-violet-100 sm:text-lg'>
                                Step into the workspace and experience how user
                                directories, task queues, and versioned files
                                come together in one cohesive interface.
                            </p>
                            <div className='mt-9 flex flex-col justify-center gap-3.5 sm:flex-row'>
                                <RippleButton
                                    hue={0}
                                    saturation={0}
                                    lightness={100}
                                    variant='solid'
                                    size='lg'
                                    onClick={() => navigate('/users')}
                                    className='inline-flex h-12 items-center justify-center gap-2 rounded-xl px-6 text-sm font-semibold text-violet-900 shadow-lg'
                                >
                                    Open workspace <FiArrowRight size={16} />
                                </RippleButton>
                                <Link
                                    to='/login'
                                    className='inline-flex h-12 items-center justify-center rounded-xl border border-white/25 bg-white/[0.08] px-6 text-sm font-semibold text-white backdrop-blur-xs transition hover:bg-white/15'
                                >
                                    Sign in to your account
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className='border-t border-slate-200/90 bg-white'>
                <div className='mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8'>
                    <div className='grid grid-cols-1 gap-10 md:grid-cols-[1.4fr_0.8fr_0.8fr_0.8fr]'>
                        <div className='max-w-sm'>
                            <Link
                                to='/'
                                className='group inline-flex items-center gap-2.5'
                            >
                                <BrandMark />
                                <span className='text-lg font-bold tracking-tight text-slate-950'>
                                    Nexa
                                    <span className='text-violet-600'>.</span>
                                </span>
                            </Link>
                            <p className='mt-4 text-sm leading-relaxed text-slate-600'>
                                A unified operational workspace for managing
                                people, tasks, and versioned files with speed
                                and clarity.
                            </p>
                            <div className='mt-5 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600'>
                                <span className='h-2 w-2 rounded-full bg-emerald-500' />
                                All workspace modules operational
                            </div>
                        </div>

                        <div>
                            <h3 className='text-xs font-bold uppercase tracking-[0.15em] text-slate-900'>
                                Workspace
                            </h3>
                            <ul className='mt-4 space-y-3'>
                                <li>
                                    <Link
                                        to='/users'
                                        className='text-sm text-slate-600 transition hover:text-violet-600'
                                    >
                                        Users Directory
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        to='/tasks'
                                        className='text-sm text-slate-600 transition hover:text-violet-600'
                                    >
                                        Task Operations
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        to='/files'
                                        className='text-sm text-slate-600 transition hover:text-violet-600'
                                    >
                                        File Repository
                                    </Link>
                                </li>
                            </ul>
                        </div>

                        <div>
                            <h3 className='text-xs font-bold uppercase tracking-[0.15em] text-slate-900'>
                                Platform
                            </h3>
                            <ul className='mt-4 space-y-3'>
                                <li>
                                    <a
                                        href='#platform'
                                        onClick={(e) => scrollTo(e, 'platform')}
                                        className='text-sm text-slate-600 transition hover:text-violet-600'
                                    >
                                        Overview
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href='#capabilities'
                                        onClick={(e) =>
                                            scrollTo(e, 'capabilities')
                                        }
                                        className='text-sm text-slate-600 transition hover:text-violet-600'
                                    >
                                        Capabilities
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href='#workflow'
                                        onClick={(e) => scrollTo(e, 'workflow')}
                                        className='text-sm text-slate-600 transition hover:text-violet-600'
                                    >
                                        Workflow
                                    </a>
                                </li>
                            </ul>
                        </div>

                        <div>
                            <h3 className='text-xs font-bold uppercase tracking-[0.15em] text-slate-900'>
                                Account
                            </h3>
                            <ul className='mt-4 space-y-3'>
                                <li>
                                    <Link
                                        to='/login'
                                        className='text-sm text-slate-600 transition hover:text-violet-600'
                                    >
                                        Sign in
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        to='/settings'
                                        className='text-sm text-slate-600 transition hover:text-violet-600'
                                    >
                                        Workspace Settings
                                    </Link>
                                </li>
                                <li>
                                    <a
                                        href='#faq'
                                        onClick={(e) => scrollTo(e, 'faq')}
                                        className='text-sm text-slate-600 transition hover:text-violet-600'
                                    >
                                        FAQ
                                    </a>
                                </li>
                            </ul>
                        </div>
                    </div>

                    <div className='mt-12 flex flex-col gap-4 border-t border-slate-200/80 pt-6 sm:flex-row sm:items-center sm:justify-between'>
                        <p className='text-xs text-slate-500'>
                            © {new Date().getFullYear()} Nexa Workspace. All
                            rights reserved.
                        </p>
                        <div className='flex flex-wrap items-center gap-6 text-xs font-medium text-slate-500'>
                            <a
                                href='#security'
                                onClick={(e) => scrollTo(e, 'security')}
                                className='transition hover:text-violet-600'
                            >
                                Security
                            </a>
                            <a
                                href='#principles'
                                onClick={(e) => scrollTo(e, 'principles')}
                                className='transition hover:text-violet-600'
                            >
                                Principles
                            </a>
                            <button
                                type='button'
                                onClick={() =>
                                    window.scrollTo({
                                        top: 0,
                                        behavior: 'smooth',
                                    })
                                }
                                className='inline-flex items-center gap-1 text-slate-600 transition hover:text-violet-600'
                            >
                                Back to top <FaArrowUp size={11} />
                            </button>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
