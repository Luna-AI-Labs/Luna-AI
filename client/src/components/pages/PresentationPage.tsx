import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Play, Pause, Home, Maximize2 } from 'lucide-react';

interface Slide {
    id: number;
    title: string;
    subtitle?: string;
    content: React.ReactNode;
    background?: string;
}

export default function PresentationPage() {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [_isFullscreen, setIsFullscreen] = useState(false);
    const [isAutoPlay, setIsAutoPlay] = useState(false);

    const slides: Slide[] = [
        // Slide 1: Hook + Team
        {
            id: 1,
            title: "Luna AI",
            subtitle: "Your Safe, Intelligent Menstrual Health Companion",
            background: "from-violet-900 via-purple-900 to-indigo-900",
            content: (
                <div className="flex flex-col items-center justify-center h-full text-center px-8">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", delay: 0.2 }}
                        className="text-8xl mb-8"
                    >
                        🌙
                    </motion.div>
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="text-6xl md:text-8xl font-bold mb-4 bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent"
                    >
                        Luna AI
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.6 }}
                        className="text-2xl md:text-3xl text-purple-200 mb-12"
                    >
                        Your Safe, Intelligent Menstrual Health Companion
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.8 }}
                        className="flex gap-8 mt-8"
                    >
                        <div className="text-center">
                            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-400 to-cyan-400 flex items-center justify-center text-3xl mb-2 mx-auto">👨‍💻</div>
                            <p className="font-semibold text-lg">Antony</p>
                            <p className="text-sm text-purple-300">Software Engineer</p>
                        </div>
                        <div className="text-center">
                            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-pink-400 to-rose-400 flex items-center justify-center text-3xl mb-2 mx-auto">📊</div>
                            <p className="font-semibold text-lg">Ruth</p>
                            <p className="text-sm text-purple-300">Data Science</p>
                        </div>
                        <div className="text-center">
                            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-400 to-teal-400 flex items-center justify-center text-3xl mb-2 mx-auto">👩‍⚕️</div>
                            <p className="font-semibold text-lg">Noreen</p>
                            <p className="text-sm text-purple-300">Medical Doctor</p>
                        </div>
                    </motion.div>
                </div>
            )
        },
        // Slide 2: The Problem
        {
            id: 2,
            title: "The Problem",
            background: "from-red-900 via-rose-900 to-pink-900",
            content: (
                <div className="flex flex-col items-center justify-center h-full px-8 md:px-16">
                    <motion.h2
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-4xl md:text-6xl font-bold mb-12 text-center"
                    >
                        The Dangerous Gap in Health AI
                    </motion.h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl">
                        {[
                            { icon: "💊", text: "AI prescribes drugs without licenses", delay: 0.2 },
                            { icon: "⚠️", text: "No guardrails or accountability", delay: 0.4 },
                            { icon: "🔓", text: "Sensitive health data sold or leaked", delay: 0.6 },
                            { icon: "📉", text: "Generic predictions that don't fit you", delay: 0.8 }
                        ].map((item, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: item.delay }}
                                className="flex items-center gap-4 bg-white/10 backdrop-blur-sm rounded-2xl p-6"
                            >
                                <span className="text-4xl">{item.icon}</span>
                                <span className="text-xl md:text-2xl">{item.text}</span>
                            </motion.div>
                        ))}
                    </div>

                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1 }}
                        className="mt-12 text-2xl text-rose-200 text-center"
                    >
                        Women deserve better than dangerous AI advice.
                    </motion.p>
                </div>
            )
        },
        // Slide 3: Opik Solution
        {
            id: 3,
            title: "The Solution",
            background: "from-emerald-900 via-teal-900 to-cyan-900",
            content: (
                <div className="flex flex-col items-center justify-center h-full px-8 md:px-16">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex items-center gap-4 mb-8"
                    >
                        <span className="text-5xl">🌙</span>
                        <span className="text-3xl">+</span>
                        <div className="bg-white px-4 py-2 rounded-lg">
                            <span className="text-2xl font-bold text-gray-900">Opik</span>
                        </div>
                    </motion.div>

                    <motion.h2
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-4xl md:text-6xl font-bold mb-12 text-center"
                    >
                        Safe AI, Powered by Opik
                    </motion.h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl">
                        {[
                            { icon: "🛡️", title: "Guardrails", desc: "Blocks dangerous medical advice", delay: 0.3 },
                            { icon: "👁️", title: "Observability", desc: "Every response traced & logged", delay: 0.5 },
                            { icon: "📈", title: "Optimization", desc: "Continuous improvement", delay: 0.7 }
                        ].map((item, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: item.delay }}
                                className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 text-center"
                            >
                                <span className="text-5xl block mb-4">{item.icon}</span>
                                <h3 className="text-2xl font-bold mb-2">{item.title}</h3>
                                <p className="text-lg text-teal-200">{item.desc}</p>
                            </motion.div>
                        ))}
                    </div>

                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.9 }}
                        className="mt-12 text-2xl text-teal-200 text-center max-w-3xl"
                    >
                        "If Luna tries to prescribe medication, Opik catches it and stops it."
                    </motion.p>
                </div>
            )
        },
        // Slide 4: Demo
        {
            id: 4,
            title: "Demo",
            background: "from-indigo-900 via-purple-900 to-violet-900",
            content: (
                <div className="flex flex-col items-center justify-center h-full px-8">
                    <motion.h2
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-4xl md:text-6xl font-bold mb-12 text-center"
                    >
                        Luna in Action
                    </motion.h2>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-6 max-w-5xl">
                        {[
                            { icon: "🏠", title: "Landing", desc: "Premium design" },
                            { icon: "✨", title: "Onboarding", desc: "4 personalized modes" },
                            { icon: "📊", title: "Dashboard", desc: "Cycle visualization" },
                            { icon: "📅", title: "Calendar", desc: "Predictions & tracking" },
                            { icon: "💬", title: "AI Chat", desc: "Safe health companion" },
                            { icon: "👤", title: "Profile", desc: "Mode switching" }
                        ].map((item, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.1 * i }}
                                className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center hover:bg-white/20 transition-colors"
                            >
                                <span className="text-4xl block mb-3">{item.icon}</span>
                                <h3 className="text-xl font-bold">{item.title}</h3>
                                <p className="text-sm text-purple-300">{item.desc}</p>
                            </motion.div>
                        ))}
                    </div>

                    <motion.a
                        href="/"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.8 }}
                        className="mt-12 bg-gradient-to-r from-pink-500 to-violet-500 px-8 py-4 rounded-2xl hover:scale-105 transition-transform cursor-pointer"
                    >
                        <p className="text-xl font-semibold">🎬 View Live Demo →</p>
                    </motion.a>
                </div>
            )
        },
        // Slide 5: Features + Business
        {
            id: 5,
            title: "Business Model",
            background: "from-amber-900 via-orange-900 to-red-900",
            content: (
                <div className="flex flex-col items-center justify-center h-full px-8 md:px-16">
                    <motion.h2
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-4xl md:text-6xl font-bold mb-12 text-center"
                    >
                        Smart, Safe, Sustainable
                    </motion.h2>

                    <div className="flex flex-col md:flex-row gap-8 max-w-5xl w-full">
                        {/* Features */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                            className="flex-1 bg-white/10 backdrop-blur-sm rounded-2xl p-8"
                        >
                            <h3 className="text-2xl font-bold mb-6">Core Features</h3>
                            <div className="space-y-4">
                                {[
                                    { icon: "🌙", text: "4 Life Modes" },
                                    { icon: "💬", text: "Safe AI Chat" },
                                    { icon: "📊", text: "Smart Predictions" },
                                    { icon: "🔐", text: "Privacy-First" }
                                ].map((f, i) => (
                                    <div key={i} className="flex items-center gap-3 text-xl">
                                        <span>{f.icon}</span>
                                        <span>{f.text}</span>
                                    </div>
                                ))}
                            </div>
                        </motion.div>

                        {/* Business Model */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.4 }}
                            className="flex-1 bg-white/10 backdrop-blur-sm rounded-2xl p-8"
                        >
                            <h3 className="text-2xl font-bold mb-6">x402 Payments</h3>
                            <div className="space-y-4">
                                <div className="bg-white/10 rounded-xl p-4">
                                    <p className="text-lg font-semibold">Free Tier</p>
                                    <p className="text-amber-200">Basic tracking & calendar</p>
                                </div>
                                <div className="bg-gradient-to-r from-amber-500/30 to-orange-500/30 rounded-xl p-4 border-2 border-amber-400">
                                    <p className="text-lg font-semibold">Premium AI</p>
                                    <p className="text-amber-200">Pay-per-chat micropayments</p>
                                    <p className="text-sm mt-2 text-white/70">Powered by x402</p>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            )
        },
        // Slide 6: Close
        {
            id: 6,
            title: "Thank You",
            background: "from-violet-900 via-purple-900 to-indigo-900",
            content: (
                <div className="flex flex-col items-center justify-center h-full text-center px-8">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring" }}
                        className="text-8xl mb-8"
                    >
                        🌙
                    </motion.div>

                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent"
                    >
                        Luna AI
                    </motion.h2>

                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="text-2xl text-purple-200 mb-12"
                    >
                        Safe AI for Women's Health
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                        className="flex flex-wrap justify-center gap-4 mb-12"
                    >
                        <span className="bg-white/10 px-6 py-3 rounded-full text-lg">✅ Opik-powered safety</span>
                        <span className="bg-white/10 px-6 py-3 rounded-full text-lg">✅ Doctor on team</span>
                        <span className="bg-white/10 px-6 py-3 rounded-full text-lg">✅ x402 payments</span>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.8 }}
                        className="bg-gradient-to-r from-pink-500 to-violet-500 px-12 py-6 rounded-2xl"
                    >
                        <p className="text-3xl font-bold">Vote for Luna! 🗳️</p>
                    </motion.div>
                </div>
            )
        }
    ];

    const nextSlide = useCallback(() => {
        setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, [slides.length]);

    const prevSlide = () => {
        setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
    };

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
            setIsFullscreen(true);
        } else {
            document.exitFullscreen();
            setIsFullscreen(false);
        }
    };

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'ArrowRight' || e.key === ' ') {
                nextSlide();
            } else if (e.key === 'ArrowLeft') {
                prevSlide();
            } else if (e.key === 'f') {
                toggleFullscreen();
            } else if (e.key === 'Escape') {
                window.location.href = '/';
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [nextSlide]);

    // Auto-play
    useEffect(() => {
        if (isAutoPlay) {
            const interval = setInterval(nextSlide, 8000);
            return () => clearInterval(interval);
        }
    }, [isAutoPlay, nextSlide]);

    return (
        <div className={`min-h-screen bg-gradient-to-br ${slides[currentSlide].background} text-white overflow-hidden`}>
            {/* Main Content */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentSlide}
                    initial={{ opacity: 0, x: 100 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{ duration: 0.5 }}
                    className="h-screen w-full"
                >
                    {slides[currentSlide].content}
                </motion.div>
            </AnimatePresence>

            {/* Navigation */}
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/50 to-transparent">
                <div className="max-w-4xl mx-auto flex items-center justify-between">
                    {/* Left controls */}
                    <div className="flex items-center gap-2">
                        <a
                            href="/"
                            className="p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
                        >
                            <Home className="w-5 h-5" />
                        </a>
                        <button
                            onClick={toggleFullscreen}
                            className="p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
                        >
                            <Maximize2 className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() => setIsAutoPlay(!isAutoPlay)}
                            className={`p-3 rounded-full transition-colors ${isAutoPlay ? 'bg-green-500/50' : 'bg-white/10 hover:bg-white/20'}`}
                        >
                            {isAutoPlay ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                        </button>
                    </div>

                    {/* Slide indicators */}
                    <div className="flex items-center gap-2">
                        {slides.map((_, i) => (
                            <button
                                key={i}
                                onClick={() => setCurrentSlide(i)}
                                className={`w-3 h-3 rounded-full transition-all ${i === currentSlide ? 'bg-white scale-125' : 'bg-white/30 hover:bg-white/50'}`}
                            />
                        ))}
                    </div>

                    {/* Right controls */}
                    <div className="flex items-center gap-2">
                        <button
                            onClick={prevSlide}
                            className="p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <span className="text-sm font-medium px-3">
                            {currentSlide + 1} / {slides.length}
                        </span>
                        <button
                            onClick={nextSlide}
                            className="p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
                        >
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Keyboard hints */}
            <div className="fixed top-4 right-4 text-xs text-white/50">
                ← → navigate | F fullscreen | ESC exit
            </div>
        </div>
    );
}
