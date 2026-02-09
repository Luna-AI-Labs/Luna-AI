/**
 * AI Routes - Luna AI Endpoints
 */

import express from 'express';
import { geminiService } from '../services/gemini.js';
import { track } from '../services/opik.js';

const router = express.Router();

// Wrap functions with Opik tracing
const trackedExtractSymptoms = track(geminiService.extractSymptoms, 'extractSymptoms');
const trackedGenerateInsight = track(geminiService.generateInsight, 'generateInsight');
const trackedChatResponse = track(geminiService.chatResponse, 'chatResponse');
const trackedExplainCause = track(geminiService.explainCause, 'explainCause');

/**
 * POST /api/ai/parse-log
 * Natural language symptom extraction
 */
router.post('/parse-log', async (req, res) => {
    try {
        const { text, mode } = req.body;

        if (!text || typeof text !== 'string') {
            return res.status(400).json({ error: 'Text is required' });
        }

        const result = await trackedExtractSymptoms(text, mode);

        res.json({
            success: true,
            data: result,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Parse log error:', error);
        res.status(500).json({ error: 'Failed to parse log' });
    }
});

/**
 * POST /api/ai/insight
 * Generate personalized daily insight
 */
router.post('/insight', async (req, res) => {
    try {
        const { cycleDay, phase, recentSymptoms, moodPatterns, mode, ...otherData } = req.body;

        if (!cycleDay && !phase && mode !== 'pregnancy') {
            // specific validation might be needed per mode, but lax for now
        }

        const insight = await trackedGenerateInsight({
            cycleDay,
            phase,
            recentSymptoms: recentSymptoms || [],
            moodPatterns: moodPatterns || [],
            ...otherData
        }, mode);

        res.json({
            success: true,
            insight,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Insight generation error:', error);
        res.status(500).json({ error: 'Failed to generate insight' });
    }
});

/**
 * POST /api/ai/chat
 * Health assistant conversation
 */
router.post('/chat', async (req, res) => {
    try {
        const { message, context, mode } = req.body;

        if (!message) {
            return res.status(400).json({ error: 'Message is required' });
        }

        const response = await trackedChatResponse(message, context || {}, mode);

        res.json({
            success: true,
            response,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Chat error:', error);
        res.status(500).json({ error: 'Failed to generate response' });
    }
});

/**
 * POST /api/ai/explain
 * Causal reasoning for "Why" questions
 */
router.post('/explain', async (req, res) => {
    try {
        const { observation, userData } = req.body;

        if (!observation) {
            return res.status(400).json({ error: 'Observation is required' });
        }

        const explanation = await trackedExplainCause(observation, userData || {});

        res.json({
            success: true,
            explanation,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Explain error:', error);
        res.status(500).json({ error: 'Failed to generate explanation' });
    }
});

export default router;
