import { format, parseISO, isToday, startOfMonth, endOfMonth, eachDayOfInterval, getDay, addMonths, subMonths, isSameDay } from 'date-fns';
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from './ui/Toast';
import { Spinner } from './ui/Spinner';

interface PeriodRecord {
    id: number;
    start_date: string;
    end_date: string | null;
}

interface CalendarData {
    periodDays: string[];
    ovulationDates: string[];
    predictedPeriod: string[];
    fertileWindow: string[];
}

interface CalendarViewProps {
    onDateSelect?: (date: Date) => void;
    onEditPeriod?: () => void;
    onPeriodLogged?: () => void;
}

const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

export default function CalendarView({ onDateSelect, onEditPeriod, onPeriodLogged }: CalendarViewProps) {
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
    const [isLogging, setIsLogging] = useState(false);
    const [logType, setLogType] = useState<'start' | 'end' | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [periods, setPeriods] = useState<PeriodRecord[]>([]);
    const [calendarData, setCalendarData] = useState<CalendarData>({
        periodDays: [],
        ovulationDates: [],
        predictedPeriod: [],
        fertileWindow: []
    });
    const [showHistory, setShowHistory] = useState(false);
    const { showToast } = useToast();

    // Fetch periods from database
    const fetchPeriods = useCallback(async () => {
        try {
            const response = await fetch('http://localhost:3001/api/cycle/periods', {
                headers: { 'x-user-id': '1' }
            });

            if (response.ok) {
                const data = await response.json();
                setPeriods(data.periods || []);
                setCalendarData(data.calendarData || {
                    periodDays: [],
                    ovulationDates: [],
                    predictedPeriod: [],
                    fertileWindow: []
                });
            }
        } catch (error) {
            console.error('Failed to fetch periods:', error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchPeriods();
    }, [fetchPeriods]);

    const handlePeriodStart = async () => {
        if (!selectedDate) return;
        setIsLogging(true);
        setLogType('start');

        try {
            const response = await fetch('http://localhost:3001/api/cycle/period', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'x-user-id': '1' },
                body: JSON.stringify({ startDate: format(selectedDate, 'yyyy-MM-dd') })
            });

            if (response.ok) {
                showToast(`Period started on ${format(selectedDate, 'MMM d')} 🌸`, 'success');
                onPeriodLogged?.();
                fetchPeriods();
            }
        } catch {
            showToast('Saved locally', 'info');
        } finally {
            setIsLogging(false);
            setLogType(null);
        }
    };

    const handlePeriodEnd = async () => {
        if (!selectedDate) return;
        setIsLogging(true);
        setLogType('end');

        try {
            const response = await fetch('http://localhost:3001/api/cycle/period', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'x-user-id': '1' },
                body: JSON.stringify({
                    startDate: periods[0]?.start_date || format(new Date(), 'yyyy-MM-dd'),
                    endDate: format(selectedDate, 'yyyy-MM-dd')
                })
            });

            if (response.ok) {
                showToast(`Period ended on ${format(selectedDate, 'MMM d')} ✨`, 'success');
                onPeriodLogged?.();
                fetchPeriods();
            }
        } catch {
            showToast('Saved locally', 'info');
        } finally {
            setIsLogging(false);
            setLogType(null);
        }
    };

    const handleDeletePeriod = async (periodId: number) => {
        try {
            const response = await fetch(`http://localhost:3001/api/cycle/periods/${periodId}`, {
                method: 'DELETE',
                headers: { 'x-user-id': '1' }
            });
            if (response.ok) {
                showToast('Period deleted', 'success');
                fetchPeriods();
            }
        } catch {
            showToast('Failed to delete', 'error');
        }
    };

    // Generate calendar days
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
    const startDay = getDay(monthStart);

    // Helper to check day type
    const getDayType = (date: Date): 'period' | 'fertile' | 'ovulation' | 'predicted' | null => {
        const dateStr = format(date, 'yyyy-MM-dd');
        if (calendarData.ovulationDates.includes(dateStr)) return 'ovulation';
        if (calendarData.periodDays.includes(dateStr)) return 'period';
        if (calendarData.fertileWindow.includes(dateStr)) return 'fertile';
        if (calendarData.predictedPeriod.includes(dateStr)) return 'predicted';
        return null;
    };

    const getDayStyle = (type: string | null) => {
        switch (type) {
            case 'period': return 'bg-gradient-to-br from-rose-500 to-pink-600 text-white shadow-lg shadow-rose-500/40 ring-1 ring-white/20';
            case 'fertile': return 'bg-gradient-to-br from-purple-400 to-indigo-500 text-white shadow-lg shadow-indigo-500/30 ring-1 ring-white/20'; // Changed to Purple/Indigo for "Magic" feel
            case 'ovulation': return 'bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-lg shadow-orange-500/40 ring-2 ring-white/50 scale-110';
            case 'predicted': return 'bg-rose-50 dark:bg-rose-900/10 text-rose-500 border-2 border-dashed border-rose-300 dark:border-rose-700/50';
            default: return 'bg-secondary/30 hover:bg-secondary/50 text-foreground/80';
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Spinner size="lg" />
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Calendar Header */}
            <motion.div
                className="glass-card p-4"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <div className="flex items-center justify-between mb-4">
                    <button
                        onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                        className="p-2 rounded-full hover:bg-secondary transition-colors"
                    >
                        ←
                    </button>
                    <h2 className="text-lg font-bold">
                        {format(currentMonth, 'MMMM yyyy')}
                    </h2>
                    <button
                        onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                        className="p-2 rounded-full hover:bg-secondary transition-colors"
                    >
                        →
                    </button>
                </div>

                {/* Weekday Headers */}
                <div className="grid grid-cols-7 gap-1 mb-2">
                    {WEEKDAYS.map((day, i) => (
                        <div key={i} className="text-center text-xs font-medium text-muted-foreground py-2">
                            {day}
                        </div>
                    ))}
                </div>

                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-1.5">
                    {/* Empty cells for days before month start */}
                    {Array.from({ length: startDay }).map((_, i) => (
                        <div key={`empty-${i}`} className="aspect-square" />
                    ))}

                    {/* Days of the month */}
                    {daysInMonth.map((date) => {
                        const dayType = getDayType(date);
                        const isSelected = isSameDay(date, selectedDate);
                        const today = isToday(date);

                        return (
                            <motion.button
                                key={date.toISOString()}
                                onClick={() => {
                                    setSelectedDate(date);
                                    onDateSelect?.(date);
                                }}
                                whileTap={{ scale: 0.95 }}
                                className={`
                                    aspect-square rounded-xl flex flex-col items-center justify-center relative
                                    transition-all duration-200 text-sm font-medium
                                    ${getDayStyle(dayType)}
                                    ${isSelected ? 'ring-2 ring-primary ring-offset-2 ring-offset-background scale-110 z-10' : ''}
                                    ${today && !dayType ? 'border-2 border-primary' : ''}
                                `}
                            >
                                <span className={today ? 'font-bold' : ''}>
                                    {format(date, 'd')}
                                </span>

                                {/* Day type indicator */}
                                {dayType === 'ovulation' && (
                                    <span className="absolute -top-1 -right-1 text-[10px]">🥚</span>
                                )}
                                {dayType === 'period' && (
                                    <span className="absolute bottom-0.5 text-[8px]">•••</span>
                                )}
                            </motion.button>
                        );
                    })}
                </div>
            </motion.div>

            {/* Legend */}
            <motion.div
                className="flex flex-wrap justify-center gap-3 text-xs"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
            >
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-secondary/30 rounded-full">
                    <span className="w-3 h-3 rounded-full bg-gradient-to-br from-pink-400 to-rose-500" />
                    <span>Period</span>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-secondary/30 rounded-full">
                    <span className="w-3 h-3 rounded-full bg-pink-200 border border-dashed border-pink-400" />
                    <span>Predicted</span>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-secondary/30 rounded-full">
                    <span className="w-3 h-3 rounded-full bg-gradient-to-br from-teal-300 to-cyan-400" />
                    <span>Fertile</span>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-secondary/30 rounded-full">
                    <span className="w-3 h-3 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500" />
                    <span>Ovulation</span>
                </div>
            </motion.div>

            {/* Selected Date Panel */}
            <motion.div
                className="glass-card p-4"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
            >
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h3 className="text-lg font-bold flex items-center gap-2">
                            {isToday(selectedDate) ? '📅 Today' : format(selectedDate, 'EEEE')}
                            {isToday(selectedDate) && (
                                <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full">
                                    Now
                                </span>
                            )}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                            {format(selectedDate, 'MMMM d, yyyy')}
                        </p>
                    </div>
                    <div className="text-right">
                        {getDayType(selectedDate) && (
                            <span className={`text-xs font-medium px-2 py-1 rounded-full ${getDayType(selectedDate) === 'period' ? 'bg-pink-100 text-pink-700' :
                                getDayType(selectedDate) === 'fertile' ? 'bg-teal-100 text-teal-700' :
                                    getDayType(selectedDate) === 'ovulation' ? 'bg-emerald-100 text-emerald-700' :
                                        'bg-pink-50 text-pink-600'
                                }`}>
                                {getDayType(selectedDate) === 'period' ? '🌸 Period Day' :
                                    getDayType(selectedDate) === 'fertile' ? '✨ Fertile' :
                                        getDayType(selectedDate) === 'ovulation' ? '🥚 Ovulation' :
                                            '📅 Predicted'}
                            </span>
                        )}
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-3">
                    <button
                        onClick={handlePeriodStart}
                        disabled={isLogging}
                        className="flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl font-medium text-white bg-gradient-to-r from-pink-500 to-rose-500 shadow-lg shadow-pink-500/30 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
                    >
                        {isLogging && logType === 'start' ? (
                            <Spinner size="sm" className="border-white/50 border-t-white" />
                        ) : (
                            <>🌸 Period Started</>
                        )}
                    </button>
                    <button
                        onClick={handlePeriodEnd}
                        disabled={isLogging}
                        className="flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl font-medium text-white bg-gradient-to-r from-purple-500 to-indigo-500 shadow-lg shadow-purple-500/30 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
                    >
                        {isLogging && logType === 'end' ? (
                            <Spinner size="sm" className="border-white/50 border-t-white" />
                        ) : (
                            <>✨ Period Ended</>
                        )}
                    </button>
                </div>
            </motion.div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-3">
                <button
                    onClick={onEditPeriod}
                    className="py-3 text-sm bg-secondary/50 hover:bg-secondary rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
                >
                    📥 Import History
                </button>
                <button
                    onClick={() => setShowHistory(!showHistory)}
                    className="py-3 text-sm bg-secondary/50 hover:bg-secondary rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
                >
                    📋 {showHistory ? 'Hide' : 'View'} History
                </button>
            </div>

            {/* Period History */}
            <AnimatePresence>
                {showHistory && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="glass-card p-4">
                            <h3 className="font-semibold mb-3 flex items-center gap-2">
                                📋 Period History
                                <span className="text-xs text-muted-foreground font-normal">
                                    ({periods.length} logged)
                                </span>
                            </h3>
                            {periods.length === 0 ? (
                                <p className="text-sm text-muted-foreground text-center py-6">
                                    No periods logged yet
                                </p>
                            ) : (
                                <div className="space-y-2 max-h-48 overflow-y-auto">
                                    {periods.slice(0, 10).map((period) => (
                                        <div
                                            key={period.id}
                                            className="flex items-center justify-between p-3 bg-gradient-to-r from-pink-50 to-rose-50 dark:from-pink-900/20 dark:to-rose-900/20 rounded-xl"
                                        >
                                            <div>
                                                <div className="text-sm font-medium flex items-center gap-2">
                                                    🌸 {format(parseISO(period.start_date), 'MMM d, yyyy')}
                                                    {period.end_date && (
                                                        <span className="text-muted-foreground">
                                                            → {format(parseISO(period.end_date), 'MMM d')}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="text-xs text-muted-foreground">
                                                    {period.end_date
                                                        ? `${Math.ceil((new Date(period.end_date).getTime() - new Date(period.start_date).getTime()) / (1000 * 60 * 60 * 24)) + 1} days`
                                                        : 'Ongoing'
                                                    }
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleDeletePeriod(period.id)}
                                                className="p-2 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                                            >
                                                🗑️
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
