// import { Link } from 'react-router';
// import { useRoot } from '@/context/RootContext';
// import { FaRotate } from 'react-icons/fa6';
// import { RippleButton } from '@/components/RippleButton';
// import UserDropdown from '@/components/UserDropdown';
// // import "@/assets/css/header.css"
// export default function Header({
//     Title,
//     className,
//     Desc,
//     onRefresh,
//     disabled,
// }) {
//     const { user, role, logout } = useRoot();

//     return (
//         <header
//             className={`z-10 sticky top-0 left-0 right-0 px-6 backdrop-blur border-b border-black/20 bg-linear-to-br from-[hsl(270,_50%,_95%)] to-[hsl(300,_50%,_97.5%)] ${className}`}
//         >
//             <nav className='z-40 headnav transition-transform duration-300 ease-linear '>
//                 <div className='flex items-center justify-between w-full'>
//                     <div className='flex-shrink-0'>
//                         <Link
//                             to='/'
//                             className='text-lg md:text-xl font-bold focus-visible:underline focus-visible:underline-offset-4 focus-visible:decoration-2 focus-visible:outline-none'
//                         >
//                             {Title}
//                         </Link>
//                         <p className='mt-1 text-xs text-slate-500 dark:text-slate-400'>
//                             {Desc}
//                             {/* Operational overview and system activity. */}
//                         </p>
//                     </div>
//                     <div className='flex items-center gap-4'>
//                         <ul className='flex items-center '>
//                             {role === 'admin' && (
//                                 <Link
//                                     className='px-2.5 py-4.5 hover:bg-[hsl(270,_50%,_92.5%)] focus:outline-none focus:underline focus:decoration-solid focus:underline-offset-4 text-cornsilk-dark   hover:text-neutral-900 hover:underline hover:decoration-solid hover:underline-offset-4'
//                                     to='/users'
//                                 >
//                                     Users
//                                 </Link>
//                             )}
//                             <Link
//                                 className='px-2.5 py-4.5 hover:bg-[hsl(270,_50%,_92.5%)] focus:outline-none focus:underline focus:decoration-solid focus:underline-offset-4 text-cornsilk-dark   hover:text-neutral-900 hover:underline hover:decoration-solid hover:underline-offset-4'
//                                 to='/tasks'
//                             >
//                                 Tasks
//                             </Link>
//                             <Link
//                                 className='px-2.5 py-4.5 hover:bg-[hsl(270,_50%,_92.5%)] focus:outline-none focus:underline focus:decoration-solid focus:underline-offset-4 text-cornsilk-dark   hover:text-neutral-900 hover:underline hover:decoration-solid hover:underline-offset-4'
//                                 to='/files'
//                             >
//                                 Files
//                             </Link>
//                         </ul>
//                         <RippleButton
//                             hue={270}
//                             saturation={100}
//                             lightness={50}
//                             variant='outline'
//                             size='sm'
//                             type='button'
//                             name='Refresh'
//                             onClick={onRefresh}
//                             disabled={disabled}
//                             className='inline-flex items-center gap-2 p-1.5 font-medium disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[hsl(270,50%,60%)]'
//                         >
//                             <FaRotate
//                                 className={disabled ? 'animate-spin' : ''}
//                                 size={16}
//                             />
//                             {/* Refresh */}
//                         </RippleButton>
//                         <UserDropdown
//                             user={user}
//                             onSignOut={logout}
//                             profileTo='/profile'
//                             settingsTo='/settings/health'
//                             align='right'
//                         />
//                     </div>
//                 </div>
//             </nav>
//         </header>
//     );
// }

import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router';
import { useRoot } from '@/context/RootContext';
import {
    FaRotate,
    FaBars,
    FaXmark,
    FaChevronRight,
    FaHouse,
    FaUsers,
    FaListCheck,
    FaFolderOpen,
} from 'react-icons/fa6';
import { RippleButton } from '@/components/RippleButton';
import UserDropdown from '@/components/UserDropdown';

