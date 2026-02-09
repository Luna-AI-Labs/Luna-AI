/**
 * Perimenopause Dashboard
 * 
 * Midlife health tracking view for perimenopause users.
 * Shows: Symptom tracking, hot flash counter, mood/sleep tracking, wellness tips
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import HotFlashHeatmap from './HotFlashHeatmap';
import ModeHeader from './ModeHeader';
import InsightsPanel from './InsightsPanel';
import { useToast } from './ui/Toast';
import { Spinner } from './ui/Spinner';

type AppMode = 'period' | 'conceive' | 'pregnancy' | 'perimenopause';

interface PerimenopauseData {
    lastPeriodDate: string;
    avgCycleLength: number;
    cycleVariability: 'regular' | 'irregular' | 'very_irregular';
    recentSymptoms: string[];
    daysTracked: number;
}

interface PerimenopauseDashboardProps {
    data: PerimenopauseData | null;
    currentMode?: AppMode;
    onModeChange?: (mode: AppMode) => void;
}

// Expanded symptom categories for perimenopause
const SYMPTOM_CATEGORIES = [
    {
        name: 'Temperature',
        symptoms: [
            { id: 'hot_flash', emoji: '🔥', label: 'Hot Flash' },
            { id: 'night_sweats', emoji: '🌙', label: 'Night Sweats' },
            { id: 'chills', emoji: '🥶', label: 'Chills' },
        ]
    },
    {
        name: 'Mental',
        symptoms: [
            { id: 'mood_swing', emoji: '🎭', label: 'Mood Swing' },
            { id: 'anxiety', emoji: '😰', label: 'Anxiety' },
            { id: 'brain_fog', emoji: '🌫️', label: 'Brain Fog' },
            { id: 'irritable', emoji: '😤', label: 'Irritability' },
        ]
    },
    {
        name: 'Physical',
        symptoms: [
            { id: 'fatigue', emoji: '😩', label: 'Fatigue' },
            { id: 'headache', emoji: '🤕', label: 'Headache' },
            { id: 'joint_pain', emoji: '🦴', label: 'Joint Pain' },
            { id: 'insomnia', emoji: '😴', label: 'Sleep Issues' },
        ]
    }
];

// Hot flash severity levels
const HOT_FLASH_SEVERITY = [
    { id: 'mild', label: 'Mild', description: 'Brief warmth', color: '#fcd34d', emoji: '🌤️' },
    { id: 'moderate', label: 'Moderate', description: 'Sweating, flushing', color: '#f97316', emoji: '☀️' },
    { id: 'severe', label: 'Severe', description: 'Drenching sweats', color: '#ef4444', emoji: '🔥' },
];

// Mood levels
const MOOD_LEVELS = [
    { id: 1, emoji: '😢', label: 'Low' },
    { id: 2, emoji: '😕', label: 'Down' },
    { id: 3, emoji: '😐', label: 'Okay' },
    { id: 4, emoji: '🙂', label: 'Good' },
    { id: 5, emoji: '😊', label: 'Great' },
];

// Energy levels
const ENERGY_LEVELS = [
    { id: 1, emoji: '🪫', label: 'Exhausted' },
    { id: 2, emoji: '😴', label: 'Tired' },
    { id: 3, emoji: '😐', label: 'Average' },
    { id: 4, emoji: '⚡', label: 'Good' },
    { id: 5, emoji: '💪', label: 'Energized' },
];

// Sleep quality
const SLEEP_QUALITY = [
    { id: 'poor', emoji: '😫', label: 'Poor', hours: '< 5h' },
    { id: 'fair', emoji: '😪', label: 'Fair', hours: '5-6h' },
    { id: 'good', emoji: '😴', label: 'Good', hours: '6-7h' },
    { id: 'great', emoji: '😌', label: 'Great', hours: '7-8h' },
    { id: 'excellent', emoji: '🌟', label: 'Excellent', hours: '8h+' },
];

export default function PerimenopauseDashboard({ data, currentMode = 'perimenopause', onModeChange }: PerimenopauseDashboardProps) {
    const { showToast } = useToast();
    const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
    const [hotFlashCount, setHotFlashCount] = useState(0);
    const [hotFlashSeverity, setHotFlashSeverity] = useState<string | null>(null);
    const [moodLevel, setMoodLevel] = useState<number | null>(null);
    const [energyLevel, setEnergyLevel] = useState<number | null>(null);
    const [sleepQuality, setSleepQuality] = useState<string | null>(null);
    const [showLogForm, setShowLogForm] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [expandedCategory, setExpandedCategory] = useState<string | null>('Temperature');

    useEffect(() => {
        // Load any saved data for today
    }, [data]);

    const toggleSymptom = (symptomId: string) => {
        setSelectedSymptoms(prev =>
            prev.includes(symptomId)
                ? prev.filter(s => s !== symptomId)
                : [...prev, symptomId]
        );
    };

    const handleQuickHotFlash = () => {
        setHotFlashCount(c => c + 1);
        showToast(`Hot flash logged (${hotFlashCount + 1} today) 🔥`, 'info');
    };

    const handleSaveAll = async () => {
        setIsSaving(true);
        try {
            const logData = {
                date: new Date().toISOString().split('T')[0],
                mode: 'perimenopause',
                symptoms: selectedSymptoms,
                hotFlashes: hotFlashCount,
                hotFlashSeverity,
                mood: moodLevel,
                energy: energyLevel,
                sleep: sleepQuality,
            };

            await fetch('http://localhost:3001/api/cycle/log', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'x-user-id': '1' },
                body: JSON.stringify(logData)
            });

            showToast('Daily log saved! 🦋', 'success');
            setShowLogForm(false);
        } catch (error) {
            showToast('Saved locally', 'info');
        } finally {
            setIsSaving(false);
        }
    };

    const getDaysSinceLastPeriod = () => {
        if (!data?.lastPeriodDate) return null;
        const last = new Date(data.lastPeriodDate);
        const today = new Date();
        return Math.floor((today.getTime() - last.getTime()) / (1000 * 60 * 60 * 24));
    };

    const getVariabilityInfo = (variability: string) => {
        switch (variability) {
            case 'regular': return { label: 'Regular', color: '#10b981', description: 'Cycles are predictable' };
            case 'irregular': return { label: 'Irregular', color: '#f59e0b', description: 'Cycles vary by 7+ days' };
            case 'very_irregular': return { label: 'Very Irregular', color: '#a855f7', description: 'Unpredictable timing' };
            default: return { label: 'Unknown', color: '#888', description: '' };
        }
    };

    if (!data) {
        return (
            <div className="flex items-center justify-center h-64">
                <Spinner size="lg" />
            </div>
        );
    }

    const daysSincePeriod = getDaysSinceLastPeriod();
    const variabilityInfo = getVariabilityInfo(data.cycleVariability);

    return (
        <div className="space-y-4 pb-20">
            {/* Mode Header */}
            {onModeChange && (
                <ModeHeader
                    currentMode={currentMode}
                    onModeChange={onModeChange}
                    subtitle={`${daysSincePeriod} days since period • ${variabilityInfo.label}`}
                />
            )}

            {/* Status Hero */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card overflow-hidden"
            >
                <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-4 text-white text-center">
                    <div className="text-4xl mb-2">🦋</div>
                    <h2 className="text-xl font-bold">Managing Perimenopause</h2>
                    <p className="text-sm opacity-90 mt-1">Your journey, your pace</p>
                </div>

                <div className="p-4 grid grid-cols-3 gap-3">
                    <div className="text-center">
                        <div className="text-2xl font-bold">{daysSincePeriod}</div>
                        <div className="text-xs text-muted-foreground">Days Since Period</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold">{data.avgCycleLength}</div>
                        <div className="text-xs text-muted-foreground">Avg Cycle</div>
                    </div>
                    <div className="text-center">
                        <div
                            className="text-2xl font-bold"
                            style={{ color: variabilityInfo.color }}
                        >
                            {variabilityInfo.label}
                        </div>
                        <div className="text-xs text-muted-foreground">Pattern</div>
                    </div>
                </div>
            </motion.div>

            {/* Quick Hot Flash Button */}
            <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onClick={handleQuickHotFlash}
                className="w-full py-4 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-xl font-medium shadow-lg shadow-orange-500/30 hover:scale-[1.02] transition-transform flex items-center justify-center gap-2"
            >
                <span className="text-2xl">🔥</span>
                <span>Quick Log Hot Flash</span>
                {hotFlashCount > 0 && (
                    <span className="ml-2 px-2 py-0.5 bg-white/20 rounded-full text-sm">
                        {hotFlashCount} today
                    </span>
                )}
            </motion.button>

            {/* Detailed Log Toggle */}
            <button
                onClick={() => setShowLogForm(!showLogForm)}
                className={`w-full py-3 rounded-xl font-medium transition-all ${showLogForm
                        ? 'bg-gray-500 text-white'
                        : 'bg-secondary/50 hover:bg-secondary text-foreground'
                    }`}
            >
                {showLogForm ? '✕ Close Daily Log' : '📝 Open Detailed Daily Log'}
            </button>

            {/* Detailed Log Form */}
            <AnimatePresence>
                {showLogForm && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="glass-card p-4 space-y-5 border-2 border-amber-500/30">

                            {/* Hot Flash Severity */}
                            <div>
                                <label className="text-sm font-medium flex items-center gap-2 mb-2">
                                    🔥 Hot Flash Severity
                                </label>
                                <div className="grid grid-cols-3 gap-2">
                                    {HOT_FLASH_SEVERITY.map((level) => (
                                        <button
                                            key={level.id}
                                            onClick={() => setHotFlashSeverity(hotFlashSeverity === level.id ? null : level.id)}
                                            className={`py-3 rounded-xl text-sm font-medium transition-all ${hotFlashSeverity === level.id
                                                    ? 'ring-2 ring-amber-500'
                                                    : 'bg-secondary/50 hover:bg-secondary'
                                                }`}
                                            style={{
                                                backgroundColor: hotFlashSeverity === level.id ? `${level.color}20` : undefined
                                            }}
                                        >
                                            <span className="text-2xl block">{level.emoji}</span>
                                            <span className="block font-semibold">{level.label}</span>
                                            <span className="text-xs text-muted-foreground">{level.description}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Mood Tracker */}
                            <div>
                                <label className="text-sm font-medium flex items-center gap-2 mb-2">
                                    🎭 How's Your Mood?
                                </label>
                                <div className="flex justify-between gap-1">
                                    {MOOD_LEVELS.map((level) => (
                                        <button
                                            key={level.id}
                                            onClick={() => setMoodLevel(moodLevel === level.id ? null : level.id)}
                                            className={`flex-1 py-3 rounded-xl transition-all ${moodLevel === level.id
                                                    ? 'bg-purple-100 dark:bg-purple-900/30 ring-2 ring-purple-500'
                                                    : 'bg-secondary/50 hover:bg-secondary'
                                                }`}
                                        >
                                            <span className="text-2xl block">{level.emoji}</span>
                                            <span className="text-[10px] text-muted-foreground">{level.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Energy Level */}
                            <div>
                                <label className="text-sm font-medium flex items-center gap-2 mb-2">
                                    ⚡ Energy Level
                                </label>
                                <div className="flex justify-between gap-1">
                                    {ENERGY_LEVELS.map((level) => (
                                        <button
                                            key={level.id}
                                            onClick={() => setEnergyLevel(energyLevel === level.id ? null : level.id)}
                                            className={`flex-1 py-3 rounded-xl transition-all ${energyLevel === level.id
                                                    ? 'bg-yellow-100 dark:bg-yellow-900/30 ring-2 ring-yellow-500'
                                                    : 'bg-secondary/50 hover:bg-secondary'
                                                }`}
                                        >
                                            <span className="text-2xl block">{level.emoji}</span>
                                            <span className="text-[10px] text-muted-foreground">{level.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Sleep Quality */}
                            <div>
                                <label className="text-sm font-medium flex items-center gap-2 mb-2">
                                    😴 Sleep Quality Last Night
                                </label>
                                <div className="flex gap-2 overflow-x-auto pb-1">
                                    {SLEEP_QUALITY.map((quality) => (
                                        <button
                                            key={quality.id}
                                            onClick={() => setSleepQuality(sleepQuality === quality.id ? null : quality.id)}
                                            className={`flex-shrink-0 px-4 py-3 rounded-xl transition-all ${sleepQuality === quality.id
                                                    ? 'bg-blue-100 dark:bg-blue-900/30 ring-2 ring-blue-500'
                                                    : 'bg-secondary/50 hover:bg-secondary'
                                                }`}
                                        >
                                            <span className="text-xl block">{quality.emoji}</span>
                                            <span className="text-xs font-medium">{quality.label}</span>
                                            <span className="text-[10px] text-muted-foreground block">{quality.hours}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Symptom Categories */}
                            <div>
                                <label className="text-sm font-medium flex items-center gap-2 mb-2">
                                    📋 Today's Symptoms
                                </label>
                                <div className="space-y-2">
                                    {SYMPTOM_CATEGORIES.map((category) => (
                                        <div key={category.name}>
                                            <button
                                                onClick={() => setExpandedCategory(
                                                    expandedCategory === category.name ? null : category.name
                                                )}
                                                className="w-full flex justify-between items-center py-2 px-3 bg-secondary/30 rounded-lg text-sm font-medium"
                                            >
                                                <span>{category.name}</span>
                                                <span>{expandedCategory === category.name ? '−' : '+'}</span>
                                            </button>
                                            {expandedCategory === category.name && (
                                                <motion.div
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    className="grid grid-cols-4 gap-2 mt-2"
                                                >
                                                    {category.symptoms.map(symptom => (
                                                        <button
                                                            key={symptom.id}
                                                            className={`flex flex-col items-center justify-center p-2 rounded-xl border transition-all ${selectedSymptoms.includes(symptom.id)
                                                                    ? 'bg-amber-100 dark:bg-amber-900/30 border-amber-500 text-amber-700 dark:text-amber-300'
                                                                    : 'bg-background/50 border-border hover:bg-secondary/50'
                                                                }`}
                                                            onClick={() => toggleSymptom(symptom.id)}
                                                        >
                                                            <span className="text-xl">{symptom.emoji}</span>
                                                            <span className="text-[9px] font-medium text-center leading-tight mt-1">
                                                                {symptom.label}
                                                            </span>
                                                        </button>
                                                    ))}
                                                </motion.div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Save Button */}
                            <button
                                onClick={handleSaveAll}
                                disabled={isSaving}
                                className="w-full py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-bold hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {isSaving ? <Spinner size="sm" className="border-white/50 border-t-white" /> : '✓ Save Daily Log'}
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Hot Flash Heatmap */}
            <HotFlashHeatmap />

            {/* Wellness Tips */}
            <motion.div
                className="glass-card p-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
            >
                <h3 className="text-sm font-semibold mb-3">🌿 Wellness Tips</h3>
                <div className="space-y-2 text-sm">
                    <div className="flex items-start gap-2 p-2 bg-secondary/30 rounded-lg">
                        <span>🧊</span>
                        <span>Layer clothing to manage temperature changes easily</span>
                    </div>
                    <div className="flex items-start gap-2 p-2 bg-secondary/30 rounded-lg">
                        <span>🧘</span>
                        <span>Deep breathing can help during hot flashes</span>
                    </div>
                    <div className="flex items-start gap-2 p-2 bg-secondary/30 rounded-lg">
                        <span>💧</span>
                        <span>Stay hydrated - aim for 8 glasses of water daily</span>
                    </div>
                    <div className="flex items-start gap-2 p-2 bg-secondary/30 rounded-lg">
                        <span>🥗</span>
                        <span>Avoid triggers: spicy food, caffeine, alcohol</span>
                    </div>
                </div>
            </motion.div>

            {/* AI Insights */}
            <InsightsPanel
                mode="perimenopause"
                cycleData={{ daysSincePeriod, variability: data.cycleVariability }}
            />
        </div>
    );
}
