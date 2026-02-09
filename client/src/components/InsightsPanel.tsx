/**
 * Insights Panel Component
 * Displays AI-powered personalized insights based on mode and cycle data
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Spinner } from './ui/Spinner';

type AppMode = 'period' | 'conceive' | 'pregnancy' | 'perimenopause';

interface InsightsPanelProps {
    mode: AppMode;
    cycleData?: {
        cycleDay?: number;
        phase?: string;
        week?: number;
        recentSymptoms?: string[];
    };
}

const MODE_ICONS: Record<AppMode, string> = {
    period: '🌸',
    conceive: '🥚',
    pregnancy: '🤰',
    perimenopause: '🌿'
};

const MODE_TIPS: Record<AppMode, string[]> = {
    period: [
        "Track your flow to spot patterns",
        "Rest is productive during menstruation",
        "Magnesium may help with cramps"
    ],
    conceive: [
        "Log BBT before getting out of bed",
        "Egg white discharge signals peak fertility",
        "Ovulation typically occurs mid-cycle"
    ],
    pregnancy: [
        "Stay hydrated for you and baby",
        "Prenatal vitamins are essential",
        "Movement helps reduce discomfort"
    ],
    perimenopause: [
        "Irregular cycles are normal during this phase",
        "Track hot flashes to find triggers",
        "Sleep hygiene can improve rest quality"
    ]
};

export default function InsightsPanel({ mode, cycleData }: InsightsPanelProps) {
    const [insight, setInsight] = useState<string>('');
    const [isLoading, setIsLoading] = useState(true);
    const [tipIndex, setTipIndex] = useState(0);

    useEffect(() => {
        fetchInsight();
    }, [mode, cycleData?.cycleDay]);

    const fetchInsight = async () => {
        setIsLoading(true);
        try {
            const response = await fetch('http://localhost:3001/api/ai/insight', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-user-id': '1'
                },
                body: JSON.stringify({
                    cycleDay: cycleData?.cycleDay,
                    phase: cycleData?.phase,
                    recentSymptoms: cycleData?.recentSymptoms || [],
                    mode,
                    week: cycleData?.week
                })
            });
            const data = await response.json();
            if (data.success) {
                setInsight(data.insight);
            } else {
                throw new Error('Failed to fetch insight');
            }
        } catch (error) {
            // Fallback to static tips
            const tips = MODE_TIPS[mode];
            setInsight(tips[tipIndex % tips.length]);
            setTipIndex(prev => prev + 1);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-4 border-l-4 border-l-primary"
        >
            <div className="flex items-start gap-3">
                {/* Icon */}
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-xl shrink-0">
                    {MODE_ICONS[mode]}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-semibold text-foreground/90">
                            Today's Insight
                        </h3>
                        <button
                            onClick={fetchInsight}
                            disabled={isLoading}
                            className="text-xs text-primary hover:text-primary/80 transition-colors"
                        >
                            {isLoading ? <Spinner size="sm" /> : '↻ Refresh'}
                        </button>
                    </div>

                    {isLoading ? (
                        <div className="h-12 flex items-center">
                            <div className="w-full h-3 bg-muted/30 rounded animate-pulse" />
                        </div>
                    ) : (
                        <p className="text-sm text-foreground/70 leading-relaxed">
                            {insight}
                        </p>
                    )}
                </div>
            </div>

            {/* Quick Tips */}
            <div className="mt-4 pt-3 border-t border-border/50">
                <p className="text-xs text-muted-foreground">
                    💡 <strong>Tip:</strong> {MODE_TIPS[mode]?.[tipIndex % (MODE_TIPS[mode]?.length || 1)] || "Track your cycle for better insights"}
                </p>
            </div>
        </motion.div>
    );
}
