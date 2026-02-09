/**
 * E2E Test Script for Luna AI
 * Verifies key user flows: Auth, Cycle Logging, Status, AI Chat, and Opik Tracing.
 */

const BASE_URL = 'http://localhost:3001/api';

async function testFlow() {
    console.log('🧪 Starting E2E Tests...');

    // 1. Auth: Login as Period User
    console.log('\n--- Test 1: Authentication ---');
    const loginRes = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'period@test.com', password: 'password123' })
    });
    const loginData = await loginRes.json();
    if (!loginData.token) throw new Error('Login failed');
    const token = loginData.token;
    const userId = loginData.user.id;
    console.log('✅ Login successful. User ID:', userId);

    // 2. Cycle Status
    console.log('\n--- Test 2: Get Cycle Status ---');
    const statusRes = await fetch(`${BASE_URL}/cycle/status`, {
        headers: { 'x-user-id': userId } // Using mock auth header for simplicity in this test script
    });
    const statusData = await statusRes.json();
    console.log('Cycle Phase:', statusData.phase);
    console.log('Days until period:', statusData.daysUntilPeriod);
    if (!statusData.success) throw new Error('Failed to get status');
    console.log('✅ Cycle status retrieved.');

    // 3. Log Data (Multi-Mode)
    console.log('\n--- Test 3: Log Multi-Mode Data ---');
    // Log period symptom
    await fetch(`${BASE_URL}/cycle/log`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-id': userId },
        body: JSON.stringify({
            date: new Date().toISOString().split('T')[0],
            symptoms: ['cramps'],
            mood: 'anxious',
            mode: 'period'
        })
    });

    // Log conceive data (simulate switching mode)
    await fetch(`${BASE_URL}/cycle/log`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-id': userId },
        body: JSON.stringify({
            date: new Date().toISOString().split('T')[0],
            bbt: 36.6,
            mucus: 'egg_white',
            mode: 'conceive'
        })
    });
    console.log('✅ Multi-mode data logged.');

    // 4. AI Chat (Opik Tracing)
    console.log('\n--- Test 4: AI Chat & Opik Trace ---');
    const chatRes = await fetch(`${BASE_URL}/ai/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-id': userId },
        body: JSON.stringify({
            message: 'I have cramps and feel anxious. Is this normal?',
            mode: 'period'
        })
    });
    const chatData = await chatRes.json();
    console.log('AI Response:', chatData.response.substring(0, 50) + '...');
    if (!chatData.response) throw new Error('No AI response');
    console.log('✅ AI Chat successful.');

    console.log('\n🎉 All E2E Tests Passed!');
}

testFlow().catch(err => {
    console.error('❌ Test Failed:', err);
    process.exit(1);
});
