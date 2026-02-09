/**
 * Prediction Routes
 * API endpoints for cycle prediction and feedback
 */

import express from 'express';
import { CyclePredictionService } from '../services/prediction/cyclePrediction.js';
import { FeedbackLoop } from '../services/prediction/feedbackLoop.js';
import { db } from '../db/database.js';

const router = express.Router();

const getUserId = (req) => req.headers['x-user-id'] || 1;

/**
 * GET /api/prediction
 * Get predictions for the current user
 */
router.get('/', async (req, res) => {
    try {
        const userId = getUserId(req);
        const predictions = await CyclePredictionService.calculatePredictions(userId);

        if (!predictions) {
            return res.json({
                success: true,
                hasData: false,
                message: 'Not enough cycle data for predictions. Log at least one period.'
            });
        }

        res.json({
            success: true,
            hasData: true,
            ...predictions
        });
    } catch (error) {
        console.error('Prediction error:', error);
        res.status(500).json({ error: 'Failed to generate predictions' });
    }
});

/**
 * POST /api/prediction/historical
 * Import historical period data for better predictions
 */
router.post('/historical', async (req, res) => {
    try {
        const userId = getUserId(req);
        const { periods } = req.body;

        if (!periods || !Array.isArray(periods)) {
            return res.status(400).json({ error: 'periods array is required' });
        }

        // Insert all historical periods
        for (const period of periods) {
            if (!period.startDate) continue;
            await db.query(
                'INSERT INTO periods (user_id, start_date, end_date, created_at) VALUES ($1, $2, $3, NOW())',
                [userId, period.startDate, period.endDate || null]
            );
        }

        // Recalculate predictions with new data
        const predictions = await CyclePredictionService.calculatePredictions(userId);

        res.json({
            success: true,
            message: `Imported ${periods.length} periods`,
            predictions
        });
    } catch (error) {
        console.error('Historical import error:', error);
        res.status(500).json({ error: 'Failed to import historical data' });
    }
});

/**
 * GET /api/prediction/accuracy
 * Get prediction accuracy stats
 */
router.get('/accuracy', async (req, res) => {
    try {
        const userId = getUserId(req);
        const stats = await FeedbackLoop.getAccuracyStats(userId);

        res.json({
            success: true,
            stats
        });
    } catch (error) {
        console.error('Accuracy stats error:', error);
        res.status(500).json({ error: 'Failed to get accuracy stats' });
    }
});

/**
 * POST /api/prediction/feedback
 * Submit feedback when actual period starts (for improving predictions)
 */
router.post('/feedback', async (req, res) => {
    try {
        const userId = getUserId(req);
        const { actualStartDate } = req.body;

        if (!actualStartDate) {
            return res.status(400).json({ error: 'actualStartDate is required' });
        }

        const evaluation = await FeedbackLoop.evaluatePrediction(userId, actualStartDate);

        if (!evaluation) {
            return res.json({
                success: true,
                evaluated: false,
                message: 'No matching prediction found for this date'
            });
        }

        res.json({
            success: true,
            evaluated: true,
            ...evaluation
        });
    } catch (error) {
        console.error('Feedback error:', error);
        res.status(500).json({ error: 'Failed to process feedback' });
    }
});

export default router;
