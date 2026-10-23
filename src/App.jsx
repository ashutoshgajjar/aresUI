// import './App.css'
import AppRoutes from '@/routes/AppRoutes';
import { RootProvider } from '@/context/RootContext';
import { NotificationProvider } from '@/components/notifications';
import toast, { Toaster, useToasterStore } from 'react-hot-toast';
import { FaExclamationCircle } from 'react-icons/fa';
import { useEffect } from 'react';
import { ErrorBoundary } from '@/components/errors';

const MAX_TOASTS = 5;

function App() {
    const { toasts } = useToasterStore();

    useEffect(() => {
        toasts
            .filter((t) => t.visible)
            .filter((_, index) => index >= MAX_TOASTS)
            .forEach((t) => toast.dismiss(t.id));
    }, [toasts]);

    return (
        <>
            <RootProvider>
                <ErrorBoundary
                    onError={(error, info) => {
                        console.error(
                            'Component rendering failed',
                            error,
                            info,
                        );
                    }}
                >
                    <Toaster gutter={12} position='bottom-right' reverseOrder={false} toastOptions={{className: 'bg-pink-200', duration: 5000,  error: {style: { background: "#fee2e2", border: "1px solid #FC6969", color: 'oklch(57.7% 0.245 27.325)'}, icon: (<FaExclamationCircle className="fill-red-500 animate-icon-pop" />)}}}  />
                    <AppRoutes />
                </ErrorBoundary>
            </RootProvider>
        </>
    );
}

export default App;
