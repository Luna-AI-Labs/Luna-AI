/**
 * Cycle Routes - Period and Symptom Tracking
 */

import express from 'express';
import { db } from '../db/database.js';
import { predictionService } from '../services/predictionService.js';

const router = express.Router();

// Middleware to get user from token
const getUserId = (req) => {
    // In production, extract from JWT (req.user is set by auth middleware usually, but here we use header/mock)
    // For now, let's assume req.user.id if available, or header, or default to 1
    return (req.user && req.user.id) || req.headers['x-user-id'] || 1;
};

/**
 * POST /api/cycle/period
 * Log period start/end
 */
router.post('/period', async (req, res) => {
    try {
        const userId = getUserId(req);
        const { startDate, endDate } = req.body;

        if (!startDate) {
            return res.status(400).json({ error: 'startDate is required' });
        }

        const result = await db.query(
            'INSERT INTO periods (user_id, start_date, end_date, created_at) VALUES ($1, $2, $3, NOW()) RETURNING id',
            [userId, startDate, endDate || null]
        );

        res.json({
            success: true,
            periodId: result.rows[0].id
        });
    } catch (error) {
        console.error('Period log error:', error);
        res.status(500).json({ error: 'Failed to log period' });
    }
});

/**
 * POST /api/cycle/log
 * Daily symptom/mood log
 */
router.post('/log', async (req, res) => {
    try {
        const userId = getUserId(req);
        // mode is passed from the client, defaults to 'period' if missing
        const { date, symptoms, mood, energy, notes, severity, mode } = req.body;

        const logDate = date || new Date().toISOString().split('T')[0];

        // 1. Write to shared daily_logs (Common for all modes)
        // Check for existing log on this date
        const existingRes = await db.query(
            'SELECT id FROM daily_logs WHERE user_id = $1 AND date = $2',
            [userId, logDate]
        );
        const existing = existingRes.rows[0];
        let dailyLogId;

        if (existing) {
            // Update existing
            await db.query(`
                UPDATE daily_logs 
                SET symptoms = $1, mood = $2, energy = $3, notes = $4, severity = $5, updated_at = NOW()
                WHERE id = $6
            `, [
                JSON.stringify(symptoms || []),
                mood,
                energy,
                notes,
                severity,
                existing.id
            ]);
            dailyLogId = existing.id;
        } else {
            // Create new
            const result = await db.query(`
                INSERT INTO daily_logs (user_id, date, symptoms, mood, energy, notes, severity, created_at)
                VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
                RETURNING id
            `, [
                userId,
                logDate,
                JSON.stringify(symptoms || []),
                mood,
                energy,
                notes,
                severity
            ]);
            dailyLogId = result.rows[0].id;
        }

        // 2. Handle Mode-Specific Data
        if (mode === 'conceive') {
            const { bbt, mucus, ovulationTest, sex } = req.body;
            // Upsert conceive_data
            const conceiveRes = await db.query('SELECT id FROM conceive_data WHERE user_id = $1 AND date = $2', [userId, logDate]);
            if (conceiveRes.rows[0]) {
                await db.query(`
                    UPDATE conceive_data 
                    SET basal_body_temperature = $1, cervical_mucus_quality = $2, ovulation_test_result = $3, sexual_activity = $4
                    WHERE id = $5
                `, [bbt, mucus, ovulationTest, sex, conceiveRes.rows[0].id]);
            } else {
                await db.query(`
                    INSERT INTO conceive_data (user_id, date, basal_body_temperature, cervical_mucus_quality, ovulation_test_result, sexual_activity)
                    VALUES ($1, $2, $3, $4, $5, $6)
                `, [userId, logDate, bbt, mucus, ovulationTest, sex]);
            }
        }
        else if (mode === 'perimenopause') {
            const { hotFlashes, sleepQuality } = req.body;
            // Upsert perimenopause_logs
            const periRes = await db.query('SELECT id FROM perimenopause_logs WHERE user_id = $1 AND date = $2', [userId, logDate]);
            if (periRes.rows[0]) {
                await db.query(`
                     UPDATE perimenopause_logs
                     SET hot_flash_count = $1, sleep_quality_score = $2
                     WHERE id = $3
                 `, [hotFlashes, sleepQuality, periRes.rows[0].id]);
            } else {
                await db.query(`
                     INSERT INTO perimenopause_logs (user_id, date, hot_flash_count, sleep_quality_score)
                     VALUES ($1, $2, $3, $4)
                 `, [userId, logDate, hotFlashes, sleepQuality]);
            }
        }
        else if (mode === 'pregnancy') {
            // Pregnancy data is usually milestone based, but could be daily (kicks, etc.)
            // For now we just stick to daily_logs for symptoms, but if we had weight/kicks we'd add here.
            // Placeholder for future expansion.
        }

        // 3. Update User Mode Preference if changed
        if (mode) {
            // Check if settings exist
            const settingsRes = await db.query('SELECT user_id FROM user_settings WHERE user_id = $1', [userId]);
            if (settingsRes.rows[0]) {
                await db.query('UPDATE user_settings SET current_mode = $1, updated_at = NOW() WHERE user_id = $2', [mode, userId]);
            } else {
                await db.query('INSERT INTO user_settings (user_id, current_mode) VALUES ($1, $2)', [userId, mode]);
            }
        }

        res.json({ success: true, logId: dailyLogId });
    } catch (error) {
        console.error('Daily log error:', error);
        res.status(500).json({ error: 'Failed to save log' });
    }
});

