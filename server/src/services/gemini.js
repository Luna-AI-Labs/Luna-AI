import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import { MODE_PROMPTS, SHARED_PROMPTS } from '../modes/prompts.js';
import { openaiService } from './openai.js';

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Helper to get prompts for a specific mode
function getPromptsForMode(mode) {
    return MODE_PROMPTS[mode] || MODE_PROMPTS.period; // Fallback to period
}

/**
 * Extract symptoms from natural language
 */
export async function extractSymptoms(userInput, mode = 'period') {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    const prompts = getPromptsForMode(mode);

    try {
        const result = await model.generateContent([
            prompts.symptomExtractor,
            `Input: "${userInput}"\nOutput:`
        ]);

        const response = result.response.text();
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }
        throw new Error('No valid JSON in response');
    } catch (error) {
        console.error('Gemini extractSymptoms error:', error.message);
        console.log('🔄 Switching to OpenAI for extractSymptoms...');

        try {
            return await openaiService.extractSymptoms(userInput, mode);
        } catch (openaiError) {
            console.error('OpenAI extractSymptoms error:', openaiError.message);
            // Fallback: Just save the raw input
            return {
                symptoms: [],
                severity: 'low',
                mood: 'neutral',
                energy: 'medium',
                notes: userInput, // Important: keep the original text
                aiAnalysis: false // Flag to UI
            };
        }
    }
}

/**
 * Generate personalized daily insight
 */
export async function generateInsight(cycleData, mode = 'period') {
    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
        const prompts = getPromptsForMode(mode);

        let prompt = prompts.insightGenerator
            .replace('{{cycleDay}}', cycleData.cycleDay)
            .replace('{{phase}}', cycleData.phase)
            .replace('{{recentSymptoms}}', JSON.stringify(cycleData.recentSymptoms || []))
            .replace('{{moodPatterns}}', JSON.stringify(cycleData.moodPatterns || []));

        // Mode-specific replacements (best effort)
        if (mode === 'conceive') {
            prompt = prompt
                .replace('{{isFertile}}', cycleData.isFertile ? 'Yes' : 'No')
                .replace('{{ovulationStatus}}', cycleData.ovulationStatus || 'Pending');
        } else if (mode === 'pregnancy') {
            prompt = prompt
                .replace('{{week}}', cycleData.week || 'unknown')
                .replace('{{trimester}}', cycleData.trimester || 'unknown')
                .replace('{{babySize}}', cycleData.babySize || 'unknown');
        }

        const result = await model.generateContent(prompt);
        return result.response.text();
    } catch (error) {
        console.error('Gemini generateInsight error:', error.message);
        console.log('🔄 Switching to OpenAI for generateInsight...');

        try {
            return await openaiService.generateInsight(cycleData, mode);
        } catch (openaiError) {
            console.error('OpenAI generateInsight error:', openaiError.message);
            return "Stay hydrated and listen to your body today. (AI Service is currently experiencing high traffic)";
        }
    }
}

/**
 * Health assistant chat response
 */
export async function chatResponse(message, context, mode = 'period') {
    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
        const prompts = getPromptsForMode(mode);

        let prompt = prompts.healthAssistant
            .replace('{{cycleDay}}', context.cycleDay || 'unknown')
            .replace('{{phase}}', context.phase || 'unknown')
            .replace('{{recentLogs}}', JSON.stringify(context.recentLogs || []));

        if (mode === 'pregnancy') {
            prompt = prompt.replace('{{week}}', context.week || 'unknown');
        }

        const result = await model.generateContent([prompt, `User: ${message}`]);
        return result.response.text();
    } catch (error) {
        console.error('Gemini chatResponse error:', error.message);
        console.log('🔄 Switching to OpenAI for chatResponse...');

        try {
            return await openaiService.chatResponse(message, context, mode);
        } catch (openaiError) {
            console.error('OpenAI chatResponse error:', openaiError.message);
            return "I'm currently unable to process complex requests due to high traffic. Please try again later. In the meantime, drinking water and resting is always good advice!";
        }
    }
}


/**
 * Causal reasoning for "Why" explanations
 */
export async function explainCause(observation, userData) {
    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

        const prompt = SHARED_PROMPTS.causalReasoning
            .replace('{{observation}}', observation)
            .replace('{{userData}}', JSON.stringify(userData, null, 2));

        const result = await model.generateContent(prompt);
        return result.response.text();
    } catch (error) {
        console.error('Gemini explainCause error:', error.message);
        console.log('🔄 Switching to OpenAI for explainCause...');

        try {
            return await openaiService.explainCause(observation, userData);
        } catch (openaiError) {
            console.error('OpenAI explainCause error:', openaiError.message);
            return "We couldn't generate a detailed explanation right now. It might be due to temporary service limits.";
        }
    }
}

export const geminiService = {
    extractSymptoms,
    generateInsight,
    chatResponse,
    explainCause,
    MODE_PROMPTS // Export for Opik optimization
};
