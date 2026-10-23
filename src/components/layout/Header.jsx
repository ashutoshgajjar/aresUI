import { Link } from 'react-router';
import { useRoot } from '@/context/RootContext';
import { FaRotate } from 'react-icons/fa6';
import { RippleButton } from '@/components/RippleButton';
import UserDropdown from '@/components/UserDropdown';
// import "@/assets/css/header.css"
export default function Header({
    Title,
    className,
    Desc,
    onRefresh,
    disabled,
}) {
    const { user, role, logout } = useRoot();

    return (
        <header
            className={`z-10 sticky top-0 left-0 right-0 px-6 backdrop-blur border-b border-black/20 bg-linear-to-br from-[hsl(270,_50%,_95%)] to-[hsl(300,_50%,_97.5%)] ${className}`}
        >
            <nav className='z-40 headnav transition-transform duration-300 ease-linear '>
                <div className='flex items-center justify-between w-full'>
                    <div className='flex-shrink-0'>
                        <Link
                            to='/'
                            className='text-lg md:text-xl font-bold focus-visible:underline focus-visible:underline-offset-4 focus-visible:decoration-2 focus-visible:outline-none'
                        >
                            {Title}
                        </Link>
                        <p className='mt-1 text-xs text-slate-500 dark:text-slate-400'>
                            {Desc}
                            {/* Operational overview and system activity. */}
                        </p>
                    </div>
                    <div className='flex items-center gap-4'>
                        <ul className='flex items-center '>
                            {role === 'admin' && (
                                <Link
                                    className='px-2.5 py-4.5 hover:bg-[hsl(270,_50%,_92.5%)] focus:outline-none focus:underline focus:decoration-solid focus:underline-offset-4 text-cornsilk-dark   hover:text-neutral-900 hover:underline hover:decoration-solid hover:underline-offset-4'
                                    to='/users'
                                >
                                    Users
                                </Link>
                            )}
                            <Link
                                className='px-2.5 py-4.5 hover:bg-[hsl(270,_50%,_92.5%)] focus:outline-none focus:underline focus:decoration-solid focus:underline-offset-4 text-cornsilk-dark   hover:text-neutral-900 hover:underline hover:decoration-solid hover:underline-offset-4'
                                to='/tasks'
                            >
                                Tasks
                            </Link>
                            <Link
                                className='px-2.5 py-4.5 hover:bg-[hsl(270,_50%,_92.5%)] focus:outline-none focus:underline focus:decoration-solid focus:underline-offset-4 text-cornsilk-dark   hover:text-neutral-900 hover:underline hover:decoration-solid hover:underline-offset-4'
                                to='/files'
                            >
                                Files
                            </Link>
                        </ul>
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
                            className='inline-flex items-center gap-2 p-1.5 font-medium disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[hsl(270,50%,60%)]'
                        >
                            <FaRotate
                                className={disabled ? 'animate-spin' : ''}
                                size={16}
                            />
                            {/* Refresh */}
                        </RippleButton>
                        <UserDropdown
                            user={user}
                            onSignOut={logout}
                            profileTo='/profile'
                            settingsTo='/settings/health'
                            align='right'
                        />
                    </div>
                </div>
            </nav>
        </header>
    );
}
