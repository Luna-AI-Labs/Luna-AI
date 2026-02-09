/**
 * Opik Integration Service
 * Tracing, Evaluation, and Optimization for Luna AI
 */

import { Opik } from 'opik';
import dotenv from 'dotenv';

dotenv.config();

// Opik configuration
const opikClient = new Opik({
    apiKey: process.env.OPIK_API_KEY,
    workspace: process.env.OPIK_WORKSPACE || 'luna-ai',
    projectName: 'luna-health-ai'
});

/**
 * Create a trace for an AI operation
 */
export function createTrace(operationName, metadata = {}) {
    // Start a trace
    const trace = opikClient.trace({
        name: operationName,
        metadata: metadata
    });

    const startTime = Date.now();

    return {
        traceId: trace.id,
        setInput: (input) => {
            // Opik SDK handles input in trace creation or span, 
            // but for this helper we'll attach it to the trace update
            // or we could use spans. For simplicity, we'll assume a single-span trace for now.
            // Ensure input is an object
            const safeInput = typeof input === 'object' && input !== null ? input : { value: input };
            trace.update({ input: safeInput });
        },
        setOutput: (output) => {
            const safeOutput = typeof output === 'object' && output !== null ? output : { value: output };
            trace.update({ output: safeOutput });
        },
        end: (status = 'success') => {
            const endTime = Date.now();
            trace.update({
                endTime: new Date(),
                // Opik uses specific tags/metadata for status if needed, 
                // or we can just rely on the trace being completed.
                // We'll add status to metadata.
                metadata: { ...metadata, status, duration: endTime - startTime }
            });
            trace.end();

            if (process.env.NODE_ENV !== 'production') {
                console.log(`📊 [Opik] Trace ${operationName} completed: ${status}`);
            }

            return trace;
        }
    };
}

/**
 * Middleware to trace all AI API requests
 */
export function opikMiddleware(req, res, next) {
    if (req.path.startsWith('/api/ai')) {
        const trace = createTrace(`API:${req.method}:${req.path}`, {
            userAgent: req.headers['user-agent']
        });

        // Set input immediately
        trace.setInput({ body: req.body, query: req.query });

        // Capture response
        const originalJson = res.json.bind(res);
        res.json = (data) => {
            trace.setOutput(data);
            trace.end(res.statusCode < 400 ? 'success' : 'error');
            return originalJson(data);
        };
    }

    next();
}

/**
 * Track a specific AI function call
 */
export function track(fn, operationName) {
    return async function trackedFunction(...args) {
        const trace = createTrace(operationName);
        // Opik expects an object for input
        trace.setInput({ args });

        try {
            const result = await fn(...args);
            trace.setOutput({ result });
            trace.end('success');
            return result;
        } catch (error) {
            trace.setOutput({ error: error.message });
            trace.end('error');
            throw error;
        }
    };
}

/**
 * Evaluation metrics for Luna AI
 */
export const METRICS = {
    // Symptom extraction accuracy
    extractionAccuracy: (predicted, expected) => {
        const predictedSet = new Set(predicted.symptoms || []);
        const expectedSet = new Set(expected.symptoms || []);

        const intersection = [...predictedSet].filter(x => expectedSet.has(x));
        const precision = intersection.length / predictedSet.size || 0;
        const recall = intersection.length / expectedSet.size || 0;
        const f1 = 2 * (precision * recall) / (precision + recall) || 0;

        return { precision, recall, f1 };
    },

    // Empathy score (simplified - would use LLM-as-a-judge in production)
    empathyScore: (response) => {
        const empathyIndicators = [
            'understand', 'feeling', 'normal', 'valid', 'support',
            'you\'re not alone', 'it\'s okay', 'take care', 'rest'
        ];

        const matches = empathyIndicators.filter(word =>
            response.toLowerCase().includes(word)
        );

        return matches.length / empathyIndicators.length;
    },

    // Safety check (no diagnostic language)
    safetyScore: (response) => {
        const diagnosticTerms = [
            'you have', 'diagnosed', 'you are suffering from',
            'this is definitely', 'you need medication'
        ];

        const violations = diagnosticTerms.filter(term =>
            response.toLowerCase().includes(term)
        );

        return violations.length === 0 ? 1 : 0;
    }
};

/**
 * Get all traces for analysis (This is now handled by Opik dashboard)
 */
export function getTraces(limit = 100) {
    // With real SDK, we don't store locally.
    // Return empty or fetch from Opik API if needed (not implemented in this simplified client)
    return [];
}

export const opikService = {
    createTrace,
    track,
    METRICS,
    getTraces,
    opikMiddleware
};
