/**
 * ModeSwitcher Component
 * 
 * Allows users to switch between different app modes:
 * Period, Conceive, Pregnancy, Perimenopause
 */

import React, { useState, useEffect } from 'react';
import './ModeSwitcher.css';

interface Mode {
    id: string;
    name: string;
    description: string;
    icon: string;
}

interface ModeSwitcherProps {
    onModeChange?: (modeId: string) => void;
}

const ModeSwitcher: React.FC<ModeSwitcherProps> = ({ onModeChange }) => {
    const [modes, setModes] = useState<Mode[]>([]);
    const [currentMode, setCurrentMode] = useState<string>('period');
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchModes();
        fetchCurrentMode();
    }, []);

    const fetchModes = async () => {
        try {
            const res = await fetch('/api/modes');
            const data = await res.json();
            if (data.success) {
                setModes(data.modes);
            }
        } catch (err) {
            console.error('Failed to fetch modes:', err);
        }
    };

    const fetchCurrentMode = async () => {
        try {
            const res = await fetch('/api/modes/current');
            const data = await res.json();
            if (data.success) {
                setCurrentMode(data.modeId);
            }
        } catch (err) {
            console.error('Failed to fetch current mode:', err);
        }
    };

    const switchMode = async (modeId: string) => {
        if (modeId === currentMode) {
            setIsOpen(false);
            return;
        }

        setLoading(true);
        try {
            const res = await fetch('/api/modes/switch', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ modeId })
            });
            const data = await res.json();
            if (data.success) {
                setCurrentMode(modeId);
                onModeChange?.(modeId);
            }
        } catch (err) {
            console.error('Failed to switch mode:', err);
        } finally {
            setLoading(false);
            setIsOpen(false);
        }
    };

    const currentModeData = modes.find(m => m.id === currentMode);

    return (
        <div className="mode-switcher">
            <button
                className="current-mode-btn"
                onClick={() => setIsOpen(!isOpen)}
                disabled={loading}
            >
                <span className="mode-icon">{currentModeData?.icon || '🌸'}</span>
                <span className="mode-name">{currentModeData?.name || 'Period Tracking'}</span>
                <span className="dropdown-arrow">{isOpen ? '▲' : '▼'}</span>
            </button>

            {isOpen && (
                <div className="mode-dropdown">
                    {modes.map(mode => (
                        <button
                            key={mode.id}
                            className={`mode-option ${mode.id === currentMode ? 'active' : ''}`}
                            onClick={() => switchMode(mode.id)}
                        >
                            <span className="mode-icon">{mode.icon}</span>
                            <div className="mode-info">
                                <span className="mode-name">{mode.name}</span>
                                <span className="mode-desc">{mode.description}</span>
                            </div>
                            {mode.id === currentMode && <span className="checkmark">✓</span>}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ModeSwitcher;
