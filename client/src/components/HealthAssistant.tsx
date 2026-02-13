/**
 * Enhanced AI Health Assistant
 * 
 * Mode-aware chat with contextual prompts, symptom checker,
 * and personalized greetings based on current mode.
 */

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useWallets } from '@privy-io/react-auth';
import { PaymentService } from '../services/PaymentService';

type AppMode = 'period' | 'conceive' | 'pregnancy' | 'perimenopause';

interface HealthAssistantProps {
    cycleStatus: any;
    currentMode?: AppMode;
}

interface Message {
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
}

// Mode-specific configurations
const MODE_CONFIG: Record<AppMode, {
    greeting: (ctx: any) => string;
    prompts: string[];
    persona: string;
}> = {
    period: {
        greeting: (ctx: any) => `Hi! I'm Luna, your cycle companion 🌙\n\nYou're on Day ${ctx?.cycleDay || '?'} of your cycle${ctx?.phase ? ` (${ctx.phase} phase)` : ''}.\n\nHow can I help you today?`,
        prompts: ["Why am I so tired?", "What helps with cramps?", "When am I most fertile?", "Why is my mood changing?"],
        persona: "Luna - Period Tracking"
    },
    conceive: {
        greeting: (ctx: any) => `Hey there! I'm Luna, your fertility guide 🥚✨\n\n${ctx?.fertileWindow ? "You're in your fertile window right now! This is a great time." : `Your next fertile window is coming up soon.`}\n\nWhat would you like to know?`,
        prompts: ["Best time to conceive?", "What is BBT tracking?", "How to read OPK tests?", "Tips to improve fertility"],
        persona: "Luna - Fertility Guide"
    },
    pregnancy: {
        greeting: (ctx: any) => `Hello, mama! I'm Luna 🤰💕\n\nYou're in Week ${ctx?.currentWeek || '?'} of your journey. Your little one is growing every day!\n\nHow can I support you?`,
        prompts: ["What's happening this week?", "Safe exercises for me?", "Foods to avoid?", "When to call my doctor?"],
        persona: "Luna - Pregnancy Support"
    },
    perimenopause: {
        greeting: (ctx: any) => `Hi there! I'm Luna 🦋\n\nI'm here to support you through this transition. It's been ${ctx?.daysSincePeriod || 'a while'} days since your last period.\n\nWhat's on your mind?`,
        prompts: ["Managing hot flashes", "Sleep better at night", "Mood swing tips", "Should I see a doctor?"],
        persona: "Luna - Midlife Wellness"
    }
};

