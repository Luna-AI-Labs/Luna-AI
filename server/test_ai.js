
// Test script for AI endpoints (requires server running with SKIP_PAYMENT=true)
import fetch from 'node-fetch';

const API_URL = 'http://localhost:3001/api/ai';
const USER_ID = '1';

async function testInsight() {
    console.log('Testing /insight...');
    try {
        const res = await fetch(`${API_URL}/insight`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-user-id': USER_ID
            },
            body: JSON.stringify({
                cycleDay: 14,
                phase: 'ovulation',
                recentSymptoms: ['energetic', 'high libido'],
                moodPatterns: ['happy']
            })
        });

        if (res.status === 402) {
            console.log('❌ Payment Required (Bypass not working)');
            return;
        }

        const data = await res.json();
        console.log('✅ Insight Response:', JSON.stringify(data, null, 2));
    } catch (err) {
        console.error('❌ Insight Failed:', err);
    }
}

async function testChat() {
    console.log('\nTesting /chat...');
    try {
        const res = await fetch(`${API_URL}/chat`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-user-id': USER_ID
            },
            body: JSON.stringify({
                message: 'Why do I feel cramps before my period?',
                mode: 'period'
            })
        });

        const data = await res.json();
        console.log('✅ Chat Response:', JSON.stringify(data, null, 2));
    } catch (err) {
        console.error('❌ Chat Failed:', err);
    }
}

async function run() {
    await testInsight();
    await testChat();
}

run();
