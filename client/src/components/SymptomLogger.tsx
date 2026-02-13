/**
 * Symptom Logger - Streamlined Daily Logging
 * 
 * Clean, focused interface for logging symptoms, mood, and daily data.
 * Adapts to current mode with relevant options.
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { useToast } from './ui/Toast';
import { Spinner } from './ui/Spinner';

type AppMode = 'period' | 'conceive' | 'pregnancy' | 'perimenopause';

interface SymptomLoggerProps {
    onSave?: (symptoms: string[], modeData?: Record<string, any>) => void;
    onClose?: () => void;
    currentMode?: AppMode;
}

// Common symptoms shown for all modes
const COMMON_SYMPTOMS = [
    { id: 'cramps', emoji: '😣', label: 'Cramps' },
    { id: 'headache', emoji: '🤕', label: 'Headache' },
    { id: 'bloating', emoji: '🎈', label: 'Bloating' },
    { id: 'fatigue', emoji: '😩', label: 'Fatigue' },
    { id: 'backache', emoji: '🔙', label: 'Back Pain' },
    { id: 'nausea', emoji: '🤢', label: 'Nausea' },
];

// Mood options
const MOODS = [
    { id: 'great', emoji: '😊', label: 'Great' },
    { id: 'good', emoji: '🙂', label: 'Good' },
    { id: 'okay', emoji: '😐', label: 'Okay' },
    { id: 'down', emoji: '😔', label: 'Down' },
    { id: 'stressed', emoji: '😰', label: 'Stressed' },
    { id: 'irritable', emoji: '😤', label: 'Irritable' },
];

// Energy levels
const ENERGY = [
    { id: 'high', emoji: '⚡', label: 'High' },
    { id: 'normal', emoji: '🔋', label: 'Normal' },
    { id: 'low', emoji: '🪫', label: 'Low' },
];

// Flow options (period mode)
const FLOW_OPTIONS = [
    { id: 'spotting', emoji: '💧', label: 'Spotting' },
    { id: 'light', emoji: '🩸', label: 'Light' },
    { id: 'medium', emoji: '🩸🩸', label: 'Medium' },
    { id: 'heavy', emoji: '🩸🩸🩸', label: 'Heavy' },
];

// Mode-specific extras
const MODE_EXTRAS: Record<AppMode, { id: string; emoji: string; label: string }[]> = {
    period: [
        { id: 'pms', emoji: '😤', label: 'PMS' },
        { id: 'cravings', emoji: '🍫', label: 'Cravings' },
    ],
    conceive: [
        { id: 'ovulation_pain', emoji: '🥚', label: 'Ovulation Pain' },
        { id: 'ewcm', emoji: '💧', label: 'EWCM' },
        { id: 'opk_positive', emoji: '✅', label: 'Positive OPK' },
    ],
    pregnancy: [
        { id: 'kicks', emoji: '🦶', label: 'Baby Kicks' },
        { id: 'morning_sickness', emoji: '🤮', label: 'Morning Sickness' },
        { id: 'heartburn', emoji: '🔥', label: 'Heartburn' },
    ],
    perimenopause: [
        { id: 'hot_flash', emoji: '🔥', label: 'Hot Flash' },
        { id: 'night_sweats', emoji: '🌙', label: 'Night Sweats' },
        { id: 'brain_fog', emoji: '🌫️', label: 'Brain Fog' },
    ],
};

export default function SymptomLogger({ onSave, onClose, currentMode = 'period' }: SymptomLoggerProps) {
    const { showToast } = useToast();
    const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
    const [selectedMood, setSelectedMood] = useState<string | null>(null);
    const [selectedEnergy, setSelectedEnergy] = useState<string | null>(null);
    const [selectedFlow, setSelectedFlow] = useState<string | null>(null);
    const [notes, setNotes] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    const toggleSymptom = (id: string) => {
        setSelectedSymptoms(prev =>
            prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
        );
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const modeData: Record<string, any> = {
                mood: selectedMood,
                energy: selectedEnergy,
                notes,
            };

            if (currentMode === 'period' && selectedFlow) {
                modeData.flow = selectedFlow;
            }

            await onSave?.(selectedSymptoms, modeData);
            showToast('Logged successfully! ✨', 'success');
        } catch {
            showToast('Saved locally', 'info');
        } finally {
            setIsSaving(false);
        }
    };

    const modeExtras = MODE_EXTRAS[currentMode] || [];
    const allSymptoms = [...COMMON_SYMPTOMS, ...modeExtras];
    const hasData = selectedSymptoms.length > 0 || selectedMood || selectedEnergy || selectedFlow;

    return (
        <div className="min-h-screen bg-background pb-24">
            {/* Header */}
            <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border px-4 py-3 flex items-center justify-between">
                <button
                    onClick={onClose}
                    className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center"
                >
                    ✕
                </button>
                <div className="text-center">
                    <h1 className="font-bold text-lg">Daily Log</h1>
                    <p className="text-xs text-muted-foreground">
                        {format(new Date(), 'EEEE, MMM d')}
                    </p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={!hasData || isSaving}
                    className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center disabled:opacity-50"
                >
                    {isSaving ? <Spinner size="sm" /> : '✓'}
                </button>
            </div>

            <div className="p-4 space-y-6">
                {/* Mood Section */}
                <motion.section
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-card p-4"
                >
                    <h2 className="font-semibold mb-3 flex items-center gap-2">
                        <span>🎭</span> How are you feeling?
                    </h2>
                    <div className="grid grid-cols-6 gap-2">
                        {MOODS.map(mood => (
                            <button
                                key={mood.id}
                                onClick={() => setSelectedMood(selectedMood === mood.id ? null : mood.id)}
                                className={`flex flex-col items-center p-2 rounded-xl transition-all ${selectedMood === mood.id
                                    ? 'bg-primary/10 ring-2 ring-primary'
                                    : 'bg-secondary/30 hover:bg-secondary/50'
                                    }`}
                            >
                                <span className="text-2xl">{mood.emoji}</span>
                                <span className="text-[10px] mt-1 text-muted-foreground">{mood.label}</span>
                            </button>
                        ))}
                    </div>
                </motion.section>

                {/* Energy Section */}
                <motion.section
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="glass-card p-4"
                >
                    <h2 className="font-semibold mb-3 flex items-center gap-2">
                        <span>⚡</span> Energy Level
                    </h2>
                    <div className="grid grid-cols-3 gap-2">
                        {ENERGY.map(level => (
                            <button
                                key={level.id}
                                onClick={() => setSelectedEnergy(selectedEnergy === level.id ? null : level.id)}
                                className={`flex items-center justify-center gap-2 p-3 rounded-xl transition-all ${selectedEnergy === level.id
                                    ? 'bg-yellow-100 dark:bg-yellow-900/30 ring-2 ring-yellow-500'
                                    : 'bg-secondary/30 hover:bg-secondary/50'
                                    }`}
                            >
                                <span className="text-xl">{level.emoji}</span>
                                <span className="text-sm font-medium">{level.label}</span>
                            </button>
                        ))}
                    </div>
                </motion.section>

                {/* Flow Section (Period Mode Only) */}
                {currentMode === 'period' && (
                    <motion.section
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.15 }}
                        className="glass-card p-4"
                    >
                        <h2 className="font-semibold mb-3 flex items-center gap-2">
                            <span>🩸</span> Flow
                        </h2>
                        <div className="grid grid-cols-4 gap-2">
                            {FLOW_OPTIONS.map(flow => (
                                <button
                                    key={flow.id}
                                    onClick={() => setSelectedFlow(selectedFlow === flow.id ? null : flow.id)}
                                    className={`flex flex-col items-center p-3 rounded-xl transition-all ${selectedFlow === flow.id
                                        ? 'bg-pink-100 dark:bg-pink-900/30 ring-2 ring-pink-500'
                                        : 'bg-secondary/30 hover:bg-secondary/50'
                                        }`}
                                >
                                    <span className="text-lg">{flow.emoji}</span>
                                    <span className="text-xs mt-1">{flow.label}</span>
                                </button>
                            ))}
                        </div>
                    </motion.section>
                )}

                {/* Symptoms Section */}
                <motion.section
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="glass-card p-4"
                >
                    <h2 className="font-semibold mb-3 flex items-center gap-2">
                        <span>📋</span> Symptoms
                        {selectedSymptoms.length > 0 && (
                            <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                                {selectedSymptoms.length}
                            </span>
                        )}
                    </h2>
                    <div className="grid grid-cols-3 gap-2">
                        {allSymptoms.map(symptom => (
                            <button
                                key={symptom.id}
                                onClick={() => toggleSymptom(symptom.id)}
                                className={`flex flex-col items-center p-3 rounded-xl transition-all ${selectedSymptoms.includes(symptom.id)
                                    ? 'bg-primary/10 ring-2 ring-primary'
                                    : 'bg-secondary/30 hover:bg-secondary/50'
                                    }`}
                            >
                                <span className="text-xl">{symptom.emoji}</span>
                                <span className="text-xs mt-1 text-center">{symptom.label}</span>
                            </button>
                        ))}
                    </div>
                </motion.section>

                {/* Notes Section */}
                <motion.section
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="glass-card p-4"
                >
                    <h2 className="font-semibold mb-3 flex items-center gap-2">
                        <span>✏️</span> Notes
                    </h2>
                    <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Add any notes for today..."
                        className="w-full p-3 rounded-xl border border-border bg-background resize-none h-24 focus:ring-2 focus:ring-primary/50"
                    />
                </motion.section>

                {/* Save Button */}
                <motion.button
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    onClick={handleSave}
                    disabled={!hasData || isSaving}
                    className="w-full py-4 bg-gradient-to-r from-primary to-accent text-white rounded-xl font-bold shadow-lg shadow-primary/30 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                    {isSaving ? (
                        <Spinner size="sm" className="border-white/50 border-t-white" />
                    ) : (
                        <>Save Today's Log</>
                    )}
                </motion.button>
            </div>
        </div>
    );
}