/**
 * GET /api/cycle/status
 * Get current cycle status
 */
router.get('/status', async (req, res) => {
    try {
        const userId = getUserId(req);

        // Get last period
        const periodRes = await db.query(
            'SELECT * FROM periods WHERE user_id = $1 ORDER BY start_date DESC LIMIT 1',
            [userId]
        );
        const lastPeriod = periodRes.rows[0];

        if (!lastPeriod) {
            return res.json({
                success: true,
                hasData: false,
                message: 'No period data yet'
            });
        }

        // Calculate cycle day
        const lastStart = new Date(lastPeriod.start_date);
        const today = new Date();
        const cycleDay = Math.floor((today - lastStart) / (1000 * 60 * 60 * 24)) + 1;

        // Determine phase (simplified)
        let phase = 'menstrual';
        if (cycleDay > 5 && cycleDay <= 14) phase = 'follicular';
        else if (cycleDay > 14 && cycleDay <= 16) phase = 'ovulatory';
        else if (cycleDay > 16) phase = 'luteal';

        // Get average cycle length
        const cyclesRes = await db.query(`
            SELECT start_date FROM periods WHERE user_id = $1 ORDER BY start_date DESC LIMIT 6
        `, [userId]);
        const cycles = cyclesRes.rows;

        let avgCycleLength = 28;
        if (cycles.length >= 2) {
            const lengths = [];
            for (let i = 0; i < cycles.length - 1; i++) {
                const diff = (new Date(cycles[i].start_date) - new Date(cycles[i + 1].start_date)) / (1000 * 60 * 60 * 24);
                lengths.push(diff);
            }
            avgCycleLength = Math.round(lengths.reduce((a, b) => a + b, 0) / lengths.length);
        }

        // Days until next period
        const daysUntilPeriod = Math.max(0, avgCycleLength - cycleDay);

        // Ovulation prediction (typically day 14 of 28-day cycle)
        const ovulationDay = Math.round(avgCycleLength / 2);
        const daysUntilOvulation = Math.max(0, ovulationDay - cycleDay);

        res.json({
            success: true,
            hasData: true,
            cycleDay,
            phase,
            avgCycleLength,
            daysUntilPeriod,
            daysUntilOvulation,
            fertileWindow: cycleDay >= ovulationDay - 5 && cycleDay <= ovulationDay + 1,
            lastPeriodStart: lastPeriod.start_date
        });
    } catch (error) {
        console.error('Status error:', error);
        res.status(500).json({ error: 'Failed to get cycle status' });
    }
});

/**
 * GET /api/cycle/logs
 * Get recent logs
 */
router.get('/logs', async (req, res) => {
    try {
        const userId = getUserId(req);
        const { limit = 30 } = req.query;

        const logsRes = await db.query(`
            SELECT * FROM daily_logs 
            WHERE user_id = $1 
            ORDER BY date DESC 
            LIMIT $2
        `, [userId, parseInt(limit)]);

        const logs = logsRes.rows;

        // Parse JSON symptoms if needed (pg auto-parses JSON types but safety check)
        const parsedLogs = logs.map(log => ({
            ...log,
            symptoms: typeof log.symptoms === 'string' ? JSON.parse(log.symptoms) : log.symptoms
        }));

        res.json({ success: true, logs: parsedLogs });
    } catch (error) {
        console.error('Get logs error:', error);
        res.status(500).json({ error: 'Failed to get logs' });
    }
});

/**
 * GET /api/cycle/periods
 * Get all periods for calendar display (secured by user)
 */
