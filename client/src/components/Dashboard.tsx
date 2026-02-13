import { useMemo, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import InsightsPanel from './InsightsPanel';

interface DashboardProps {
    cycleStatus: {
        hasData: boolean;
        cycleDay: number;
        phase: string;
        avgCycleLength: number;
        daysUntilPeriod: number;
        daysUntilOvulation: number;
        fertileWindow: boolean;
    } | null;
    currentMode?: string;
    onModeChange?: (mode: string) => void;
}

// Animated particles component
function FloatingParticles({ color }: { color: string }) {
    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(4)].map((_, i) => (
                <motion.div
                    key={i}
                    className={`absolute w-2 h-2 rounded-full ${color} opacity-60`}
                    initial={{
                        x: 120 + Math.cos(i * 60 * Math.PI / 180) * 80,
                        y: 120 + Math.sin(i * 60 * Math.PI / 180) * 80,
                        scale: 0.5
                    }}
                    animate={{
                        x: [null, 120 + Math.cos((i * 60 + 30) * Math.PI / 180) * 100],
                        y: [null, 120 + Math.sin((i * 60 + 30) * Math.PI / 180) * 100],
                        scale: [0.5, 1, 0.5],
                        opacity: [0.4, 0.8, 0.4]
                    }}
                    transition={{
                        duration: 3 + i * 0.5,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                />
            ))}
        </div>
    );
}

