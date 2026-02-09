import { motion } from 'framer-motion';
import { Camera, Plus } from 'lucide-react';

interface Photo {
    id: string;
    week: number;
    url: string;
    date: string;
}

export default function BumpGallery({ currentWeek }: { currentWeek: number }) {
    // Mock data for demo
    const photos: Photo[] = [
        { id: '1', week: 12, url: 'https://api.dicebear.com/7.x/shapes/svg?seed=Week12', date: '2025-01-15' },
        { id: '2', week: 16, url: 'https://api.dicebear.com/7.x/shapes/svg?seed=Week16', date: '2025-02-12' },
    ];

    return (
        <div className="glass-card p-4">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold flex items-center gap-2">
                    <Camera className="w-4 h-4" />
                    Bump Gallery
                </h3>
                <span className="text-xs text-muted-foreground">{photos.length} photos</span>
            </div>

            <div className="flex gap-3 overflow-x-auto pb-2 hide-scrollbar">
                <motion.button
                    whileTap={{ scale: 0.95 }}
                    className="flex-shrink-0 w-24 h-32 rounded-xl border-2 border-dashed border-muted-foreground/30 flex flex-col items-center justify-center gap-2 text-muted-foreground hover:bg-secondary/50 transition-colors"
                >
                    <div className="p-2 rounded-full bg-secondary">
                        <Plus className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-medium">Add Week {currentWeek}</span>
                </motion.button>

                {photos.map((photo) => (
                    <div key={photo.id} className="flex-shrink-0 w-24 h-32 rounded-xl overflow-hidden relative group">
                        <img
                            src={photo.url}
                            alt={`Week ${photo.week}`}
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-2">
                            <span className="text-white text-xs font-medium">Week {photo.week}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
