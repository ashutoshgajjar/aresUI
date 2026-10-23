import { NavLink } from 'react-router';
import { useState } from 'react';
import {
    FiBarChart2,
    FiChevronLeft,
    FiChevronRight,
    FiFile,
    FiHome,
    FiList,
    FiLogOut,
    FiSettings,
    FiUsers,
} from 'react-icons/fi';
import { LuLogOut } from 'react-icons/lu';
import { RippleButton } from '@/components/RippleButton';

const items = [
    { label: 'Dashboard', to: '/dashboard', icon: FiHome, disabled: false },
    { label: 'Tasks', to: '/tasks', icon: FiList, disabled: false },
    { label: 'Files', to: '/files', icon: FiFile, disabled: false },
    { label: 'Users', to: '/users', icon: FiUsers, adminOnly: true, disabled: false },
    { label: 'Settings', to: '/settings', icon: FiSettings, disabled: true },
];

export default function Sidebar({ role, onLogout }) {
    const [collapsed, setCollapsed] = useState(false);

    const visibleItems = items.filter(
        (item) => !item.adminOnly || role === 'admin',
    );

    return (
        <aside
            className={[
                'sticky top-0 flex h-screen shrink-0 flex-col border-r border-slate-200 bg-[hsl(270,50%,98%)] transition-[width] duration-300 dark:border-slate-800 dark:bg-slate-950',
                collapsed ? 'w-[76px]' : 'w-64',
            ].join(' ')}
        >
            <div className='flex h-15 items-center border-b border-black/20 px-4 bg-linear-to-br from-[hsl(270,_50%,_95%)] to-[hsl(300,_50%,_97.5%)] dark:border-slate-800'>
                {/* {!collapsed && (
                    <div className="min-w-0 flex-1">
                        <div className="truncate text-base font-bold text-slate-900 dark:text-white">
                            Security Console
                        </div>
                        <div className="text-xs text-slate-500">
                            Operations dashboard
                        </div>
                    </div>
                )} */}

                <RippleButton
                    hue={270}
                    saturation={100}
                    lightness={80}
                    variant='ghost'
                    type='button'
                    onClick={() => setCollapsed((value) => !value)}
                    className='rounded-lg p-2'
                    aria-label={
                        collapsed ? 'Expand sidebar' : 'Collapse sidebar'
                    }
                    title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                >
                     <div className='relative flex flex-col justify-center items-center'>
                            <span
                                className={`block h-0.5 w-2.5 bg-black/50 rounded-full transition-all duration-200 self-start ${collapsed ? 'translate-x-0 delay-300' : 'translate-x-3 delay-100 opacity-0'
                                    }`}
                            />
                            <span
                                className={`block w-4 h-0.5 bg-black/50 my-1 rounded-full transition-all duration-200 ${collapsed ? 'translate-x-0 delay-200' : '-translate-x-3 delay-200 opacity-0'
                                    }`}
                            />
                            <span
                                className={`block h-0.5 w-2.5 bg-black/50 rounded-full transition-all duration-200 self-end ${collapsed ? 'translate-x-0 delay-100' : 'translate-x-3 delay-300 opacity-0'
                                    }`}
                            />
                            <span
                                className={`absolute w-4 h-0.5 bg-black/50 my-1 rounded-full transition-all duration-200 -rotate-45 ${collapsed ? 'opacity-0 translate-x-2 -translate-y-2' : 'translate-0 delay-300'
                                    }`}
                            />
                            <span
                                className={`absolute h-0.5 w-4 bg-black/50 rounded-full transition-all duration-200 rotate-45 ${collapsed ? 'opacity-0 -translate-2' : 'translate-0 delay-300'
                                    }`}
                            />
                        </div>
                </RippleButton>
            </div>

            <nav
                className='flex-1 space-y-1 overflow-y-auto p-3'
                aria-label='Primary navigation'
            >
                {visibleItems.map(({ label, to, icon: Icon, disabled }) => (
                    <NavLink
                        key={to}
                        to={to}
                        end={to === '/'}
                        title={collapsed ? label : undefined}
                        className="w-full"
                        tabIndex={-1}
                    >
                        <RippleButton
                            hue={270}
                            saturation={50}
                            lightness={50}
                            variant={collapsed ? "ghost" : "soft"}
                            size='md'
                            type='button'
                            className={`my-1 w-full justify-start px-3`}
                            disabled={disabled}
                        >
                            <Icon size={19} className='shrink-0' />
                            <span className={`whitespace-nowrap transition-all ease-in-out origin-left ${collapsed ? 'opacity-0 -translate-x-6 pointer-events-none' : 'opacity-100 translate-x-0 delay-150'}`}>{label}</span>
                        </RippleButton>
                    </NavLink>
                ))}
            </nav>

            <div className='border-t border-black/20 p-3 dark:border-slate-800'>
                <RippleButton
                    hue={0}
                    saturation={100}
                    lightness={50}
                    variant={collapsed ? 'ghost' : 'soft'}
                    type='button'
                    onClick={onLogout}
                    title='Sign out'
                    className={[
                        'w-full transition-all',
                        collapsed ? 'h-11.5 mx-0' : 'delay-150 h-11.5',
                    ].join(' ')}
                >
                    <span className={`flex items-center justify-center gap-2 transition-translate duration-200 ${collapsed ? 'translate-x-5.25 translate-y-0 delay-50' : 'translate-x-0 delay-150'}`}>
                        <LuLogOut size={19} className="shrink-0" />
                        <span className={`transition-all ease-in-out ${collapsed ? 'opacity-0 scale-95 -translate-x-2 duration-100 pointer-events-none' : 'opacity-100 scale-100 delay-150 duration-300'}`}>
                            Sign out
                        </span>
                    </span>
                </RippleButton>
            </div>
        </aside>
    );
}
