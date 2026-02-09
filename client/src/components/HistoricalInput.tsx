/**
 * Historical Period Input
 * 
 * Modern UI for importing past periods to improve prediction accuracy.
 * Data is saved to database and used by Opik for training.
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, subMonths } from 'date-fns';
import { useToast } from './ui/Toast';
import { Spinner } from './ui/Spinner';

interface PeriodEntry {
    startDate: string;
    endDate: string;
}

interface HistoricalInputProps {
    onSubmit: (periods: PeriodEntry[]) => void;
    onClose: () => void;
}

export default function HistoricalInput({ onSubmit, onClose }: HistoricalInputProps) {
    const { showToast } = useToast();
    const [periods, setPeriods] = useState<PeriodEntry[]>([
        { startDate: '', endDate: '' },
        { startDate: '', endDate: '' },
        { startDate: '', endDate: '' }
    ]);
    const [isLoading, setIsLoading] = useState(false);
    const [importedCount, setImportedCount] = useState<number | null>(null);

    const addRow = () => {
        setPeriods([...periods, { startDate: '', endDate: '' }]);
    };

    const removeRow = (index: number) => {
        if (periods.length > 1) {
            setPeriods(periods.filter((_, i) => i !== index));
        }
    };

    const updatePeriod = (index: number, field: 'startDate' | 'endDate', value: string) => {
        const updated = [...periods];
        updated[index][field] = value;
        setPeriods(updated);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Filter out empty entries
        const validPeriods = periods.filter(p => p.startDate);

        if (validPeriods.length === 0) {
            showToast('Please add at least one period', 'error');
            return;
        }

        setIsLoading(true);

        try {
            const response = await fetch('http://localhost:3001/api/cycle/periods/history', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-user-id': '1'
                },
                body: JSON.stringify({ periods: validPeriods })
            });

            const data = await response.json();

            if (response.ok) {
                setImportedCount(data.imported);
                showToast(`Imported ${data.imported} periods! 🎉`, 'success');

                // Wait a moment then close
                setTimeout(() => {
                    onSubmit(validPeriods);
                    onClose();
                }, 1500);
            } else {
                throw new Error(data.error || 'Failed to import');
            }
        } catch (error) {
            showToast('Failed to save - please try again', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const maxDate = format(new Date(), 'yyyy-MM-dd');
    const minDate = format(subMonths(new Date(), 24), 'yyyy-MM-dd'); // Allow up to 2 years back

    return (
        <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
        >
            <motion.div
                className="w-full max-w-md bg-background rounded-2xl shadow-2xl overflow-hidden"
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
            >
                {/* Header */}
                <div className="bg-gradient-to-r from-pink-500 to-purple-500 p-4 text-white">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-bold flex items-center gap-2">
                            📥 Import Past Periods
                        </h2>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-white/20 rounded-full transition-colors"
                        >
                            ✕
                        </button>
                    </div>
                    <p className="text-sm opacity-90 mt-1">
                        Add your previous periods to improve prediction accuracy
                    </p>
                </div>

                {/* Success State */}
                <AnimatePresence>
                    {importedCount !== null && (
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="p-6 text-center"
                        >
                            <div className="text-6xl mb-4">🎉</div>
                            <h3 className="text-xl font-bold">Success!</h3>
                            <p className="text-muted-foreground mt-2">
                                Imported {importedCount} historical periods.
                                <br />Your predictions will now be more accurate!
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Form */}
                {importedCount === null && (
                    <form onSubmit={handleSubmit} className="p-4 space-y-4">
                        {/* Info Box */}
                        <div className="p-3 bg-primary/10 rounded-xl text-sm">
                            <p className="text-center">
                                🧠 <strong>More data = Better predictions!</strong>
                                <br />
                                <span className="text-muted-foreground">
                                    Your data is securely saved and used to personalize your experience
                                </span>
                            </p>
                        </div>

                        {/* Period Rows */}
                        <div className="space-y-3 max-h-64 overflow-y-auto">
                            {periods.map((period, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="flex items-center gap-2 p-3 bg-secondary/30 rounded-xl"
                                >
                                    <span className="text-sm font-bold text-primary w-6">
                                        {index + 1}
                                    </span>

                                    <div className="flex-1 grid grid-cols-2 gap-2">
                                        <div>
                                            <label className="text-[10px] text-muted-foreground block mb-1">
                                                Start Date
                                            </label>
                                            <input
                                                type="date"
                                                value={period.startDate}
                                                onChange={(e) => updatePeriod(index, 'startDate', e.target.value)}
                                                min={minDate}
                                                max={maxDate}
                                                className="w-full px-2 py-1.5 text-sm rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary/50"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] text-muted-foreground block mb-1">
                                                End Date
                                            </label>
                                            <input
                                                type="date"
                                                value={period.endDate}
                                                onChange={(e) => updatePeriod(index, 'endDate', e.target.value)}
                                                min={period.startDate || minDate}
                                                max={maxDate}
                                                className="w-full px-2 py-1.5 text-sm rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary/50"
                                            />
                                        </div>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => removeRow(index)}
                                        disabled={periods.length <= 1}
                                        className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-30"
                                    >
                                        🗑️
                                    </button>
                                </motion.div>
                            ))}
                        </div>

                        {/* Add More Button */}
                        <button
                            type="button"
                            onClick={addRow}
                            className="w-full py-2 border-2 border-dashed border-primary/30 text-primary rounded-xl font-medium hover:bg-primary/5 transition-colors"
                        >
                            + Add Another Period
                        </button>

                        {/* Actions */}
                        <div className="grid grid-cols-2 gap-3 pt-2">
                            <button
                                type="button"
                                onClick={onClose}
                                className="py-3 bg-secondary rounded-xl font-medium transition-colors hover:bg-secondary/80"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-xl font-bold shadow-lg shadow-pink-500/30 flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {isLoading ? (
                                    <Spinner size="sm" className="border-white/50 border-t-white" />
                                ) : (
                                    <>Save & Train AI</>
                                )}
                            </button>
                        </div>
                    </form>
                )}
            </motion.div>
        </motion.div>
    );
}
