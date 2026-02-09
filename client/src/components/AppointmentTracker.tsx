import { Calendar as CalendarIcon, Clock, MapPin } from 'lucide-react';

interface Appointment {
    id: string;
    title: string;
    date: string;
    time: string;
    location: string;
    type: 'doctor' | 'ultrasound' | 'lab';
}

export default function AppointmentTracker() {
    const nextAppointment: Appointment = {
        id: '1',
        title: '20 Week Scan',
        date: '2025-03-15',
        time: '10:00 AM',
        location: 'City OBGYN',
        type: 'ultrasound'
    };

    return (
        <div className="glass-card p-4 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <CalendarIcon className="w-4 h-4 text-purple-500" />
                Next Appointment
            </h3>

            <div className="bg-white/50 dark:bg-black/20 rounded-xl p-3 border border-border/50">
                <div className="flex justify-between items-start mb-2">
                    <h4 className="font-bold text-foreground">{nextAppointment.title}</h4>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 uppercase tracking-wide">
                        {nextAppointment.type}
                    </span>
                </div>

                <div className="space-y-1 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                        <CalendarIcon className="w-3 h-3" />
                        <span>{new Date(nextAppointment.date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Clock className="w-3 h-3" />
                        <span>{nextAppointment.time}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <MapPin className="w-3 h-3" />
                        <span>{nextAppointment.location}</span>
                    </div>
                </div>
            </div>

            <button className="w-full mt-3 py-2 text-xs font-medium text-purple-600 hover:bg-purple-50 rounded-lg transition-colors">
                View All Appointments
            </button>
        </div>
    );
}
