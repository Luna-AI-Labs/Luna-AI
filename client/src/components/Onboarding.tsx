import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser, SignInButton, SignUpButton } from '@clerk/clerk-react';
import { ChevronRight, Lock, HelpCircle, Check, Sparkles } from 'lucide-react';
import { Button } from './ui/Button';
import { Card } from './ui/Card';

// Types
type Mode = 'period' | 'conceive' | 'pregnancy' | 'perimenopause';

interface OnboardingData {
    firstName: string;
    birthYear: number;
    mode: Mode;

    // Period/Conceive shared
    avgCycleLength?: number;
    avgPeriodLength?: number;
    lastPeriodStart?: string;
    cycleRegularity?: 'regular' | 'irregular' | 'unknown';

    // Period specific
    trackingGoals?: string[];
    commonSymptoms?: string[];
    contraceptionUse?: string;

    // Conceive specific
    monthsTrying?: number;
    trackingMethods?: string[];
    knownConditions?: string[];
    partnerInvolved?: boolean;

    // Pregnancy specific
    dueDate?: string;
    conceptionDate?: string;
    firstPregnancy?: boolean;
    multiplePregnancy?: boolean;
    healthConditions?: string[];
    careProvider?: string;

    // Perimenopause specific
    lastPeriodDate?: string;
    periodFrequency?: string;
    periSymptoms?: string[];
    hrtStatus?: string;
    menopauseConfirmed?: boolean;

    // Universal
    notifications?: {
        periodReminders?: boolean;
        dailyCheckIn?: boolean;
        insights?: boolean;
    };
    consents?: {
        privacy: boolean;
        dataUsage: boolean;
    };
}

interface OnboardingProps {
    onComplete: (data: OnboardingData) => void;
}

// Step configurations per mode
const MODE_STEPS: Record<Mode, string[]> = {
    period: ['cycle', 'lastPeriod', 'regularity', 'trackingGoals', 'symptoms', 'contraception', 'notifications', 'consent', 'signin'],
    conceive: ['cycle', 'lastPeriod', 'regularity', 'trying', 'methods', 'conditions', 'partner', 'notifications', 'consent', 'signin'],
    pregnancy: ['confirmation', 'dueDate', 'history', 'conditions', 'provider', 'notifications', 'consent', 'signin'],
    perimenopause: ['lastPeriod', 'frequency', 'symptoms', 'hrt', 'notifications', 'consent', 'signin']
};

