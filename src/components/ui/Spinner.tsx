/**
 * Spinner Component
 * Loading indicator with size variants
 */

import { motion } from 'framer-motion';

interface SpinnerProps {
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

const SIZES = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-10 h-10'
};

export function Spinner({ size = 'md', className = '' }: SpinnerProps) {
    return (
        <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className={`${SIZES[size]} border-2 border-primary/30 border-t-primary rounded-full ${className}`}
        />
    );
}

/**
 * Loading Overlay
 * Full-screen or container loading state
 */
export function LoadingOverlay({ message = 'Loading...' }: { message?: string }) {
    return (
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center z-50">
            <Spinner size="lg" />
            <p className="mt-3 text-sm text-muted-foreground">{message}</p>
        </div>
    );
}

/**
 * Success Checkmark Animation
 */
export function SuccessCheck({ className = '' }: { className?: string }) {
    return (
        <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className={`w-16 h-16 rounded-full bg-green-500 flex items-center justify-center ${className}`}
        >
            <motion.svg
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="w-8 h-8 text-white"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
            >
                <motion.path d="M5 13l4 4L19 7" />
            </motion.svg>
        </motion.div>
    );
}
