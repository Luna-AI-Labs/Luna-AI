import { motion } from 'framer-motion';
import { ArrowLeft, Heart, Shield, Users, Sparkles } from 'lucide-react';
import { Button } from '../ui/Button';

interface PageProps {
    onBack: () => void;
}

export default function AboutPage({ onBack }: PageProps) {
    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <nav className="sticky top-0 z-50 px-6 py-4 bg-background/80 backdrop-blur-md border-b border-border/50">
                <div className="max-w-4xl mx-auto flex items-center gap-4">
                    <Button variant="ghost" size="sm" onClick={onBack}>
                        <ArrowLeft className="w-4 h-4 mr-2" /> Back
                    </Button>
                    <span className="font-heading font-bold">Luna AI</span>
                </div>
            </nav>

            {/* Hero */}
            <section className="py-20 px-6">
                <div className="max-w-4xl mx-auto text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <h1 className="text-4xl md:text-5xl font-heading font-bold mb-6">
                            About Luna AI
                        </h1>
                        <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                            We're on a mission to revolutionize women's health through intelligent, personalized, and privacy-first technology.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Mission */}
            <section className="py-16 px-6 bg-secondary/30">
                <div className="max-w-4xl mx-auto">
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <div>
                            <h2 className="text-3xl font-heading font-bold mb-4">Our Mission</h2>
                            <p className="text-muted-foreground leading-relaxed mb-4">
                                Luna AI was born from a simple belief: every woman deserves access to intelligent health insights that adapt to her unique body.
                            </p>
                            <p className="text-muted-foreground leading-relaxed">
                                We combine cutting-edge AI technology with deep respect for privacy to create a health companion that truly understands you—without ever compromising your data.
                            </p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            {[
                                { icon: Heart, label: 'User-Centric', desc: 'Built for real needs' },
                                { icon: Shield, label: 'Privacy-First', desc: 'Your data, your control' },
                                { icon: Sparkles, label: 'AI-Powered', desc: 'Smart predictions' },
                                { icon: Users, label: 'Inclusive', desc: 'For every journey' }
                            ].map((item, i) => (
                                <motion.div
                                    key={item.label}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                    className="p-4 rounded-2xl bg-white border border-border"
                                >
                                    <item.icon className="w-8 h-8 text-primary mb-3" />
                                    <h3 className="font-bold mb-1">{item.label}</h3>
                                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Opik AI */}
            <section className="py-16 px-6">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-3xl font-heading font-bold mb-4">Powered by Opik AI</h2>
                    <p className="text-muted-foreground max-w-xl mx-auto mb-8">
                        Our partnership with Opik brings state-of-the-art machine learning to cycle tracking, enabling predictions that learn and adapt to your unique patterns.
                    </p>
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-black text-white text-sm">
                        <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                        Opik AI Integration Active
                    </div>
                </div>
            </section>

            {/* Team placeholder */}
            <section className="py-16 px-6 bg-secondary/30">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-3xl font-heading font-bold mb-4">Our Team</h2>
                    <p className="text-muted-foreground mb-8">
                        A diverse team of engineers, designers, and health experts united by a common goal.
                    </p>
                    <div className="grid grid-cols-3 gap-6 max-w-md mx-auto">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="aspect-square rounded-full bg-gradient-to-br from-primary/20 to-accent/20" />
                        ))}
                    </div>
                </div>
            </section>

            {/* Footer CTA */}
            <section className="py-20 px-6 text-center">
                <h2 className="text-2xl font-heading font-bold mb-4">Join the Luna Community</h2>
                <p className="text-muted-foreground mb-6">Start your personalized health journey today.</p>
                <Button onClick={onBack} size="lg">
                    Get Started
                </Button>
            </section>
        </div>
    );
}
