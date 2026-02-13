import OpenAI from 'openai';
import dotenv from 'dotenv';
import { MODE_PROMPTS, SHARED_PROMPTS } from '../modes/prompts.js';

dotenv.config();

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// Helper to get prompts for a specific mode
function getPromptsForMode(mode) {
    return MODE_PROMPTS[mode] || MODE_PROMPTS.period;
}

export async function extractSymptoms(userInput, mode = 'period') {
    const prompts = getPromptsForMode(mode);
    const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
            { role: "system", content: prompts.symptomExtractor },
            { role: "user", content: `Input: "${userInput}"` }
        ],
        response_format: { type: "json_object" }
    });

    const content = response.choices[0].message.content;
    return JSON.parse(content);
}

export async function generateInsight(cycleData, mode = 'period') {
    const prompts = getPromptsForMode(mode);
    let prompt = prompts.insightGenerator
        .replace('{{cycleDay}}', cycleData.cycleDay)
        .replace('{{phase}}', cycleData.phase)
        .replace('{{recentSymptoms}}', JSON.stringify(cycleData.recentSymptoms || []))
        .replace('{{moodPatterns}}', JSON.stringify(cycleData.moodPatterns || []));

    // Mode-specific replacements
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

    const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "user", content: prompt }]
    });

    return response.choices[0].message.content;
}

export async function chatResponse(message, context, mode = 'period') {
    const prompts = getPromptsForMode(mode);
    let prompt = prompts.healthAssistant
        .replace('{{cycleDay}}', context.cycleDay || 'unknown')
        .replace('{{phase}}', context.phase || 'unknown')
        .replace('{{recentLogs}}', JSON.stringify(context.recentLogs || []));

    if (mode === 'pregnancy') {
        prompt = prompt.replace('{{week}}', context.week || 'unknown');
    }

    const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
            { role: "system", content: prompt },
            { role: "user", content: message }
        ]
    });

    return response.choices[0].message.content;
}

export async function explainCause(observation, userData) {
    const prompt = SHARED_PROMPTS.causalReasoning
        .replace('{{observation}}', observation)
        .replace('{{userData}}', JSON.stringify(userData, null, 2));

    const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "user", content: prompt }]
    });

    return response.choices[0].message.content;
}

export const openaiService = {
    extractSymptoms,
    generateInsight,
    chatResponse,
    explainCause
};
