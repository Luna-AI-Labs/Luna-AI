import React from 'react';
import { motion } from 'framer-motion';
import { Home, FileText, MessageCircle, Settings, Plus } from 'lucide-react';
import { cn } from '../../utils/cn';

interface NavbarProps {
    currentView: string;
    onViewChange: (view: string) => void;
}

export default function Navbar({ currentView, onViewChange }: NavbarProps) {
    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 px-6 pb-6 pt-2 pointer-events-none">
            <div className="max-w-md mx-auto relative pointer-events-auto">
                {/* Floating Glass Dock */}
                <div className="glass-card flex items-center justify-around p-2 rounded-full shadow-2xl bg-white/80 backdrop-blur-xl border-white/40">
                    <NavButton
                        active={currentView === 'dashboard'}
                        onClick={() => onViewChange('dashboard')}
                        icon={<Home className="w-5 h-5" />}
                        label="Today"
                    />
                    <NavButton
                        active={currentView === 'symptoms'}
                        onClick={() => onViewChange('symptoms')}
                        icon={<FileText className="w-5 h-5" />}
                        label="Log"
                    />

                    {/* Central FAB */}
                    <div className="relative -mt-8 mx-2">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => onViewChange('calendar')}
                            className="w-14 h-14 rounded-full bg-gradient-to-tr from-primary to-accent text-white shadow-glow flex items-center justify-center border-4 border-background"
                        >
                            <Plus className="w-7 h-7" />
                        </motion.button>
                    </div>

                    <NavButton
                        active={currentView === 'assistant'}
                        onClick={() => onViewChange('assistant')}
                        icon={<MessageCircle className="w-5 h-5" />}
                        label="Luna"
                    />
                    <NavButton
                        active={currentView === 'profile'}
                        onClick={() => onViewChange('profile')}
                        icon={<Settings className="w-5 h-5" />}
                        label="Profile"
                    />
                </div>
            </div>
        </nav>
    );
}

function NavButton({ active, onClick, icon, label }: {
    active: boolean;
    onClick: () => void;
    icon: React.ReactNode;
    label: string;
}) {
    return (
        <button
            onClick={onClick}
            className={cn(
                "relative flex flex-col items-center justify-center w-12 h-10 gap-0.5 transition-colors",
                active ? "text-primary" : "text-muted-foreground hover:text-primary/70"
            )}
        >
            {active && (
                <motion.div
                    layoutId="nav-pill"
                    className="absolute -top-3 w-8 h-1 bg-primary rounded-full shadow-[0_0_10px_rgba(244,63,94,0.5)]"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
            )}
            <div className={cn("transition-transform duration-300", active && "scale-110")}>
                {icon}
            </div>
            <span className="text-[9px] font-semibold tracking-wide">{label}</span>
        </button>
    );
}