export default function Onboarding({ onComplete }: OnboardingProps) {
    const { user, isLoaded } = useUser();
    const [currentStep, setCurrentStep] = useState(0);
    const [data, setData] = useState<OnboardingData>({
        firstName: '',
        birthYear: 1990,
        mode: 'period',
        avgCycleLength: 28,
        avgPeriodLength: 5,
        notifications: { periodReminders: true, dailyCheckIn: true, insights: true },
        consents: { privacy: false, dataUsage: false }
    });

    // Auto-fill from Clerk user
    useEffect(() => {
        if (isLoaded && user?.firstName) {
            setData(d => ({ ...d, firstName: user.firstName || '' }));
        }
    }, [isLoaded, user]);

    // Calculate total steps based on mode - always return full list
    const getSteps = (): string[] => {
        return ['welcome', 'goal', ...MODE_STEPS[data.mode]];
    };

    const steps = getSteps();
    const totalSteps = steps.length;

    const nextStep = () => setCurrentStep(s => Math.min(s + 1, totalSteps - 1));
    const prevStep = () => setCurrentStep(s => Math.max(s - 1, 0));
    const skipStep = () => nextStep();

    const handleComplete = () => {
        // Save to localStorage
        localStorage.setItem('onboardingData', JSON.stringify(data));
        localStorage.setItem('onboardingComplete', 'true');
        localStorage.setItem('currentMode', data.mode);

        // Call parent callback
        onComplete(data);
    };

    const updateData = (updates: Partial<OnboardingData>) => {
        setData(d => ({ ...d, ...updates }));
    };

    const slideVariants = {
        enter: (direction: number) => ({ x: direction > 0 ? 300 : -300, opacity: 0 }),
        center: { x: 0, opacity: 1 },
        exit: (direction: number) => ({ x: direction > 0 ? -300 : 300, opacity: 0 })
    };

    const renderStep = () => {
        const stepName = steps[currentStep];

        switch (stepName) {
            case 'welcome':
                return (
                    <motion.div key="welcome" variants={slideVariants} initial="enter" animate="center" exit="exit" custom={1} className="flex-1 flex flex-col items-center justify-center text-center">
                        <motion.div
                            className="relative w-32 h-32 mb-8"
                            animate={{ scale: [1, 1.05, 1] }}
                            transition={{ duration: 2, repeat: Infinity }}
                        >
                            <div className="absolute inset-0 bg-primary/20 rounded-full blur-3xl" />
                            <div className="relative w-full h-full bg-gradient-to-tr from-primary to-accent rounded-full flex items-center justify-center shadow-2xl">
                                <span className="text-5xl">🌙</span>
                            </div>
                        </motion.div>

                        <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent font-heading">
                            Welcome to Luna AI
                        </h1>
                        <p className="text-muted-foreground mb-8 max-w-xs">
                            Let's personalize your experience in just a few steps.
                        </p>

                        <div className="w-full space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-2 text-left">What's your name?</label>
                                <input
                                    type="text"
                                    value={data.firstName}
                                    onChange={(e) => updateData({ firstName: e.target.value })}
                                    className="input-premium text-lg w-full"
                                    placeholder="Your name"
                                    autoFocus
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2 text-left">Birth Year</label>
                                <select
                                    value={data.birthYear}
                                    onChange={(e) => updateData({ birthYear: Number(e.target.value) })}
                                    className="input-premium w-full"
                                >
                                    {Array.from({ length: 60 }, (_, i) => 2010 - i).map(year => (
                                        <option key={year} value={year}>{year}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <Button
                            onClick={nextStep}
                            disabled={!data.firstName}
                            className="mt-8 w-full"
                            size="lg"
                        >
                            Continue <ChevronRight className="w-5 h-5 ml-2" />
                        </Button>
                    </motion.div>
                );

            case 'goal':
                const goals = [
                    { id: 'period' as Mode, label: 'Track My Cycle', emoji: '🩸', desc: 'Predict periods & symptoms', color: 'from-rose-500 to-pink-400' },
                    { id: 'conceive' as Mode, label: 'Get Pregnant', emoji: '👶', desc: 'Identify fertile days', color: 'from-teal-500 to-cyan-400' },
                    { id: 'pregnancy' as Mode, label: 'Follow Pregnancy', emoji: '🤰', desc: 'Track baby growth', color: 'from-purple-500 to-violet-400' },
                    { id: 'perimenopause' as Mode, label: 'Navigate Changes', emoji: '🌿', desc: 'Manage transition', color: 'from-emerald-500 to-teal-400' }
                ];

                return (
                    <motion.div key="goal" variants={slideVariants} initial="enter" animate="center" exit="exit" custom={1} className="flex-1 flex flex-col h-full">
                        <h2 className="text-2xl font-bold mb-2 font-heading">What's your goal?</h2>
                        <p className="text-muted-foreground mb-6">We'll tailor your experience accordingly.</p>

                        <div className="space-y-3 flex-1 overflow-y-auto pr-2">
                            {goals.map((goal) => (
                                <button
                                    key={goal.id}
                                    onClick={() => updateData({ mode: goal.id })}
                                    className={`w-full p-4 rounded-2xl border-2 transition-all text-left flex items-center gap-4 ${data.mode === goal.id ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-border hover:border-primary/50'}`}
                                >
                                    <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${goal.color} flex items-center justify-center text-2xl shadow-lg shrink-0`}>
                                        {goal.emoji}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg">{goal.label}</h3>
                                        <p className="text-sm text-muted-foreground">{goal.desc}</p>
                                    </div>
                                    {data.mode === goal.id && <Check className="w-6 h-6 text-primary ml-auto" />}
                                </button>
                            ))}
                        </div>

                        <div className="mt-4 pt-4 border-t border-border">
                            <Button onClick={nextStep} className="w-full" size="lg">
                                Next <ChevronRight className="w-5 h-5 ml-2" />
                            </Button>
                        </div>
                    </motion.div>
                );

            case 'cycle':
                return (
                    <motion.div key="cycle" variants={slideVariants} initial="enter" animate="center" exit="exit" custom={1} className="flex-1 flex flex-col h-full">
                        <h2 className="text-2xl font-bold mb-2 font-heading">Your Cycle Details</h2>
                        <p className="text-muted-foreground mb-6">This helps us make accurate predictions.</p>

                        <div className="space-y-8 flex-1">
                            <div>
                                <label className="block text-sm font-medium mb-4">Average Cycle Length</label>
                                <div className="flex items-center gap-4 mb-2">
                                    <input
                                        type="range"
                                        min={21}
                                        max={45}
                                        value={data.avgCycleLength}
                                        onChange={(e) => updateData({ avgCycleLength: Number(e.target.value) })}
                                        className="flex-1 accent-primary h-2 bg-secondary rounded-lg appearance-none cursor-pointer"
                                    />
                                    <span className="w-16 text-center font-bold text-2xl text-primary">{data.avgCycleLength}</span>
                                </div>
                                <p className="text-xs text-muted-foreground text-center">Most cycles are 21-35 days</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-4">Average Period Length</label>
                                <div className="flex items-center gap-4">
                                    <input
                                        type="range"
                                        min={2}
                                        max={10}
                                        value={data.avgPeriodLength}
                                        onChange={(e) => updateData({ avgPeriodLength: Number(e.target.value) })}
                                        className="flex-1 accent-primary h-2 bg-secondary rounded-lg appearance-none cursor-pointer"
                                    />
                                    <span className="w-16 text-center font-bold text-2xl text-primary">{data.avgPeriodLength}</span>
                                </div>
                            </div>
                        </div>

                        <div className="mt-auto pt-6 flex gap-3">
                            <Button variant="outline" onClick={prevStep} className="flex-1">
                                Back
                            </Button>
                            <Button onClick={nextStep} className="flex-[2]">
                                Next <ChevronRight className="w-4 h-4 ml-1" />
                            </Button>
                        </div>
                    </motion.div>
                );

            case 'lastPeriod':
                return (
                    <motion.div key="lastPeriod" variants={slideVariants} initial="enter" animate="center" exit="exit" custom={1} className="flex-1 flex flex-col h-full">
                        <h2 className="text-2xl font-bold mb-2 font-heading">Last Period Start</h2>
                        <p className="text-muted-foreground mb-6">When did your most recent period begin?</p>

                        <div className="flex-1">
                            <input
                                type="date"
                                value={data.lastPeriodStart || ''}
                                onChange={(e) => updateData({ lastPeriodStart: e.target.value })}
                                max={new Date().toISOString().split('T')[0]}
                                className="input-premium w-full text-lg p-4"
                            />
                            <p className="text-sm text-muted-foreground mt-4 flex items-start gap-2 bg-secondary/30 p-3 rounded-lg">
                                <HelpCircle className="w-4 h-4 mt-0.5 shrink-0" />
                                This is the single most important data point for your first prediction.
                            </p>
                        </div>

                        <div className="mt-auto pt-6 flex gap-3">
                            <Button variant="outline" onClick={prevStep} className="flex-1">
                                Back
                            </Button>
                            <Button onClick={nextStep} className="flex-[2]" disabled={!data.lastPeriodStart}>
                                Next <ChevronRight className="w-4 h-4 ml-1" />
                            </Button>
                        </div>
                    </motion.div>
                );

            case 'regularity':
                const regularityOptions = [
                    { id: 'regular', label: 'Regular', desc: 'Consistent timing each month' },
                    { id: 'irregular', label: 'Irregular', desc: 'Varies significantly' },
                    { id: 'unknown', label: "I'm not sure", desc: 'Haven\'t tracked before' }
                ];

                return (
                    <motion.div key="regularity" variants={slideVariants} initial="enter" animate="center" exit="exit" custom={1} className="flex-1 flex flex-col h-full">
                        <h2 className="text-2xl font-bold mb-2 font-heading">Cycle Regularity</h2>
                        <p className="text-muted-foreground mb-6">How consistent is your cycle timing?</p>

                        <div className="space-y-3 flex-1">
                            {regularityOptions.map((opt) => (
                                <button
                                    key={opt.id}
                                    onClick={() => updateData({ cycleRegularity: opt.id as any })}
                                    className={`w-full p-4 rounded-xl border-2 text-left transition-all ${data.cycleRegularity === opt.id ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-border hover:border-primary/50'}`}
                                >
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="font-semibold text-lg">{opt.label}</h3>
                                            <p className="text-sm text-muted-foreground">{opt.desc}</p>
                                        </div>
                                        {data.cycleRegularity === opt.id && <Check className="w-5 h-5 text-primary" />}
                                    </div>
                                </button>
                            ))}
                        </div>

                        <div className="mt-auto pt-6 flex gap-3">
                            <Button variant="outline" onClick={prevStep} className="flex-1">
                                Back
                            </Button>
                            <Button onClick={nextStep} className="flex-[2]" disabled={!data.cycleRegularity}>
                                Next <ChevronRight className="w-4 h-4 ml-1" />
                            </Button>
                        </div>
                    </motion.div>
                );

            case 'symptoms':
                const symptomOptions = ['Cramps', 'Bloating', 'Headaches', 'Acne', 'Fatigue', 'Mood swings', 'Back pain', 'Breast tenderness'];

                return (
                    <motion.div key="symptoms" variants={slideVariants} initial="enter" animate="center" exit="exit" custom={1} className="flex-1 flex flex-col h-full">
                        <h2 className="text-2xl font-bold mb-2 font-heading">Common Symptoms</h2>
                        <p className="text-muted-foreground mb-4">Select any you typically experience (optional)</p>

                        <div className="flex flex-wrap gap-2 flex-1 overflow-y-auto pr-2">
                            {symptomOptions.map((symptom) => {
                                const isSelected = data.commonSymptoms?.includes(symptom);
                                return (
                                    <button
                                        key={symptom}
                                        onClick={() => {
                                            const current = data.commonSymptoms || [];
                                            const updated = isSelected
                                                ? current.filter(s => s !== symptom)
                                                : [...current, symptom];
                                            updateData({ commonSymptoms: updated });
                                        }}
                                        className={`px-4 py-2 rounded-full border-2 text-sm font-medium transition-all ${isSelected ? 'border-primary bg-primary text-white' : 'border-border hover:border-primary/50'}`}
                                    >
                                        {symptom}
                                    </button>
                                );
                            })}
                        </div>

                        <div className="mt-auto pt-6 flex gap-3">
                            <Button variant="outline" onClick={prevStep} className="flex-1">
                                Back
                            </Button>
                            <Button variant="ghost" onClick={skipStep}>Skip</Button>
                            <Button onClick={nextStep} className="flex-[2]">
                                Next <ChevronRight className="w-4 h-4 ml-1" />
                            </Button>
                        </div>
                    </motion.div>
                );

            case 'trackingGoals':
                const trackingOptions = ['Symptoms', 'Mood', 'Energy', 'Sleep', 'Exercise', 'Weight'];

                return (
                    <motion.div key="trackingGoals" variants={slideVariants} initial="enter" animate="center" exit="exit" custom={1} className="flex-1 flex flex-col h-full">
                        <h2 className="text-2xl font-bold mb-2 font-heading">What to Track?</h2>
                        <p className="text-muted-foreground mb-4">Choose what you'd like to log daily (optional)</p>

                        <div className="grid grid-cols-2 gap-3 flex-1 overflow-y-auto pr-2">
                            {trackingOptions.map((goal) => {
                                const isSelected = data.trackingGoals?.includes(goal);
                                return (
                                    <button
                                        key={goal}
                                        onClick={() => {
                                            const current = data.trackingGoals || [];
                                            const updated = isSelected
                                                ? current.filter(g => g !== goal)
                                                : [...current, goal];
                                            updateData({ trackingGoals: updated });
                                        }}
                                        className={`p-4 rounded-xl border-2 text-left transition-all ${isSelected ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-border hover:border-primary/50'}`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className="font-medium">{goal}</span>
                                            {isSelected && <Check className="w-4 h-4 text-primary" />}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>

                        <div className="mt-auto pt-6 flex gap-3">
                            <Button variant="outline" onClick={prevStep} className="flex-1">
                                Back
                            </Button>
                            <Button variant="ghost" onClick={skipStep}>Skip</Button>
                            <Button onClick={nextStep} className="flex-[2]">
                                Next <ChevronRight className="w-4 h-4 ml-1" />
                            </Button>
                        </div>
                    </motion.div>
                );

            case 'contraception':
                const contraceptionOptions = [
                    { id: 'none', label: 'None' },
                    { id: 'hormonal', label: 'Hormonal (pill, patch, ring)' },
                    { id: 'iud', label: 'IUD' },
                    { id: 'barrier', label: 'Barrier methods' },
                    { id: 'other', label: 'Other' }
                ];

                return (
                    <motion.div key="contraception" variants={slideVariants} initial="enter" animate="center" exit="exit" custom={1} className="flex-1 flex flex-col h-full">
                        <h2 className="text-2xl font-bold mb-2 font-heading">Contraception</h2>
                        <p className="text-muted-foreground mb-4">This can affect cycle patterns (optional)</p>

                        <div className="space-y-2 flex-1 overflow-y-auto pr-2">
                            {contraceptionOptions.map((opt) => (
                                <button
                                    key={opt.id}
                                    onClick={() => updateData({ contraceptionUse: opt.id })}
                                    className={`w-full p-3 rounded-xl border-2 text-left transition-all ${data.contraceptionUse === opt.id ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-border hover:border-primary/50'}`}
                                >
                                    <div className="flex items-center justify-between">
                                        <span>{opt.label}</span>
                                        {data.contraceptionUse === opt.id && <Check className="w-4 h-4 text-primary" />}
                                    </div>
                                </button>
                            ))}
                        </div>

                        <div className="mt-auto pt-6 flex gap-3">
                            <Button variant="outline" onClick={prevStep} className="flex-1">
                                Back
                            </Button>
                            <Button variant="ghost" onClick={skipStep}>Skip</Button>
                            <Button onClick={nextStep} className="flex-[2]">
                                Next <ChevronRight className="w-4 h-4 ml-1" />
                            </Button>
                        </div>
                    </motion.div>
                );

            case 'trying':
                return (
                    <motion.div key="trying" variants={slideVariants} initial="enter" animate="center" exit="exit" custom={1} className="flex-1 flex flex-col h-full">
                        <h2 className="text-2xl font-bold mb-2 font-heading">Your Journey</h2>
                        <p className="text-muted-foreground mb-6">How long have you been trying to conceive?</p>

                        <div className="flex-1">
                            <div className="flex items-center gap-4">
                                <input
                                    type="range"
                                    min={0}
                                    max={36}
                                    value={data.monthsTrying || 0}
                                    onChange={(e) => updateData({ monthsTrying: Number(e.target.value) })}
                                    className="flex-1 accent-primary h-2 bg-secondary rounded-lg appearance-none cursor-pointer"
                                />
                                <span className="w-24 text-center font-bold text-xl text-primary">
                                    {data.monthsTrying === 0 ? 'Just starting' : `${data.monthsTrying} months`}
                                </span>
                            </div>
                        </div>

                        <div className="mt-auto pt-6 flex gap-3">
                            <Button variant="outline" onClick={prevStep} className="flex-1">
                                Back
                            </Button>
                            <Button onClick={nextStep} className="flex-[2]">
                                Next <ChevronRight className="w-4 h-4 ml-1" />
                            </Button>
                        </div>
                    </motion.div>
                );

            case 'methods':
                const methodOptions = ['BBT tracking', 'OPK tests', 'Cervical mucus', 'Apps', 'None yet'];

                return (
                    <motion.div key="methods" variants={slideVariants} initial="enter" animate="center" exit="exit" custom={1} className="flex-1 flex flex-col h-full">
                        <h2 className="text-2xl font-bold mb-2 font-heading">Tracking Methods</h2>
                        <p className="text-muted-foreground mb-4">What are you currently using? (optional)</p>

                        <div className="flex flex-wrap gap-2 flex-1 overflow-y-auto pr-2">
                            {methodOptions.map((method) => {
                                const isSelected = data.trackingMethods?.includes(method);
                                return (
                                    <button
                                        key={method}
                                        onClick={() => {
                                            const current = data.trackingMethods || [];
                                            const updated = isSelected
                                                ? current.filter(m => m !== method)
                                                : [...current, method];
                                            updateData({ trackingMethods: updated });
                                        }}
                                        className={`px-4 py-2 rounded-full border-2 text-sm font-medium transition-all ${isSelected ? 'border-primary bg-primary text-white' : 'border-border hover:border-primary/50'}`}
                                    >
                                        {method}
                                    </button>
                                );
                            })}
                        </div>

                        <div className="mt-auto pt-6 flex gap-3">
                            <Button variant="outline" onClick={prevStep} className="flex-1">
                                Back
                            </Button>
                            <Button variant="ghost" onClick={skipStep}>Skip</Button>
                            <Button onClick={nextStep} className="flex-[2]">
                                Next <ChevronRight className="w-4 h-4 ml-1" />
                            </Button>
                        </div>
                    </motion.div>
                );

            case 'conditions':
                const conditionOptions = ['PCOS', 'Endometriosis', 'Thyroid issues', 'Fibroids', 'None'];

                return (
                    <motion.div key="conditions" variants={slideVariants} initial="enter" animate="center" exit="exit" custom={1} className="flex-1 flex flex-col h-full">
                        <h2 className="text-2xl font-bold mb-2 font-heading">Health Conditions</h2>
                        <p className="text-muted-foreground mb-4">Any known conditions? (optional, helps personalize)</p>

                        <div className="flex flex-wrap gap-2 flex-1 overflow-y-auto pr-2">
                            {conditionOptions.map((condition) => {
                                const isSelected = data.knownConditions?.includes(condition);
                                return (
                                    <button
                                        key={condition}
                                        onClick={() => {
                                            const current = data.knownConditions || [];
                                            const updated = isSelected
                                                ? current.filter(c => c !== condition)
                                                : [...current, condition];
                                            updateData({ knownConditions: updated });
                                        }}
                                        className={`px-4 py-2 rounded-full border-2 text-sm font-medium transition-all ${isSelected ? 'border-primary bg-primary text-white' : 'border-border hover:border-primary/50'}`}
                                    >
                                        {condition}
                                    </button>
                                );
                            })}
                        </div>

                        <div className="mt-auto pt-6 flex gap-3">
                            <Button variant="outline" onClick={prevStep} className="flex-1">
                                Back
                            </Button>
                            <Button variant="ghost" onClick={skipStep}>Skip</Button>
                            <Button onClick={nextStep} className="flex-[2]">
                                Next <ChevronRight className="w-4 h-4 ml-1" />
                            </Button>
                        </div>
                    </motion.div>
                );

            case 'partner':
                return (
                    <motion.div key="partner" variants={slideVariants} initial="enter" animate="center" exit="exit" custom={1} className="flex-1 flex flex-col h-full">
                        <h2 className="text-2xl font-bold mb-2 font-heading">Partner Features</h2>
                        <p className="text-muted-foreground mb-6">Would you like to share insights with a partner?</p>

                        <div className="space-y-3 flex-1">
                            <button
                                onClick={() => { updateData({ partnerInvolved: true }); }}
                                className={`w-full p-4 rounded-xl border-2 text-left transition-all ${data.partnerInvolved === true ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-border hover:border-primary/50'}`}
                            >
                                <div className="flex items-center justify-between">
                                    <span>Yes, enable partner features</span>
                                    {data.partnerInvolved === true && <Check className="w-5 h-5 text-primary" />}
                                </div>
                            </button>
                            <button
                                onClick={() => { updateData({ partnerInvolved: false }); }}
                                className={`w-full p-4 rounded-xl border-2 text-left transition-all ${data.partnerInvolved === false ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-border hover:border-primary/50'}`}
                            >
                                <div className="flex items-center justify-between">
                                    <span>No, just for me</span>
                                    {data.partnerInvolved === false && <Check className="w-5 h-5 text-primary" />}
                                </div>
                            </button>
                        </div>

                        <div className="mt-auto pt-6 flex gap-3">
                            <Button variant="outline" onClick={prevStep} className="flex-1">
                                Back
                            </Button>
                            <Button onClick={nextStep} className="flex-[2]" disabled={data.partnerInvolved === undefined}>
                                Next <ChevronRight className="w-4 h-4 ml-1" />
                            </Button>
                        </div>
                    </motion.div>
                );

            case 'confirmation':
                return (
                    <motion.div key="confirmation" variants={slideVariants} initial="enter" animate="center" exit="exit" custom={1} className="flex-1 flex flex-col h-full">
                        <h2 className="text-2xl font-bold mb-2 font-heading">Pregnancy Status</h2>
                        <p className="text-muted-foreground mb-6">Where are you in your pregnancy journey?</p>

                        <div className="space-y-3 flex-1">
                            <button
                                onClick={() => { updateData({ firstPregnancy: undefined }); }} // Use undefined to represent "confirmed" or "suspected" without setting firstPregnancy yet
                                className={`w-full p-4 rounded-xl border-2 border-border hover:border-primary/50 text-left transition-all ${data.firstPregnancy === undefined ? 'border-primary bg-primary/5 ring-1 ring-primary' : ''}`}
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="text-2xl mb-2">✅</div>
                                        <h3 className="font-bold">Confirmed pregnancy</h3>
                                        <p className="text-sm text-muted-foreground">I have a positive test</p>
                                    </div>
                                    {data.firstPregnancy === undefined && <Check className="w-5 h-5 text-primary" />}
                                </div>
                            </button>
                            <button
                                onClick={() => { updateData({ firstPregnancy: undefined }); }} // Same as above, this step is just for confirmation, not setting firstPregnancy
                                className={`w-full p-4 rounded-xl border-2 border-border hover:border-primary/50 text-left transition-all ${data.firstPregnancy === undefined ? 'border-primary bg-primary/5 ring-1 ring-primary' : ''}`}
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="text-2xl mb-2">🤔</div>
                                        <h3 className="font-bold">Suspected pregnancy</h3>
                                        <p className="text-sm text-muted-foreground">Waiting to confirm</p>
                                    </div>
                                    {data.firstPregnancy === undefined && <Check className="w-5 h-5 text-primary" />}
                                </div>
                            </button>
                        </div>

                        <div className="mt-auto pt-6 flex gap-3">
                            <Button variant="outline" onClick={prevStep} className="flex-1">
                                Back
                            </Button>
                            <Button onClick={nextStep} className="flex-[2]">
                                Next <ChevronRight className="w-4 h-4 ml-1" />
                            </Button>
                        </div>
                    </motion.div>
                );

            case 'dueDate':
                return (
                    <motion.div key="dueDate" variants={slideVariants} initial="enter" animate="center" exit="exit" custom={1} className="flex-1 flex flex-col h-full">
                        <h2 className="text-2xl font-bold mb-2 font-heading">Due Date</h2>
                        <p className="text-muted-foreground mb-6">When is your expected due date?</p>

                        <div className="space-y-4 flex-1">
                            <div>
                                <label className="block text-sm font-medium mb-2">Due Date (if known)</label>
                                <input
                                    type="date"
                                    value={data.dueDate || ''}
                                    onChange={(e) => updateData({ dueDate: e.target.value, lastPeriodStart: undefined })}
                                    className="input-premium w-full"
                                />
                            </div>
                            <p className="text-xs text-muted-foreground text-center">— or —</p>
                            <div>
                                <label className="block text-sm font-medium mb-2">Last Period Start</label>
                                <input
                                    type="date"
                                    value={data.lastPeriodStart || ''}
                                    onChange={(e) => updateData({ lastPeriodStart: e.target.value, dueDate: undefined })}
                                    className="input-premium w-full"
                                />
                                <p className="text-xs text-muted-foreground mt-1">We'll calculate your due date</p>
                            </div>
                        </div>

                        <div className="mt-auto pt-6 flex gap-3">
                            <Button variant="outline" onClick={prevStep} className="flex-1">
                                Back
                            </Button>
                            <Button onClick={nextStep} className="flex-[2]" disabled={!data.dueDate && !data.lastPeriodStart}>
                                Next <ChevronRight className="w-4 h-4 ml-1" />
                            </Button>
                        </div>
                    </motion.div>
                );

            case 'history':
                return (
                    <motion.div key="history" variants={slideVariants} initial="enter" animate="center" exit="exit" custom={1} className="flex-1 flex flex-col h-full">
                        <h2 className="text-2xl font-bold mb-2 font-heading">Pregnancy History</h2>

                        <div className="space-y-4 flex-1">
                            <button
                                onClick={() => { updateData({ firstPregnancy: true }); }}
                                className={`w-full p-4 rounded-xl border-2 text-left transition-all ${data.firstPregnancy === true ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-border hover:border-primary/50'}`}
                            >
                                <div className="flex items-center justify-between">
                                    <span>This is my first pregnancy</span>
                                    {data.firstPregnancy === true && <Check className="w-5 h-5 text-primary" />}
                                </div>
                            </button>
                            <button
                                onClick={() => { updateData({ firstPregnancy: false }); }}
                                className={`w-full p-4 rounded-xl border-2 text-left transition-all ${data.firstPregnancy === false ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-border hover:border-primary/50'}`}
                            >
                                <div className="flex items-center justify-between">
                                    <span>I've been pregnant before</span>
                                    {data.firstPregnancy === false && <Check className="w-5 h-5 text-primary" />}
                                </div>
                            </button>
                        </div>

                        <div className="mt-auto pt-6 flex gap-3">
                            <Button variant="outline" onClick={prevStep} className="flex-1">
                                Back
                            </Button>
                            <Button onClick={nextStep} className="flex-[2]" disabled={data.firstPregnancy === undefined}>
                                Next <ChevronRight className="w-4 h-4 ml-1" />
                            </Button>
                        </div>
                    </motion.div>
                );

            case 'provider':
                const providerOptions = ['OB-GYN', 'Midwife', 'Family doctor', 'Not yet decided'];

                return (
                    <motion.div key="provider" variants={slideVariants} initial="enter" animate="center" exit="exit" custom={1} className="flex-1 flex flex-col h-full">
                        <h2 className="text-2xl font-bold mb-2 font-heading">Care Provider</h2>
                        <p className="text-muted-foreground mb-4">Who's managing your prenatal care? (optional)</p>

                        <div className="space-y-2 flex-1 overflow-y-auto pr-2">
                            {providerOptions.map((provider) => (
                                <button
                                    key={provider}
                                    onClick={() => updateData({ careProvider: provider })}
                                    className={`w-full p-3 rounded-xl border-2 text-left transition-all ${data.careProvider === provider ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-border hover:border-primary/50'}`}
                                >
                                    <div className="flex items-center justify-between">
                                        <span>{provider}</span>
                                        {data.careProvider === provider && <Check className="w-4 h-4 text-primary" />}
                                    </div>
                                </button>
                            ))}
                        </div>

                        <div className="mt-auto pt-6 flex gap-3">
                            <Button variant="outline" onClick={prevStep} className="flex-1">
                                Back
                            </Button>
                            <Button variant="ghost" onClick={skipStep}>Skip</Button>
                            <Button onClick={nextStep} className="flex-[2]">
                                Next <ChevronRight className="w-4 h-4 ml-1" />
                            </Button>
                        </div>
                    </motion.div>
                );

            case 'frequency':
                const frequencyOptions = [
                    { id: 'regular', label: 'Still regular', desc: 'Every 21-35 days' },
                    { id: 'occasional', label: 'Occasional', desc: 'Every few months' },
                    { id: 'rare', label: 'Rare', desc: 'A few times a year' },
                    { id: 'stopped', label: 'Stopped', desc: 'More than 12 months ago' }
                ];

                return (
                    <motion.div key="frequency" variants={slideVariants} initial="enter" animate="center" exit="exit" custom={1} className="flex-1 flex flex-col h-full">
                        <h2 className="text-2xl font-bold mb-2 font-heading">Period Frequency</h2>
                        <p className="text-muted-foreground mb-4">How often do you have periods now?</p>

                        <div className="space-y-2 flex-1">
                            {frequencyOptions.map((opt) => (
                                <button
                                    key={opt.id}
                                    onClick={() => { updateData({ periodFrequency: opt.id }); }}
                                    className={`w-full p-4 rounded-xl border-2 text-left transition-all ${data.periodFrequency === opt.id ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-border hover:border-primary/50'}`}
                                >
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="font-semibold">{opt.label}</h3>
                                            <p className="text-sm text-muted-foreground">{opt.desc}</p>
                                        </div>
                                        {data.periodFrequency === opt.id && <Check className="w-5 h-5 text-primary" />}
                                    </div>
                                </button>
                            ))}
                        </div>

                        <div className="mt-auto pt-6 flex gap-3">
                            <Button variant="outline" onClick={prevStep} className="flex-1">
                                Back
                            </Button>
                            <Button onClick={nextStep} className="flex-[2]" disabled={!data.periodFrequency}>
                                Next <ChevronRight className="w-4 h-4 ml-1" />
                            </Button>
                        </div>
                    </motion.div>
                );

            case 'hrt':
                const hrtOptions = ['Not using', 'Considering', 'Currently using'];

                return (
                    <motion.div key="hrt" variants={slideVariants} initial="enter" animate="center" exit="exit" custom={1} className="flex-1 flex flex-col h-full">
                        <h2 className="text-2xl font-bold mb-2 font-heading">Hormone Therapy</h2>
                        <p className="text-muted-foreground mb-4">Are you using HRT? (optional)</p>

                        <div className="space-y-2 flex-1 overflow-y-auto pr-2">
                            {hrtOptions.map((opt) => (
                                <button
                                    key={opt}
                                    onClick={() => updateData({ hrtStatus: opt })}
                                    className={`w-full p-3 rounded-xl border-2 text-left transition-all ${data.hrtStatus === opt ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-border hover:border-primary/50'}`}
                                >
                                    <div className="flex items-center justify-between">
                                        <span>{opt}</span>
                                        {data.hrtStatus === opt && <Check className="w-4 h-4 text-primary" />}
                                    </div>
                                </button>
                            ))}
                        </div>

                        <div className="mt-auto pt-6 flex gap-3">
                            <Button variant="outline" onClick={prevStep} className="flex-1">
                                Back
                            </Button>
                            <Button variant="ghost" onClick={skipStep}>Skip</Button>
                            <Button onClick={nextStep} className="flex-[2]">
                                Next <ChevronRight className="w-4 h-4 ml-1" />
                            </Button>
                        </div>
                    </motion.div>
                );

            case 'notifications':
                return (
                    <motion.div key="notifications" variants={slideVariants} initial="enter" animate="center" exit="exit" custom={1} className="flex-1 flex flex-col h-full">
                        <h2 className="text-2xl font-bold mb-2 font-heading">Stay Connected</h2>
                        <p className="text-muted-foreground mb-6">What would you like reminders for?</p>

                        <div className="space-y-3 flex-1 overflow-y-auto pr-2">
                            {[
                                { key: 'periodReminders', label: 'Period predictions', desc: 'Get notified before your period' },
                                { key: 'dailyCheckIn', label: 'Daily check-in', desc: 'Gentle reminder to log symptoms' },
                                { key: 'insights', label: 'AI insights', desc: 'Personalized health tips' }
                            ].map((item) => (
                                <button
                                    key={item.key}
                                    onClick={() => updateData({
                                        notifications: {
                                            ...data.notifications,
                                            [item.key]: !data.notifications?.[item.key as keyof typeof data.notifications]
                                        }
                                    })}
                                    className={`w-full p-4 rounded-xl border-2 text-left transition-all ${data.notifications?.[item.key as keyof typeof data.notifications] ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-border hover:border-primary/50'}`}
                                >
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="font-semibold">{item.label}</h3>
                                            <p className="text-sm text-muted-foreground">{item.desc}</p>
                                        </div>
                                        {data.notifications?.[item.key as keyof typeof data.notifications] && <Check className="w-5 h-5 text-primary" />}
                                    </div>
                                </button>
                            ))}
                        </div>

                        <div className="mt-auto pt-6 flex gap-3">
                            <Button variant="outline" onClick={prevStep} className="flex-1">
                                Back
                            </Button>
                            <Button onClick={nextStep} className="flex-[2]">
                                Next <ChevronRight className="w-4 h-4 ml-1" />
                            </Button>
                        </div>
                    </motion.div>
                );

            case 'consent':
                return (
                    <motion.div key="consent" variants={slideVariants} initial="enter" animate="center" exit="exit" custom={1} className="flex-1 flex flex-col h-full">
                        <div className="flex items-center gap-2 mb-4">
                            <Lock className="w-5 h-5 text-primary" />
                            <h2 className="text-2xl font-bold font-heading">Privacy & Data</h2>
                        </div>
                        <p className="text-muted-foreground mb-6">Your data is encrypted and never sold.</p>

                        <Card className="p-4 bg-primary/5 border-primary/20 mb-6">
                            <div className="flex items-start gap-3">
                                <Sparkles className="w-5 h-5 text-primary mt-0.5" />
                                <div>
                                    <p className="font-medium text-sm">Powered by Opik AI</p>
                                    <p className="text-xs text-muted-foreground">Your data helps train personalized predictions. All processing is privacy-preserving.</p>
                                </div>
                            </div>
                        </Card>

                        <div className="space-y-4 flex-1 overflow-y-auto pr-2">
                            <label className="flex items-start gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={data.consents?.privacy || false}
                                    onChange={(e) => updateData({ consents: { ...data.consents!, privacy: e.target.checked } })}
                                    className="mt-1 w-5 h-5 accent-primary"
                                />
                                <span className="text-sm">
                                    I agree to the <a href="#" className="text-primary underline">Privacy Policy</a> and <a href="#" className="text-primary underline">Terms of Service</a>
                                </span>
                            </label>

                            <label className="flex items-start gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={data.consents?.dataUsage || false}
                                    onChange={(e) => updateData({ consents: { ...data.consents!, dataUsage: e.target.checked } })}
                                    className="mt-1 w-5 h-5 accent-primary"
                                />
                                <span className="text-sm">
                                    I consent to anonymous data use for improving predictions
                                </span>
                            </label>
                        </div>

                        <div className="mt-auto pt-6 flex gap-3">
                            <Button variant="outline" onClick={prevStep} className="flex-1">
                                Back
                            </Button>
                            <Button
                                onClick={nextStep}
                                disabled={!data.consents?.privacy}
                                className="flex-[2] bg-gradient-to-r from-primary to-accent"
                            >
                                Next <ChevronRight className="w-4 h-4 ml-1" />
                            </Button>
                        </div>
                    </motion.div>
                );

            case 'signin':
                return (
                    <motion.div key="signin" variants={slideVariants} initial="enter" animate="center" exit="exit" custom={1} className="flex-1 flex flex-col h-full items-center justify-center text-center">
                        <motion.div
                            className="relative w-24 h-24 mb-6"
                            animate={{ scale: [1, 1.05, 1] }}
                            transition={{ duration: 2, repeat: Infinity }}
                        >
                            <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl" />
                            <div className="relative w-full h-full bg-gradient-to-tr from-primary to-accent rounded-full flex items-center justify-center shadow-2xl">
                                <span className="text-4xl">🎉</span>
                            </div>
                        </motion.div>

                        <h2 className="text-2xl font-bold mb-2 font-heading">
                            You're all set, {data.firstName || 'friend'}!
                        </h2>
                        <p className="text-muted-foreground mb-8 max-w-xs">
                            Create an account to save your settings and sync across devices.
                        </p>

                        <div className="w-full space-y-3">
                            <SignUpButton mode="modal">
                                <Button className="w-full bg-gradient-to-r from-primary to-accent" size="lg">
                                    Create Account ✨
                                </Button>
                            </SignUpButton>

                            <SignInButton mode="modal">
                                <Button variant="outline" className="w-full" size="lg">
                                    I already have an account
                                </Button>
                            </SignInButton>

                            <button
                                onClick={handleComplete}
                                className="text-sm text-muted-foreground hover:text-foreground transition-colors mt-4"
                            >
                                Skip for now →
                            </button>
                        </div>
                    </motion.div>
                );

            default:
                // Use default rendering for other steps but ensure buttons
                return (
                    <motion.div key={stepName} variants={slideVariants} initial="enter" animate="center" exit="exit" custom={1} className="flex-1 flex flex-col h-full">
                        {/* Fallback for steps not explicitly customized above */}
                        <h2 className="text-2xl font-bold mb-4 font-heading capitalize">{stepName}</h2>
                        <div className="flex-1">
                            <p>Configuration for {stepName}</p>
                        </div>
                        <div className="mt-auto pt-6 flex gap-3">
                            <Button variant="outline" onClick={prevStep}>Back</Button>
                            <Button onClick={nextStep}>Next</Button>
                        </div>
                    </motion.div>
                );
        }
    };

    // Redesigned Layout: Centered Modal
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-background/60 backdrop-blur-sm"
            />

            {/* Modal Panel */}
            <motion.div
                initial={{ scale: 0.95, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 20 }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                className="relative w-full max-w-lg bg-background border border-border/50 shadow-2xl rounded-3xl flex flex-col overflow-hidden max-h-[90vh]"
            >
                {/* Header */}
                <div className="px-6 py-4 border-b border-border/50 flex items-center justify-between bg-muted/30">
                    <div>
                        <h3 className="font-heading font-bold text-lg">Setup Luna</h3>
                        <p className="text-xs text-muted-foreground">Step {currentStep + 1} of {totalSteps}</p>
                    </div>
                    <div className="flex gap-1.5">
                        {steps.map((_, i) => (
                            <motion.div
                                key={i}
                                className={`h-1.5 rounded-full transition-all ${i === currentStep ? 'bg-primary w-4' : i < currentStep ? 'bg-primary/50 w-1.5' : 'bg-border w-1.5'}`}
                                layout
                            />
                        ))}
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto p-6 min-h-[400px]">
                    <AnimatePresence mode="wait" custom={1}>
                        {renderStep()}
                    </AnimatePresence>
                </div>

                {/* Footer info */}
                <div className="px-6 py-3 border-t border-border/50 text-center text-[10px] text-muted-foreground bg-muted/20">
                    <p>Your data is encrypted and stored locally. You can update these settings later.</p>
                </div>
            </motion.div>
        </div>
    );
}
