import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import BBTChart from './BBTChart';
import FertilityScore from './FertilityScore';
import ModeHeader from './ModeHeader';
import InsightsPanel from './InsightsPanel';
import { useToast } from './ui/Toast';
import { Spinner } from './ui/Spinner';

type AppMode = 'period' | 'conceive' | 'pregnancy' | 'perimenopause';

interface ConceiveData {
    cycleDay: number;
    avgCycleLength: number;
    fertileWindow: boolean;
    daysUntilOvulation: number;
    ovulationDate: string;
    bbtData?: { day: number; temp: number }[];
}

interface ConceiveDashboardProps {
    data: ConceiveData | null;
    currentMode?: AppMode;
    onModeChange?: (mode: AppMode) => void;
}

// Cervical mucus types with fertility indicators
const MUCUS_TYPES = [
    { id: 'dry', label: 'Dry', emoji: '☀️', fertility: 'Low', color: '#fbbf24' },
    { id: 'sticky', label: 'Sticky', emoji: '🩹', fertility: 'Low', color: '#f97316' },
    { id: 'creamy', label: 'Creamy', emoji: '🥛', fertility: 'Medium', color: '#a855f7' },
    { id: 'watery', label: 'Watery', emoji: '💧', fertility: 'High', color: '#3b82f6' },
    { id: 'eggwhite', label: 'Egg White', emoji: '🥚', fertility: 'Peak', color: '#10b981' },
];

// OPK results
const OPK_RESULTS = [
    { id: 'negative', label: 'Negative', emoji: '➖' },
    { id: 'almostpos', label: 'Almost +', emoji: '〰️' },
    { id: 'positive', label: 'Positive', emoji: '➕' },
];

