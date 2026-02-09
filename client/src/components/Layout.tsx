import { Calendar } from 'lucide-react';
import Navbar from './ui/Navbar';

interface LayoutProps {
    children: React.ReactNode;
    currentView: string;
    onViewChange: (view: string) => void;
    onModeChange: (mode: string) => void;
}

export default function Layout({ children, currentView, onViewChange }: LayoutProps) {
    return (
        <div className="min-h-screen bg-background text-foreground transition-colors duration-500 relative overflow-hidden">

            {/* Ambient Background Blobs */}
            <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/5 rounded-full blur-[100px] animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-accent/10 rounded-full blur-[100px]" />
            </div>

            {/* Sticky Header - Fixed Height */}
            <header className="fixed top-0 left-0 right-0 z-50 h-14 bg-background/95 backdrop-blur-xl border-b border-border/50 shadow-sm">
                <div className="flex items-center justify-between max-w-md mx-auto px-4 h-full">
                    <div className="flex flex-col">
                        <h1 className="text-xl font-heading font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                            Luna AI
                        </h1>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            className={`p-2 rounded-full transition-all border border-transparent ${currentView === 'calendar'
                                ? 'bg-primary/10 text-primary border-primary/20'
                                : 'hover:bg-secondary/50 text-muted-foreground'
                                }`}
                            onClick={() => onViewChange('calendar')}
                        >
                            <Calendar className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content - Offset for fixed header and bottom nav */}
            <main className="max-w-md mx-auto px-4 pt-16 pb-24 relative z-10 w-full min-h-screen">
                {children}
            </main>

            {/* Footer with Presentation Link */}
            <footer className="fixed bottom-16 left-0 right-0 z-40 flex justify-center pointer-events-none">
                <button
                    onClick={() => onViewChange('presentation')}
                    className="pointer-events-auto px-4 py-1.5 bg-gradient-to-r from-violet-600 to-purple-600 text-white text-xs font-medium rounded-full shadow-lg hover:scale-105 transition-transform flex items-center gap-1.5"
                >
                    <span>📽️</span>
                    <span>View Pitch Deck</span>
                </button>
            </footer>

            {/* Premium Navbar */}
            <Navbar currentView={currentView} onViewChange={onViewChange} />
        </div>
    );
}
