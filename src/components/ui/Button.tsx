import React from 'react';
import { cn } from '../../utils/cn';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'glass';
    size?: 'sm' | 'md' | 'lg' | 'icon';
    isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = 'primary', size = 'md', isLoading, children, ...props }, ref) => {
        const variants = {
            primary: 'bg-primary text-primary-foreground hover:opacity-90 shadow-lg shadow-primary/25',
            secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
            outline: 'border-2 border-primary text-primary hover:bg-primary/5',
            ghost: 'hover:bg-accent hover:text-accent-foreground',
            glass: 'bg-white/20 backdrop-blur-md border border-white/30 text-white hover:bg-white/30',
        };

        const sizes = {
            sm: 'h-9 px-4 text-xs',
            md: 'h-11 px-6 text-sm',
            lg: 'h-14 px-8 text-base',
            icon: 'h-11 w-11 p-0',
        };

        return (
            <button
                ref={ref}
                className={cn(
                    'btn-premium relative overflow-hidden',
                    variants[variant],
                    sizes[size],
                    isLoading && 'opacity-70 cursor-not-allowed',
                    className
                )}
                disabled={isLoading || props.disabled}
                {...props}
            >
                {isLoading ? (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : children}
            </button>
        );
    }
);

Button.displayName = 'Button';
