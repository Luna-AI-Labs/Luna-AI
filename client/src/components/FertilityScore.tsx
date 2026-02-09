import { motion } from 'framer-motion';

interface FertilityScoreProps {
    score: number; // 0-100
    status: 'Low' | 'High' | 'Peak';
    factors: {
        label: string;
        impact: 'Positive' | 'Neutral' | 'Negative';
    }[];
}

export default function FertilityScore({ score, status, factors }: FertilityScoreProps) {
    const color = status === 'Peak' ? 'text-rose-500' : status === 'High' ? 'text-teal-500' : 'text-blue-400';


    return (
        <div className="glass-card p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10 font-black text-9xl pointer-events-none select-none">
                {score}
            </div>

            <div className="relative z-10 flex flex-col items-center">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">Daily Fertility Score</h3>

                <div className="relative flex items-center justify-center w-32 h-32 mb-6">
                    {/* Outer Ring */}
                    <svg className="w-full h-full transform -rotate-90">
                        <circle
                            cx="50%" cy="50%" r="45%"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="8"
                            className="text-secondary"
                        />
                        <motion.circle
                            cx="50%" cy="50%" r="45%"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="8"
                            strokeLinecap="round"
                            className={color}
                            initial={{ strokeDasharray: "0 283" }}
                            animate={{ strokeDasharray: `${(score / 100) * 283} 283` }}
                            transition={{ duration: 1.5, ease: "easeOut" }}
                        />
                    </svg>

                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className={`text-4xl font-bold ${color}`}>{score}</span>
                        <span className="text-xs font-medium text-muted-foreground">{status}</span>
                    </div>
                </div>

                <div className="w-full space-y-2">
                    {factors.map((factor, i) => (
                        <div key={i} className="flex items-center justify-between text-sm">
                            <span className="text-foreground/80">{factor.label}</span>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${factor.impact === 'Positive' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                                factor.impact === 'Negative' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                                    'bg-gray-100 text-gray-700'
                                }`}>
                                {factor.impact}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
