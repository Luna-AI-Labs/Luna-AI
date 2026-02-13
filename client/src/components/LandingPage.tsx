import { motion } from 'framer-motion';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { Badge } from './ui/Badge';

interface LandingPageProps {
    onStart: () => void;
    onLogin: () => void;
    onNavigate: (page: string) => void;
}

export default function LandingPage({ onStart, onLogin, onNavigate }: LandingPageProps) {
    const fadeInUp = {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.6 }
    };

    const staggerContainer = {
        animate: {
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    return (
        <div className="min-h-screen bg-background font-sans overflow-x-hidden">
            {/* Navigation Overlay */}
            <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4 flex items-center justify-between bg-background/80 backdrop-blur-md border-b border-border/50">
                <div className="flex items-center gap-2">
                    <span className="text-2xl">🌙</span>
                    <span className="font-heading font-bold text-xl tracking-tight">Luna AI</span>
                </div>
                <div className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
                    <a href="#features" className="hover:text-primary transition-colors">Features</a>
                    <a href="#opik" className="hover:text-primary transition-colors">Opik AI</a>
                    <a href="#security" className="hover:text-primary transition-colors">Privacy</a>
                    <a href="#blog" className="hover:text-primary transition-colors">Blog</a>
                </div>
                <div className="flex items-center gap-4">
                    <Button variant="ghost" onClick={onLogin}>Log In / Sign Up</Button>
                    <Button variant="primary" className="shadow-glow" onClick={onStart}>Get Started</Button>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative pt-32 pb-20 px-6 min-h-[90vh] flex items-center justify-center overflow-hidden">
                {/* Abstract Background Blobs */}
                <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-period-300/20 rounded-full blur-[100px] animate-pulse" />
                <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-conceive-300/20 rounded-full blur-[100px] animate-pulse delay-1000" />

                <div className="container mx-auto grid lg:grid-cols-2 gap-12 items-center relative z-10">
                    <motion.div
                        initial="initial"
                        animate="animate"
                        variants={staggerContainer}
                        className="text-center lg:text-left space-y-8"
                    >
                        <motion.div variants={fadeInUp}>
                            <Badge variant="outline" className="mb-4 border-primary/20 text-primary bg-primary/5 uppercase tracking-wider py-1 px-3">
                                Powered by Opik AI
                            </Badge>
                            <h1 className="text-5xl lg:text-7xl font-heading font-bold leading-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                                Cycle Tracking <br />
                                <span className="text-primary italic">Reimagined.</span>
                            </h1>
                        </motion.div>

                        <motion.p variants={fadeInUp} className="text-xl text-muted-foreground/80 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                            Experience the next evolution of feminine health technology. Intelligent predictions that adapt to your unique rhythm, secured by end-to-end encryption.
                        </motion.p>

                        <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                            <Button size="lg" className="text-lg px-8 py-6 shadow-glow hover:scale-105 transition-transform" onClick={onStart}>
                                Start Your Journey
                            </Button>
                            <Button variant="outline" size="lg" className="text-lg px-8 py-6 hover:bg-secondary/50" onClick={() => onNavigate('presentation')}>
                                View Demo
                            </Button>
                        </motion.div>

                        <motion.div variants={fadeInUp} className="pt-8 flex items-center justify-center lg:justify-start gap-8 text-muted-foreground/60 text-sm font-medium">
                            <span className="flex items-center gap-2">Waitlist Joining 10k+</span>
                            <span className="w-1 h-1 bg-current rounded-full" />
                            <span className="flex items-center gap-2">4.9/5 Star Rating</span>
                        </motion.div>
                    </motion.div>

                    {/* Hero Visual */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
                        animate={{ opacity: 1, scale: 1, rotate: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="relative hidden lg:block"
                    >
                        <div className="relative w-full aspect-square max-w-[600px] mx-auto">
                            {/* Central Phone Mockup or Abstract UI */}
                            <Card variant="glass" className="w-[300px] h-[600px] mx-auto border-4 border-white/20 shadow-2xl overflow-hidden relative z-20 rounded-[3rem] bg-black/5">
                                <div className="absolute inset-0 bg-white/40 backdrop-blur-xl" />
                                {/* Internal UI Mockup - Just a glimpse */}
                                <div className="absolute top-20 left-4 right-4 space-y-4 opacity-80">
                                    <div className="h-40 rounded-full border-[12px] border-primary/30 flex items-center justify-center">
                                        <div className="text-4xl font-bold text-primary">Day 12</div>
                                    </div>
                                    <div className="h-20 bg-white/50 rounded-2xl" />
                                    <div className="h-20 bg-white/50 rounded-2xl" />
                                </div>
                            </Card>

                            {/* Floating Cards around */}
                            <motion.div
                                animate={{ y: [-10, 10, -10] }}
                                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                className="absolute top-32 -left-12 z-30"
                            >
                                <Card variant="glass" className="p-4 flex items-center gap-3 w-48 border-l-4 border-period-500">
                                    <span className="text-2xl">🌸</span>
                                    <div>
                                        <div className="text-xs font-bold uppercase text-period-500">Period</div>
                                        <div className="text-sm font-semibold">In 3 Days</div>
                                    </div>
                                </Card>
                            </motion.div>

                            <motion.div
                                animate={{ y: [15, -15, 15] }}
                                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                                className="absolute bottom-48 -right-8 z-30"
                            >
                                <Card variant="glass" className="p-4 flex items-center gap-3 w-52 border-l-4 border-conceive-500">
                                    <span className="text-2xl">🥚</span>
                                    <div>
                                        <div className="text-xs font-bold uppercase text-conceive-500">High Fertility</div>
                                        <div className="text-sm font-semibold">Window Open</div>
                                    </div>
                                </Card>
                            </motion.div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Features Bento Grid */}
            <section id="features" className="py-24 bg-secondary/30">
                <div className="container mx-auto px-6">
                    <div className="text-center mb-16 max-w-2xl mx-auto">
                        <h2 className="text-3xl md:text-5xl font-heading font-bold mb-4">Holistic Cycle Intelligence</h2>
                        <p className="text-muted-foreground text-lg">Tracks more than just dates. Luna understands the full spectrum of your hormonal health.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[300px]">
                        {/* Large Tile - Period Tracking */}
                        <motion.div
                            whileHover={{ y: -5 }}
                            className="md:col-span-2 row-span-1 rounded-3xl overflow-hidden relative group"
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-period-100 to-period-50/50 -z-10" />
                            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1516575150278-77136aed6920?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-10 mix-blend-overlay group-hover:scale-105 transition-transform duration-700" />
                            <div className="p-8 h-full flex flex-col justify-end relative z-10">
                                <span className="bg-white/80 backdrop-blur self-start px-3 py-1 rounded-full text-xs font-bold text-period-600 mb-4">Core Feature</span>
                                <h3 className="text-3xl font-heading font-bold text-period-900 mb-2">Smart Period Tracking</h3>
                                <p className="text-period-800/80 max-w-md">Adaptive algorithms that learn your unique cycle length and variability over time.</p>
                            </div>
                        </motion.div>

                        {/* Tall Tile - Opik AI */}
                        <motion.div
                            whileHover={{ y: -5 }}
                            className="md:col-span-1 md:row-span-2 rounded-3xl overflow-hidden relative group bg-black text-white"
                        >
                            <div className="absolute inset-0 bg-gradient-to-b from-gray-900 to-black -z-10" />
                            <div className="p-8 h-full flex flex-col relative z-10">
                                <div className="flex items-center gap-2 mb-auto">
                                    <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                                    <span className="text-xs font-mono text-green-400">OPIK.AI ACTIVE</span>
                                </div>

                                <div className="space-y-6 my-auto">
                                    <div className="p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur">
                                        <div className="text-xs text-gray-400 mb-1">Analysis</div>
                                        <p className="text-sm font-mono">"Cycle regularity improved by 15% this month. Stress markers detected."</p>
                                    </div>
                                    <div className="p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur translate-x-4">
                                        <div className="text-xs text-gray-400 mb-1">Prediction</div>
                                        <p className="text-sm font-mono">"Ovulation likely in 2 days based on BBT trend."</p>
                                    </div>
                                </div>

                                <div className="mt-8">
                                    <h3 className="text-2xl font-heading font-bold mb-2">Powered by Opik</h3>
                                    <p className="text-gray-400 text-sm">Real-time analysis of over 50+ biomarkers to give you clinical-grade insights.</p>
                                </div>
                            </div>
                        </motion.div>

                        {/* Small Tile - Fertility */}
                        <motion.div
                            whileHover={{ y: -5 }}
                            className="rounded-3xl overflow-hidden relative group bg-gradient-to-br from-conceive-100 to-conceive-50"
                        >
                            <div className="p-8">
                                <div className="w-12 h-12 rounded-full bg-conceive-200 flex items-center justify-center text-2xl mb-4">🌱</div>
                                <h3 className="text-xl font-heading font-bold text-conceive-900">Fertility Window</h3>
                                <p className="text-sm text-conceive-800 mt-2">Pinpoint precise ovulation days.</p>
                            </div>
                        </motion.div>

                        {/* Small Tile - Pregnancy */}
                        <motion.div
                            whileHover={{ y: -5 }}
                            className="rounded-3xl overflow-hidden relative group bg-gradient-to-br from-pregnancy-100 to-pregnancy-50"
                        >
                            <div className="p-8">
                                <div className="w-12 h-12 rounded-full bg-pregnancy-200 flex items-center justify-center text-2xl mb-4">🤰</div>
                                <h3 className="text-xl font-heading font-bold text-pregnancy-900">Pregnancy Mode</h3>
                                <p className="text-sm text-pregnancy-800 mt-2">Week-by-week baby growth tracking.</p>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Opik AI Deep Dive */}
            <section id="opik" className="py-24 bg-black text-white overflow-hidden relative">
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/20 via-black to-black opacity-50" />

                <div className="container mx-auto px-6 relative z-10">
                    <div className="max-w-4xl mx-auto text-center space-y-8">
                        <Badge className="bg-white/10 text-white border-white/20 hover:bg-white/20 transition-colors cursor-default">
                            Artificial Intelligence
                        </Badge>
                        <h2 className="text-4xl md:text-6xl font-heading font-bold bg-gradient-to-r from-white via-white to-gray-500 bg-clip-text text-transparent">
                            Your Body Speaks.<br />
                            <span className="text-primary">Luna Listens.</span>
                        </h2>
                        <p className="text-xl text-gray-400 leading-relaxed">
                            Unlike generic trackers, Luna uses Opik AI to analyze your specific patterns. It doesn't just average days—it learns from your symptoms, mood, and energy levels to predict your body's needs before you even feel them.
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-12">
                            {[
                                { title: "Pattern Recognition", desc: "Identifies irregularities early." },
                                { title: "Symptom Correlation", desc: "Connects headaches to hormonal shifts." },
                                { title: "Personalized Advice", desc: "Actionable tips based on real-time data." }
                            ].map((item, i) => (
                                <div key={i} className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-left">
                                    <div className="h-1 w-12 bg-primary mb-4" />
                                    <h4 className="text-lg font-bold mb-2">{item.title}</h4>
                                    <p className="text-sm text-gray-400">{item.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Security Section */}
            <section id="security" className="py-24 bg-white">
                <div className="container mx-auto px-6">
                    <div className="flex flex-col md:flex-row items-center gap-16">
                        <div className="flex-1 space-y-6">
                            <Badge variant="outline" className="border-green-500 text-green-600 bg-green-50">Privacy First</Badge>
                            <h2 className="text-4xl font-heading font-bold text-gray-900">Your Data stays Yours.<br />Period.</h2>
                            <p className="text-lg text-gray-600">
                                In a world of surveillance, Luna is a sanctuary. We employ military-grade encryption and an optional Anonymous Mode to ensure your health data never leaves your control.
                            </p>
                            <ul className="space-y-4">
                                {[
                                    "End-to-End Encryption by default",
                                    "No data selling to third parties",
                                    "Anonymous 'Ghost Mode' available",
                                    "Europe-based secure servers"
                                ].map((item, i) => (
                                    <li key={i} className="flex items-center gap-3 text-gray-700 font-medium">
                                        <span className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center text-green-600 text-xs">✓</span>
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="flex-1 relative">
                            <div className="absolute inset-0 bg-gradient-to-tr from-green-50 to-transparent rounded-full filter blur-3xl opacity-60" />
                            <Card className="relative z-10 p-8 border-2 border-green-50 shadow-xl bg-white/80 backdrop-blur max-w-md mx-auto">
                                <div className="flex items-center justify-center w-16 h-16 rounded-full bg-green-100 text-3xl mb-6 mx-auto">
                                    🔒
                                </div>
                                <h3 className="text-xl font-bold text-center mb-2">Security Audit Passed</h3>
                                <p className="text-center text-sm text-gray-500 mb-6">Verified by independent security researchers.</p>
                                <div className="space-y-3">
                                    <div className="flex justify-between text-sm py-2 border-b">
                                        <span className="text-gray-500">Encryption</span>
                                        <span className="font-mono text-green-600">AES-256</span>
                                    </div>
                                    <div className="flex justify-between text-sm py-2 border-b">
                                        <span className="text-gray-500">Data Storage</span>
                                        <span className="font-mono text-green-600">Local + Encrypted Cloud</span>
                                    </div>
                                </div>
                            </Card>
                        </div>
                    </div>
                </div>
            </section>

            {/* Blog Section */}
            <section id="blog" className="py-24 bg-secondary/20">
                <div className="container mx-auto px-6">
                    <div className="flex items-end justify-between mb-12">
                        <div>
                            <h2 className="text-3xl font-heading font-bold mb-2">Luna Health Hub</h2>
                            <p className="text-muted-foreground">Expert articles on cycle health and wellness.</p>
                        </div>
                        <Button variant="ghost" className="hidden md:flex">View all articles →</Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            { title: "Understanding Your Follicular Phase", cat: "Education", img: "https://images.unsplash.com/photo-1544367563-12123d8959bd?auto=format&fit=crop&q=80" },
                            { title: "Nutrition for Hormone Balance", cat: "Wellness", img: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&q=80" },
                            { title: "The Science of Cycle Syncing", cat: "Lifestyle", img: "https://images.unsplash.com/photo-1515023115689-589c33041697?auto=format&fit=crop&q=80" }
                        ].map((post, i) => (
                            <motion.div
                                key={i}
                                whileHover={{ y: -10 }}
                                className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all cursor-pointer"
                            >
                                <div className="h-48 bg-gray-200 relative overflow-hidden">
                                    <img src={post.img} alt={post.title} className="w-full h-full object-cover" />
                                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-2 py-1 rounded text-xs font-bold uppercase tracking-wide">
                                        {post.cat}
                                    </div>
                                </div>
                                <div className="p-6">
                                    <h3 className="text-lg font-bold mb-2 line-clamp-2">{post.title}</h3>
                                    <p className="text-sm text-muted-foreground mb-4">Read in 5 mins</p>
                                    <span className="text-primary font-medium text-sm">Read Article</span>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-gray-900 text-gray-400 py-12 px-6">
                <div className="container mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div className="col-span-1 md:col-span-2">
                        <div className="text-2xl font-heading font-bold text-white mb-4">Luna AI</div>
                        <p className="max-w-xs text-sm">Empowering women with intelligent, secure, and beautiful cycle tracking technology.</p>
                    </div>
                    <div>
                        <h4 className="text-white font-bold mb-4">Product</h4>
                        <ul className="space-y-2 text-sm">
                            <li><a href="#" className="hover:text-white">Features</a></li>
                            <li><a href="#" className="hover:text-white">Opik AI</a></li>
                            <li><a href="#" className="hover:text-white">Pricing</a></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="text-white font-bold mb-4">Company</h4>
                        <ul className="space-y-2 text-sm">
                            <li><button onClick={() => onNavigate('about')} className="hover:text-white transition-colors">About Us</button></li>
                            <li><button onClick={() => onNavigate('privacy')} className="hover:text-white transition-colors">Privacy Policy</button></li>
                            <li><button onClick={() => onNavigate('contact')} className="hover:text-white transition-colors">Contact</button></li>
                        </ul>
                    </div>
                </div>
                <div className="container mx-auto mt-12 pt-8 border-t border-gray-800 text-xs text-center">
                    © 2026 Luna AI Health Technologies. All rights reserved.
                </div>
            </footer>
        </div>
    );
}
