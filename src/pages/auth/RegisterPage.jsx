import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router';
import { useAuth } from '@/context/AuthContext';
import { RippleButton } from '@/components/RippleButton';
import { FaArrowLeft, FaEye, FaEyeSlash } from 'react-icons/fa6';

export default function RegisterPage() {
    const { register, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const [form, setForm] = useState({
        email: '',
        username: '',
        password: '',
        firstName: '',
        lastName: '',
    });
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    if (isAuthenticated) return <Navigate to='/' replace />;

    const update = (key) => (event) =>
        setForm((current) => ({ ...current, [key]: event.target.value }));

    async function handleSubmit(event) {
        event.preventDefault();
        setError('');
        try {
            await register({
                contact: { email: form.email, username: form.username },
                personal: {
                    firstName: form.firstName,
                    lastName: form.lastName,
                },
                security: { password: form.password },
            });
            navigate('/', { replace: true });
        } catch (err) {
            setError(err.message || 'Registration failed.');
        }
    }

    return (
        <main className='flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-violet-200 to-pink-200'>
            <div className='w-full max-w-xs sm:max-w-md md:max-w-xl lg:max-w-2xl border border-neutral-300 py-3 md:py-6 rounded-lg shadow-xl bg-linear-to-br from-[hsl(270,_50%,_92.5%)] to-[hsl(300,_50%,_97.5%)]'>
                <div className='mb-6 border-b border-black/25 px-4 pb-4'>
                    <h1 className='text-base md:text-xl font-bold text-[hsl(270,_75%,_60%)] text-shadow-md'>Register</h1>
                </div>
                {error && <p role='alert' className='text-red-500 text-sm mb-4 px-6 mx-6 bg-red-100 border border-red-400 rounded py-2'>
                    {error}
                </p>}
                <form className='space-y-4 px-6' onSubmit={handleSubmit}>
                    <div className='grid md:grid-cols-2 gap-4 space-y-4'>
                        <div className='relative h-11'>
                            <input
                                className='peer h-full w-full border-b border-blue-gray-200 bg-transparent pt-4 pb-1.5 font-sans text-sm font-normal text-blue-gray-700 outline outline-0 transition-all placeholder-shown:border-blue-gray-200 focus:border-indigo-500 focus:outline-0 disabled:border-0 disabled:bg-blue-gray-50'
                                value={form.email}
                                onChange={update('email')}
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
                                value={form.username}
                                onChange={update('username')}
                                placeholder=' '
                                autoComplete='username'
                            />
                            <label className="after:content[' '] pointer-events-none absolute left-0 -top-1.5 flex h-full w-full origin-left select-none text-[11px] font-bold leading-tight peer-[:not(:placeholder-shown)]:text-[hsl(270,_100%,_40%)] transition-all after:absolute after:-bottom-1.5 after:block after:w-full after:origin-right peer-focus:after:origin-left after:scale-x-0 peer-[:not(:placeholder-shown)]:after:scale-x-100 after:border-b-2 after:bg-linear-to-r after:from-[hsl(270,_50%,_60%)] after:to-[hsl(300,_50%,_64%)] after:transition-transform after:duration-300 peer-placeholder-shown:text-sm peer-placeholder-shown:font-normal peer-placeholder-shown:leading-[4.25] peer-focus:text-[11px] peer-focus:leading-tight peer-focus:font-bold peer-focus:text-[hsl(270,_100%,_40%)] peer-focus:after:scale-x-100 peer-disabled:text-transparent peer-disabled:peer-placeholder-shown:text-[hsl(270,_100%,_40%)]">
                                Username
                            </label>
                        </div>
                        <div className='relative h-11'>
                            <input
                                className='peer h-full w-full border-b border-blue-gray-200 bg-transparent pt-4 pb-1.5 font-sans text-sm font-normal text-blue-gray-700 outline outline-0 transition-all placeholder-shown:border-blue-gray-200 focus:border-indigo-500 focus:outline-0 disabled:border-0 disabled:bg-blue-gray-50'
                                value={form.firstName}
                                onChange={update('firstName')}
                                placeholder=' '
                            />
                            <label className="after:content[' '] pointer-events-none absolute left-0 -top-1.5 flex h-full w-full origin-left select-none text-[11px] font-bold leading-tight peer-[:not(:placeholder-shown)]:text-[hsl(270,_100%,_40%)] transition-all after:absolute after:-bottom-1.5 after:block after:w-full after:origin-right peer-focus:after:origin-left after:scale-x-0 peer-[:not(:placeholder-shown)]:after:scale-x-100 after:border-b-2 after:bg-linear-to-r after:from-[hsl(270,_50%,_60%)] after:to-[hsl(300,_50%,_64%)] after:transition-transform after:duration-300 peer-placeholder-shown:text-sm peer-placeholder-shown:font-normal peer-placeholder-shown:leading-[4.25] peer-focus:text-[11px] peer-focus:leading-tight peer-focus:font-bold peer-focus:text-[hsl(270,_100%,_40%)] peer-focus:after:scale-x-100 peer-disabled:text-transparent peer-disabled:peer-placeholder-shown:text-[hsl(270,_100%,_40%)]">
                                First name
                            </label>
                        </div>
                        <div className='relative h-11'>
                            <input
                                className='peer h-full w-full border-b border-blue-gray-200 bg-transparent pt-4 pb-1.5 font-sans text-sm font-normal text-blue-gray-700 outline outline-0 transition-all placeholder-shown:border-blue-gray-200 focus:border-indigo-500 focus:outline-0 disabled:border-0 disabled:bg-blue-gray-50'
                                value={form.lastName}
                                onChange={update('lastName')}
                                placeholder=' '
                            />
                            <label className="after:content[' '] pointer-events-none absolute left-0 -top-1.5 flex h-full w-full origin-left select-none text-[11px] font-bold leading-tight peer-[:not(:placeholder-shown)]:text-[hsl(270,_100%,_40%)] transition-all after:absolute after:-bottom-1.5 after:block after:w-full after:origin-right peer-focus:after:origin-left after:scale-x-0 peer-[:not(:placeholder-shown)]:after:scale-x-100 after:border-b-2 after:bg-linear-to-r after:from-[hsl(270,_50%,_60%)] after:to-[hsl(300,_50%,_64%)] after:transition-transform after:duration-300 peer-placeholder-shown:text-sm peer-placeholder-shown:font-normal peer-placeholder-shown:leading-[4.25] peer-focus:text-[11px] peer-focus:leading-tight peer-focus:font-bold peer-focus:text-[hsl(270,_100%,_40%)] peer-focus:after:scale-x-100 peer-disabled:text-transparent peer-disabled:peer-placeholder-shown:text-[hsl(270,_100%,_40%)]">
                                Last name
                            </label>
                        </div>
                        <div className='relative h-11'>
                            <input
                                className='peer h-full w-full border-b border-blue-gray-200 bg-transparent pt-4 pb-1.5 font-sans text-sm font-normal text-blue-gray-700 outline outline-0 transition-all placeholder-shown:border-blue-gray-200 focus:border-indigo-500 focus:outline-0 disabled:border-0 disabled:bg-blue-gray-50'
                                value={form.password}
                                onChange={update('password')}
                                type={showPassword ? 'text' : 'password'}
                                placeholder=' '
                                autoComplete='new-password'
                            />
                            <label className="after:content[' '] pointer-events-none absolute left-0 -top-1.5 flex h-full w-full origin-left select-none text-[11px] font-bold leading-tight peer-[:not(:placeholder-shown)]:text-[hsl(270,_100%,_40%)] transition-all after:absolute after:-bottom-1.5 after:block after:w-full after:origin-right peer-focus:after:origin-left after:scale-x-0 peer-[:not(:placeholder-shown)]:after:scale-x-100 after:border-b-2 after:bg-linear-to-r after:from-[hsl(270,_50%,_60%)] after:to-[hsl(300,_50%,_64%)] after:transition-transform after:duration-300 peer-placeholder-shown:text-sm peer-placeholder-shown:font-normal peer-placeholder-shown:leading-[4.25] peer-focus:text-[11px] peer-focus:leading-tight peer-focus:font-bold peer-focus:text-[hsl(270,_100%,_40%)] peer-focus:after:scale-x-100 peer-disabled:text-transparent peer-disabled:peer-placeholder-shown:text-[hsl(270,_100%,_40%)]">
                                Password
                            </label>
                        </div>
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
                            name={
                                showPassword ? 'Hide password' : 'Show password'
                            }
                            className='p-1.5 shadow-none font-medium'
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
                    <div class='flex items-center justify-between space-x-2 my-4'>
                        <Link to='/login'>
                            <RippleButton
                                hue={270}
                                saturation={100}
                                lightness={50}
                                variant='ghost'
                                type='submit'
                                size='sm'
                                name='Back to login'
                                className='rounded text-xs md:text-sm'
                            >
                                <FaArrowLeft size={15} className='mr-1' />
                                Back to login
                            </RippleButton>
                        </Link>
                        <RippleButton
                            hue={270}
                            saturation={100}
                            lightness={60}
                            variant='solid'
                            type='submit'
                            size='sm'
                            name='Register'
                            className='rounded text-xs md:text-sm'
                        >
                            Register
                        </RippleButton>
                    </div>
                </form>
            </div>
        </main>
    );
}
