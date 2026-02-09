/**
 * Generate Test Data for Luna AI
 * Seeds the database with 4 persona users (one per mode) and 6 months of history.
 */

import { db, initDb } from '../src/db/database.js';
import bcrypt from 'bcryptjs';

const USERS = [
    { email: 'period@test.com', password: 'password123', mode: 'period' },
    { email: 'conceive@test.com', password: 'password123', mode: 'conceive' },
    { email: 'pregnancy@test.com', password: 'password123', mode: 'pregnancy' },
    { email: 'menopause@test.com', password: 'password123', mode: 'perimenopause' }
];

const SYMPTOMS_LIST = ['cramps', 'headache', 'fatigue', 'bloating', 'acne', 'mood_swings', 'insomnia', 'nausea'];
const MOODS = ['happy', 'sad', 'anxious', 'irritated', 'calm', 'neutral'];
const ENERGY = ['low', 'medium', 'high'];

async function createUsers() {
    console.log('👥 Creating users...');
    const userIds = {};

    for (const u of USERS) {
        // Check if exists
        const res = await db.query('SELECT id FROM users WHERE email = $1', [u.email]);
        let userId;

        if (res.rows[0]) {
            userId = res.rows[0].id;
        } else {
            const hash = await bcrypt.hash(u.password, 10);
            const insert = await db.query(
                'INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id',
                [u.email, hash]
            );
            userId = insert.rows[0].id;
        }

        // Set mode
        const settings = await db.query('SELECT user_id FROM user_settings WHERE user_id = $1', [userId]);
        if (settings.rows[0]) {
            await db.query('UPDATE user_settings SET current_mode = $1 WHERE user_id = $2', [u.mode, userId]);
        } else {
            await db.query('INSERT INTO user_settings (user_id, current_mode) VALUES ($1, $2)', [userId, u.mode]);
        }

        userIds[u.mode] = userId;
        console.log(`✅ User ${u.email} (ID: ${userId}) ready.`);
    }
    return userIds;
}

function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomItem(arr) {
    return arr[randomInt(0, arr.length - 1)];
}

function randomDate(start, end) {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

async function generatePeriodData(userId) {
    console.log('🩸 Generating Period data...');
    // Generate 6 periods in last 6 months
    const today = new Date();
    let currentDate = new Date(today);
    currentDate.setMonth(currentDate.getMonth() - 6);

    while (currentDate < today) {
        // Period start
        const startDate = new Date(currentDate);
        const duration = randomInt(4, 6);
        const endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + duration);

        if (startDate > today) break;

        await db.query(
            'INSERT INTO periods (user_id, start_date, end_date) VALUES ($1, $2, $3)',
            [userId, startDate, endDate]
        );

        // Logs during period
        for (let i = 0; i < duration; i++) {
            const d = new Date(startDate);
            d.setDate(d.getDate() + i);
            const dateStr = d.toISOString().split('T')[0];

            await db.query(`
                INSERT INTO daily_logs (user_id, date, symptoms, mood, energy, severity)
                VALUES ($1, $2, $3, $4, $5, $6)
                ON CONFLICT (user_id, date) DO NOTHING
            `, [
                userId, dateStr,
                JSON.stringify([randomItem(SYMPTOMS_LIST), randomItem(SYMPTOMS_LIST)]),
                randomItem(MOODS),
                'low',
                'medium'
            ]);
        }

        // Advance 28 days
        currentDate.setDate(currentDate.getDate() + randomInt(26, 30));
    }
}

async function generateConceiveData(userId) {
    console.log('👶 Generating Conceive data...');
    // Similar to period but add conceive_data
    const today = new Date();
    for (let i = 0; i < 60; i++) { // Last 60 days
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];

        // Random BBT (36.2 - 36.8)
        const bbt = (36.2 + Math.random() * 0.6).toFixed(2);

        await db.query(`
            INSERT INTO conceive_data (user_id, date, basal_body_temperature, sexual_activity)
            VALUES ($1, $2, $3, $4)
            ON CONFLICT (user_id, date) DO NOTHING
        `, [userId, dateStr, bbt, Math.random() > 0.8]);
    }
}

async function generatePerimenopauseData(userId) {
    console.log('🌿 Generating Perimenopause data...');
    const today = new Date();
    for (let i = 0; i < 30; i++) { // Last 30 days
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];

        await db.query(`
            INSERT INTO perimenopause_logs (user_id, date, hot_flash_count, sleep_quality_score)
            VALUES ($1, $2, $3, $4)
            ON CONFLICT (user_id, date) DO NOTHING
        `, [userId, dateStr, randomInt(0, 5), randomInt(1, 10)]);

        if (Math.random() > 0.5) {
            await db.query(`
                INSERT INTO daily_logs (user_id, date, symptoms, mood, energy)
                VALUES ($1, $2, $3, $4, $5)
                ON CONFLICT (user_id, date) DO NOTHING
            `, [userId, dateStr, JSON.stringify(['insomnia']), 'anxious', 'low']);
        }
    }
}

async function run() {
    await initDb();
    const userIds = await createUsers();

    await generatePeriodData(userIds.period);
    await generateConceiveData(userIds.conceive);
    await generatePerimenopauseData(userIds.perimenopause);
    // Pregnancy data requires less history, maybe just one entry
    await db.query('INSERT INTO pregnancy_data (user_id, due_date) VALUES ($1, $2)', [userIds.pregnancy, '2026-10-01']);

    console.log('✨ Data generation complete!');
    process.exit(0);
}

run().catch(err => {
    console.error(err);
    process.exit(1);
});
