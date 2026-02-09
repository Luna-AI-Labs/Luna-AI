/**
 * Opik Feedback Loop for Cycle Prediction Optimization
 * 
 * Compares predicted cycle dates against actual user-reported dates
 * and feeds that accuracy data back into the system to improve future predictions.
 */

import { db } from '../../db/database.js';

// Opik client - dynamically loaded if available
let opik = null;
if (process.env.OPIK_API_KEY) {
    try {
        const opikModule = await import('opik');
        opik = opikModule.Opik ? new opikModule.Opik() : null;
        console.log('✅ Opik feedback loop enabled');
    } catch (e) {
        console.log('⚠️ Opik not available, feedback loop disabled');
    }
}

export class FeedbackLoop {

    /**
     * Record a prediction for later evaluation
     */
    static async recordPrediction(userId, predictionData) {
        const { startDate, confidence, cycleIndex } = predictionData;

        await db.query(`
            INSERT INTO predictions (user_id, predicted_start, confidence, cycle_index, created_at)
            VALUES ($1, $2, $3, $4, NOW())
        `, [userId, startDate, confidence, cycleIndex]);
    }

    /**
     * When user logs actual period start, compare to prediction
     */
    static async evaluatePrediction(userId, actualStartDate) {
        // Find the closest prediction to this actual date
        const predRes = await db.query(`
            SELECT id, predicted_start, confidence
            FROM predictions
            WHERE user_id = $1
              AND actual_start IS NULL
              AND ABS(DATE_PART('day', predicted_start::timestamp - $2::timestamp)) <= 7
            ORDER BY ABS(DATE_PART('day', predicted_start::timestamp - $2::timestamp)) ASC
            LIMIT 1
        `, [userId, actualStartDate]);

        if (predRes.rows.length === 0) {
            return null; // No prediction to compare
        }

        const prediction = predRes.rows[0];
        const predictedDate = new Date(prediction.predicted_start);
        const actualDate = new Date(actualStartDate);
        const errorDays = Math.round((actualDate - predictedDate) / (1000 * 60 * 60 * 24));

        // Update prediction with actual result
        await db.query(`
            UPDATE predictions
            SET actual_start = $1, error_days = $2, evaluated_at = NOW()
            WHERE id = $3
        `, [actualStartDate, errorDays, prediction.id]);

        // Log to Opik for tracking
        if (opik) {
            try {
                opik.trace({
                    name: 'cycle_prediction_evaluation',
                    input: {
                        predicted: prediction.predicted_start,
                        confidence: prediction.confidence
                    },
                    output: {
                        actual: actualStartDate,
                        errorDays
                    },
                    metadata: {
                        userId,
                        predictionId: prediction.id,
                        accuracy: errorDays === 0 ? 'exact' : (Math.abs(errorDays) <= 2 ? 'close' : 'off')
                    }
                });
            } catch (e) {
                console.error('Opik trace failed:', e.message);
            }
        }

        return {
            predictionId: prediction.id,
            predictedDate: prediction.predicted_start,
            actualDate: actualStartDate,
            errorDays
        };
    }

    /**
     * Get prediction accuracy stats for a user
     */
    static async getAccuracyStats(userId) {
        const statsRes = await db.query(`
            SELECT 
                COUNT(*) as total_predictions,
                AVG(ABS(error_days)) as avg_error,
                COUNT(CASE WHEN error_days = 0 THEN 1 END) as exact_matches,
                COUNT(CASE WHEN ABS(error_days) <= 2 THEN 1 END) as close_matches
            FROM predictions
            WHERE user_id = $1 AND actual_start IS NOT NULL
        `, [userId]);

        const stats = statsRes.rows[0];
        return {
            totalPredictions: parseInt(stats.total_predictions) || 0,
            averageError: parseFloat(stats.avg_error) || 0,
            exactMatches: parseInt(stats.exact_matches) || 0,
            closeMatches: parseInt(stats.close_matches) || 0,
            accuracy: stats.total_predictions > 0
                ? Math.round((parseInt(stats.close_matches) / parseInt(stats.total_predictions)) * 100)
                : 0
        };
    }
}