export default function HealthAssistant({ cycleStatus, currentMode = 'period' }: HealthAssistantProps) {
    const config = MODE_CONFIG[currentMode];
    const { wallets, user } = useAuth(); // useAuth wraps usePrivy, but we need dbUser
    const { dbUser } = useAuth();
    const wallet = wallets && wallets.length > 0 ? wallets[0] : null;

    const [messages, setMessages] = useState<Message[]>([
        {
            role: 'assistant',
            content: config.greeting(cycleStatus),
            timestamp: new Date()
        }
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [showSymptomChecker, setShowSymptomChecker] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Update greeting when mode changes
    useEffect(() => {
        const newConfig = MODE_CONFIG[currentMode];
        setMessages([{
            role: 'assistant',
            content: newConfig.greeting(cycleStatus),
            timestamp: new Date()
        }]);
    }, [currentMode, cycleStatus]);

    const handleSend = async () => {
        if (!input.trim() || !dbUser) return;

        const userMessage: Message = {
            role: 'user',
            content: input,
            timestamp: new Date()
        };

        setMessages((prev) => [...prev, userMessage]);
        setInput('');
        setIsTyping(true);

        try {
            const response = await PaymentService.secureFetch('http://localhost:3001/api/ai/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-user-id': dbUser.id.toString()
                },
                body: JSON.stringify({
                    message: input,
                    context: { ...cycleStatus, mode: currentMode }
                })
            }, wallet);

            const data = await response.json();

            if (data.success) {
                setMessages((prev) => [...prev, {
                    role: 'assistant',
                    content: data.response,
                    timestamp: new Date()
                }]);
            }
        } catch (error) {
            // Demo mode response
            const demoResponse = getDemoResponse(input, cycleStatus, currentMode);
            setMessages((prev) => [...prev, {
                role: 'assistant',
                content: demoResponse,
                timestamp: new Date()
            }]);
        } finally {
            setIsTyping(false);
        }
    };

    const getDemoResponse = (question: string, context: any, mode: AppMode): string => {
        const q = question.toLowerCase();

        // Mode-specific responses
        if (mode === 'pregnancy') {
            if (q.includes('week') || q.includes('happening')) {
                return `At Week ${context?.currentWeek || '?'}, your baby is growing rapidly! 🌟\n\n**This week:**\n• Baby is about the size of a ${context?.babySize || 'small fruit'}\n• Major organs are developing\n• You might feel more movement\n\n**Tips for you:**\n• Stay hydrated\n• Continue prenatal vitamins\n• Rest when you need to\n\nAny specific concerns I can help with? 💕`;
            }
            if (q.includes('exercise') || q.includes('workout')) {
                return `Great question about staying active! 🏃‍♀️\n\n**Safe exercises during pregnancy:**\n• Walking (low impact, can do daily)\n• Swimming (takes pressure off joints)\n• Prenatal yoga (flexibility + relaxation)\n• Light strength training (with modifications)\n\n**Exercises to avoid:**\n• Contact sports\n• Hot yoga or activities in extreme heat\n• Exercises lying flat on back (after 1st trimester)\n\nAlways listen to your body and consult your provider! 🤍`;
            }
        }

        if (mode === 'conceive') {
            if (q.includes('bbt') || q.includes('temperature')) {
                return `BBT (Basal Body Temperature) tracking is a great fertility tool! 📊\n\n**How it works:**\n• Take your temperature first thing every morning\n• Before getting out of bed, moving, or drinking\n• Use a BBT-specific thermometer (more precise)\n\n**What to look for:**\n• A sustained rise of 0.2-0.5°F after ovulation\n• This confirms ovulation happened\n• The shift stays elevated until your next period\n\nWould you like tips on interpreting your chart? 🥚`;
            }
            if (q.includes('opk') || q.includes('ovulation test')) {
                return `OPK (Ovulation Predictor Kit) tips! 🔬\n\n**When to test:**\n• Start testing a few days before expected ovulation\n• Test in the afternoon (LH surges then)\n• Don't drink lots of fluids 2hrs before\n\n**Reading results:**\n• Positive = test line as dark or darker than control\n• Positive means ovulation in 12-36 hours\n• This is your most fertile time!\n\nKeep tracking - you're doing great! ✨`;
            }
        }

        if (mode === 'perimenopause') {
            if (q.includes('hot flash') || q.includes('flush')) {
                return `Hot flashes are one of the most common perimenopause symptoms. Let me help! 🔥\n\n**Quick relief:**\n• Dress in layers you can remove\n• Keep a small fan or cooling towel nearby\n• Sip cold water when you feel one coming\n\n**Long-term strategies:**\n• Identify triggers (spicy food, alcohol, stress)\n• Regular exercise can reduce frequency\n• Deep breathing when they start\n\n**When to see a doctor:**\n• If they're severely disrupting sleep or life\n• To discuss hormone therapy options\n\nYou're not alone in this! 🦋`;
            }
            if (q.includes('sleep') || q.includes('insomnia')) {
                return `Sleep issues during perimenopause are so frustrating - I hear you! 😴\n\n**Improve your sleep:**\n• Keep bedroom cool (night sweats!)\n• Consistent sleep/wake times\n• Limit caffeine after noon\n• Avoid screens 1hr before bed\n\n**For night sweats:**\n• Moisture-wicking pajamas\n• Breathable bedding\n• Small fan by bedside\n\nWould you like to log your sleep patterns to find your best routine? 💜`;
            }
        }

        // Fallback general responses
        if (q.includes('cramp') || q.includes('pain')) {
            return `Cramps can be tough! Here's what might help 💗\n\n• **Warmth**: Heating pad on your lower abdomen\n• **Movement**: Gentle yoga or a short walk\n• **Hydration**: Warm water or ginger tea\n• **Magnesium**: Dark chocolate, bananas\n\nIf cramps are severe or disruptive, chat with your healthcare provider. You deserve comfort! 🌸`;
        }

        if (q.includes('mood') || q.includes('emotional')) {
            return `Mood changes are so valid - your hormones are doing a lot! 🤗\n\n**What's happening:**\n• Estrogen affects serotonin (mood chemical)\n• Fluctuations can cause emotional shifts\n\n**What helps:**\n• Acknowledge feelings without judgment\n• Get outside for natural light\n• Move your body gently\n• Rest when needed\n\nYou're not "too emotional" - you're human! 💜`;
        }

        return `That's a great question! 🌙\n\nI'm here to help with anything related to ${mode === 'period' ? 'your cycle' : mode === 'conceive' ? 'fertility' : mode === 'pregnancy' ? 'your pregnancy journey' : 'this transition'}.\n\nFor specific medical advice, always consult your healthcare provider. Is there something specific about your symptoms or cycle I can help explain? 💫`;
    };

    return (
        <div className="flex flex-col h-[calc(100vh-200px)]">
            {/* Mode Indicator */}
            <div className="flex items-center justify-between mb-4 px-1">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-primary to-accent flex items-center justify-center text-white text-sm">
                        {currentMode === 'period' ? '🌸' : currentMode === 'conceive' ? '🥚' : currentMode === 'pregnancy' ? '🤰' : '🦋'}
                    </div>
                    <span className="text-xs text-muted-foreground font-medium">{config.persona}</span>
                </div>
                <button
                    onClick={() => setShowSymptomChecker(!showSymptomChecker)}
                    className="text-xs px-3 py-1.5 rounded-full border border-primary/30 hover:bg-primary/5 transition-colors flex items-center gap-1"
                >
                    🩺 Symptom Check
                </button>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto space-y-4 pb-4">
                <AnimatePresence>
                    {messages.map((message, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={message.role === 'user' ? 'flex justify-end' : ''}
                        >
                            <div className={message.role === 'user' ? 'user-bubble' : 'ai-bubble'}>
                                {message.role === 'assistant' && (
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="w-6 h-6 rounded-full bg-gradient-to-r from-primary to-accent flex items-center justify-center text-white text-xs">
                                            🌙
                                        </div>
                                        <span className="text-xs text-muted-foreground">Luna</span>
                                    </div>
                                )}
                                <div className="whitespace-pre-wrap text-sm leading-relaxed">
                                    {message.content}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {isTyping && (
                    <div className="ai-bubble inline-block">
                        <div className="flex gap-1">
                            <span className="w-2 h-2 bg-primary rounded-full animate-bounce"></span>
                            <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></span>
                            <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Mode-Specific Suggestion Pills */}
            {messages.length <= 2 && (
                <div className="flex flex-wrap gap-2 pb-3">
                    {config.prompts.map((prompt) => (
                        <button
                            key={prompt}
                            onClick={() => setInput(prompt)}
                            className="text-xs px-3 py-2 rounded-full bg-primary/10 hover:bg-primary/20 transition-colors text-foreground"
                        >
                            {prompt}
                        </button>
                    ))}
                </div>
            )}

            {/* Input Area */}
            <div className="glass-card p-3 flex gap-2">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Ask Luna anything..."
                    className="luna-input flex-1"
                    disabled={isTyping}
                />
                <button
                    onClick={handleSend}
                    disabled={!input.trim() || isTyping}
                    className="luna-btn px-6 disabled:opacity-50"
                >
                    Send
                </button>
            </div>
        </div>
    );
}
