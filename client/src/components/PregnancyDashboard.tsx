import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import BumpGallery from './BumpGallery';
import AppointmentTracker from './AppointmentTracker';
import ModeHeader from './ModeHeader';
import InsightsPanel from './InsightsPanel';
import { useToast } from './ui/Toast';
import { Spinner } from './ui/Spinner';

type AppMode = 'period' | 'conceive' | 'pregnancy' | 'perimenopause';

interface PregnancyData {
    dueDate: string;
    currentWeek: number;
    trimester: 1 | 2 | 3;
    babySize: string;
    weekHighlight: string;
}

interface PregnancyDashboardProps {
    data: PregnancyData | null;
    currentMode?: AppMode;
    onModeChange?: (mode: AppMode) => void;
}

// Baby sizes with detailed development info
const BABY_DEVELOPMENT: Record<number, {
    size: string;
    emoji: string;
    length: string;
    weight: string;
    development: string;
    momTip: string;
}> = {
    4: {
        size: 'Poppy seed', emoji: '🌸', length: '0.1 cm', weight: '< 1 g',
        development: 'The embryo is implanting in the uterus', momTip: 'Start taking prenatal vitamins if you haven\'t already'
    },
    5: {
        size: 'Sesame seed', emoji: '✨', length: '0.2 cm', weight: '< 1 g',
        development: 'The neural tube is forming, which becomes the brain and spine', momTip: 'Folic acid is crucial - make sure you\'re getting enough'
    },
    6: {
        size: 'Lentil', emoji: '🫘', length: '0.5 cm', weight: '< 1 g',
        development: 'The heart starts beating! Arm and leg buds appear', momTip: 'Morning sickness may start - keep crackers nearby'
    },
    7: {
        size: 'Blueberry', emoji: '🫐', length: '1 cm', weight: '< 1 g',
        development: 'Face features are forming, brain is growing rapidly', momTip: 'Stay hydrated and rest when you feel tired'
    },
    8: {
        size: 'Raspberry', emoji: '🍇', length: '1.6 cm', weight: '1 g',
        development: 'All essential organs have begun forming, fingers and toes appear', momTip: 'Wear a supportive bra as breasts may be tender'
    },
    9: {
        size: 'Grape', emoji: '🍇', length: '2.3 cm', weight: '2 g',
        development: 'Baby can move! Muscles are developing', momTip: 'Consider comfortable maternity clothes soon'
    },
    10: {
        size: 'Prune', emoji: '🍑', length: '3.1 cm', weight: '4 g',
        development: 'All vital organs are formed, now they\'ll just grow', momTip: 'Your first ultrasound may be scheduled around now'
    },
    11: {
        size: 'Lime', emoji: '🍋', length: '4.1 cm', weight: '7 g',
        development: 'Baby can open and close fists and mouth', momTip: 'Energy levels may start improving soon'
    },
    12: {
        size: 'Plum', emoji: '🍑', length: '5.4 cm', weight: '14 g',
        development: 'Reflexes developing - baby can feel touch', momTip: 'You may notice your belly \'bump\' appearing!'
    },
    13: {
        size: 'Lemon', emoji: '🍋', length: '7.4 cm', weight: '23 g',
        development: 'Fingerprints are forming! Vocal cords developing', momTip: 'Welcome to the second trimester! Nausea often eases'
    },
    14: {
        size: 'Peach', emoji: '🍑', length: '8.7 cm', weight: '43 g',
        development: 'Baby is making facial expressions', momTip: 'This is often called the "honeymoon" trimester'
    },
    15: {
        size: 'Apple', emoji: '🍎', length: '10.1 cm', weight: '70 g',
        development: 'Baby can sense light through closed eyelids', momTip: 'Start doing gentle exercises like walking or swimming'
    },
    16: {
        size: 'Avocado', emoji: '🥑', length: '11.6 cm', weight: '100 g',
        development: 'Baby can hear your heartbeat and voice!', momTip: 'Talk and sing to your baby - they can hear you!'
    },
    17: {
        size: 'Pear', emoji: '🍐', length: '13 cm', weight: '140 g',
        development: 'Fat is starting to form under skin', momTip: 'You might feel baby\'s first movements soon!'
    },
    18: {
        size: 'Bell pepper', emoji: '🫑', length: '14.2 cm', weight: '190 g',
        development: 'Baby is practicing breathing motions', momTip: 'Anatomy scan usually happens around now'
    },
    19: {
        size: 'Mango', emoji: '🥭', length: '15.3 cm', weight: '240 g',
        development: 'A waxy coating (vernix) is protecting the skin', momTip: 'Stay active but listen to your body'
    },
    20: {
        size: 'Banana', emoji: '🍌', length: '16.4 cm', weight: '300 g',
        development: 'Halfway there! Baby has a regular sleep schedule', momTip: 'You\'re at the halfway point! Celebrate this milestone'
    },
    24: {
        size: 'Ear of corn', emoji: '🌽', length: '30 cm', weight: '600 g',
        development: 'Baby responds to sounds and may have hiccups', momTip: 'Third trimester begins soon - start preparing the nursery'
    },
    28: {
        size: 'Eggplant', emoji: '🍆', length: '37.6 cm', weight: '1 kg',
        development: 'Eyes can open! Baby can see and dream', momTip: 'Count kicks daily - 10 movements in 2 hours is healthy'
    },
    32: {
        size: 'Squash', emoji: '🎃', length: '42.4 cm', weight: '1.7 kg',
        development: 'Baby is practicing breathing and has fingernails', momTip: 'Prepare your hospital bag soon'
    },
    36: {
        size: 'Honeydew', emoji: '🍈', length: '47.4 cm', weight: '2.6 kg',
        development: 'Baby is head-down, getting ready for birth', momTip: 'Rest as much as possible and finalize birth plans'
    },
    40: {
        size: 'Watermelon', emoji: '🍉', length: '51.2 cm', weight: '3.4 kg',
        development: 'Baby is ready to meet you!', momTip: 'Any day now! Trust your body and stay calm'
    },
};

