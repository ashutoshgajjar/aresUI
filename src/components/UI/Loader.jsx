import '@/assets/css/Loader.css';

export default function Loader() {
    return (
        <div className='flex items-center justify-center min-h-screen bg-[#F8F9FA]'>
            <div class='loader'>
                <svg viewBox='0 0 100 100' aria-label='Loading'>
                    <path
                        class='loader-path'
                        d='M50 12 L78 50 L50 88 L22 50 Z'
                    ></path>
                    <path
                        class='loader-inner'
                        d='M50 28 L65 50 L50 72 L35 50 Z'
                    ></path>
                </svg>
            </div>
        </div>
    );
}
