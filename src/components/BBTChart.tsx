import { useMemo } from 'react';
import { motion } from 'framer-motion';

interface BBTDataPoint {
    day: number;
    temp: number;
}

interface BBTChartProps {
    data: BBTDataPoint[];
    targetTemp?: number; // Ovulation threshold, e.g., 36.6 or 97.9
}

export default function BBTChart({ data, targetTemp = 36.6 }: BBTChartProps) {
    if (!data || data.length === 0) return null;

    const width = 100; // viewbox percentage
    const height = 50; // viewbox percentage

    // Scales
    const minTemp = Math.min(...data.map(d => d.temp)) - 0.2;
    const maxTemp = Math.max(...data.map(d => d.temp)) + 0.2;
    const tempRange = maxTemp - minTemp;

    const getX = (index: number) => (index / (data.length - 1)) * width;
    const getY = (temp: number) => height - ((temp - minTemp) / tempRange) * height;

    const points = useMemo(() => {
        return data.map((d, i) => `${getX(i)},${getY(d.temp)}`).join(' ');
    }, [data, minTemp, tempRange]);

    const areaPath = `${points} ${width},${height} 0,${height}`;

    return (
        <div className="w-full h-full">
            <h3 className="text-sm font-semibold mb-4 text-foreground flex items-center gap-2">
                Basal Body Temperature
                <span className="text-xs font-normal text-muted-foreground">(°C)</span>
            </h3>

            <div className="relative aspect-[2/1] w-full">
                <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
                    {/* Grid Lines */}
                    {[...Array(5)].map((_, i) => (
                        <line
                            key={i}
                            x1="0"
                            y1={(i / 4) * height}
                            x2={width}
                            y2={(i / 4) * height}
                            stroke="currentColor"
                            strokeOpacity="0.1"
                            strokeWidth="0.2"
                        />
                    ))}

                    {/* Ovulation Threshold Line */}
                    <line
                        x1="0"
                        y1={getY(targetTemp)}
                        x2={width}
                        y2={getY(targetTemp)}
                        stroke="#F59E0B"
                        strokeWidth="0.3"
                        strokeDasharray="2 2"
                    />

                    {/* Area under curve */}
                    <motion.path
                        d={`M ${areaPath}`}
                        fill="url(#tempGradient)"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.2 }}
                        transition={{ duration: 1 }}
                    />

                    {/* Line Chart */}
                    <motion.polyline
                        fill="none"
                        stroke="url(#lineGradient)"
                        strokeWidth="1"
                        points={points}
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 1.5, ease: "easeInOut" }}
                    />

                    {/* Data Points */}
                    {data.map((d, i) => (
                        <motion.circle
                            key={i}
                            cx={getX(i)}
                            cy={getY(d.temp)}
                            r="1.5"
                            className="fill-background stroke-primary"
                            strokeWidth="0.5"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 1 + (i * 0.05) }}
                        />
                    ))}

                    {/* Gradients */}
                    <defs>
                        <linearGradient id="tempGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="var(--primary)" />
                            <stop offset="100%" stopColor="var(--background)" stopOpacity="0" />
                        </linearGradient>
                        <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                            <stop offset="0%" stopColor="var(--secondary)" />
                            <stop offset="100%" stopColor="var(--primary)" />
                        </linearGradient>
                    </defs>
                </svg>

                {/* X-Axis Labels */}
                <div className="flex justify-between mt-2 px-1">
                    {data.filter((_, i) => i % 5 === 0).map((d, i) => (
                        <span key={i} className="text-[10px] text-muted-foreground">Day {d.day}</span>
                    ))}
                </div>
            </div>
        </div>
    );
}
