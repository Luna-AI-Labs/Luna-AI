/**
 * Recent Logs Component
 * Displays the user's recent symptom logs with ability to view details
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Spinner } from './ui/Spinner';

interface LogEntry {
    id: number;
    date: string;
    symptoms: string[];
    mood?: string;
    energy?: string;
    notes?: string;
}

interface RecentLogsProps {
    onLogClick?: (log: LogEntry) => void;
    limit?: number;
}

const SYMPTOM_EMOJIS: Record<string, string> = {
    cramps: '😣',
    headache: '🤕',
    fatigue: '😴',
    bloating: '🎈',
    happy: '😊',
    anxious: '😰',
    heavy: '💧💧💧',
    light: '💧',
    hot_flash: '🔥',
    default: '•'
};

export default function RecentLogs({ limit = 7 }: RecentLogsProps) {
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [expandedId, setExpandedId] = useState<number | null>(null);

    useEffect(() => {
        fetchLogs();
    }, []);

    const fetchLogs = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`http://localhost:3001/api/cycle/logs?limit=${limit}`, {
                headers: { 'x-user-id': '1' }
            });
            const data = await response.json();
            if (data.success) {
                setLogs(data.logs);
            } else {
                setLogs(generateMockLogs());
            }
        } catch (error) {
            // Use mock data for demo
            setLogs(generateMockLogs());
        } finally {
            setIsLoading(false);
        }
    };

    const generateMockLogs = (): LogEntry[] => {
        const mockLogs: LogEntry[] = [];
        const today = new Date();
        for (let i = 0; i < limit; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() - i);
            mockLogs.push({
                id: i + 1,
                date: date.toISOString().split('T')[0],
                symptoms: ['fatigue', 'cramps', 'headache'].slice(0, Math.floor(Math.random() * 3) + 1),
                mood: ['happy', 'calm', 'anxious'][Math.floor(Math.random() * 3)],
                energy: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)]
            });
        }
        return mockLogs;
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);

        if (dateStr === today.toISOString().split('T')[0]) {
            return 'Today';
        } else if (dateStr === yesterday.toISOString().split('T')[0]) {
            return 'Yesterday';
        }
        return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    };

    const getSymptomEmoji = (symptom: string) => {
        return SYMPTOM_EMOJIS[symptom] || SYMPTOM_EMOJIS.default;
    };

    if (isLoading) {
        return (
            <div className="glass-card p-6 flex items-center justify-center">
                <Spinner size="md" />
            </div>
        );
    }

    if (logs.length === 0) {
        return (
            <div className="glass-card p-6 text-center">
                <p className="text-3xl mb-2">📝</p>
                <p className="text-sm text-muted-foreground">No logs yet. Start tracking!</p>
            </div>
        );
    }

    return (
        <div className="glass-card p-4">
            <h3 className="text-sm font-semibold mb-4 flex items-center justify-between">
                <span>Recent Activity</span>
                <button
                    onClick={fetchLogs}
                    className="text-xs text-primary hover:text-primary/80"
                >
                    ↻
                </button>
            </h3>

            <div className="space-y-2">
                {logs.map((log) => (
                    <motion.div
                        key={log.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="group"
                    >
                        <button
                            onClick={() => setExpandedId(expandedId === log.id ? null : log.id)}
                            className="w-full flex items-center justify-between p-3 rounded-lg bg-background/50 hover:bg-background/80 transition-colors text-left"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm">
                                    {log.symptoms.length > 0 ? getSymptomEmoji(log.symptoms[0]) : '📝'}
                                </div>
                                <div>
                                    <p className="text-sm font-medium">{formatDate(log.date)}</p>
                                    <p className="text-xs text-muted-foreground">
                                        {log.symptoms.length} symptom{log.symptoms.length !== 1 ? 's' : ''} logged
                                    </p>
                                </div>
                            </div>
                            <span className="text-muted-foreground text-sm group-hover:text-primary transition-colors">
                                {expandedId === log.id ? '−' : '+'}
                            </span>
                        </button>

                        <AnimatePresence>
                            {expandedId === log.id && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="overflow-hidden"
                                >
                                    <div className="p-3 bg-muted/20 rounded-lg mt-1 ml-11">
                                        <div className="flex flex-wrap gap-1.5">
                                            {log.symptoms.map((symptom, i) => (
                                                <span
                                                    key={i}
                                                    className="px-2 py-1 bg-primary/10 rounded-full text-xs"
                                                >
                                                    {getSymptomEmoji(symptom)} {symptom.replace('_', ' ')}
                                                </span>
                                            ))}
                                        </div>
                                        {log.mood && (
                                            <p className="text-xs text-muted-foreground mt-2">
                                                Mood: <span className="capitalize">{log.mood}</span>
                                            </p>
                                        )}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
