
/**
 * Prediction Service
 * Implements "Smart Cycle" logic using weighted averages and outlier rejection.
 */

export const predictionService = {
    /**
     * Calculate predictions for the next cycle
     * @param {Array} periods - List of past periods (must include start_date), sorted DESC
     * @param {Object} profile - User profile with avg_cycle_length
     * @returns {Object} { nextPeriodStart, ovulationDate, fertileWindowStart, fertileWindowEnd, cycleLength, confidence }
     */
    calculateNextPeriod: (periods, profile) => {
        // 1. Basic Setup
        const defaultCycleLength = profile?.avg_cycle_length || 28;

        if (!periods || periods.length === 0) {
            // No data, return today + default
            const today = new Date();
            return {
                nextPeriodStart: addDays(today, defaultCycleLength), // rough guess
                cycleLength: defaultCycleLength,
                confidence: 0.1, // Low confidence
                isIrregular: false
            };
        }

        const lastPeriod = periods[0];
        const lastStart = new Date(lastPeriod.start_date);

        // 2. Calculate Historical Intervals
        // We need at least 2 periods to calculate an interval
        if (periods.length < 2) {
            return generatePrediction(lastStart, defaultCycleLength, 0.3); // Low-med confidence based on profile
        }

        const intervals = [];
        // Calculate intervals between consecutive periods
        // Note: periods are expected to be ordered DESC (latest first)
        // Interval = Start of New - Start of Previous
        for (let i = 0; i < Math.min(periods.length, 13) - 1; i++) { // Look back ~1 year max
            const current = new Date(periods[i].start_date);
            const prev = new Date(periods[i + 1].start_date);
            const diffTime = Math.abs(current - prev);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            // Basic sanity check (ignore cycles < 15 days or > 60 days as likely errors or skipped months)
            // unless user profile allows it? For now, hard limits for "normal-ish" filtering
            if (diffDays >= 15 && diffDays <= 60) {
                intervals.push(diffDays);
            }
        }

        if (intervals.length === 0) {
            return generatePrediction(lastStart, defaultCycleLength, 0.2);
        }

        // 3. Outlier Rejection & Weighted Average
        const { calculatedLength, isIrregular, confidence } = calculateSmartLength(intervals, defaultCycleLength);

        // 4. Generate Dates
        return generatePrediction(lastStart, calculatedLength, confidence, isIrregular);
    }
};

/**
 * Helper: Smart Length Calculation
 */
function calculateSmartLength(intervals, fallback) {
    // If we have very few intervals, just average them
    if (intervals.length < 3) {
        const avg = intervals.reduce((a, b) => a + b, 0) / intervals.length;
        return { calculatedLength: Math.round(avg), isIrregular: false, confidence: 0.5 };
    }

    // Calculate Median
    const sorted = [...intervals].sort((a, b) => a - b);
    const median = sorted[Math.floor(sorted.length / 2)];

    // Filter Outliers (+/- 20% from median)
    const validIntervals = intervals.filter(i => {
        const diff = Math.abs(i - median);
        return (diff / median) < 0.2; // Keep if within 20% deviation
    });

    // If we filtered out too many (cycle is very irregular), use full average but flag it
    if (validIntervals.length < intervals.length / 2) {
        const fullAvg = intervals.reduce((a, b) => a + b, 0) / intervals.length;
        return { calculatedLength: Math.round(fullAvg), isIrregular: true, confidence: 0.3 };
    }

    // Weighted Average for Valid Intervals
    // We want to give more weight to recent intervals. 
    // validIntervals is derived from intervals which is ordered most-recent-first (index 0 is most recent)
    // But filter breaks index order. Let's re-filter preserving method.

    let weightedSum = 0;
    let totalWeight = 0;

    intervals.forEach((interval, index) => {
        // Check if it's an outlier (using same median logic)
        if (Math.abs(interval - median) / median < 0.2) {
            // Weight: 3 for recent (0-2), 2 for medium (3-5), 1 for old (6+)
            const weight = index < 3 ? 3 : index < 6 ? 2 : 1;
            weightedSum += interval * weight;
            totalWeight += weight;
        }
    });

    const weightedAvg = weightedSum / totalWeight;

    // Calculate variability (Standard Deviation of valid intervals)
    const mean = validIntervals.reduce((a, b) => a + b, 0) / validIntervals.length;
    const variance = validIntervals.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / validIntervals.length;
    const stdDev = Math.sqrt(variance);

    // High confidence if stdDev is low (< 2 days)
    const confidence = stdDev < 2 ? 0.9 : stdDev < 4 ? 0.7 : 0.5;

    return {
        calculatedLength: Math.round(weightedAvg),
        isIrregular: false,
        confidence
    };
}

/**
 * Helper: Generate Dates from Start + Length
 */
function generatePrediction(lastStart, length, confidence, isIrregular = false) {
    const nextPeriodStart = addDays(lastStart, length);

    // Luteal Phase default 14 days
    // Ovulation = Next Period - 14
    const ovulationDate = addDays(nextPeriodStart, -14);

    // Fertile Window
    // Standard: Ovulation - 5 to Ovulation + 1 (7 days)
    // Irregular: Widen by +/- 1 or 2 days
    const buffer = isIrregular ? 2 : 0;

    const fertileWindowStart = addDays(ovulationDate, -5 - buffer);
    const fertileWindowEnd = addDays(ovulationDate, 1 + buffer);

    return {
        nextPeriodStart: nextPeriodStart.toISOString().split('T')[0],
        ovulationDate: ovulationDate.toISOString().split('T')[0],
        fertileWindowStart: fertileWindowStart.toISOString().split('T')[0],
        fertileWindowEnd: fertileWindowEnd.toISOString().split('T')[0],
        cycleLength: length,
        confidence,
        isIrregular
    };
}

function addDays(date, days) {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
}