export default function Header({
    Title,
    className = '',
    Desc,
    onRefresh,
    disabled,
    breadcrumbs,
    actions,
}) {
    const { user, role, logout } = useRoot();
    const location = useLocation();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [isVisible, setIsVisible] = useState(true);
    const lastScrollY = useRef(0);

    // Close mobile menu and reveal header on route change
    useEffect(() => {
        setMobileMenuOpen(false);
        setIsVisible(true);
    }, [location.pathname]);

    // Auto-hide on scroll down, reveal on scroll up
    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = Math.max(0, window.scrollY);
            const scrollDelta = currentScrollY - lastScrollY.current;

            // Always keep header visible near the top of the page
            if (currentScrollY < 60) {
                setIsVisible(true);
                lastScrollY.current = currentScrollY;
                return;
            }

            // Ignore micro-scrolls under 10px to prevent trackpad jitter
            if (Math.abs(scrollDelta) > 10) {
                setIsVisible(scrollDelta < 0);
                lastScrollY.current = currentScrollY;
            }
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navLinks = [
        ...(role === 'admin'
            ? [{ label: 'Users', to: '/users', icon: FaUsers }]
            : []),
        { label: 'Tasks', to: '/tasks', icon: FaListCheck },
        { label: 'Files', to: '/files', icon: FaFolderOpen },
    ];

    const computedBreadcrumbs =
        breadcrumbs ||
        location.pathname
            .split('/')
            .filter(Boolean)
            .map((segment, index, arr) => {
                const to = '/' + arr.slice(0, index + 1).join('/');
                const label = decodeURIComponent(segment)
                    .replace(/[-_]/g, ' ')
                    .replace(/\b\w/g, (char) => char.toUpperCase());
                return { label, to };
            });

    // Keep header visible if the mobile navigation drawer is currently open
    const showHeader = isVisible || mobileMenuOpen;

    return (
        <header
            className={`z-20 sticky top-0 left-0 right-0 backdrop-blur-md border-b border-purple-950/15 bg-linear-to-br from-[hsl(270,_50%,_95%)]/90 to-[hsl(300,_50%,_97.5%)]/90 shadow-2xs transition-transform duration-300 ease-in-out ${
                showHeader ? 'translate-y-0' : '-translate-y-full'
            } ${className}`}
        >
            {/* TIER 1: Global Navigation & Inline Breadcrumb Bar */}
            <div className='px-4 sm:px-6 h-13 flex items-center justify-between gap-4 border-b border-purple-950/10'>
                {/* Left: Home Button + Inline Breadcrumbs */}
                <nav
                    aria-label='Breadcrumb'
                    className='flex items-center min-w-0  no-scrollbar whitespace-nowrap py-1 gap-2'
                >
                    {/* Mobile Menu Trigger */}
                    <RippleButton
                        hue={270}
                        saturation={50}
                        lightness={25}
                        variant='ghost'
                        size='sm'
                        type='button'
                        onClick={() => setMobileMenuOpen((prev) => !prev)}
                        aria-expanded={mobileMenuOpen}
                        aria-label='Toggle navigation menu'
                        className='md:hidden p-1.5 rounded-lg'
                    >
                        {mobileMenuOpen ? (
                            <FaXmark size={16} />
                        ) : (
                            <FaBars size={16} />
                        )}
                    </RippleButton>
                    <div className='block md:hidden h-4 w-px bg-purple-950/15' />
                    <ol className='flex items-center gap-1.5 text-xs'>
                        <li className='flex items-center'>
                            <Link
                                to='/'
                                aria-label='Home'
                                className='inline-flex items-center gap-1.5 px-2 py-1 rounded-md font-semibold text-neutral-700 hover:text-neutral-950 hover:bg-white/60 transition-colors focus-visible:outline-2 focus-visible:outline-[hsl(270,50%,60%)]'
                            >
                                <FaHouse
                                    size={13}
                                    className='text-[hsl(270,60%,45%)] shrink-0'
                                />
                                <span className='hidden sm:inline'>Home</span>
                            </Link>
                        </li>

                        {location.pathname != '/dashboard' && (
                            <li className="flex  items-center gap-1.5">
                                <FaChevronRight
                                    size={9}
                                    className="text-slate-400 shrink-0"
                                />
                                    <Link
                                        to="/dashboard"
                                        className="px-1.5 py-0.5 rounded-md text-slate-600 hover:text-neutral-950 hover:bg-white/50 transition-colors"
                                    >
                                        Dashboard
                                    </Link>
                            </li>
                        )}

                        {computedBreadcrumbs.map((crumb, index) => {
                            const isLast =
                                index === computedBreadcrumbs.length - 1;
                            return (
                                <li
                                    key={crumb.to || index}
                                    className='flex items-center gap-1.5'
                                >
                                    <FaChevronRight
                                        size={9}
                                        className='text-slate-400 shrink-0'
                                    />
                                    {isLast || !crumb.to ? (
                                        <span
                                            aria-current='page'
                                            className='px-2 py-0.5 rounded-md font-semibold text-neutral-900 bg-white/70 border border-purple-950/10 truncate max-w-[140px] sm:max-w-[220px]'
                                        >
                                            {crumb.label}
                                        </span>
                                    ) : (
                                        <Link
                                            to={crumb.to}
                                            className='px-1.5 py-0.5 rounded-md text-slate-600 hover:text-neutral-950 hover:bg-white/50 transition-colors truncate max-w-[110px] sm:max-w-[180px]'
                                        >
                                            {crumb.label}
                                        </Link>
                                    )}
                                </li>
                            );
                        })}
                    </ol>
                </nav>

                {/* Right: Segmented Pill Navigation + User Profile */}
                <div className='flex items-center gap-2.5 shrink-0'>
                    <nav aria-label='Main Navigation' className='hidden md:block'>
                        <ul className='flex items-center gap-1 p-1 rounded-lg bg-white/50 border border-purple-950/20 shadow-2xs'>
                            {navLinks.map((link) => {
                                const Icon = link.icon;
                                const isActive =
                                    location.pathname === link.to ||
                                    location.pathname.startsWith(`${link.to}/`);
                                return (
                                    <li key={link.to}>
                                        <Link
                                            to={link.to}
                                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-all focus-visible:outline-2 focus-visible:outline-[hsl(270,50%,60%)] ${
                                                isActive
                                                    ? 'bg-[hsl(270,_50%,_92%)] text-neutral-950 font-semibold shadow-2xs border border-purple-950/10'
                                                    : 'text-slate-600 hover:text-neutral-900 hover:bg-[hsl(270,_50%,_95%)]'
                                            }`}
                                        >
                                            <Icon
                                                size={12}
                                                className={
                                                    isActive
                                                        ? 'text-[hsl(270,60%,45%)]'
                                                        : 'text-slate-400'
                                                }
                                            />
                                            {link.label}
                                        </Link>
                                    </li>
                                );
                            })}
                        </ul>
                    </nav>

                    {/* <div className='hidden md:block h-4 w-px bg-purple-950/15' />
                     <RippleButton
                            hue={270}
                            saturation={100}
                            lightness={50}
                            variant='outline'
                            size='sm'
                            type='button'
                            name='Refresh'
                            onClick={onRefresh}
                            disabled={disabled}
                            className='inline-flex items-center gap-1.5 px-2.5 py-1.5 disabled:cursor-not-allowed disabled:opacity-60'
                        >
                            <FaRotate
                                className={disabled ? 'animate-spin' : ''}
                                size={13}
                            />
                            <span className='hidden sm:inline'>
                                Refresh
                            </span>
                        </RippleButton> */}

                    <div className='hidden md:block h-4 w-px bg-purple-950/15' />

                    <UserDropdown
                        user={user}
                        onSignOut={logout}
                        profileTo='/profile'
                        settingsTo='/settings/health'
                        align='right'
                        btnClassName='size-7.5 md:size-9.5'
                    />
                </div>
            </div>

            {/* Mobile Drawer (Grid Pill Layout) */}
            {mobileMenuOpen && (
                <nav
                    aria-label='Mobile Navigation'
                    className='md:hidden px-4 py-2.5 bg-white/75 border-b border-purple-950/10'
                >
                    <ul className='grid grid-cols-3 gap-2'>
                        {navLinks.map((link) => {
                            const Icon = link.icon;
                            const isActive =
                                location.pathname === link.to ||
                                location.pathname.startsWith(`${link.to}/`);
                            return (
                                <li key={link.to}>
                                    <Link
                                        to={link.to}
                                        onClick={() => setMobileMenuOpen(false)}
                                        className={`flex flex-col items-center justify-center gap-1 py-2 px-3 rounded-lg text-xs font-medium border transition-colors ${
                                            isActive
                                                ? 'bg-[hsl(270,_50%,_92%)] border-purple-950/15 text-neutral-950 font-semibold shadow-2xs'
                                                : 'bg-white/60 border-transparent text-slate-600 hover:bg-white hover:text-neutral-900'
                                        }`}
                                    >
                                        <Icon
                                            size={14}
                                            className={
                                                isActive
                                                    ? 'text-[hsl(270,60%,45%)]'
                                                    : 'text-slate-400'
                                            }
                                        />
                                        {link.label}
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                </nav>
            )}
        </header>
    );
}