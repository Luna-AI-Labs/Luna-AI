import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Mail, MessageSquare, Send, MapPin, Clock } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';

interface PageProps {
    onBack: () => void;
}

export default function ContactPage({ onBack }: PageProps) {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Simulate form submission
        setSubmitted(true);
    };

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

            {/* Content */}
            <section className="py-20 px-6">
                <div className="max-w-4xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center mb-16"
                    >
                        <h1 className="text-4xl md:text-5xl font-heading font-bold mb-6">
                            Get in Touch
                        </h1>
                        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                            Have questions, feedback, or need support? We'd love to hear from you.
                        </p>
                    </motion.div>

                    <div className="grid md:grid-cols-3 gap-8 mb-12">
                        {[
                            { icon: Mail, label: 'Email', value: 'hello@luna-ai.health', href: 'mailto:hello@luna-ai.health' },
                            { icon: Clock, label: 'Response Time', value: 'Within 24 hours', href: null },
                            { icon: MapPin, label: 'Location', value: 'Remote-first team', href: null }
                        ].map((item, i) => (
                            <motion.div
                                key={item.label}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                            >
                                <Card className="p-6 text-center h-full">
                                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                                        <item.icon className="w-6 h-6 text-primary" />
                                    </div>
                                    <h3 className="font-bold mb-1">{item.label}</h3>
                                    {item.href ? (
                                        <a href={item.href} className="text-primary hover:underline">{item.value}</a>
                                    ) : (
                                        <p className="text-muted-foreground">{item.value}</p>
                                    )}
                                </Card>
                            </motion.div>
                        ))}
                    </div>

                    {/* Contact Form */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                    >
                        <Card className="p-8 max-w-2xl mx-auto">
                            {submitted ? (
                                <div className="text-center py-8">
                                    <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                                        <Send className="w-8 h-8 text-green-600" />
                                    </div>
                                    <h2 className="text-2xl font-bold mb-2">Message Sent!</h2>
                                    <p className="text-muted-foreground mb-6">
                                        Thank you for reaching out. We'll get back to you within 24 hours.
                                    </p>
                                    <Button variant="outline" onClick={() => setSubmitted(false)}>
                                        Send Another Message
                                    </Button>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="flex items-center gap-3 mb-6">
                                        <MessageSquare className="w-6 h-6 text-primary" />
                                        <h2 className="text-xl font-bold">Send us a message</h2>
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium mb-2">Name</label>
                                            <input
                                                type="text"
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                className="input-premium w-full"
                                                placeholder="Your name"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-2">Email</label>
                                            <input
                                                type="email"
                                                value={formData.email}
                                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                className="input-premium w-full"
                                                placeholder="you@example.com"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium mb-2">Subject</label>
                                        <select
                                            value={formData.subject}
                                            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                            className="input-premium w-full"
                                            required
                                        >
                                            <option value="">Select a topic</option>
                                            <option value="support">Technical Support</option>
                                            <option value="feedback">Feature Feedback</option>
                                            <option value="privacy">Privacy Question</option>
                                            <option value="billing">Billing Inquiry</option>
                                            <option value="partnership">Partnership</option>
                                            <option value="other">Other</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium mb-2">Message</label>
                                        <textarea
                                            value={formData.message}
                                            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                            className="input-premium w-full min-h-[150px] resize-none"
                                            placeholder="How can we help you?"
                                            required
                                        />
                                    </div>

                                    <Button type="submit" className="w-full" size="lg">
                                        Send Message <Send className="w-4 h-4 ml-2" />
                                    </Button>
                                </form>
                            )}
                        </Card>
                    </motion.div>

                    {/* FAQ Link */}
                    <div className="text-center mt-12">
                        <p className="text-muted-foreground mb-2">Looking for quick answers?</p>
                        <Button variant="ghost">View FAQ →</Button>
                    </div>
                </div>
            </section>
        </div>
    );
}
