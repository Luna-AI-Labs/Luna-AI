
import { predictionService } from './src/services/predictionService.js';

// Mocks
const mockProfile = { avg_cycle_length: 28 };

const testCases = [
    {
        name: "Regular 28-day cycle",
        periods: [
            { start_date: '2023-10-01' },
            { start_date: '2023-09-03' }, // 28 days
            { start_date: '2023-08-06' }, // 28 days
            { start_date: '2023-07-09' }, // 28 days
        ],
        expectedLength: 28
    },
    {
        name: "Regular 30-day cycle",
        periods: [
            { start_date: '2023-10-01' },
            { start_date: '2023-09-01' }, // 30
            { start_date: '2023-08-02' }, // 30
        ],
        expectedLength: 30
    },
    {
        name: "Irregular but shifting (Weighted Recent)",
        // Recent are 30, Old are 25. Should lean towards 30.
        periods: [
            { start_date: '2023-10-01' },
            { start_date: '2023-09-01' }, // 30
            { start_date: '2023-08-02' }, // 30
            { start_date: '2023-07-03' }, // 30
            { start_date: '2023-06-08' }, // 25
            { start_date: '2023-05-14' }, // 25
        ],
        expectedMin: 28, // Should be closer to 30 than 27.5
        expectedMax: 30
    },
    {
        name: "Outlier Rejection",
        // 28, 28, 15 (outlier), 28. Should ignore 15.
        periods: [
            { start_date: '2023-10-01' },
            { start_date: '2023-09-03' }, // 28
            { start_date: '2023-08-06' }, // 28
            { start_date: '2023-07-22' }, // 15 (Short outlier!)
            { start_date: '2023-06-24' }, // 28
        ],
        expectedLength: 28
    }
];

console.log('--- TEST PREDICTION SERVICE ---');

testCases.forEach(test => {
    console.log(`\nRunning: ${test.name}`);
    const result = predictionService.calculateNextPeriod(test.periods, mockProfile);

    console.log(`Calculated Length: ${result.cycleLength}`);
    console.log(`Confidence: ${result.confidence}`);
    console.log(`Irregular: ${result.isIrregular}`);

    let pass = false;
    if (test.expectedLength) {
        pass = result.cycleLength === test.expectedLength;
    } else if (test.expectedMin) {
        pass = result.cycleLength >= test.expectedMin && result.cycleLength <= test.expectedMax;
    }

    console.log(`Status: ${pass ? '✅ PASS' : '❌ FAIL'}`);
});
