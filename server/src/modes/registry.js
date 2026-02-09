/**
 * Luna AI Mode Registry
 * Manages available modes and their configurations
 */

export const MODES = {
    PERIOD: 'period',
    CONCEIVE: 'conceive',
    PREGNANCY: 'pregnancy',
    PERIMENOPAUSE: 'perimenopause'
};

export const MODE_CONFIG = {
    [MODES.PERIOD]: {
        id: MODES.PERIOD,
        name: "Period Tracking",
        description: "Track your cycle, symptoms, and health",
        icon: "🌸",
        features: ["cycle_tracking", "symptom_logging", "predictions"],
        prompts: {
            insight: "insightGenerator",
            chat: "healthAssistant"
        }
    },
    [MODES.CONCEIVE]: {
        id: MODES.CONCEIVE,
        name: "Trying to Conceive",
        description: "Optimize fertility and track ovulation",
        icon: "🌱",
        features: ["fertile_window", "ovulation_tracking", "bbt_logging"],
        prompts: {
            insight: "fertilityAdvisor",
            chat: "fertilityAssistant"
        }
    },
    [MODES.PREGNANCY]: {
        id: MODES.PREGNANCY,
        name: "Pregnancy",
        description: "Follow your pregnancy journey week by week",
        icon: "🤰",
        features: ["week_tracker", "fetal_development", "symptoms"],
        prompts: {
            insight: "pregnancyCompanion",
            chat: "pregnancyAssistant"
        }
    },
    [MODES.PERIMENOPAUSE]: {
        id: MODES.PERIMENOPAUSE,
        name: "Perimenopause",
        description: "Manage transition symptoms and irregular cycles",
        icon: "moon",
        features: ["symptom_management", "cycle_changes", "sleep_tracking"],
        prompts: {
            insight: "transitionGuide",
            chat: "menopauseAssistant"
        }
    }
};

export class ModeRegistry {
    static getMode(modeId) {
        return MODE_CONFIG[modeId] || MODE_CONFIG[MODES.PERIOD];
    }

    static getAllModes() {
        return Object.values(MODE_CONFIG);
    }

    static isValidMode(modeId) {
        return !!MODE_CONFIG[modeId];
    }
}
