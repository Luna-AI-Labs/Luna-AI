import { motion } from 'framer-motion';

export default function HotFlashHeatmap() {
    // Mock data: frequency by time of day (0-23)
    const data = [2, 1, 0, 0, 1, 3, 5, 2, 1, 1, 2, 4, 3, 1, 0, 1, 2, 3, 5, 4, 2, 1, 1, 2];
    const max = Math.max(...data);

    return (
        <div className="glass-card p-4">
            <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
                🔥 Hot Flash Intensity
                <span className="text-xs font-normal text-muted-foreground">(Last 24h)</span>
            </h3>

            <div className="flex items-end justify-between h-24 gap-1">
                {data.map((count, i) => {
                    const heightPercent = max > 0 ? (count / max) * 100 : 0;
                    const isHigh = count > 3;

                    return (
                        <div key={i} className="flex flex-col items-center flex-1 gap-1">
                            <motion.div
                                initial={{ height: 0 }}
                                animate={{ height: `${Math.max(10, heightPercent)}%` }}
                                transition={{ delay: i * 0.05 }}
                                className={`w-full rounded-t-sm ${isHigh ? 'bg-orange-500' : 'bg-orange-300 dark:bg-orange-700'
                                    }`}
                            />
                            {i % 4 === 0 && (
                                <span className="text-[9px] text-muted-foreground">{i}h</span>
                            )}
                        </div>
                    );
                })}
            </div>

            <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground bg-secondary/50 p-2 rounded-lg">
                <span>Peak activity: 6 PM - 8 PM</span>
                <span>Total: {data.reduce((a, b) => a + b, 0)}</span>
            </div>
        </div>
    );
}