export default function ConceiveDashboard({ data, currentMode = 'conceive', onModeChange }: ConceiveDashboardProps) {
    const { showToast } = useToast();
    const [mockBBT, setMockBBT] = useState<{ day: number; temp: number }[]>([]);
    const [selectedMucus, setSelectedMucus] = useState<string | null>(null);
    const [selectedOPK, setSelectedOPK] = useState<string | null>(null);
    const [loggedIntercourse, setLoggedIntercourse] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [showLogForm, setShowLogForm] = useState(false);
    const [bbtTemp, setBbtTemp] = useState<string>('');

    useEffect(() => {
        if (data) {
            if (!data.bbtData) {
                const generated = Array.from({ length: data.cycleDay }, (_, i) => ({
                    day: i + 1,
                    temp: 36.2 + Math.random() * 0.2 + (i > data.avgCycleLength / 2 ? 0.3 : 0)
                }));
                setMockBBT(generated);
            }
        }
    }, [data]);



    const handleQuickLog = async () => {
        setIsSaving(true);
        try {
            const logData: Record<string, any> = {
                date: new Date().toISOString().split('T')[0],
                mode: 'conceive',
            };

            if (bbtTemp) logData.bbt = parseFloat(bbtTemp);
            if (selectedMucus) logData.mucus = selectedMucus;
            if (selectedOPK) logData.ovulationTest = selectedOPK;
            if (loggedIntercourse) logData.sex = true;

            await fetch('http://localhost:3001/api/cycle/log', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'x-user-id': '1' },
                body: JSON.stringify(logData)
            });

            showToast('Fertility data logged! 🥚', 'success');
            setShowLogForm(false);
            setBbtTemp('');
            setSelectedMucus(null);
            setSelectedOPK(null);
            setLoggedIntercourse(false);
        } catch (error) {
            showToast('Saved locally', 'info');
        } finally {
            setIsSaving(false);
        }
    };

    if (!data) {
        return (
            <div className="flex items-center justify-center h-64">
                <Spinner size="lg" />
            </div>
        );
    }

    const fertilityLevel = data.fertileWindow ? 'Peak' : data.daysUntilOvulation <= 3 ? 'High' : 'Low';
    const fertilityScore = data.fertileWindow ? 95 : data.daysUntilOvulation <= 3 ? 70 : 25;

    return (
        <div className="space-y-4 pb-20">
            {/* Mode Header */}
            {onModeChange && (
                <ModeHeader
                    currentMode={currentMode}
                    onModeChange={onModeChange}
                    subtitle={`Cycle Day ${data.cycleDay}`}
                />
            )}

            {/* Fertility Status Hero */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card overflow-hidden"
            >
                <div
                    className={`p-4 text-white text-center ${data.fertileWindow ? 'bg-gradient-to-r from-teal-500 to-emerald-500' :
                        data.daysUntilOvulation <= 3 ? 'bg-gradient-to-r from-blue-500 to-cyan-500' :
                            'bg-gradient-to-r from-gray-500 to-slate-500'
                        }`}
                >
                    <div className="text-4xl mb-2">
                        {data.fertileWindow ? '🔥' : data.daysUntilOvulation <= 3 ? '⭐' : '📅'}
                    </div>
                    <h2 className="text-xl font-bold">
                        {data.fertileWindow ? 'Peak Fertility Today!' :
                            data.daysUntilOvulation <= 0 ? 'Ovulation Day!' :
                                `${data.daysUntilOvulation} Days to Ovulation`}
                    </h2>
                    <p className="text-sm opacity-90 mt-1">
                        {data.fertileWindow ? 'Best time to conceive' :
                            data.daysUntilOvulation <= 3 ? 'Fertile window approaching' :
                                'Keep tracking for predictions'}
                    </p>
                </div>

                <div className="p-4">
                    <FertilityScore
                        score={fertilityScore}
                        status={fertilityLevel}
                        factors={[
                            { label: 'Cycle Timing', impact: data.fertileWindow ? 'Positive' : 'Neutral' },
                            { label: 'BBT Trend', impact: mockBBT.length > 5 ? 'Positive' : 'Neutral' },
                            { label: 'Cervical Mucus', impact: selectedMucus === 'eggwhite' ? 'Positive' : 'Neutral' }
                        ]}
                    />
                </div>
            </motion.div>

            {/* Quick Log Button */}
            <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onClick={() => setShowLogForm(!showLogForm)}
                className={`w-full py-4 rounded-xl font-medium text-white shadow-lg transition-all ${showLogForm
                    ? 'bg-gray-500'
                    : 'bg-gradient-to-r from-teal-500 to-emerald-500 shadow-teal-500/30 hover:scale-[1.02]'
                    }`}
            >
                {showLogForm ? '✕ Close' : '➕ Quick Log Today\'s Data'}
            </motion.button>

            {/* Quick Log Form */}
            <AnimatePresence>
                {showLogForm && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="glass-card p-4 space-y-4 border-2 border-teal-500/30">
                            {/* BBT Input */}
                            <div>
                                <label className="text-sm font-medium flex items-center gap-2 mb-2">
                                    🌡️ BBT Temperature
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="35"
                                    max="40"
                                    value={bbtTemp}
                                    onChange={(e) => setBbtTemp(e.target.value)}
                                    placeholder="36.50"
                                    className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-teal-500"
                                />
                            </div>

                            {/* Cervical Mucus */}
                            <div>
                                <label className="text-sm font-medium flex items-center gap-2 mb-2">
                                    💧 Cervical Mucus
                                </label>
                                <div className="flex gap-2 overflow-x-auto pb-1">
                                    {MUCUS_TYPES.map((type) => (
                                        <button
                                            key={type.id}
                                            onClick={() => setSelectedMucus(selectedMucus === type.id ? null : type.id)}
                                            className={`flex-shrink-0 px-3 py-2 rounded-xl text-sm font-medium transition-all ${selectedMucus === type.id
                                                ? 'ring-2 ring-teal-500 bg-teal-50 dark:bg-teal-900/30'
                                                : 'bg-secondary/50 hover:bg-secondary'
                                                }`}
                                        >
                                            <span className="text-lg mr-1">{type.emoji}</span>
                                            <span>{type.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* OPK Test */}
                            <div>
                                <label className="text-sm font-medium flex items-center gap-2 mb-2">
                                    🧪 Ovulation Test (OPK)
                                </label>
                                <div className="grid grid-cols-3 gap-2">
                                    {OPK_RESULTS.map((result) => (
                                        <button
                                            key={result.id}
                                            onClick={() => setSelectedOPK(selectedOPK === result.id ? null : result.id)}
                                            className={`py-3 rounded-xl text-sm font-medium transition-all ${selectedOPK === result.id
                                                ? 'ring-2 ring-teal-500 bg-teal-50 dark:bg-teal-900/30'
                                                : 'bg-secondary/50 hover:bg-secondary'
                                                }`}
                                        >
                                            <span className="text-xl block">{result.emoji}</span>
                                            <span>{result.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Intercourse */}
                            <button
                                onClick={() => setLoggedIntercourse(!loggedIntercourse)}
                                className={`w-full py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${loggedIntercourse
                                    ? 'bg-pink-500 text-white'
                                    : 'bg-secondary/50 hover:bg-secondary'
                                    }`}
                            >
                                <span>💕</span>
                                <span>{loggedIntercourse ? 'Intercourse Logged' : 'Log Intercourse'}</span>
                            </button>

                            {/* Save Button */}
                            <button
                                onClick={handleQuickLog}
                                disabled={isSaving}
                                className="w-full py-4 bg-teal-500 text-white rounded-xl font-bold hover:bg-teal-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {isSaving ? <Spinner size="sm" className="border-white/50 border-t-white" /> : '✓ Save Data'}
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* BBT Chart */}
            <motion.div
                className="glass-card p-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
            >
                <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                    📈 BBT Chart
                    <span className="text-xs text-muted-foreground font-normal">
                        (Take temp before getting up)
                    </span>
                </h3>
                <BBTChart data={data.bbtData || mockBBT} />
            </motion.div>

            {/* Fertile Window Timeline */}
            <motion.div
                className="glass-card p-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
            >
                <h3 className="text-sm font-semibold mb-3">🗓️ Fertile Window Timeline</h3>
                <div className="flex gap-2 overflow-x-auto pb-2 hide-scrollbar">
                    {Array.from({ length: 9 }).map((_, i) => {
                        const offset = i - 4;
                        const day = data.cycleDay + offset;
                        const isToday = offset === 0;
                        const isOvulation = day === Math.round(data.avgCycleLength / 2);
                        const isFertile = Math.abs(day - data.avgCycleLength / 2) <= 3;

                        return (
                            <div
                                key={i}
                                className={`flex-shrink-0 w-12 h-16 rounded-xl flex flex-col items-center justify-center gap-0.5 border-2 transition-all ${isToday
                                    ? 'border-primary bg-primary/10 scale-110'
                                    : isOvulation
                                        ? 'border-teal-500 bg-teal-50 dark:bg-teal-900/30'
                                        : isFertile
                                            ? 'border-teal-300 bg-teal-50/50 dark:bg-teal-900/20'
                                            : 'border-border bg-background/50'
                                    }`}
                            >
                                <span className="text-[10px] font-bold opacity-70">
                                    Day
                                </span>
                                <span className={`text-lg font-bold ${isOvulation ? 'text-teal-600' : ''}`}>
                                    {day}
                                </span>
                                {isOvulation && <span className="text-xs">🥚</span>}
                                {isToday && !isOvulation && <span className="text-xs">📍</span>}
                            </div>
                        );
                    })}
                </div>
                <p className="text-xs text-muted-foreground mt-2 text-center">
                    Predicted ovulation: Day {Math.round(data.avgCycleLength / 2)}
                </p>
            </motion.div>

            {/* Tips for Conceiving */}
            <motion.div
                className="glass-card p-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
            >
                <h3 className="text-sm font-semibold mb-3">💡 Conception Tips</h3>
                <div className="space-y-2 text-sm">
                    <div className="flex items-start gap-2 p-2 bg-secondary/30 rounded-lg">
                        <span>🌡️</span>
                        <span>Take BBT at the same time every morning before moving</span>
                    </div>
                    <div className="flex items-start gap-2 p-2 bg-secondary/30 rounded-lg">
                        <span>💧</span>
                        <span>Egg-white cervical mucus indicates peak fertility</span>
                    </div>
                    <div className="flex items-start gap-2 p-2 bg-secondary/30 rounded-lg">
                        <span>🗓️</span>
                        <span>Have intercourse every 1-2 days during fertile window</span>
                    </div>
                </div>
            </motion.div>

            {/* AI Insights */}
            <InsightsPanel
                mode="conceive"
                cycleData={{ cycleDay: data.cycleDay, phase: data.fertileWindow ? 'fertile' : 'follicular' }}
            />
        </div>
    );
}
