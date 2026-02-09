/**
 * Mode Routes
 * Manage application modes (Period, Conceive, Pregnancy, etc.)
 */

import express from 'express';
import { ModeRegistry } from '../modes/registry.js';
import { db } from '../db/database.js';

const router = express.Router();

/**
 * GET /api/modes
 * List all available modes
 */
router.get('/', (req, res) => {
    try {
        const modes = ModeRegistry.getAllModes();
        res.json({
            success: true,
            modes
        });
    } catch (error) {
        console.error('Get modes error:', error);
        res.status(500).json({ error: 'Failed to get modes' });
    }
});

/**
 * GET /api/modes/current
 * Get user's current mode
 */
router.get('/current', async (req, res) => {
    try {
        // Mock user ID for now
        const userId = req.headers['x-user-id'] || 1;

        const result = await db.query(
            'SELECT current_mode FROM user_settings WHERE user_id = $1',
            [userId]
        );

        const currentModeId = result.rows[0]?.current_mode || 'period';
        const modeConfig = ModeRegistry.getMode(currentModeId);

        res.json({
            success: true,
            modeId: currentModeId,
            config: modeConfig
        });
    } catch (error) {
        console.error('Get current mode error:', error);
        res.status(500).json({ error: 'Failed to get current mode' });
    }
});

/**
 * POST /api/modes/switch
 * Switch user's mode
 */
router.post('/switch', async (req, res) => {
    try {
        const userId = req.headers['x-user-id'] || 1;
        const { modeId } = req.body;

        if (!ModeRegistry.isValidMode(modeId)) {
            return res.status(400).json({ error: 'Invalid mode ID' });
        }

        // Upsert setting
        await db.query(`
            INSERT INTO user_settings (user_id, current_mode, updated_at)
            VALUES ($1, $2, NOW())
            ON CONFLICT (user_id) 
            DO UPDATE SET current_mode = $2, updated_at = NOW()
        `, [userId, modeId]);

        res.json({
            success: true,
            message: `Switched to ${modeId} mode`,
            mode: ModeRegistry.getMode(modeId)
        });
    } catch (error) {
        console.error('Switch mode error:', error);
        res.status(500).json({ error: 'Failed to switch mode' });
    }
});

export default router;
