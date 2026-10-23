import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router';
import { useAuth } from '@/context/AuthContext';
import { RippleButton } from '@/components/RippleButton';
import { FaEye, FaEyeSlash } from 'react-icons/fa6';
import { LuLogIn } from 'react-icons/lu';
import { FaExclamationCircle } from 'react-icons/fa';
import toast from 'react-hot-toast';

export default function LoginPage() {
    const [showPassword, setShowPassword] = useState(false);
    const { login, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState('');

    if (isAuthenticated) return <Navigate to='/dashboard' replace />;

    async function handleSubmit(event) {
        event.preventDefault();
        setError('');
        if (!email?.trim() || !password) {
            const message = 'Please enter both email and password.';
            // setError(message);
            toast.error(message);
            return;
        }

        setLoading(true);
        try {
            await login({ email, password });
            // notifications.success("Changes saved successfully.", {
            //     title: "Login Successfull!!",
            // });
            toast.success('Login Successfull!!!', {
                duration: 5000,
            });
            navigate(location.state?.from?.pathname || '/dashboard', { replace: true });
        } catch (err) {
            // setError(err.message || 'Login failed.');
            // notifications.error(error?.message, {
            //     title: "Login failed",
            //     duration: 8000,
            // });
            toast.error(err.message || 'Login failed.');
        } finally {
            setLoading(false);
        }
    }

    return (
        <main className='flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-violet-200 to-pink-200'>
            <div className='w-full max-w-xs md:max-w-sm border border-neutral-300 py-6 rounded-lg shadow-xl bg-linear-to-br from-[hsl(270,_50%,_92.5%)] to-[hsl(300,_50%,_97.5%)]'>
                <div className='mb-6 border-b border-black/25 px-4 pb-4'>
                    <h1 className='text-xl font-bold text-[hsl(270,_75%,_60%)] text-shadow-md'>
                        Login
                    </h1>
                </div>
                <form className='space-y-4 px-6' onSubmit={handleSubmit}>
                    <div className='relative h-11'>
                        <input
                            className='peer h-full w-full border-b border-blue-gray-200 bg-transparent pt-4 pb-1.5 font-sans text-sm font-normal text-blue-gray-700 outline outline-0 transition-all placeholder-shown:border-blue-gray-200 focus:border-indigo-500 focus:outline-0 disabled:border-0 disabled:bg-blue-gray-50'
                            value={email}
                            onChange={(e) => {
                                setEmail(e.target.value);
                                if (error) setError('');
                            }}
                            placeholder=' '
                            type='email'
                            autoComplete='email'
                            // required
                        />
                        <label className="after:content[' '] pointer-events-none absolute left-0 -top-1.5 flex h-full w-full origin-left select-none text-[11px] font-bold leading-tight peer-[:not(:placeholder-shown)]:text-[hsl(270,_100%,_40%)] transition-all after:absolute after:-bottom-1.5 after:block after:w-full after:origin-right peer-focus:after:origin-left after:scale-x-0 peer-[:not(:placeholder-shown)]:after:scale-x-100 after:border-b-2 after:bg-linear-to-r after:from-[hsl(270,_50%,_60%)] after:to-[hsl(300,_50%,_64%)] after:transition-transform after:duration-300 peer-placeholder-shown:text-sm peer-placeholder-shown:font-normal peer-placeholder-shown:leading-[4.25] peer-focus:text-[11px] peer-focus:leading-tight peer-focus:font-bold peer-focus:text-[hsl(270,_100%,_40%)] peer-focus:after:scale-x-100 peer-disabled:text-transparent peer-disabled:peer-placeholder-shown:text-[hsl(270,_100%,_40%)]">
                            Email
                        </label>
                    </div>
                    <div className='relative h-11'>
                        <input
                            className='peer h-full w-full border-b border-blue-gray-200 bg-transparent pt-4 pb-1.5 font-sans text-sm font-normal text-blue-gray-700 outline outline-0 transition-all placeholder-shown:border-blue-gray-200 focus:border-indigo-500 focus:outline-0 disabled:border-0 disabled:bg-blue-gray-50'
                            value={password}
                            onChange={(e) => {
                                setPassword(e.target.value);
                                if (error) setError('');
                            }}
                            type={showPassword ? 'text' : 'password'}
                            placeholder=' '
                            autoComplete='current-password'
                        />
                        <label className="after:content[' '] pointer-events-none absolute left-0 -top-1.5 flex h-full w-full origin-left select-none text-[11px] font-bold leading-tight peer-[:not(:placeholder-shown)]:text-[hsl(270,_100%,_40%)] transition-all after:absolute after:-bottom-1.5 after:block after:w-full after:origin-right peer-focus:after:origin-left after:scale-x-0 peer-[:not(:placeholder-shown)]:after:scale-x-100 after:border-b-2 after:bg-linear-to-r after:from-[hsl(270,_50%,_60%)] after:to-[hsl(300,_50%,_64%)] after:transition-transform after:duration-300 peer-placeholder-shown:text-sm peer-placeholder-shown:font-normal peer-placeholder-shown:leading-[4.25] peer-focus:text-[11px] peer-focus:leading-tight peer-focus:font-bold peer-focus:text-[hsl(270,_100%,_40%)] peer-focus:after:scale-x-100 peer-disabled:text-transparent peer-disabled:peer-placeholder-shown:text-[hsl(270,_100%,_40%)]">
                            Password
                        </label>
                    </div>
                    <div className='flex items-center justify-between'>
                        <label class='group flex items-center cursor-pointer'>
                            <input class='sr-only peer' type='checkbox' />

                            <span class='relative size-4 flex justify-center items-center bg-gray-100 border-2 border-gray-400 rounded-md shadow-md transition-[transform,background-color,border-color] duration-500 peer-checked:border-[hsl(270,_50%,_750%)] peer-checked:bg-[hsl(270,_50%,_60%)] peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-[hsl(270,50%,60%)]'>
                                <span class='absolute inset-0 bg-gradient-to-br from-white/30 to-white/10 opacity-0 peer-checked:opacity-100 rounded-md transition-opacity duration-500 peer-checked:animate-pulse'></span>

                                <svg
                                    fill='currentColor'
                                    viewBox='0 0 20 20'
                                    class='hidden size-5 peer-checked:block transition-transform duration-500 transform scale-50 peer-checked:scale-100'
                                    xmlns='http://www.w3.org/2000/svg'
                                >
                                    <path
                                        clip-rule='evenodd'
                                        d='M16.707 5.293a1 1 0 00-1.414 0L8 12.586 4.707 9.293a1 1 0 10-1.414 1.414l4 4a1 1 0 001.414 0l8-8a1 1 0 000-1.414z'
                                        fill-rule='evenodd'
                                    ></path>
                                </svg>
                            </span>

                            <span class='ml-1.5 text-gray-700 text-sm select-none'>
                                remember me
                            </span>
                        </label>
                        <RippleButton
                            hue={270}
                            saturation={100}
                            lightness={50}
                            variant={showPassword ? 'soft' : 'ghost'}
                            size='sm'
                            className='p-1.5 shadow-none font-medium focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[hsl(270,50%,60%)]'
                            onClick={() => setShowPassword((value) => !value)}
                            aria-label={
                                showPassword ? 'Hide password' : 'Show password'
                            }
                        >
                            {showPassword ? (
                                <FaEyeSlash size={17} />
                            ) : (
                                <FaEye size={17} />
                            )}
                        </RippleButton>
                    </div>
                    {error && (
                        <span
                            role='alert'
                            className='flex items-center text-red-500 max-w-md text-sm mb-4 px-3 bg-red-100 border border-red-400 rounded py-2'
                        >
                            <span className='mr-2'>
                                <FaExclamationCircle />
                            </span>
                            <p>{error}</p>
                        </span>
                    )}
                    {loading ? (
                        <span className='flex items-center justify-center'>
                            <div className='relative w-12 h-12'>
                                {[...Array(12)].map((_, i) => (
                                    <div
                                        key={i}
                                        className='absolute w-1 h-2.5 bg-black rounded-full'
                                        style={{
                                            top: '10px',
                                            left: '50%',
                                            transformOrigin:
                                                '0.125rem 1.050rem',
                                            transform: `translateX(-50%) rotate(${i * 30}deg)`,
                                            opacity: 0.1,
                                            animation: `spinner 1s linear infinite`,
                                            animationDelay: `${i * (1000 / 12)}ms`,
                                        }}
                                    ></div>
                                ))}
                            </div>
                            Logging in...
                        </span>
                    ) : (
                        <RippleButton
                            hue={270}
                            saturation={100}
                            lightness={60}
                            variant='solid'
                            type='submit'
                            size='sm'
                            name='Login'
                            className='w-full rounded focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[hsl(270,50%,60%)]'
                        >
                            Login
                            <LuLogIn size={17} />
                        </RippleButton>
                    )}
                </form>
                {!loading && (
                    <>
                        <div class='flex items-center opacity-50 space-x-2 my-4 px-6 select-none'>
                            <hr class='flex-grow border-zinc-600 dark:border-zinc-700' />
                            <span class='text-zinc-648565200 dark:text-zinc-300 text-sm'>
                                OR
                            </span>
                            <hr class='flex-grow border-zinc-600 dark:border-zinc-700' />
                        </div>
                        <div class='flex flex-col  space-y-2 px-6'>
                            <Link to='/register'>
                                <RippleButton
                                    hue={270}
                                    saturation={100}
                                    lightness={50}
                                    variant='outline'
                                    type='submit'
                                    size='sm'
                                    name='Create account'
                                    className='w-full rounded focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[hsl(270,50%,60%)]'
                                >
                                    Create account
                                </RippleButton>
                            </Link>
                        </div>
                    </>
                )}
            </div>
            <div className='opacity-50 mt-5'>
                <p>Caesar.OHara1@yahoo.com : Ad</p>
                <p>Sean_Davis-Ward8@gmail.com : Mod</p>
                <p>Marc_Reynolds50@yahoo.com : Us</p>
            </div>
        </main>
    );
}