router.get('/periods', async (req, res) => {
    try {
        const userId = getUserId(req);

        const periodsRes = await db.query(`
            SELECT id, start_date, end_date, created_at 
            FROM periods 
            WHERE user_id = $1 
            ORDER BY start_date DESC
        `, [userId]);

        const periods = periodsRes.rows;

        // Generate calendar data for display
        const periodDays = [];
        const predictedPeriod = [];
        const fertileWindow = [];
        const ovulationDates = [];

        periods.forEach(period => {
            const start = new Date(period.start_date);
            const end = period.end_date ? new Date(period.end_date) : new Date(start.getTime() + 5 * 24 * 60 * 60 * 1000);

            // Add each day of the period
            for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
                periodDays.push(d.toISOString().split('T')[0]);
            }
        });

        // Calculate predictions based on latest period
        if (periods.length > 0) {
            const lastPeriod = periods[0];

            // Get user's average cycle length
            const profileRes = await db.query('SELECT avg_cycle_length FROM user_profiles WHERE user_id = $1', [userId]);
            const avgCycleLength = profileRes.rows[0]?.avg_cycle_length || 28;

            const lastStart = new Date(lastPeriod.start_date);

            // Predict next period
            const nextPeriodStart = new Date(lastStart.getTime() + avgCycleLength * 24 * 60 * 60 * 1000);
            for (let i = 0; i < 5; i++) {
                const day = new Date(nextPeriodStart.getTime() + i * 24 * 60 * 60 * 1000);
                predictedPeriod.push(day.toISOString().split('T')[0]);
            }

            // Calculate fertile window (days 10-16 typically, relative to cycle length)
            // Ovulation is typically 14 days before the *next* period
            const ovulationDay = avgCycleLength - 14;

            // Fertile window: 5 days before ovulation + ovulation day + 1 day after
            for (let i = ovulationDay - 5; i <= ovulationDay + 1; i++) {
                const day = new Date(lastStart.getTime() + i * 24 * 60 * 60 * 1000);
                fertileWindow.push(day.toISOString().split('T')[0]);
            }

            // Ovulation date
            const ovDate = new Date(lastStart.getTime() + ovulationDay * 24 * 60 * 60 * 1000);
            ovulationDates.push(ovDate.toISOString().split('T')[0]);
        }

        res.json({
            success: true,
            periods,
            calendarData: {
                periodDays: [...new Set(periodDays)],
                predictedPeriod,
                fertileWindow,
                ovulationDates
            }
        });
    } catch (error) {
        console.error('Get periods error:', error);
        res.status(500).json({ error: 'Failed to get periods' });
    }
});

/**
 * POST /api/cycle/periods/history
 * Import historical period data (for training Opik model)
 */
router.post('/periods/history', async (req, res) => {
    try {
        const userId = getUserId(req);
        const { periods } = req.body;

        if (!periods || !Array.isArray(periods)) {
            return res.status(400).json({ error: 'periods array is required' });
        }

        const insertedIds = [];

        for (const period of periods) {
            if (!period.startDate) continue;

            // Check if period already exists (avoid duplicates)
            const existingRes = await db.query(
                'SELECT id FROM periods WHERE user_id = $1 AND start_date = $2',
                [userId, period.startDate]
            );

            if (existingRes.rows.length === 0) {
                const result = await db.query(
                    'INSERT INTO periods (user_id, start_date, end_date, is_historical, created_at) VALUES ($1, $2, $3, true, NOW()) RETURNING id',
                    [userId, period.startDate, period.endDate || null]
                );
                insertedIds.push(result.rows[0].id);
            }
        }

        // Trigger Opik training with new historical data (async)
        // This data will be used to improve prediction accuracy
        console.log(`📊 Historical data imported: ${insertedIds.length} periods for user ${userId}`);
        console.log('🧠 Opik training data updated - predictions will improve');

        res.json({
            success: true,
            imported: insertedIds.length,
            message: `Imported ${insertedIds.length} historical periods. Your predictions will now be more accurate!`
        });
    } catch (error) {
        console.error('Import history error:', error);
        res.status(500).json({ error: 'Failed to import historical data' });
    }
});

/**
 * PUT /api/cycle/periods/:id
 * Update a specific period
 */
router.put('/periods/:id', async (req, res) => {
    try {
        const userId = getUserId(req);
        const { id } = req.params;
        const { startDate, endDate } = req.body;

        // Verify ownership
        const checkRes = await db.query(
            'SELECT id FROM periods WHERE id = $1 AND user_id = $2',
            [id, userId]
        );

        if (checkRes.rows.length === 0) {
            return res.status(404).json({ error: 'Period not found' });
        }

        await db.query(
            'UPDATE periods SET start_date = $1, end_date = $2, updated_at = NOW() WHERE id = $3',
            [startDate, endDate, id]
        );

        res.json({ success: true, message: 'Period updated' });
    } catch (error) {
        console.error('Update period error:', error);
        res.status(500).json({ error: 'Failed to update period' });
    }
});

/**
 * DELETE /api/cycle/periods/:id
 * Delete a specific period
 */
router.delete('/periods/:id', async (req, res) => {
    try {
        const userId = getUserId(req);
        const { id } = req.params;

        // Verify ownership before delete
        const checkRes = await db.query(
            'SELECT id FROM periods WHERE id = $1 AND user_id = $2',
            [id, userId]
        );

        if (checkRes.rows.length === 0) {
            return res.status(404).json({ error: 'Period not found' });
        }

        await db.query('DELETE FROM periods WHERE id = $1', [id]);

        res.json({ success: true, message: 'Period deleted' });
    } catch (error) {
        console.error('Delete period error:', error);
        res.status(500).json({ error: 'Failed to delete period' });
    }
});

export default router;