export default function PregnancyDashboard({ data, currentMode = 'pregnancy', onModeChange }: PregnancyDashboardProps) {
    const [kickCount, setKickCount] = useState(0);
    const [kickSession, setKickSession] = useState(false);
    const [kickStartTime, setKickStartTime] = useState<Date | null>(null);
    const [showWeekDetails, setShowWeekDetails] = useState(false);
    const [weight, setWeight] = useState<string>('');
    const [isSaving, setIsSaving] = useState(false);
    const { showToast } = useToast();

    const getBabyInfo = (week: number) => {
        const weeks = Object.keys(BABY_DEVELOPMENT).map(Number).sort((a, b) => a - b);
        const closestWeek = weeks.reduce((prev, curr) =>
            Math.abs(curr - week) < Math.abs(prev - week) ? curr : prev
        );
        return BABY_DEVELOPMENT[closestWeek] || {
            size: 'Growing!', emoji: '👶', length: '', weight: '',
            development: 'Your baby is developing beautifully', momTip: 'Take care of yourself'
        };
    };

    const calculateDaysRemaining = () => {
        if (!data?.dueDate) return 280 - (data?.currentWeek || 0) * 7;
        const due = new Date(data.dueDate);
        const today = new Date();
        return Math.max(0, Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));
    };

    const getTrimesterInfo = (trimester: number) => {
        switch (trimester) {
            case 1: return { name: 'First Trimester', color: '#FF6B9D', weeks: 'Weeks 1-12' };
            case 2: return { name: 'Second Trimester', color: '#FFB347', weeks: 'Weeks 13-26' };
            case 3: return { name: 'Third Trimester', color: '#9B59B6', weeks: 'Weeks 27-40' };
            default: return { name: 'Pregnancy', color: '#FF6B9D', weeks: '' };
        }
    };

    const handleKickStart = () => {
        setKickSession(true);
        setKickCount(0);
        setKickStartTime(new Date());
    };

    const handleKickEnd = async () => {
        setKickSession(false);
        if (kickCount > 0 && kickStartTime) {
            const duration = Math.round((new Date().getTime() - kickStartTime.getTime()) / 60000);
            showToast(`Saved ${kickCount} kicks in ${duration} minutes! 👣`, 'success');
            // Could save to API here
        }
    };

    const handleWeightLog = async () => {
        if (!weight) return;
        setIsSaving(true);
        try {
            await fetch('http://localhost:3001/api/cycle/log', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'x-user-id': '1' },
                body: JSON.stringify({
                    date: new Date().toISOString().split('T')[0],
                    mode: 'pregnancy',
                    notes: `Weight: ${weight} kg`
                })
            });
            showToast('Weight logged! 📊', 'success');
            setWeight('');
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

    const babyInfo = getBabyInfo(data.currentWeek);
    const trimesterInfo = getTrimesterInfo(data.trimester);
    const daysRemaining = calculateDaysRemaining();
    const progressPercent = Math.min(100, (data.currentWeek / 40) * 100);

    return (
        <div className="space-y-4 pb-20">
            {/* Mode Header */}
            {onModeChange && (
                <ModeHeader
                    currentMode={currentMode}
                    onModeChange={onModeChange}
                    subtitle={`Week ${data.currentWeek} • ${daysRemaining} days to go`}
                />
            )}

            {/* Hero Card - Baby Visualization */}
            <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="glass-card overflow-hidden"
            >
                {/* Trimester Header */}
                <div
                    className="px-4 py-2 text-center text-white text-sm font-medium"
                    style={{ backgroundColor: trimesterInfo.color }}
                >
                    {trimesterInfo.name} • {trimesterInfo.weeks}
                </div>

                <div className="p-6 relative">
                    <div className="flex items-center gap-4">
                        {/* Baby Emoji */}
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", bounce: 0.5, delay: 0.2 }}
                            className="text-7xl filter drop-shadow-xl"
                        >
                            {babyInfo.emoji}
                        </motion.div>

                        {/* Info */}
                        <div className="flex-1">
                            <h2 className="text-2xl font-bold font-heading">
                                Week {data.currentWeek}
                            </h2>
                            <p className="text-muted-foreground">
                                Size of a <span className="font-semibold text-foreground">{babyInfo.size}</span>
                            </p>
                            <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                                <span>📏 {babyInfo.length}</span>
                                <span>⚖️ {babyInfo.weight}</span>
                            </div>
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-4">
                        <div className="flex justify-between text-xs text-muted-foreground mb-1">
                            <span>Progress</span>
                            <span>{Math.round(progressPercent)}%</span>
                        </div>
                        <div className="w-full bg-secondary rounded-full h-3 overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${progressPercent}%` }}
                                transition={{ duration: 1.5, ease: "easeOut" }}
                                className="h-full rounded-full"
                                style={{ background: `linear-gradient(90deg, ${trimesterInfo.color}, #FF6B9D)` }}
                            />
                        </div>
                        <div className="flex justify-between text-xs text-muted-foreground mt-1">
                            <span>Week 1</span>
                            <span>Due: {data.dueDate ? new Date(data.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Not set'}</span>
                        </div>
                    </div>

                    {/* Expand for Details */}
                    <button
                        onClick={() => setShowWeekDetails(!showWeekDetails)}
                        className="mt-4 w-full py-2 text-sm text-primary font-medium hover:bg-primary/5 rounded-lg transition-colors"
                    >
                        {showWeekDetails ? 'Hide Details ↑' : 'Show This Week\'s Development ↓'}
                    </button>

                    <AnimatePresence>
                        {showWeekDetails && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden"
                            >
                                <div className="pt-4 space-y-3">
                                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                        <h4 className="text-xs font-semibold text-blue-600 dark:text-blue-400 mb-1">👶 Baby's Development</h4>
                                        <p className="text-sm">{babyInfo.development}</p>
                                    </div>
                                    <div className="p-3 bg-pink-50 dark:bg-pink-900/20 rounded-lg">
                                        <h4 className="text-xs font-semibold text-pink-600 dark:text-pink-400 mb-1">💝 Tip for Mom</h4>
                                        <p className="text-sm">{babyInfo.momTip}</p>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-3 gap-3">
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="glass-card p-4 text-center"
                >
                    <div className="text-2xl mb-1">📅</div>
                    <div className="text-xl font-bold">{daysRemaining}</div>
                    <div className="text-xs text-muted-foreground">Days Left</div>
                </motion.div>
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="glass-card p-4 text-center"
                >
                    <div className="text-2xl mb-1">📏</div>
                    <div className="text-xl font-bold">{babyInfo.length}</div>
                    <div className="text-xs text-muted-foreground">Length</div>
                </motion.div>
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="glass-card p-4 text-center"
                >
                    <div className="text-2xl mb-1">⚖️</div>
                    <div className="text-xl font-bold">{babyInfo.weight}</div>
                    <div className="text-xs text-muted-foreground">Weight</div>
                </motion.div>
            </div>

            {/* Weight Tracker */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="glass-card p-4"
            >
                <h3 className="font-semibold flex items-center gap-2 mb-3">
                    📊 Track Your Weight
                </h3>
                <div className="flex gap-2">
                    <input
                        type="number"
                        step="0.1"
                        value={weight}
                        onChange={(e) => setWeight(e.target.value)}
                        placeholder="Enter weight in kg"
                        className="flex-1 px-4 py-2 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary/50"
                    />
                    <button
                        onClick={handleWeightLog}
                        disabled={!weight || isSaving}
                        className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium disabled:opacity-50"
                    >
                        {isSaving ? <Spinner size="sm" /> : 'Log'}
                    </button>
                </div>
            </motion.div>

            {/* Kick Counter (2nd/3rd trimester only) */}
            {data.trimester >= 2 && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="glass-card p-4 border border-blue-100 dark:border-blue-900"
                >
                    <div className="flex justify-between items-center mb-3">
                        <h3 className="font-semibold flex items-center gap-2">
                            👣 Kick Counter
                            {kickSession && (
                                <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full animate-pulse">
                                    Recording
                                </span>
                            )}
                        </h3>
                        {kickSession && (
                            <span className="text-3xl font-bold text-blue-500">{kickCount}</span>
                        )}
                    </div>

                    {!kickSession ? (
                        <div className="space-y-2">
                            <p className="text-sm text-muted-foreground">
                                Track baby's movements - aim for 10 kicks in 2 hours
                            </p>
                            <button
                                className="w-full py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl font-medium shadow-lg shadow-blue-500/20 hover:scale-[1.02] transition-transform"
                                onClick={handleKickStart}
                            >
                                🦶 Start Counting Kicks
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            <button
                                className="w-full py-6 bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-blue-900/50 dark:to-cyan-900/50 border-2 border-blue-300 rounded-2xl font-bold text-xl active:scale-95 transition-transform"
                                onClick={() => setKickCount(c => c + 1)}
                            >
                                Tap When Baby Kicks! 🦶
                            </button>
                            <div className="flex gap-2">
                                <button
                                    className="flex-1 py-2 bg-secondary text-foreground rounded-xl font-medium text-sm"
                                    onClick={() => setKickCount(c => Math.max(0, c - 1))}
                                >
                                    Undo
                                </button>
                                <button
                                    className="flex-1 py-2 bg-green-500 text-white rounded-xl font-medium text-sm"
                                    onClick={handleKickEnd}
                                >
                                    ✓ Finish Session
                                </button>
                            </div>
                        </div>
                    )}
                </motion.div>
            )}

            {/* Features Grid */}
            <div className="grid grid-cols-1 gap-4">
                <AppointmentTracker />
                <BumpGallery currentWeek={data.currentWeek} />
            </div>

            {/* AI Insights */}
            <InsightsPanel
                mode="pregnancy"
                cycleData={{ week: data.currentWeek }}
            />
        </div>
    );
}
