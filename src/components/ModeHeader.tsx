import { motion } from 'framer-motion';
import { Card } from './ui/Card';
import { Button } from './ui/Button';

type AppMode = 'period' | 'conceive' | 'pregnancy' | 'perimenopause';

interface ModeHeaderProps {
    currentMode: AppMode;
    onModeChange: (mode: AppMode) => void;
    subtitle?: string;
}

const MODE_CONFIG: Record<AppMode, { icon: string; label: string; gradient: string; color: string }> = {
    period: {
        icon: '🌸',
        label: 'Period Tracking',
        gradient: 'from-period-500 to-period-400',
        color: 'text-period-600'
    },
    conceive: {
        icon: '🥚',
        label: 'Trying to Conceive',
        gradient: 'from-conceive-500 to-conceive-400',
        color: 'text-conceive-600'
    },
    pregnancy: {
        icon: '🤰',
        label: 'Pregnancy',
        gradient: 'from-pregnancy-500 to-pregnancy-400',
        color: 'text-pregnancy-600'
    },
    perimenopause: {
        icon: '🔥',
        label: 'Perimenopause',
        gradient: 'from-perimenopause-500 to-perimenopause-400',
        color: 'text-perimenopause-600'
    }
};

const MODES: AppMode[] = ['period', 'conceive', 'pregnancy', 'perimenopause'];

export default function ModeHeader({ currentMode, onModeChange, subtitle }: ModeHeaderProps) {
    const config = MODE_CONFIG[currentMode];

    const cycleToNextMode = () => {
        const currentIndex = MODES.indexOf(currentMode);
        const nextIndex = (currentIndex + 1) % MODES.length;
        onModeChange(MODES[nextIndex]);
    };

    return (
        <Card variant="glass" className="flex items-center justify-between p-4 mb-6 border-white/40 shadow-glass">
            <div className="flex items-center gap-4">
                <motion.div
                    key={currentMode}
                    initial={{ scale: 0.8, rotate: -20, opacity: 0 }}
                    animate={{ scale: 1, rotate: 0, opacity: 1 }}
                    transition={{ type: 'spring', bounce: 0.5 }}
                    className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${config.gradient} flex items-center justify-center text-3xl shadow-lg ring-4 ring-white/30`}
                >
                    {config.icon}
                </motion.div>
                <div>
                    <motion.p
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-0.5"
                    >
                        Current Mode
                    </motion.p>
                    <motion.h2
                        key={config.label}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`text-lg font-heading font-bold ${config.color} leading-none`}
                    >
                        {config.label}
                    </motion.h2>
                    {subtitle && (
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-xs text-muted-foreground mt-1 font-medium"
                        >
                            {subtitle}
                        </motion.p>
                    )}
                </div>
            </div>

            <Button
                variant="outline"
                size="sm"
                onClick={cycleToNextMode}
                className="gap-2 bg-white/50 border-white/40 hover:bg-white/80 shadow-sm"
            >
                <span className="text-xs font-semibold">Switch</span>
                <motion.span
                    whileHover={{ rotate: 180 }}
                    transition={{ duration: 0.4 }}
                    className="text-xs"
                >
                    ⟳
                </motion.span>
            </Button>
        </Card>
    );
}
