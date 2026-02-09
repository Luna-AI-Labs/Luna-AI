/**
 * Cycle Prediction Service
 * 
 * Handles calculation of future cycle events (period, ovulation, fertile window)
 * Uses both heuristic algorithms and AI-enhanced adjustments.
 */

import { db } from '../../db/database.js';

export class CyclePredictionService {

    /**
     * Calculate predictions for a user
     * @param {number} userId 
     * @returns {Promise<Object>} Predictions
     */
    static async calculatePredictions(userId) {
        // 1. Fetch historical periods
        const periodsRes = await db.query(
            'SELECT * FROM periods WHERE user_id = $1 ORDER BY start_date DESC LIMIT 12',
            [userId]
        );
        const periods = periodsRes.rows;

        if (periods.length < 1) {
            return null; // Not enough data
        }

        // 2. Calculate average cycle length
        const cycleLengths = [];
        for (let i = 0; i < periods.length - 1; i++) {
            const currentStart = new Date(periods[i].start_date);
            const prevStart = new Date(periods[i + 1].start_date);
            const diffDays = (currentStart - prevStart) / (1000 * 60 * 60 * 24);

            // Filter outliers (e.g. < 21 or > 45 days)
            if (diffDays >= 21 && diffDays <= 45) {
                cycleLengths.push(diffDays);
            }
        }

        const avgLength = cycleLengths.length > 0
            ? Math.round(cycleLengths.reduce((a, b) => a + b, 0) / cycleLengths.length)
            : 28; // Default

        // 3. Predict next 3 cycles
        const lastPeriodStart = new Date(periods[0].start_date);
        const predictions = [];

        for (let i = 1; i <= 3; i++) {
            const predictedStart = new Date(lastPeriodStart);
            predictedStart.setDate(lastPeriodStart.getDate() + (avgLength * i));

            const predictedEnd = new Date(predictedStart);
            predictedEnd.setDate(predictedStart.getDate() + 4); // Assume 5 day period

            const ovulationDate = new Date(predictedStart);
            ovulationDate.setDate(predictedStart.getDate() - 14); // Standard ovulation

            const fertileStart = new Date(ovulationDate);
            fertileStart.setDate(ovulationDate.getDate() - 5);

            const fertileEnd = new Date(ovulationDate);
            fertileEnd.setDate(ovulationDate.getDate() + 1);

            predictions.push({
                cycleIndex: i,
                startDate: predictedStart.toISOString().split('T')[0],
                endDate: predictedEnd.toISOString().split('T')[0],
                ovulationDate: ovulationDate.toISOString().split('T')[0],
                fertileWindow: {
                    start: fertileStart.toISOString().split('T')[0],
                    end: fertileEnd.toISOString().split('T')[0]
                },
                confidence: calculateConfidence(cycleLengths)
            });
        }

        return {
            avgCycleLength: avgLength,
            predictions
        };
    }

    /**
     * Save predictions to database
     */
    static async savePredictions(userId, predictions) {
        // Implementation pending schema update for predictions table if needed
        // For now, we return them on the fly or store in a cache
        // But let's assume we want to store them in 'predictions' table logic
    }
}

function calculateConfidence(lengths) {
    if (lengths.length < 3) return 50; // Low confidence

    // Calculate variance
    const mean = lengths.reduce((a, b) => a + b, 0) / lengths.length;
    const variance = lengths.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / lengths.length;
    const stdDev = Math.sqrt(variance);

    // Lower stdDev = Higher confidence
    if (stdDev < 1) return 95;
    if (stdDev < 2) return 85;
    if (stdDev < 4) return 70;
    return 60;
}
