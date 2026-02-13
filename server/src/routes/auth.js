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

/**
 * POST /api/auth/privy
 * Sync Privy user with backend
 */
router.post('/privy', async (req, res) => {
    try {
        const { user } = req.body;

        if (!user || (!user.id && !user.privy_id)) {
            return res.status(400).json({ error: 'User data required' });
        }

        const privyId = user.id || user.privy_id;
        // Handle email structure from Privy (can be string or object)
        const email = user.email ? (typeof user.email === 'string' ? user.email : user.email.address) : null;

        // 1. Check if user exists by privy_id
        let dbUserRes = await db.query('SELECT * FROM users WHERE privy_id = $1', [privyId]);
        let dbUser = dbUserRes.rows[0];

        if (dbUser) {
            // User found by Privy ID - return it
            return res.json({
                success: true,
                user: dbUser
            });
        }

        // 2. If not found by Privy ID, check by email (Legacy account linking)
        if (email) {
            dbUserRes = await db.query('SELECT * FROM users WHERE email = $1', [email]);
            dbUser = dbUserRes.rows[0];

            if (dbUser) {
                // Link privy_id to existing email user
                await db.query('UPDATE users SET privy_id = $1 WHERE id = $2', [privyId, dbUser.id]);
                dbUser.privy_id = privyId; // Update local object

                return res.json({
                    success: true,
                    user: dbUser
                });
            }
        }

        // 3. Create new user
        const result = await db.query(
            'INSERT INTO users (privy_id, email, created_at) VALUES ($1, $2, NOW()) RETURNING *',
            [privyId, email]
        );
        dbUser = result.rows[0];

        // Create default settings for new user
        await db.query(
            'INSERT INTO user_settings (user_id, current_mode) VALUES ($1, $2)',
            [dbUser.id, 'period']
        );

        res.json({
            success: true,
            user: dbUser
        });

    } catch (error) {
        console.error('Privy auth error:', error);
        res.status(500).json({ error: 'Failed to sync user' });
    }
});

export default router;
