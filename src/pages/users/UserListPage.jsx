import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router';
import {
    FiUsers,
    FiSearch,
    FiRefreshCw,
    FiChevronLeft,
    FiChevronRight,
    FiArrowUpRight,
    FiShield,
    FiAlertCircle,
    FiUser,
} from 'react-icons/fi';
import { FaX } from "react-icons/fa6";
import { RippleButton } from '@/components/RippleButton';
import { usersApi } from '@/api/users.api';
import Header from '@/components/layout/Header';

function formatLabel(value) {
    if (value === null || value === undefined || value === '') {
        return 'Unknown';
    }

    return String(value)
        .replace(/[_-]+/g, ' ')
        .replace(/\b\w/g, (character) => character.toUpperCase());
}

function getStatusClasses(status) {
    const value = String(status ?? '').toLowerCase();

    if (['active', 'enabled', 'verified'].includes(value)) {
        return 'bg-emerald-50 text-emerald-700 ring-emerald-600/20';
    }

    if (['inactive', 'disabled', 'suspended', 'blocked'].includes(value)) {
        return 'bg-rose-50 text-rose-700 ring-rose-600/20';
    }

    if (['pending', 'invited', 'unverified'].includes(value)) {
        return 'bg-amber-50 text-amber-700 ring-amber-600/20';
    }

    return 'bg-slate-100 text-slate-600 ring-slate-500/20';
}

function getInitials(user) {
    const name =
        user?.name ||
        user?.full_name ||
        user?.profile?.name ||
        user?.contact?.name;

    if (name) {
        return String(name)
            .trim()
            .split(/\s+/)
            .slice(0, 2)
            .map((part) => part[0])
            .join('')
            .toUpperCase();
    }

    const email = user?.contact?.email || user?.email;

    return email ? String(email)[0].toUpperCase() : 'U';
}

function getUserIdentity(user) {
    const email = user?.contact?.email || user?.email || '';
    const name =
        user?.name ||
        user?.full_name ||
        user?.profile?.name ||
        user?.contact?.name;

    return {
        email,
        primary: name || email || `User ${user?.id ?? ''}`,
        secondary: name && email ? email : `Account ID: ${user?.id ?? '—'}`,
    };
}

function LoadingRows() {
    return Array.from({ length: 5 }, (_, index) => (
        <tr key={index} className='animate-pulse'>
            <td className='px-6 py-5'>
                <div className='flex items-center gap-3'>
                    <div className='h-10 w-10 rounded-full bg-slate-200' />
                    <div className='space-y-2'>
                        <div className='h-3 w-36 rounded bg-slate-200' />
                        <div className='h-3 w-24 rounded bg-slate-100' />
                    </div>
                </div>
            </td>
            <td className='px-6 py-5'>
                <div className='h-6 w-20 rounded-full bg-slate-200' />
            </td>
            <td className='px-6 py-5'>
                <div className='h-6 w-20 rounded-full bg-slate-200' />
            </td>
            <td className='px-6 py-5 text-right'>
                <div className='ml-auto h-8 w-20 rounded-lg bg-slate-200' />
            </td>
        </tr>
    ));
}

