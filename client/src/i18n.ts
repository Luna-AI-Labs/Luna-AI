import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// In a real app, these would be in separate JSON files
const resources = {
    en: {
        translation: {
            "welcome": "Welcome back",
            "today": "Today",
            "log": "Log Symptoms",
            "calendar": "Calendar",
            "modes": {
                "period": "Cycle Tracking",
                "conceive": "Get Pregnant",
                "pregnancy": "Pregnancy",
                "perimenopause": "Perimenopause"
            },
            "phases": {
                "menstrual": "Menstruation",
                "follicular": "Follicular Phase",
                "ovulation": "Ovulation",
                "luteal": "Luteal Phase"
            },
            "symptoms": {
                "cramps": "Cramps",
                "headache": "Headache",
                "mood": "Mood Swings"
            }
        }
    },
    zh: {
        translation: {
            "welcome": "欢迎回来",
            "today": "今天",
            "log": "记录症状",
            "calendar": "日历",
            "modes": {
                "period": "经期追踪",
                "conceive": "备孕模式",
                "pregnancy": "怀孕模式",
                "perimenopause": "更年期模式"
            },
            "phases": {
                "menstrual": "月经期",
                "follicular": "卵泡期",
                "ovulation": "排卵期",
                "luteal": "黄体期"
            },
            "symptoms": {
                "cramps": "痛经",
                "headache": "头痛",
                "mood": "情绪波动"
            }
        }
    },
    fr: {
        translation: {
            "welcome": "Bienvenue",
            "today": "Aujourd'hui",
            "log": "Symptômes",
            "calendar": "Calendrier",
            "modes": {
                "period": "Suivi du Cycle",
                "conceive": "Conception",
                "pregnancy": "Grossesse",
                "perimenopause": "Préménopause"
            },
            "phases": {
                "menstrual": "Menstruation",
                "follicular": "Phase Folliculaire",
                "ovulation": "Ovulation",
                "luteal": "Phase Lutéale"
            },
            "symptoms": {
                "cramps": "Crampes",
                "headache": "Maux de tête",
                "mood": "Humeur changeante"
            }
        }
    }
};

i18n
    .use(initReactI18next)
    .init({
        resources,
        lng: "en", // default language
        fallbackLng: "en",
        interpolation: {
            escapeValue: false
        }
    });

export default i18n;
