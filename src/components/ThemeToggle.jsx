import { useTheme } from '@/context/ThemeContext';
import { RippleButton } from '@/components/RippleButton';
export function ThemeToggle() {
    const { theme, setTheme } = useTheme();

    return (
        <RippleButton
            hue={296}
            saturation={17}
            lightness={45}
            variant="ghost"
            size="sm"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className='px-2 py-1 my-0.5 rounded'
        >
            {theme === 'dark' ? '☀️ Light Mode' : '🌙 Dark Mode'}
        </RippleButton>
    );
}