export default function UserListPage() {
    const [data, setData] = useState(null);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [adminCount, setAdminCount] = useState(null);
    const [limit, setLimit] = useState(50);
    const [offset, setOffset] = useState(0);
    const [query, setQuery] = useState('');
    const [debouncedQuery, setDebouncedQuery] = useState('');
    const [reloadKey, setReloadKey] = useState(0);

    // Debounce the search input and reset pagination after typing.
    useEffect(() => {
        const timer = setTimeout(() => {
            setOffset(0);
            setDebouncedQuery(query.trim());
        }, 300);

        return () => clearTimeout(timer);
    }, [query]);

    useEffect(() => {
        let active = true;

        usersApi
            .list({ limit: 1, offset: 0, role: 'admin' })
            .then((result) => {
                if (active) {
                    setAdminCount(Number(result?.count ?? 0));
                }
            })
            .catch(() => {
                if (active) {
                    setAdminCount(null);
                }
            });

        return () => {
            active = false;
        };
    }, [reloadKey]);

    // Fetch users and ignore responses from outdated requests.
    useEffect(() => {
        let active = true;

        async function loadUsers() {
            setIsLoading(true);
            setError('');

            try {
                const result = await usersApi.list({
                    limit,
                    offset,
                    q: debouncedQuery,
                });

                if (active) {
                    setData(result);
                }
            } catch (err) {
                if (active) {
                    setError(
                        err?.message ||
                            'Unable to load users. Please try again.',
                    );
                }
            } finally {
                if (active) {
                    setIsLoading(false);
                }
            }
        }

        loadUsers();

        return () => {
            active = false;
        };
    }, [limit, offset, debouncedQuery, reloadKey]);

    const users = data?.results ?? [];
    const total = Number(data?.count ?? 0);
    const pageSize = limit === 'all' ? total : Number(limit);
    const currentPage = pageSize > 0 ? Math.floor(offset / pageSize) + 1 : 1;

    const rangeStart = users.length ? offset + 1 : 0;
    const rangeEnd = offset + users.length;

    const canGoPrevious = offset > 0 && limit !== 'all';
    const canGoNext = Boolean(data?.next) && limit !== 'all';

    const summary = useMemo(
        () => ({
            matching: total,
            displayed: users.length,
            pageSize: limit === 'all' ? 'All' : limit,
        }),
        [total, users.length, limit],
    );

    function handleLimitChange(event) {
        const value = event.target.value;

        setOffset(0);
        setLimit(value === 'all' ? 'all' : Number(value));
    }

    function handlePrevious() {
        if (!canGoPrevious) return;

        setOffset((current) => Math.max(0, current - Number(limit)));
    }

    function handleNext() {
        if (!canGoNext) return;

        setOffset((current) => current + Number(limit));
    }

    function retryRequest() {
        setReloadKey((current) => current + 1);
    }

    return (
        <>
            <Header Title='Home' onRefresh={() => retryRequest()} disabled={isLoading} />

            <main className='min-h-screen bg-slate-50/80 px-4 py-6 text-slate-900 sm:px-6 lg:px-8'>
                <div className='mx-auto max-w-7xl space-y-7'>
                    {/* Page heading */}
                    <header className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
                        <div>
                            <div className='mb-2 flex items-center gap-2 text-sm font-medium text-violet-700'>
                                <FiUsers size={16} />
                                User management
                            </div>

                            <h1 className='text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl'>
                                Users
                            </h1>

                            <p className='mt-2 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base'>
                                Manage accounts, review user information, and access individual profiles from one place.
                            </p>
                        </div>
                    </header>

                    {/* Summary cards */}
                    <section aria-label='User list summary' className='grid grid-cols-1 gap-4 sm:grid-cols-3'>
                        <div className='rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm'>
                            <div className='flex items-start justify-between'>
                                <div>
                                    <p className='text-sm font-medium text-slate-500'>
                                        Matching users
                                    </p>
                                    <p className='mt-2 text-3xl font-bold tracking-tight text-slate-900'>
                                        {isLoading && !data ? '—' : summary.matching.toLocaleString()}
                                    </p>
                                    <p className='mt-2 text-xs text-slate-500'>
                                        Accounts matching your search
                                    </p>
                                </div>
                                <div className='rounded-xl bg-violet-50 p-3 text-violet-700'>
                                    <FiUsers size={21} />
                                </div>
                            </div>
                        </div>

                        <div className='rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm'>
                            <div className='flex items-start justify-between'>
                                <div>
                                    <p className='text-sm font-medium text-slate-500'>
                                        On this page
                                    </p>
                                    <p className='mt-2 text-3xl font-bold tracking-tight text-slate-900'>
                                        {isLoading && !data ? '—' : summary.displayed}
                                    </p>
                                    <p className='mt-2 text-xs text-slate-500'>
                                        Users in the current result
                                    </p>
                                </div>

                                <div className='rounded-xl bg-sky-50 p-3 text-sky-700'>
                                    <FiUser size={21} />
                                </div>
                            </div>
                        </div>

                        <div className='rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm'>
                            <div className='flex items-start justify-between'>
                                <div>
                                    <p className='text-sm font-medium text-slate-500'>
                                        Admin users
                                    </p>

                                    <p className='mt-2 text-3xl font-bold tracking-tight text-slate-900'>
                                        {adminCount === null ? '—' : adminCount.toLocaleString()}
                                    </p>

                                    <p className='mt-2 text-xs text-slate-500'>
                                        Total administrator accounts
                                    </p>
                                </div>

                                <div className='rounded-xl bg-emerald-50 p-3 text-emerald-700'>
                                    <FiShield size={21} />
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* User table container */}
                    <section className='overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm'>
                        <div className='flex flex-col gap-4 border-b border-slate-100 p-5 sm:p-6 lg:flex-row lg:items-center lg:justify-between'>
                            <div>
                                <h2 className='text-lg font-bold text-slate-900'>
                                    All users
                                </h2>
                                <p className='mt-1 text-sm text-slate-500'>
                                    Search and open a user profile to view account details.
                                </p>
                            </div>

                            <div className='flex flex-col gap-3 sm:flex-row'>
                                {/* Search */}
                                <div className='relative min-w-0 sm:w-80'>
                                    <FiSearch aria-hidden='true' size={18} className='pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400' />

                                    <input
                                        type='search'
                                        value={query}
                                        onChange={(event) =>
                                            setQuery(event.target.value)
                                        }
                                        placeholder='Search by email or user ID...'
                                        aria-label='Search users'
                                        className='h-11 w-full rounded-xl border border-slate-200 bg-slate-50/70 pl-10 pr-10 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-100'
                                    />

                                    {query && (
                                        <RippleButton
                                            hue={270}
                                            saturation={100}
                                            lightness={80}
                                            variant='ghost'
                                            type='button'
                                            onClick={() => setQuery('')}
                                            aria-label='Clear search'
                                            className='absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-2'
                                        >
                                            <FaX size={12} />
                                        </RippleButton>
                                    )}
                                </div>

                                {/* Page size */}
                                {/* <label className='flex h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3'>
                                    <span className='whitespace-nowrap text-xs font-medium text-slate-500'>
                                        Show
                                    </span>

                                    <select
                                        value={limit}
                                        onChange={handleLimitChange}
                                        aria-label='Users per page'
                                        className='min-w-14 cursor-pointer bg-transparent text-sm font-semibold text-slate-700 outline-none'
                                    >
                                        <option value={20}>20</option>
                                        <option value={50}>50</option>
                                        <option value={100}>100</option>
                                        <option value='all'>All</option>
                                    </select>
                                </label> */}
                                <label className="pro-select-group" onClick={(e) => { if (e.target instanceof HTMLSelectElement) return; e.preventDefault(); e.currentTarget.querySelector('select')?.showPicker?.(); }}>
                                    <span className="pro-select-prefix">Show</span>

                                    <select
                                        value={limit}
                                        onChange={handleLimitChange}
                                        aria-label="Users per page"
                                        className="pro-select"
                                    >
                                        <option value={20}>
                                            <span>20</span>
                                            {/* <span className="pro-option-meta">rows</span> */}
                                        </option>
                                        <option value={50}>
                                            <span>50</span>
                                            {/* <span className="pro-option-meta">rows</span> */}
                                        </option>
                                        <option value={100}>
                                            <span>100</span>
                                            {/* <span className="pro-option-meta">rows</span> */}
                                        </option>
                                        <hr />
                                        <option value='all'>
                                            <span>All</span>
                                            <span className="pro-option-meta">unfiltered</span>
                                        </option>
                                    </select>
                                </label>
                            </div>
                        </div>

                        {/* Error message */}
                        {error && (
                            <div
                                role='alert'
                                className='mx-5 mt-5 flex flex-col gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 sm:mx-6 sm:flex-row sm:items-center sm:justify-between'
                            >
                                <div className='flex items-start gap-3'>
                                    <FiAlertCircle
                                        size={20}
                                        className='mt-0.5 shrink-0 text-rose-600'
                                    />
                                    <div>
                                        <p className='text-sm font-semibold text-rose-800'>
                                            Could not load users
                                        </p>
                                        <p className='mt-1 text-sm text-rose-700'>
                                            {error}
                                        </p>
                                    </div>
                                </div>

                                <button
                                    type='button'
                                    onClick={retryRequest}
                                    disabled={isLoading}
                                    className='inline-flex shrink-0 items-center justify-center gap-2 rounded-lg border border-rose-200 bg-white px-3 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-100 disabled:opacity-60'
                                >
                                    <FiRefreshCw size={14} />
                                    Retry
                                </button>
                            </div>
                        )}

                        {/* Table */}
                        <div className='overflow-y-auto min-h-sm max-h-88 overscroll-contain'>
                            <table className='table table-fixed w-full border-separate border-spacing-0.5'>
                                <thead className='table-header-group sticky top-0 backdrop-blur-sm z-10'>
                                    <tr className='table-row border-b border-gray-900 bg-gray-100/80 text-left'>
                                        <th
                                            scope='col'
                                            className='table-cell border border-gray-300 px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500'
                                        >
                                            User
                                        </th>
                                        <th
                                            scope='col'
                                            className='table-cell border border-gray-300 px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500'
                                        >
                                            Role
                                        </th>
                                        <th
                                            scope='col'
                                            className='table-cell border border-gray-300 px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500'
                                        >
                                            Account status
                                        </th>
                                        <th
                                            scope='col'
                                            className='table-cell border border-gray-300 px-10 py-4 text-right text-xs font-semibold uppercase tracking-wider text-gray-500'
                                        >
                                            Action
                                        </th>
                                    </tr>
                                </thead>

                                <tbody className='table-row-group divide-y divide-slate-100 overflow-y-auto'>
                                    {isLoading && <LoadingRows />}

                                    {!isLoading &&
                                        !error &&
                                        users.map((user) => {
                                            const identity =
                                                getUserIdentity(user);
                                            const role =
                                                user?.role ??
                                                user?.metadata?.role;
                                            const status =
                                                user?.accountStatus ??
                                                user?.metadata?.accountStatus;

                                            return (
                                                <tr
                                                    key={user.id}
                                                    className='table-row group transition-colors hover:bg-violet-50/40'
                                                >
                                                    <td className='table-cell border border-[#F1E8F9] px-6 py-4'>
                                                        <div className='flex items-center gap-3'>
                                                            <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-100 to-indigo-100 text-sm font-bold text-violet-700 ring-1 ring-violet-200/70'>
                                                                {getInitials(
                                                                    user,
                                                                )}
                                                            </div>

                                                            <div className='min-w-0'>
                                                                <p
                                                                    className='max-w-xs truncate text-sm font-semibold text-slate-900'
                                                                    title={
                                                                        identity.primary
                                                                    }
                                                                >
                                                                    {
                                                                        identity.primary
                                                                    }
                                                                </p>
                                                                <p
                                                                    className='mt-1 max-w-xs truncate text-xs text-slate-500'
                                                                    title={
                                                                        identity.secondary
                                                                    }
                                                                >
                                                                    {
                                                                        identity.secondary
                                                                    }
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </td>

                                                    <td className='border border-[#F1E8F9] px-6 py-4'>
                                                        <span className='inline-flex items-center rounded-lg bg-slate-100 px-2.5 py-1.5 text-xs font-semibold text-slate-700'>
                                                            {formatLabel(role)}
                                                        </span>
                                                    </td>

                                                    <td className='border border-[#F1E8F9] px-6 py-4'>
                                                        <span
                                                            className={`inline-flex items-center rounded-full px-2.5 py-1.5 text-xs font-semibold ring-1 ring-inset ${getStatusClasses(status)}`}
                                                        >
                                                            <span className='mr-1.5 h-1.5 w-1.5 rounded-full bg-current' />
                                                            {formatLabel(
                                                                status,
                                                            )}
                                                        </span>
                                                    </td>

                                                    <td className='border border-[#F1E8F9] px-6 py-4 text-right'>
                                                        <Link
                                                            to={`/users/${user.id}`}
                                                        >
                                                            <RippleButton
                                                                hue={270}
                                                                saturation={25}
                                                                lightness={80}
                                                                variant='soft'
                                                                size='sm'
                                                                className='z-1'
                                                                // className='inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:border-violet-200 hover:bg-violet-50 hover:text-violet-700 focus:outline-none focus:ring-4 focus:ring-violet-100'
                                                            >
                                                                View
                                                                <FiArrowUpRight
                                                                    size={14}
                                                                />
                                                            </RippleButton>
                                                        </Link>
                                                    </td>
                                                </tr>
                                            );
                                        })}

                                    {!isLoading &&
                                        !error &&
                                        users.length === 0 && (
                                            <tr>
                                                <td
                                                    colSpan={4}
                                                    className='px-6 py-16 text-center'
                                                >
                                                    <div className='mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400'>
                                                        <FiUsers size={25} />
                                                    </div>

                                                    <h3 className='mt-4 text-sm font-semibold text-slate-900'>
                                                        {debouncedQuery
                                                            ? 'No matching users found'
                                                            : 'No users available'}
                                                    </h3>

                                                    <p className='mx-auto mt-1 max-w-sm text-sm text-slate-500'>
                                                        {debouncedQuery
                                                            ? 'Try another email address or user ID.'
                                                            : 'Users will appear here when they are available.'}
                                                    </p>

                                                    {debouncedQuery && (
                                                        <button
                                                            type='button'
                                                            onClick={() =>
                                                                setQuery('')
                                                            }
                                                            className='mt-4 inline-flex items-center gap-2 text-sm font-semibold text-violet-700 hover:text-violet-800'
                                                        >
                                                            <FaX size={15} />
                                                            Clear search
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination footer */}
                        <footer className='flex flex-col gap-4 border-t border-slate-100 bg-white px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6'>
                            <p className='text-sm text-slate-500'>
                                Showing{' '}
                                <span className='font-semibold text-slate-800'>
                                    {rangeStart.toLocaleString()}–
                                    {rangeEnd.toLocaleString()}
                                </span>{' '}
                                of{' '}
                                <span className='font-semibold text-slate-800'>
                                    {total.toLocaleString()}
                                </span>{' '}
                                matching users
                            </p>

                            <div className='flex items-center gap-2'>
                                <RippleButton
                                    hue={270}
                                    saturation={100}
                                    lightness={60}
                                    variant='solid'
                                    size='sm'
                                    type='button'
                                    onClick={handlePrevious}
                                    disabled={!canGoPrevious || isLoading}
                                >
                                    <span>
                                        <FiChevronLeft size={17} />
                                    </span>
                                    <span>Previous</span>
                                </RippleButton>

                                <span className='min-w-10 text-center text-sm font-semibold text-slate-600'>
                                    {limit === 'all' ? 'All' : currentPage}
                                </span>

                                <RippleButton
                                    hue={270}
                                    saturation={100}
                                    lightness={60}
                                    size='sm'
                                    variant='solid'
                                    type='button'
                                    onClick={handleNext}
                                    disabled={!canGoNext || isLoading}
                                >
                                    <span>Next</span>
                                    <span>
                                        <FiChevronRight size={17} />
                                    </span>
                                </RippleButton>
                            </div>
                        </footer>
                    </section>
                </div>
            </main>
        </>
    );
}
// import { useEffect, useMemo, useState } from 'react';
// import { Link } from 'react-router';
// import {
//     FiAlertCircle,
//     FiArrowDown,
//     FiArrowUp,
//     // FiArrowUpDown,
//     FiArrowUpRight,
//     FiChevronLeft,
//     FiChevronRight,
//     FiFilter,
//     FiPlus,
//     FiRefreshCw,
//     FiSearch,
//     FiShield,
//     FiSliders,
//     FiTrash2,
//     FiUser,
//     FiUsers,
//     FiX,
// } from 'react-icons/fi';

// import { FaArrowUpWideShort } from "react-icons/fa6";

// import { RippleButton } from '@/components/RippleButton';
// import { usersApi } from '@/api/users.api';
// import Header from '@/components/layout/Header';

// const PRIMARY_BUTTON = { hue: 270, saturation: 75, lightness: 55 };
// const MUTED_BUTTON = { hue: 220, saturation: 12, lightness: 45 };

// const SORT_OPTIONS = [
//     { value: 'created_at', label: 'Created date' },
//     { value: 'updated_at', label: 'Last updated' },
//     { value: 'email', label: 'Email' },
//     { value: 'username', label: 'Username' },
//     { value: 'role', label: 'Role' },
//     { value: 'account_status', label: 'Account status' },
// ];

// const ROLE_OPTIONS = [
//     { value: '', label: 'All roles' },
//     { value: 'admin', label: 'Admin' },
//     { value: 'moderator', label: 'Moderator' },
//     { value: 'user', label: 'User' },
// ];

// const STATUS_OPTIONS = [
//     { value: '', label: 'All statuses' },
//     { value: 'active', label: 'Active' },
//     { value: 'pending', label: 'Pending' },
//     { value: 'inactive', label: 'Inactive' },
//     { value: 'suspended', label: 'Suspended' },
//     { value: 'banned', label: 'Banned' },
// ];

// const INPUT_CLASS =
//     'h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-violet-400 focus:ring-4 focus:ring-violet-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-violet-500 dark:focus:ring-violet-500/10';

// function formatLabel(value) {
//     if (value === null || value === undefined || value === '') return 'Unknown';
//     return String(value)
//         .replace(/[_-]+/g, ' ')
//         .replace(/\b\w/g, (character) => character.toUpperCase());
// }

// function getStatusClasses(status) {
//     const value = String(status ?? '').toLowerCase();
//     if (['active', 'enabled', 'verified'].includes(value)) {
//         return 'bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-400/10 dark:text-emerald-300';
//     }
//     if (['inactive', 'banned', 'suspended', 'blocked'].includes(value)) {
//         return 'bg-rose-50 text-rose-700 ring-rose-600/20 dark:bg-rose-400/10 dark:text-rose-300';
//     }
//     if (['pending', 'invited', 'unverified'].includes(value)) {
//         return 'bg-amber-50 text-amber-700 ring-amber-600/20 dark:bg-amber-400/10 dark:text-amber-300';
//     }
//     return 'bg-slate-100 text-slate-600 ring-slate-500/20 dark:bg-slate-800 dark:text-slate-300';
// }

// function getInitials(user) {
//     const name =
//         user?.personal?.displayName ||
//         [user?.personal?.firstName, user?.personal?.lastName]
//             .filter(Boolean)
//             .join(' ') ||
//         user?.name ||
//         user?.full_name ||
//         user?.profile?.name ||
//         user?.contact?.name;

//     if (name) {
//         return String(name)
//             .trim()
//             .split(/\s+/)
//             .slice(0, 2)
//             .map((part) => part[0])
//             .join('')
//             .toUpperCase();
//     }

//     const email = user?.contact?.email || user?.email;
//     return email ? String(email)[0].toUpperCase() : 'U';
// }

// function getUserIdentity(user) {
//     const email = user?.contact?.email || user?.email || '';
//     const personal = user?.personal || {};
//     const name =
//         personal.displayName ||
//         [
//             personal.prefix,
//             personal.firstName,
//             personal.middle,
//             personal.lastName,
//             personal.suffix,
//         ]
//             .filter(Boolean)
//             .join(' ') ||
//         user?.name ||
//         user?.full_name ||
//         user?.profile?.name ||
//         user?.contact?.name;

//     return {
//         email,
//         primary: name || email || `User ${user?.id ?? ''}`,
//         secondary: name && email ? email : `Account ID: ${user?.id ?? '—'}`,
//     };
// }

// function LoadingRows() {
//     return Array.from({ length: 5 }, (_, index) => (
//         <tr key={index} className='animate-pulse'>
//             <td className='px-6 py-5'>
//                 <div className='flex items-center gap-3'>
//                     <div className='h-10 w-10 rounded-full bg-slate-200 dark:bg-slate-700' />
//                     <div className='space-y-2'>
//                         <div className='h-3 w-36 rounded bg-slate-200 dark:bg-slate-700' />
//                         <div className='h-3 w-24 rounded bg-slate-100 dark:bg-slate-800' />
//                     </div>
//                 </div>
//             </td>
//             <td className='px-6 py-5'>
//                 <div className='h-6 w-20 rounded-full bg-slate-200 dark:bg-slate-700' />
//             </td>
//             <td className='px-6 py-5'>
//                 <div className='h-6 w-20 rounded-full bg-slate-200 dark:bg-slate-700' />
//             </td>
//             <td className='px-6 py-5 text-right'>
//                 <div className='ml-auto h-8 w-20 rounded-lg bg-slate-200 dark:bg-slate-700' />
//             </td>
//         </tr>
//     ));
// }

// function buildDynamicFilter(rows) {
//     const output = {};
//     const errors = [];

//     for (const [index, row] of rows.entries()) {
//         const rawPath = row.path.trim();
//         if (!rawPath && row.value === '') continue;
//         if (!rawPath || row.value === '') {
//             errors.push(
//                 `Dynamic filter ${index + 1}: enter both a field path and value.`,
//             );
//             continue;
//         }

//         const parts = rawPath.split('.').map((part) => part.trim());
//         const isValid = parts.every((part) =>
//             /^[A-Za-z][A-Za-z0-9_]*$/.test(part),
//         );
//         if (!isValid) {
//             errors.push(
//                 `Dynamic filter ${index + 1}: use a dotted JSON path such as personal.firstName.`,
//             );
//             continue;
//         }

//         let value;
//         if (row.valueType === 'number') {
//             value = Number(row.value);
//             if (!Number.isFinite(value)) {
//                 errors.push(
//                     `Dynamic filter ${index + 1}: enter a valid number.`,
//                 );
//                 continue;
//             }
//         } else if (row.valueType === 'boolean') {
//             value = row.value === 'true';
//         } else {
//             value = row.value;
//         }

//         let target = output;
//         let conflict = false;
//         for (let partIndex = 0; partIndex < parts.length - 1; partIndex += 1) {
//             const part = parts[partIndex];
//             if (
//                 Object.prototype.hasOwnProperty.call(target, part) &&
//                 (typeof target[part] !== 'object' ||
//                     target[part] === null ||
//                     Array.isArray(target[part]))
//             ) {
//                 conflict = true;
//                 break;
//             }
//             target[part] ||= {};
//             target = target[part];
//         }

//         const leaf = parts[parts.length - 1];
//         if (conflict || Object.prototype.hasOwnProperty.call(target, leaf)) {
//             errors.push(
//                 `Dynamic filter ${index + 1}: this path conflicts with another filter.`,
//             );
//             continue;
//         }
//         target[leaf] = value;
//     }

//     return { filter: output, errors };
// }

// function countDynamicLeaves(value) {
//     if (!value || typeof value !== 'object') return 0;
//     return Object.values(value).reduce(
//         (total, child) =>
//             total +
//             (child && typeof child === 'object'
//                 ? countDynamicLeaves(child)
//                 : 1),
//         0,
//     );
// }

// function SummaryCard({ title, value, description, icon, iconClasses }) {
//     return (
//         <div className='rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900'>
//             <div className='flex items-start justify-between gap-4'>
//                 <div className='min-w-0'>
//                     <p className='text-sm font-medium text-slate-500 dark:text-slate-400'>
//                         {title}
//                     </p>
//                     <p className='mt-2 text-3xl font-bold tracking-tight text-slate-900 dark:text-white'>
//                         {value}
//                     </p>
//                     <p className='mt-2 text-xs leading-5 text-slate-500 dark:text-slate-400'>
//                         {description}
//                     </p>
//                 </div>
//                 <div className={`shrink-0 rounded-xl p-3 ${iconClasses}`}>
//                     {icon}
//                 </div>
//             </div>
//         </div>
//     );
// }

// export default function UserListPage() {
//     const [data, setData] = useState(null);
//     const [error, setError] = useState('');
//     const [filterError, setFilterError] = useState('');
//     const [isLoading, setIsLoading] = useState(true);
//     const [adminCount, setAdminCount] = useState(null);

//     const [limit, setLimit] = useState(50);
//     const [offset, setOffset] = useState(0);
//     const [query, setQuery] = useState('');
//     const [debouncedQuery, setDebouncedQuery] = useState('');

//     const [sortBy, setSortBy] = useState('created_at');
//     const [sortOrder, setSortOrder] = useState('desc');
//     const [showFilters, setShowFilters] = useState(false);

//     const [draftRole, setDraftRole] = useState('');
//     const [draftAccountStatus, setDraftAccountStatus] = useState('');
//     const [dynamicRows, setDynamicRows] = useState([
//         { id: 1, path: '', value: '', valueType: 'string' },
//     ]);
//     const [appliedFilters, setAppliedFilters] = useState({
//         role: '',
//         accountStatus: '',
//         filter: {},
//     });
//     const [reloadKey, setReloadKey] = useState(0);

//     useEffect(() => {
//         const timer = setTimeout(() => {
//             setOffset(0);
//             setDebouncedQuery(query.trim());
//         }, 300);
//         return () => clearTimeout(timer);
//     }, [query]);

//     useEffect(() => {
//         let active = true;
//         usersApi
//             .list({ limit: 1, offset: 0, role: 'admin' })
//             .then((result) => {
//                 if (active) setAdminCount(Number(result?.count ?? 0));
//             })
//             .catch(() => {
//                 if (active) setAdminCount(null);
//             });
//         return () => {
//             active = false;
//         };
//     }, [reloadKey]);

//     useEffect(() => {
//         let active = true;

//         async function loadUsers() {
//             setIsLoading(true);
//             setError('');
//             try {
//                 const params = {
//                     limit,
//                     offset,
//                     q: debouncedQuery,
//                     sort_by: sortBy,
//                     sort_order: sortOrder,
//                     ...(appliedFilters.role
//                         ? { role: appliedFilters.role }
//                         : {}),
//                     ...(appliedFilters.accountStatus
//                         ? { account_status: appliedFilters.accountStatus }
//                         : {}),
//                     ...(countDynamicLeaves(appliedFilters.filter) > 0
//                         ? { filter: appliedFilters.filter }
//                         : {}),
//                 };

//                 const result = await usersApi.list(params);
//                 if (active) setData(result);
//             } catch (err) {
//                 if (active)
//                     setError(
//                         err?.message ||
//                             'Unable to load users. Please try again.',
//                     );
//             } finally {
//                 if (active) setIsLoading(false);
//             }
//         }

//         loadUsers();
//         return () => {
//             active = false;
//         };
//     }, [
//         limit,
//         offset,
//         debouncedQuery,
//         sortBy,
//         sortOrder,
//         appliedFilters,
//         reloadKey,
//     ]);

//     const users = data?.results ?? [];
//     const total = Number(data?.count ?? 0);
//     const pageSize = limit === 'all' ? total : Number(limit);
//     const currentPage = pageSize > 0 ? Math.floor(offset / pageSize) + 1 : 1;
//     const rangeStart = users.length ? offset + 1 : 0;
//     const rangeEnd = offset + users.length;
//     const canGoPrevious = offset > 0 && limit !== 'all';
//     const canGoNext = Boolean(data?.next) && limit !== 'all';

//     const activeFilterCount =
//         Number(Boolean(appliedFilters.role)) +
//         Number(Boolean(appliedFilters.accountStatus)) +
//         countDynamicLeaves(appliedFilters.filter);

//     const sortLabel =
//         SORT_OPTIONS.find((option) => option.value === sortBy)?.label ??
//         'Created date';

//     function handleLimitChange(event) {
//         const value = event.target.value;
//         setOffset(0);
//         setLimit(value === 'all' ? 'all' : Number(value));
//     }

//     function handlePrevious() {
//         if (!canGoPrevious || isLoading) return;
//         setOffset((current) => Math.max(0, current - Number(limit)));
//     }

//     function handleNext() {
//         if (!canGoNext || isLoading) return;
//         setOffset((current) => current + Number(limit));
//     }

//     function retryRequest() {
//         setReloadKey((current) => current + 1);
//     }

//     function updateDynamicRow(id, key, value) {
//         setDynamicRows((current) =>
//             current.map((row) =>
//                 row.id === id ? { ...row, [key]: value } : row,
//             ),
//         );
//     }

//     function addDynamicRow() {
//         setDynamicRows((current) => [
//             ...current,
//             {
//                 id: Math.max(0, ...current.map((row) => row.id)) + 1,
//                 path: '',
//                 value: '',
//                 valueType: 'string',
//             },
//         ]);
//     }

//     function applyFilters() {
//         const { filter, errors } = buildDynamicFilter(dynamicRows);
//         if (errors.length) {
//             setFilterError(errors[0]);
//             return;
//         }
//         setFilterError('');
//         setOffset(0);
//         setAppliedFilters({
//             role: draftRole,
//             accountStatus: draftAccountStatus,
//             filter,
//         });
//     }

//     function clearFilters() {
//         setDraftRole('');
//         setDraftAccountStatus('');
//         setDynamicRows([{ id: 1, path: '', value: '', valueType: 'string' }]);
//         setAppliedFilters({ role: '', accountStatus: '', filter: {} });
//         setFilterError('');
//         setOffset(0);
//     }

//     return (
//         <>
//             <Header
//                 Title='Home'
//                 onRefresh={retryRequest}
//                 disabled={isLoading}
//             />

//             <main className='min-h-screen bg-slate-50/80 px-4 py-6 text-slate-900 dark:bg-slate-950 dark:text-white sm:px-6 lg:px-8'>
//                 <div className='mx-auto max-w-7xl space-y-7'>
//                     <header className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
//                         <div>
//                             <div className='mb-2 flex items-center gap-2 text-sm font-medium text-violet-700 dark:text-violet-300'>
//                                 <FiUsers size={16} /> User management
//                             </div>
//                             <h1 className='text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl'>
//                                 Users
//                             </h1>
//                             <p className='mt-2 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400 sm:text-base'>
//                                 Manage accounts, sort records, and combine
//                                 standard filters with dynamic JSON profile
//                                 fields.
//                             </p>
//                         </div>

//                         <RippleButton
//                             {...PRIMARY_BUTTON}
//                             variant='outline'
//                             size='sm'
//                             disabled={isLoading}
//                             onClick={retryRequest}
//                             className='inline-flex h-11 items-center justify-center gap-2 self-start rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 sm:self-auto'
//                         >
//                             <FiRefreshCw
//                                 size={16}
//                                 className={isLoading ? 'animate-spin' : ''}
//                             />{' '}
//                             Refresh
//                         </RippleButton>
//                     </header>

//                     <section
//                         aria-label='User list summary'
//                         className='grid grid-cols-1 gap-4 sm:grid-cols-3'
//                     >
//                         <SummaryCard
//                             title='Matching users'
//                             value={
//                                 isLoading && !data
//                                     ? '—'
//                                     : total.toLocaleString()
//                             }
//                             description='Records returned by the current query'
//                             icon={<FiUsers size={21} />}
//                             iconClasses='bg-violet-50 text-violet-700 dark:bg-violet-500/10 dark:text-violet-300'
//                         />
//                         <SummaryCard
//                             title='On this page'
//                             value={
//                                 isLoading && !data
//                                     ? '—'
//                                     : users.length.toLocaleString()
//                             }
//                             description='Users in the current result page'
//                             icon={<FiUser size={21} />}
//                             iconClasses='bg-sky-50 text-sky-700 dark:bg-sky-500/10 dark:text-sky-300'
//                         />
//                         <SummaryCard
//                             title='Admin users'
//                             value={
//                                 adminCount === null
//                                     ? '—'
//                                     : adminCount.toLocaleString()
//                             }
//                             description='Total administrator accounts'
//                             icon={<FiShield size={21} />}
//                             iconClasses='bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300'
//                         />
//                     </section>

//                     <section className='overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900'>
//                         <div className='flex flex-col gap-4 border-b border-slate-100 p-5 dark:border-slate-800 sm:p-6 xl:flex-row xl:items-center xl:justify-between'>
//                             <div>
//                                 <div className='flex flex-wrap items-center gap-2'>
//                                     <h2 className='text-lg font-bold text-slate-900 dark:text-white'>
//                                         All users
//                                     </h2>
//                                     {activeFilterCount > 0 && (
//                                         <span className='inline-flex items-center rounded-full bg-violet-50 px-2.5 py-1 text-xs font-semibold text-violet-700 dark:bg-violet-500/10 dark:text-violet-300'>
//                                             {activeFilterCount} filter
//                                             {activeFilterCount === 1 ? '' : 's'}{' '}
//                                             active
//                                         </span>
//                                     )}
//                                 </div>
//                                 <p className='mt-1 text-sm text-slate-500 dark:text-slate-400'>
//                                     Search, sort, and filter using fields stored
//                                     in the user profile JSON.
//                                 </p>
//                             </div>

//                             <div className='grid grid-cols-1 gap-3 sm:grid-cols-2 xl:flex xl:items-center'>
//                                 <div className='relative min-w-0 sm:col-span-2 xl:w-72'>
//                                     <FiSearch
//                                         size={18}
//                                         aria-hidden='true'
//                                         className='pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400'
//                                     />
//                                     <input
//                                         type='search'
//                                         value={query}
//                                         onChange={(event) => {
//                                             setQuery(event.target.value);
//                                             setOffset(0);
//                                         }}
//                                         placeholder='Search email or username...'
//                                         aria-label='Search users by email or username'
//                                         className={`${INPUT_CLASS} pl-10 pr-10 bg-slate-50/70 dark:bg-slate-950`}
//                                     />
//                                     {query && (
//                                         <button
//                                             type='button'
//                                             onClick={() => setQuery('')}
//                                             aria-label='Clear search'
//                                             className='absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-700 dark:hover:bg-slate-800'
//                                         >
//                                             <FiX size={15} />
//                                         </button>
//                                     )}
//                                 </div>

//                                 <label className='flex h-11 min-w-0 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 dark:border-slate-700 dark:bg-slate-950 xl:w-52'>
//                                     <FaArrowUpWideShort
//                                         size={15}
//                                         className='shrink-0 text-slate-400'
//                                     />
//                                     <select
//                                         value={sortBy}
//                                         onChange={(event) => {
//                                             setSortBy(event.target.value);
//                                             setOffset(0);
//                                         }}
//                                         aria-label='Sort users by'
//                                         className='min-w-0 flex-1 bg-transparent text-sm font-medium text-slate-700 outline-none dark:text-slate-200'
//                                     >
//                                         {SORT_OPTIONS.map((option) => (
//                                             <option
//                                                 key={option.value}
//                                                 value={option.value}
//                                             >
//                                                 {option.label}
//                                             </option>
//                                         ))}
//                                     </select>
//                                 </label>

//                                 <RippleButton
//                                     {...MUTED_BUTTON}
//                                     variant='outline'
//                                     size='sm'
//                                     onClick={() => {
//                                         setSortOrder((current) =>
//                                             current === 'asc' ? 'desc' : 'asc',
//                                         );
//                                         setOffset(0);
//                                     }}
//                                     aria-label={`Current sort ${sortOrder === 'asc' ? 'ascending' : 'descending'}; click to reverse`}
//                                     className='inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200'
//                                 >
//                                     {sortOrder === 'asc' ? (
//                                         <FiArrowUp size={15} />
//                                     ) : (
//                                         <FiArrowDown size={15} />
//                                     )}
//                                     {sortOrder === 'asc'
//                                         ? 'Ascending'
//                                         : 'Descending'}
//                                 </RippleButton>

//                                 <RippleButton
//                                     {...PRIMARY_BUTTON}
//                                     variant={showFilters ? 'solid' : 'outline'}
//                                     size='sm'
//                                     onClick={() =>
//                                         setShowFilters((current) => !current)
//                                     }
//                                     aria-expanded={showFilters}
//                                     className={`inline-flex h-11 items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold ${showFilters ? 'text-white' : 'border border-slate-200 bg-white text-slate-700 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200'}`}
//                                 >
//                                     <FiSliders size={16} /> Filters
//                                     {activeFilterCount > 0 && (
//                                         <span
//                                             className={`rounded-full px-1.5 py-0.5 text-[10px] ${showFilters ? 'bg-white/20' : 'bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-300'}`}
//                                         >
//                                             {activeFilterCount}
//                                         </span>
//                                     )}
//                                 </RippleButton>

//                                 <label className='flex h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 dark:border-slate-700 dark:bg-slate-950'>
//                                     <span className='whitespace-nowrap text-xs font-medium text-slate-500'>
//                                         Show
//                                     </span>
//                                     <select
//                                         value={limit}
//                                         onChange={handleLimitChange}
//                                         aria-label='Users per page'
//                                         className='min-w-14 bg-transparent text-sm font-semibold text-slate-700 outline-none dark:text-slate-200'
//                                     >
//                                         <option value={20}>20</option>
//                                         <option value={50}>50</option>
//                                         <option value={100}>100</option>
//                                         <option value='all'>All</option>
//                                     </select>
//                                 </label>
//                             </div>
//                         </div>

//                         {showFilters && (
//                             <div className='border-b border-slate-100 bg-slate-50/70 p-5 dark:border-slate-800 dark:bg-slate-950/50 sm:p-6'>
//                                 <div className='mb-4 flex items-start gap-3'>
//                                     <div className='rounded-xl bg-violet-50 p-2.5 text-violet-700 dark:bg-violet-500/10 dark:text-violet-300'>
//                                         <FiFilter size={18} />
//                                     </div>
//                                     <div>
//                                         <h3 className='text-sm font-semibold text-slate-900 dark:text-white'>
//                                             Backend filters
//                                         </h3>
//                                         <p className='mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400'>
//                                             Standard filters use dedicated query
//                                             parameters. Dynamic filters match
//                                             exact values in nested JSON profile
//                                             fields.
//                                         </p>
//                                     </div>
//                                 </div>

//                                 <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
//                                     <label className='space-y-1.5'>
//                                         <span className='text-xs font-semibold text-slate-600 dark:text-slate-300'>
//                                             Role
//                                         </span>
//                                         <select
//                                             value={draftRole}
//                                             onChange={(event) =>
//                                                 setDraftRole(event.target.value)
//                                             }
//                                             className={INPUT_CLASS}
//                                         >
//                                             {ROLE_OPTIONS.map((option) => (
//                                                 <option
//                                                     key={option.value || 'all'}
//                                                     value={option.value}
//                                                 >
//                                                     {option.label}
//                                                 </option>
//                                             ))}
//                                         </select>
//                                     </label>

//                                     <label className='space-y-1.5'>
//                                         <span className='text-xs font-semibold text-slate-600 dark:text-slate-300'>
//                                             Account status
//                                         </span>
//                                         <select
//                                             value={draftAccountStatus}
//                                             onChange={(event) =>
//                                                 setDraftAccountStatus(
//                                                     event.target.value,
//                                                 )
//                                             }
//                                             className={INPUT_CLASS}
//                                         >
//                                             {STATUS_OPTIONS.map((option) => (
//                                                 <option
//                                                     key={option.value || 'all'}
//                                                     value={option.value}
//                                                 >
//                                                     {option.label}
//                                                 </option>
//                                             ))}
//                                         </select>
//                                     </label>
//                                 </div>

//                                 <div className='mt-5 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900'>
//                                     <div className='flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between'>
//                                         <div>
//                                             <h4 className='text-sm font-semibold text-slate-900 dark:text-white'>
//                                                 Dynamic profile filters
//                                             </h4>
//                                             <p className='mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400'>
//                                                 Example path:{' '}
//                                                 <code className='rounded bg-slate-100 px-1 py-0.5 dark:bg-slate-800'>
//                                                     personal.firstName
//                                                 </code>
//                                                 . Multiple rows are combined
//                                                 with AND.
//                                             </p>
//                                         </div>
//                                         <RippleButton
//                                             {...MUTED_BUTTON}
//                                             variant='outline'
//                                             size='sm'
//                                             onClick={addDynamicRow}
//                                             className='inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200'
//                                         >
//                                             <FiPlus size={14} /> Add field
//                                         </RippleButton>
//                                     </div>

//                                     <div className='mt-4 space-y-3'>
//                                         {dynamicRows.map((row, index) => (
//                                             <div
//                                                 key={row.id}
//                                                 className='grid grid-cols-1 items-end gap-3 md:grid-cols-[minmax(0,1fr)_130px_minmax(0,1fr)_40px]'
//                                             >
//                                                 <label className='min-w-0 space-y-1.5'>
//                                                     <span className='text-xs font-medium text-slate-500'>
//                                                         JSON field path
//                                                     </span>
//                                                     <input
//                                                         value={row.path}
//                                                         onChange={(event) =>
//                                                             updateDynamicRow(
//                                                                 row.id,
//                                                                 'path',
//                                                                 event.target
//                                                                     .value,
//                                                             )
//                                                         }
//                                                         placeholder={
//                                                             index === 0
//                                                                 ? 'personal.firstName'
//                                                                 : 'professional.company.name'
//                                                         }
//                                                         className={INPUT_CLASS}
//                                                     />
//                                                 </label>

//                                                 <label className='min-w-0 space-y-1.5'>
//                                                     <span className='text-xs font-medium text-slate-500'>
//                                                         Value type
//                                                     </span>
//                                                     <select
//                                                         value={row.valueType}
//                                                         onChange={(event) =>
//                                                             updateDynamicRow(
//                                                                 row.id,
//                                                                 'valueType',
//                                                                 event.target
//                                                                     .value,
//                                                             )
//                                                         }
//                                                         className={INPUT_CLASS}
//                                                     >
//                                                         <option value='string'>
//                                                             Text
//                                                         </option>
//                                                         <option value='number'>
//                                                             Number
//                                                         </option>
//                                                         <option value='boolean'>
//                                                             Boolean
//                                                         </option>
//                                                     </select>
//                                                 </label>

//                                                 <label className='min-w-0 space-y-1.5'>
//                                                     <span className='text-xs font-medium text-slate-500'>
//                                                         Exact value
//                                                     </span>
//                                                     {row.valueType ===
//                                                     'boolean' ? (
//                                                         <select
//                                                             value={row.value}
//                                                             onChange={(event) =>
//                                                                 updateDynamicRow(
//                                                                     row.id,
//                                                                     'value',
//                                                                     event.target
//                                                                         .value,
//                                                                 )
//                                                             }
//                                                             className={
//                                                                 INPUT_CLASS
//                                                             }
//                                                         >
//                                                             <option value=''>
//                                                                 Select value
//                                                             </option>
//                                                             <option value='true'>
//                                                                 True
//                                                             </option>
//                                                             <option value='false'>
//                                                                 False
//                                                             </option>
//                                                         </select>
//                                                     ) : (
//                                                         <input
//                                                             type={
//                                                                 row.valueType ===
//                                                                 'number'
//                                                                     ? 'number'
//                                                                     : 'text'
//                                                             }
//                                                             value={row.value}
//                                                             onChange={(event) =>
//                                                                 updateDynamicRow(
//                                                                     row.id,
//                                                                     'value',
//                                                                     event.target
//                                                                         .value,
//                                                                 )
//                                                             }
//                                                             placeholder={
//                                                                 row.valueType ===
//                                                                 'number'
//                                                                     ? 'e.g. 2024'
//                                                                     : 'Enter exact value'
//                                                             }
//                                                             className={
//                                                                 INPUT_CLASS
//                                                             }
//                                                         />
//                                                     )}
//                                                 </label>

//                                                 <RippleButton
//                                                     hue={0}
//                                                     saturation={45}
//                                                     lightness={48}
//                                                     variant='outline'
//                                                     size='sm'
//                                                     onClick={() =>
//                                                         setDynamicRows(
//                                                             (current) =>
//                                                                 current.length ===
//                                                                 1
//                                                                     ? [
//                                                                           {
//                                                                               id:
//                                                                                   current[0]
//                                                                                       .id +
//                                                                                   1,
//                                                                               path: '',
//                                                                               value: '',
//                                                                               valueType:
//                                                                                   'string',
//                                                                           },
//                                                                       ]
//                                                                     : current.filter(
//                                                                           (
//                                                                               item,
//                                                                           ) =>
//                                                                               item.id !==
//                                                                               row.id,
//                                                                       ),
//                                                         )
//                                                     }
//                                                     aria-label={`Remove dynamic filter ${index + 1}`}
//                                                     title='Remove filter'
//                                                     className='inline-flex h-11 w-10 items-center justify-center rounded-xl border border-rose-200 bg-white p-0 text-rose-600 dark:border-rose-900/60 dark:bg-slate-950 dark:text-rose-300'
//                                                 >
//                                                     <FiTrash2 size={15} />
//                                                 </RippleButton>
//                                             </div>
//                                         ))}
//                                     </div>
//                                 </div>

//                                 {filterError && (
//                                     <p
//                                         role='alert'
//                                         className='mt-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-300'
//                                     >
//                                         {filterError}
//                                     </p>
//                                 )}

//                                 <div className='mt-5 flex flex-wrap items-center justify-end gap-2'>
//                                     <RippleButton
//                                         {...MUTED_BUTTON}
//                                         variant='outline'
//                                         size='sm'
//                                         onClick={clearFilters}
//                                         className='inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200'
//                                     >
//                                         <FiX size={15} /> Clear filters
//                                     </RippleButton>
//                                     <RippleButton
//                                         {...PRIMARY_BUTTON}
//                                         variant='solid'
//                                         size='sm'
//                                         onClick={applyFilters}
//                                         className='inline-flex h-10 items-center gap-2 rounded-xl px-4 text-sm font-semibold text-white'
//                                     >
//                                         <FiFilter size={15} /> Apply filters
//                                     </RippleButton>
//                                 </div>
//                             </div>
//                         )}

//                         {error && (
//                             <div
//                                 role='alert'
//                                 className='mx-5 mt-5 flex flex-col gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 dark:border-rose-900/50 dark:bg-rose-950/30 sm:mx-6 sm:flex-row sm:items-center sm:justify-between'
//                             >
//                                 <div className='flex items-start gap-3'>
//                                     <FiAlertCircle
//                                         size={20}
//                                         className='mt-0.5 shrink-0 text-rose-600 dark:text-rose-300'
//                                     />
//                                     <div>
//                                         <p className='text-sm font-semibold text-rose-800 dark:text-rose-200'>
//                                             Could not load users
//                                         </p>
//                                         <p className='mt-1 text-sm text-rose-700 dark:text-rose-300'>
//                                             {error}
//                                         </p>
//                                     </div>
//                                 </div>
//                                 <RippleButton
//                                     {...PRIMARY_BUTTON}
//                                     variant='outline'
//                                     size='sm'
//                                     disabled={isLoading}
//                                     onClick={retryRequest}
//                                     className='inline-flex shrink-0 items-center justify-center gap-2 rounded-lg border border-rose-200 bg-white px-3 py-2 text-sm font-semibold text-rose-700 dark:border-rose-900/60 dark:bg-slate-900 dark:text-rose-300'
//                                 >
//                                     <FiRefreshCw size={14} /> Retry
//                                 </RippleButton>
//                             </div>
//                         )}

//                         <div className='overflow-x-auto'>
//                             <table className='w-full min-w-[760px] border-collapse text-left'>
//                                 <thead className='sticky top-0 z-10 bg-slate-50/95 backdrop-blur-sm dark:bg-slate-950/95'>
//                                     <tr className='border-b border-slate-100 dark:border-slate-800'>
//                                         <th
//                                             scope='col'
//                                             className='px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400'
//                                         >
//                                             User
//                                         </th>
//                                         <th
//                                             scope='col'
//                                             className='px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400'
//                                         >
//                                             Role
//                                         </th>
//                                         <th
//                                             scope='col'
//                                             className='px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400'
//                                         >
//                                             Account status
//                                         </th>
//                                         <th
//                                             scope='col'
//                                             className='px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400'
//                                         >
//                                             Action
//                                         </th>
//                                     </tr>
//                                 </thead>
//                                 <tbody className='divide-y divide-slate-100 dark:divide-slate-800'>
//                                     {isLoading && <LoadingRows />}
//                                     {!isLoading &&
//                                         !error &&
//                                         users.map((user) => {
//                                             const identity =
//                                                 getUserIdentity(user);
//                                             const role =
//                                                 user?.role ??
//                                                 user?.metadata?.role;
//                                             const status =
//                                                 user?.account_status ??
//                                                 user?.accountStatus ??
//                                                 user?.metadata?.accountStatus;
//                                             return (
//                                                 <tr
//                                                     key={user.id}
//                                                     className='group transition-colors hover:bg-violet-50/40 dark:hover:bg-violet-500/5'
//                                                 >
//                                                     <td className='px-6 py-4'>
//                                                         <div className='flex items-center gap-3'>
//                                                             <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-100 to-indigo-100 text-sm font-bold text-violet-700 ring-1 ring-violet-200/70 dark:from-violet-500/20 dark:to-indigo-500/20 dark:text-violet-200 dark:ring-violet-400/20'>
//                                                                 {getInitials(
//                                                                     user,
//                                                                 )}
//                                                             </div>
//                                                             <div className='min-w-0'>
//                                                                 <p
//                                                                     className='max-w-xs truncate text-sm font-semibold text-slate-900 dark:text-slate-100'
//                                                                     title={
//                                                                         identity.primary
//                                                                     }
//                                                                 >
//                                                                     {
//                                                                         identity.primary
//                                                                     }
//                                                                 </p>
//                                                                 <p
//                                                                     className='mt-1 max-w-xs truncate text-xs text-slate-500 dark:text-slate-400'
//                                                                     title={
//                                                                         identity.secondary
//                                                                     }
//                                                                 >
//                                                                     {
//                                                                         identity.secondary
//                                                                     }
//                                                                 </p>
//                                                             </div>
//                                                         </div>
//                                                     </td>
//                                                     <td className='px-6 py-4'>
//                                                         <span className='inline-flex items-center rounded-lg bg-slate-100 px-2.5 py-1.5 text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-200'>
//                                                             {formatLabel(role)}
//                                                         </span>
//                                                     </td>
//                                                     <td className='px-6 py-4'>
//                                                         <span
//                                                             className={`inline-flex items-center rounded-full px-2.5 py-1.5 text-xs font-semibold ring-1 ring-inset ${getStatusClasses(status)}`}
//                                                         >
//                                                             <span className='mr-1.5 h-1.5 w-1.5 rounded-full bg-current' />
//                                                             {formatLabel(
//                                                                 status,
//                                                             )}
//                                                         </span>
//                                                     </td>
//                                                     <td className='px-6 py-4 text-right'>
//                                                         <Link
//                                                             to={`/users/${user.id}`}
//                                                             className='inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:border-violet-200 hover:bg-violet-50 hover:text-violet-700 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:hover:border-violet-500/40 dark:hover:bg-violet-500/10 dark:hover:text-violet-300'
//                                                         >
//                                                             View details{' '}
//                                                             <FiArrowUpRight
//                                                                 size={13}
//                                                             />
//                                                         </Link>
//                                                     </td>
//                                                 </tr>
//                                             );
//                                         })}
//                                     {!isLoading &&
//                                         !error &&
//                                         users.length === 0 && (
//                                             <tr>
//                                                 <td
//                                                     colSpan={4}
//                                                     className='px-6 py-16 text-center'
//                                                 >
//                                                     <div className='mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 dark:bg-slate-800'>
//                                                         <FiUsers size={25} />
//                                                     </div>
//                                                     <h3 className='mt-4 text-sm font-semibold text-slate-900 dark:text-white'>
//                                                         No matching users
//                                                     </h3>
//                                                     <p className='mx-auto mt-1 max-w-sm text-sm text-slate-500 dark:text-slate-400'>
//                                                         Try changing your
//                                                         search, sort, or
//                                                         filters.
//                                                     </p>
//                                                     {(debouncedQuery ||
//                                                         activeFilterCount >
//                                                             0) && (
//                                                         <RippleButton
//                                                             {...PRIMARY_BUTTON}
//                                                             variant='soft'
//                                                             size='sm'
//                                                             onClick={() => {
//                                                                 setQuery('');
//                                                                 setDebouncedQuery(
//                                                                     '',
//                                                                 );
//                                                                 clearFilters();
//                                                             }}
//                                                             className='mt-4 inline-flex items-center gap-2 rounded-xl text-sm font-semibold text-violet-700 dark:text-violet-300'
//                                                         >
//                                                             <FiX size={15} />{' '}
//                                                             Clear search and
//                                                             filters
//                                                         </RippleButton>
//                                                     )}
//                                                 </td>
//                                             </tr>
//                                         )}
//                                 </tbody>
//                             </table>
//                         </div>

//                         <footer className='flex flex-col gap-4 border-t border-slate-100 bg-white px-5 py-4 dark:border-slate-800 dark:bg-slate-900 sm:flex-row sm:items-center sm:justify-between sm:px-6'>
//                             <div>
//                                 <p className='text-sm text-slate-500 dark:text-slate-400'>
//                                     Showing{' '}
//                                     <span className='font-semibold text-slate-800 dark:text-slate-200'>
//                                         {rangeStart.toLocaleString()}–
//                                         {rangeEnd.toLocaleString()}
//                                     </span>{' '}
//                                     of{' '}
//                                     <span className='font-semibold text-slate-800 dark:text-slate-200'>
//                                         {total.toLocaleString()}
//                                     </span>{' '}
//                                     matching users
//                                 </p>
//                                 <p className='mt-1 text-xs text-slate-400 dark:text-slate-500'>
//                                     Sorted by {sortLabel.toLowerCase()},{' '}
//                                     {sortOrder === 'asc'
//                                         ? 'ascending'
//                                         : 'descending'}
//                                 </p>
//                             </div>
//                             <div className='flex items-center gap-2'>
//                                 <RippleButton
//                                     {...MUTED_BUTTON}
//                                     variant='outline'
//                                     size='sm'
//                                     type='button'
//                                     onClick={handlePrevious}
//                                     disabled={!canGoPrevious || isLoading}
//                                     className='inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 text-sm font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200'
//                                 >
//                                     <FiChevronLeft size={17} /> Previous
//                                 </RippleButton>
//                                 <span className='min-w-10 text-center text-sm font-semibold text-slate-600 dark:text-slate-300'>
//                                     {limit === 'all' ? 'All' : currentPage}
//                                 </span>
//                                 <RippleButton
//                                     {...PRIMARY_BUTTON}
//                                     variant='solid'
//                                     size='sm'
//                                     type='button'
//                                     onClick={handleNext}
//                                     disabled={!canGoNext || isLoading}
//                                     className='inline-flex h-10 items-center justify-center gap-2 rounded-xl text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40'
//                                 >
//                                     Next <FiChevronRight size={17} />
//                                 </RippleButton>
//                             </div>
//                         </footer>
//                     </section>

//                     <p className='text-center text-xs text-slate-400 dark:text-slate-500'>
//                         User management · Filters and sorting are applied by the
//                         backend
//                     </p>
//                 </div>
//             </main>
//         </>
//     );
// }
