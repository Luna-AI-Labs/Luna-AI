import { motion } from 'framer-motion';
import { ArrowLeft, Shield, Lock, Eye, Server, Trash2 } from 'lucide-react';
import { Button } from '../ui/Button';

interface PageProps {
    onBack: () => void;
}

export default function PrivacyPage({ onBack }: PageProps) {
    const sections = [
        {
            icon: Lock,
            title: 'Data Encryption',
            content: 'All your health data is encrypted using AES-256 encryption, both in transit and at rest. Your information is protected by the same security standards used by financial institutions.'
        },
        {
            icon: Eye,
            title: 'What We Collect',
            content: 'We collect only the data necessary to provide personalized predictions: cycle dates, symptoms you choose to log, and basic profile information. We never collect data without your explicit consent.'
        },
        {
            icon: Server,
            title: 'Data Storage',
            content: 'Your data is stored on secure, GDPR-compliant servers located in the European Union. We implement strict access controls and regular security audits.'
        },
        {
            icon: Trash2,
            title: 'Your Rights',
            content: 'You can export, modify, or permanently delete your data at any time from your profile settings. When you delete your account, all data is removed within 30 days.'
        }
    ];

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
                <div className="max-w-4xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center mb-16"
                    >
                        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
                            <Shield className="w-8 h-8 text-green-600" />
                        </div>
                        <h1 className="text-4xl md:text-5xl font-heading font-bold mb-6">
                            Privacy Policy
                        </h1>
                        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                            Your privacy is our top priority. Here's how we protect your personal health data.
                        </p>
                        <p className="text-sm text-muted-foreground mt-4">
                            Last updated: February 2026
                        </p>
                    </motion.div>

                    {/* Sections */}
                    <div className="space-y-8">
                        {sections.map((section, i) => (
                            <motion.div
                                key={section.title}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className="p-6 rounded-2xl bg-white border border-border"
                            >
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                                        <section.icon className="w-5 h-5 text-primary" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold mb-2">{section.title}</h2>
                                        <p className="text-muted-foreground leading-relaxed">{section.content}</p>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Anonymous Mode */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="mt-12 p-6 rounded-2xl bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20"
                    >
                        <h3 className="text-lg font-bold mb-2">🔒 Anonymous Mode</h3>
                        <p className="text-muted-foreground mb-4">
                            Enable Ghost Mode for maximum privacy. In this mode, all data is stored locally on your device only—nothing is sent to our servers.
                        </p>
                        <Button variant="outline" size="sm">Learn More</Button>
                    </motion.div>

                    {/* Detailed Policy */}
                    <div className="mt-16 prose prose-gray max-w-none">
                        <h2 className="text-2xl font-heading font-bold mb-4">Full Privacy Policy</h2>

                        <h3>1. Information We Collect</h3>
                        <p className="text-muted-foreground">
                            Luna AI collects information you provide directly, including: name, email address, birth year, cycle data (period dates, symptoms, mood), and health conditions you choose to share.
                        </p>

                        <h3>2. How We Use Your Information</h3>
                        <p className="text-muted-foreground">
                            We use your data to: provide personalized predictions and insights, improve our AI models (using anonymized, aggregated data), send you notifications you've opted into, and ensure account security.
                        </p>

                        <h3>3. Data Sharing</h3>
                        <p className="text-muted-foreground">
                            We never sell your personal data. We may share anonymized, aggregated statistics for research purposes, but only with your consent and in a way that cannot identify you individually.
                        </p>

                        <h3>4. Third-Party Services</h3>
                        <p className="text-muted-foreground">
                            We use Clerk for secure authentication and Opik AI for predictions. These partners are contractually bound to protect your data and use it only for providing services to Luna AI.
                        </p>

                        <h3>5. Contact Us</h3>
                        <p className="text-muted-foreground">
                            For privacy questions or data requests, email us at privacy@luna-ai.health
                        </p>
                    </div>
                </div>
            </section>
        </div>
    );
}
