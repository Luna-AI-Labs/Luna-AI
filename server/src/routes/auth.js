/**
 * Auth Routes - User Authentication
 */

import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../db/database.js';

const router = express.Router();

/**
 * POST /api/auth/register
 */
router.post('/register', async (req, res) => {
    try {
        const { email, password, name } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        // Check if user exists
        const existingRes = await db.query('SELECT id FROM users WHERE email = $1', [email]);
        if (existingRes.rows.length > 0) {
            return res.status(400).json({ error: 'User already exists' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const result = await db.query(
            'INSERT INTO users (email, password_hash, created_at) VALUES ($1, $2, NOW()) RETURNING id',
            [email, hashedPassword]
        );

        const userId = result.rows[0].id;

        // Create default settings
        await db.query(
            'INSERT INTO user_settings (user_id, current_mode) VALUES ($1, $2)',
            [userId, 'period']
        );

        // Generate token
        const token = jwt.sign(
            { userId },
            process.env.JWT_SECRET || 'luna-secret-key',
            { expiresIn: '30d' }
        );

        res.json({
            success: true,
            token,
            user: { id: userId, email, name }
        });
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ error: 'Registration failed' });
    }
});

/**
 * POST /api/auth/login
 */
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        // Find user
        const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
        const user = result.rows[0];

        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Verify password
        const valid = await bcrypt.compare(password, user.password_hash);
        if (!valid) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Generate token
        const token = jwt.sign(
            { userId: user.id },
            process.env.JWT_SECRET || 'luna-secret-key',
            { expiresIn: '30d' }
        );

        res.json({
            success: true,
            token,
            user: { id: user.id, email: user.email }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Login failed' });
    }
});

/**
 * POST /api/auth/guest
 * Create anonymous guest session
 */
router.post('/guest', async (req, res) => {
    try {
        const guestId = `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}@luna.ai`;
        const guestPassword = await bcrypt.hash('guest', 10);

        const result = await db.query(
            'INSERT INTO users (email, password_hash, created_at) VALUES ($1, $2, NOW()) RETURNING id',
            [guestId, guestPassword]
        );

        const userId = result.rows[0].id;

        // Create default settings
        await db.query(
            'INSERT INTO user_settings (user_id, current_mode) VALUES ($1, $2)',
            [userId, 'period']
        );

        const token = jwt.sign(
            { userId: userId, isGuest: true },
            process.env.JWT_SECRET || 'luna-secret-key',
            { expiresIn: '7d' }
        );

        res.json({
            success: true,
            token,
            user: { id: userId, isGuest: true }
        });
    } catch (error) {
        console.error('Guest session error:', error);
        res.status(500).json({ error: 'Failed to create guest session' });
    }
});

export default router;
