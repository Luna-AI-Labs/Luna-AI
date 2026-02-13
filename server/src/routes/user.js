
import express from 'express';
import { db } from '../db/database.js';

const router = express.Router();

// Middleware to get user from token/header (mock for now, similar to cycle.js)
const getUserId = (req) => {
    return (req.user && req.user.id) || req.headers['x-user-id'] || 1;
};

/**
 * POST /api/user/profile
 * Upsert user profile
 */
router.post('/profile', async (req, res) => {
    try {
        const userId = getUserId(req);
        const {
            birthYear,
            avgCycleLength,
            avgPeriodLength,
            cycleRegularity,
            onboardingData
        } = req.body;

        // Check if profile exists
        const existing = await db.query('SELECT user_id FROM user_profiles WHERE user_id = $1', [userId]);

        if (existing.rows.length > 0) {
            // Update
            await db.query(`
                UPDATE user_profiles 
                SET birth_year = $1, avg_cycle_length = $2, avg_period_length = $3, cycle_regularity = $4, onboarding_data = $5, updated_at = NOW()
                WHERE user_id = $6
            `, [birthYear, avgCycleLength, avgPeriodLength, cycleRegularity, onboardingData, userId]);
        } else {
            // Insert
            await db.query(`
                INSERT INTO user_profiles (user_id, birth_year, avg_cycle_length, avg_period_length, cycle_regularity, onboarding_data)
                VALUES ($1, $2, $3, $4, $5, $6)
            `, [userId, birthYear, avgCycleLength, avgPeriodLength, cycleRegularity, onboardingData]);
        }

        res.json({ success: true, message: 'Profile saved' });
    } catch (error) {
        console.error('Save profile error:', error);
        res.status(500).json({ error: 'Failed to save profile' });
    }
});

/**
 * GET /api/user/profile
 * Get user profile
 */
router.get('/profile', async (req, res) => {
    try {
        const userId = getUserId(req);

        const result = await db.query('SELECT * FROM user_profiles WHERE user_id = $1', [userId]);

        if (result.rows.length === 0) {
            return res.json({ success: true, profile: null });
        }

        res.json({ success: true, profile: result.rows[0] });
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({ error: 'Failed to get profile' });
    }
});

export default router;