export default function Dashboard({ cycleStatus, currentMode }: DashboardProps) {
    const [pulseScale, setPulseScale] = useState(1);

    // Continuous breathing animation
    useEffect(() => {
        const interval = setInterval(() => {
            setPulseScale(prev => prev === 1 ? 1.02 : 1);
        }, 2000);
        return () => clearInterval(interval);
    }, []);

    const phaseInfo = useMemo(() => {
        const phases: Record<string, {
            color: string;
            emoji: string;
            desc: string;
            gradient: string;
            ringColor: string;
            glowColor: string;
            bgGradient: string;
            particleColor: string;
        }> = {
            menstrual: {
                color: 'text-rose-500',
                emoji: '🌸',
                desc: 'Rest and nurture yourself',
                gradient: 'from-rose-500 to-pink-400',
                ringColor: '#fb7185',
                glowColor: 'rgba(251, 113, 133, 0.6)',
                bgGradient: 'from-rose-500/20 via-pink-500/10 to-rose-400/20',
                particleColor: 'bg-rose-400'
            },
            follicular: {
                color: 'text-teal-500',
                emoji: '🌱',
                desc: 'Energy is rising!',
                gradient: 'from-teal-500 to-cyan-400',
                ringColor: '#14b8a6',
                glowColor: 'rgba(20, 184, 166, 0.6)',
                bgGradient: 'from-teal-500/20 via-cyan-500/10 to-teal-400/20',
                particleColor: 'bg-teal-400'
            },
            ovulatory: {
                color: 'text-amber-500',
                emoji: '✨',
                desc: 'Peak energy & fertility',
                gradient: 'from-amber-500 to-yellow-400',
                ringColor: '#f59e0b',
                glowColor: 'rgba(245, 158, 11, 0.6)',
                bgGradient: 'from-amber-500/20 via-yellow-500/10 to-amber-400/20',
                particleColor: 'bg-amber-400'
            },
            luteal: {
                color: 'text-violet-500',
                emoji: '🌙',
                desc: 'Wind down and reflect',
                gradient: 'from-violet-500 to-purple-400',
                ringColor: '#8b5cf6',
                glowColor: 'rgba(139, 92, 246, 0.6)',
                bgGradient: 'from-violet-500/20 via-purple-500/10 to-violet-400/20',
                particleColor: 'bg-violet-400'
            }
        };
        const currentPhase = cycleStatus?.phase?.toLowerCase() || 'follicular';
        return phases[Object.keys(phases).find(p => currentPhase.includes(p)) || 'follicular'];
    }, [cycleStatus?.phase]);

    if (!cycleStatus?.hasData) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] p-6">
                <Card variant="glass" className="w-full max-w-sm text-center p-8 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-accent" />
                    <motion.div
                        className="text-7xl mb-6 filter drop-shadow-md"
                        animate={{ y: [-5, 5, -5] }}
                        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    >
                        🌙
                    </motion.div>
                    <h2 className="text-2xl font-heading font-bold mb-3 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                        Welcome to Luna AI
                    </h2>
                    <p className="text-muted-foreground mb-8 text-sm leading-relaxed">
                        Start tracking your cycle to unlock personalized insights.
                    </p>
                    <Button variant="primary" size="lg" className="w-full shadow-glow">
                        Log Your First Period
                    </Button>
                </Card>
            </div>
        );
    }

    // Calculate progress for the ring (stroke-dashoffset)
    const safeCycleLength = Math.max(1, cycleStatus.avgCycleLength || 28);
    const circumference = 2 * Math.PI * 90; // radius = 90
    const progress = Math.min(circumference, ((cycleStatus.cycleDay - 1) / safeCycleLength) * circumference); // Cap at 100%
    const strokeDashoffset = circumference - progress;

    return (
        <div className="space-y-5 pb-24">
            {/* Hero Cycle Ring */}
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative"
            >
                <Card variant="glass" className="relative overflow-visible py-8 px-4">
                    {/* Animated Background Gradient */}
                    <motion.div
                        className={`absolute inset-0 bg-gradient-radial ${phaseInfo.bgGradient} rounded-2xl`}
                        animate={{ opacity: [0.5, 0.8, 0.5] }}
                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    />

                    {/* Date Header */}
                    <div className="flex items-center justify-between mb-4 relative z-10 px-2">
                        <div>
                            <h2 className="text-lg font-bold">Today</h2>
                            <p className="text-xs text-muted-foreground uppercase tracking-wide">
                                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                            </p>
                        </div>
                        <motion.div
                            className={`px-3 py-1.5 rounded-full bg-gradient-to-r ${phaseInfo.gradient} text-white text-xs font-medium shadow-lg`}
                            animate={{ scale: [1, 1.05, 1] }}
                            transition={{ duration: 2, repeat: Infinity }}
                        >
                            {phaseInfo.emoji} {cycleStatus.phase}
                        </motion.div>
                    </div>

                    {/* Main Cycle Ring */}
                    <div className="flex justify-center relative z-10 py-4">
                        <motion.div
                            className="relative"
                            animate={{ scale: pulseScale }}
                            transition={{ duration: 2, ease: "easeInOut" }}
                        >
                            {/* Outer Glow Ring */}
                            <motion.div
                                className="absolute inset-0 rounded-full"
                                style={{
                                    width: 240,
                                    height: 240,
                                    left: '50%',
                                    top: '50%',
                                    transform: 'translate(-50%, -50%)',
                                    boxShadow: `0 0 60px 20px ${phaseInfo.glowColor}, 0 0 100px 40px ${phaseInfo.glowColor}`,
                                    opacity: 0.4
                                }}
                                animate={{
                                    opacity: [0.3, 0.6, 0.3],
                                    scale: [0.98, 1.02, 0.98]
                                }}
                                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                            />

                            {/* Floating Particles */}
                            <FloatingParticles color={phaseInfo.particleColor} />

                            {/* SVG Circle */}
                            <svg width="240" height="240" className="relative z-10">
                                {/* Background Circle */}
                                <circle
                                    cx="120"
                                    cy="120"
                                    r="90"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="12"
                                    className="text-secondary/30"
                                />

                                {/* Animated Progress Circle */}
                                <motion.circle
                                    cx="120"
                                    cy="120"
                                    r="90"
                                    fill="none"
                                    stroke={`url(#progressGradient)`}
                                    strokeWidth="14"
                                    strokeLinecap="round"
                                    strokeDasharray={circumference}
                                    strokeDashoffset={strokeDashoffset}
                                    transform="rotate(-90 120 120)"
                                    initial={{ strokeDashoffset: circumference }}
                                    animate={{ strokeDashoffset }}
                                    transition={{ duration: 1.5, ease: "easeOut" }}
                                    style={{
                                        filter: `drop-shadow(0 0 8px ${phaseInfo.ringColor})`
                                    }}
                                />

                                {/* Gradient Definition */}
                                <defs>
                                    <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                        <stop offset="0%" stopColor={phaseInfo.ringColor} />
                                        <stop offset="100%" stopColor={phaseInfo.ringColor} stopOpacity="0.6" />
                                    </linearGradient>
                                </defs>

                                {/* Moving Dot at Progress End */}
                                <motion.circle
                                    cx="120"
                                    cy="30"
                                    r="8"
                                    fill={phaseInfo.ringColor}
                                    style={{
                                        filter: `drop-shadow(0 0 10px ${phaseInfo.ringColor})`,
                                        transformOrigin: '120px 120px'
                                    }}
                                    animate={{
                                        rotate: [0, 360],
                                    }}
                                    transition={{
                                        duration: 20,
                                        repeat: Infinity,
                                        ease: "linear"
                                    }}
                                />
                            </svg>

                            {/* Center Content */}
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <motion.div
                                    className="text-center"
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.3 }}
                                >
                                    <span className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
                                        Day
                                    </span>
                                    <motion.div
                                        className={`text-6xl font-bold bg-gradient-to-br ${phaseInfo.gradient} bg-clip-text text-transparent`}
                                        key={cycleStatus.cycleDay}
                                        initial={{ scale: 0.5, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        transition={{ type: "spring", stiffness: 200 }}
                                    >
                                        {cycleStatus.cycleDay}
                                    </motion.div>
                                    <span className="text-sm text-muted-foreground">
                                        of {cycleStatus.avgCycleLength} days
                                    </span>
                                </motion.div>
                            </div>
                        </motion.div>
                    </div>

                    {/* Phase Description */}
                    <motion.p
                        className="text-center text-muted-foreground mt-4 relative z-10"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                    >
                        {phaseInfo.desc}
                    </motion.p>
                </Card>
            </motion.div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-3">
                <StatCard
                    icon="💧"
                    value={cycleStatus.daysUntilPeriod.toString()}
                    label="Days until period"
                    gradient={phaseInfo.gradient}
                    delay={0.1}
                />
                <StatCard
                    icon={cycleStatus.fertileWindow ? "✨" : "⭐"}
                    value={cycleStatus.fertileWindow ? "High" : cycleStatus.daysUntilOvulation.toString()}
                    label={cycleStatus.fertileWindow ? "Fertility Status" : "Days to ovulation"}
                    subLabel={cycleStatus.fertileWindow ? "Fertile Window" : undefined}
                    gradient={cycleStatus.fertileWindow ? "from-amber-500 to-yellow-400" : "from-teal-500 to-cyan-400"}
                    delay={0.2}
                />
            </div>

            {/* Insights Panel */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
            >
                <InsightsPanel
                    mode={currentMode as any || 'period'}
                    cycleData={{
                        cycleDay: cycleStatus.cycleDay,
                        phase: cycleStatus.phase
                    }}
                />
            </motion.div>
        </div>
    );
}

function StatCard({
    icon,
    value,
    label,
    subLabel,
    gradient,
    delay = 0
}: {
    icon: string;
    value: string;
    label: string;
    subLabel?: string;
    gradient: string;
    delay?: number;
}) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay }}
        >
            <Card variant="glass" className="p-4 relative overflow-hidden group">
                {/* Hover glow effect */}
                <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />

                <div className="flex items-center gap-3 relative z-10">
                    <motion.span
                        className="text-2xl"
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 2, repeat: Infinity, delay: delay }}
                    >
                        {icon}
                    </motion.span>
                    <div>
                        <div className={`text-2xl font-bold bg-gradient-to-r ${gradient} bg-clip-text text-transparent`}>
                            {value}
                        </div>
                        <div className="text-xs text-muted-foreground">{label}</div>
                        {subLabel && (
                            <div className="text-[10px] text-muted-foreground/70">{subLabel}</div>
                        )}
                    </div>
                </div>
            </Card>
        </motion.div>
    );
}
