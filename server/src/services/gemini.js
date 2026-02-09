import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import { MODE_PROMPTS, SHARED_PROMPTS } from '../modes/prompts.js';

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

    const result = await model.generateContent([
        prompts.symptomExtractor,
        `Input: "${userInput}"\nOutput:`
    ]);

    const response = result.response.text();

    try {
        // Parse JSON response
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }
        throw new Error('No valid JSON in response');
    } catch (error) {
        console.error('Failed to parse symptom extraction:', error);
        return {
            symptoms: [],
            severity: 'medium',
            mood: 'neutral',
            energy: 'medium',
            notes: userInput,
            parseError: true
        };
    }
}

/**
 * Generate personalized daily insight
 */
export async function generateInsight(cycleData, mode = 'period') {
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
}

/**
 * Health assistant chat response
 */
export async function chatResponse(message, context, mode = 'period') {
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
}


/**
 * Causal reasoning for "Why" explanations
 */
export async function explainCause(observation, userData) {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const prompt = SHARED_PROMPTS.causalReasoning
        .replace('{{observation}}', observation)
        .replace('{{userData}}', JSON.stringify(userData, null, 2));

    const result = await model.generateContent(prompt);
    return result.response.text();
}

export const geminiService = {
    extractSymptoms,
    generateInsight,
    chatResponse,
    explainCause,
    MODE_PROMPTS // Export for Opik optimization
};
