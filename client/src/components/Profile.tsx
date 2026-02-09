import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { User, Bell, Shield, Heart, LogOut, ChevronRight, Moon, Globe, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast } from './ui/Toast';

type AppMode = 'period' | 'conceive' | 'pregnancy' | 'perimenopause';

interface ProfileProps {
    currentMode?: AppMode;
    onModeChange?: (mode: AppMode) => void;
}

const MODE_OPTIONS: { id: AppMode; label: string; emoji: string; description: string; color: string }[] = [
    { id: 'period', label: 'Period Tracking', emoji: '🌸', description: 'Track your menstrual cycle', color: '#ec4899' },
    { id: 'conceive', label: 'Trying to Conceive', emoji: '🥚', description: 'Fertility & ovulation tracking', color: '#14b8a6' },
    { id: 'pregnancy', label: 'Pregnancy', emoji: '🤰', description: 'Week-by-week pregnancy journey', color: '#a855f7' },
    { id: 'perimenopause', label: 'Perimenopause', emoji: '🌿', description: 'Manage menopause symptoms', color: '#f59e0b' },
];

export default function Profile({ currentMode = 'period', onModeChange }: ProfileProps) {
    const { i18n } = useTranslation();
    const { showToast } = useToast();
    const [notifications, setNotifications] = useState(true);
    const [showModeSelector, setShowModeSelector] = useState(false);

    const toggleLanguage = () => {
        const nextLang = i18n.language === 'en' ? 'zh' : i18n.language === 'zh' ? 'fr' : 'en';
        i18n.changeLanguage(nextLang);
    };

    const handleModeChange = (mode: AppMode) => {
        onModeChange?.(mode);
        setShowModeSelector(false);
        const modeInfo = MODE_OPTIONS.find(m => m.id === mode);
        showToast(`Switched to ${modeInfo?.label} ${modeInfo?.emoji}`, 'success');
    };

    const currentModeInfo = MODE_OPTIONS.find(m => m.id === currentMode) || MODE_OPTIONS[0];

    const sections = [
        {
            title: 'Mode',
            items: [
                {
                    icon: Sparkles,
                    label: currentModeInfo.label,
                    sublabel: 'Tap to change',
                    action: () => setShowModeSelector(!showModeSelector),
                    emoji: currentModeInfo.emoji,
                    highlight: true
                },
            ]
        },
        {
            title: 'Account',
            items: [
                { icon: User, label: 'Personal Info', action: () => { } },
                { icon: Globe, label: `Language (${i18n.language.toUpperCase()})`, action: toggleLanguage },
            ]
        },
        {
            title: 'Preferences',
            items: [
                { icon: Bell, label: 'Notifications', toggle: true, value: notifications, onToggle: () => setNotifications(!notifications) },
                { icon: Moon, label: 'Dark Mode', toggle: true, value: false, onToggle: () => { } }
            ]
        },
        {
            title: 'Support',
            items: [
                { icon: Shield, label: 'Privacy Policy', action: () => { } },
                { icon: Heart, label: 'Share Luna', action: () => { } },
            ]
        }
    ];

    return (
        <div className="pb-20">
            {/* Profile Header */}
            <div className="flex flex-col items-center mb-8">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-accent p-1 shadow-xl mb-4">
                    <div className="w-full h-full rounded-full bg-background flex items-center justify-center overflow-hidden">
                        <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=LunaUser" alt="User" className="w-full h-full" />
                    </div>
                </div>
                <h2 className="text-2xl font-bold">Luna User</h2>
                <p className="text-muted-foreground">Premium Member</p>

                {/* Current Mode Badge */}
                <div
                    className="mt-3 px-4 py-1.5 rounded-full text-white text-sm font-medium flex items-center gap-2"
                    style={{ backgroundColor: currentModeInfo.color }}
                >
                    <span>{currentModeInfo.emoji}</span>
                    <span>{currentModeInfo.label}</span>
                </div>
            </div>

            <div className="space-y-4">
                {sections.map((section, idx) => (
                    <div key={idx}>
                        <div className="glass-card p-4 rounded-xl border border-border/50">
                            <h3 className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wider px-2">
                                {section.title}
                            </h3>
                            <div className="space-y-1">
                                {section.items.map((item, itemIdx) => (
                                    <button
                                        key={itemIdx}
                                        onClick={'action' in item ? item.action : undefined}
                                        className={`w-full flex items-center justify-between p-3 rounded-lg transition-all text-left group ${'highlight' in item && item.highlight
                                                ? 'bg-primary/5 hover:bg-primary/10 border border-primary/20'
                                                : 'hover:bg-secondary/50'
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            {'emoji' in item ? (
                                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-xl">
                                                    {item.emoji}
                                                </div>
                                            ) : (
                                                <div className="p-2 rounded-full bg-secondary text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                                                    <item.icon className="w-5 h-5" />
                                                </div>
                                            )}
                                            <div>
                                                <span className="font-medium block">{item.label}</span>
                                                {'sublabel' in item && (
                                                    <span className="text-xs text-muted-foreground">{item.sublabel}</span>
                                                )}
                                            </div>
                                        </div>

                                        {'toggle' in item ? (
                                            <div
                                                className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${item.value ? 'bg-primary' : 'bg-gray-300'}`}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    item.onToggle && item.onToggle();
                                                }}
                                            >
                                                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm transition-all ${item.value ? 'left-7' : 'left-1'}`} />
                                            </div>
                                        ) : (
                                            <ChevronRight className={`w-5 h-5 text-muted-foreground transition-transform ${section.title === 'Mode' && showModeSelector ? 'rotate-90' : ''
                                                }`} />
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Mode Selector Dropdown */}
                        {section.title === 'Mode' && showModeSelector && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="mt-2 glass-card p-3 rounded-xl border border-primary/20 overflow-hidden"
                            >
                                <p className="text-xs text-muted-foreground mb-3 px-1">Select your tracking mode:</p>
                                <div className="grid grid-cols-2 gap-2">
                                    {MODE_OPTIONS.map((mode) => (
                                        <button
                                            key={mode.id}
                                            onClick={() => handleModeChange(mode.id)}
                                            className={`p-3 rounded-xl text-left transition-all ${currentMode === mode.id
                                                    ? 'ring-2 ring-primary bg-primary/10'
                                                    : 'bg-secondary/30 hover:bg-secondary/50'
                                                }`}
                                        >
                                            <div className="text-2xl mb-1">{mode.emoji}</div>
                                            <div className="text-sm font-medium">{mode.label}</div>
                                            <div className="text-xs text-muted-foreground mt-0.5">{mode.description}</div>
                                        </button>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </div>
                ))}

                <button
                    onClick={() => {
                        if (confirm('Are you sure you want to reset onboarding? This will clear your local preferences.')) {
                            localStorage.removeItem('onboardingComplete');
                            window.location.reload();
                        }
                    }}
                    className="w-full flex items-center justify-center gap-2 p-4 text-red-500 hover:bg-red-50 rounded-xl transition-colors font-medium"
                >
                    <LogOut className="w-5 h-5" />
                    Reset Onboarding
                </button>
            </div>
        </div>
    );
}
