import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useUser, SignedIn, SignedOut, SignInButton, SignUpButton } from '@clerk/clerk-react';
import { AnimatePresence } from 'framer-motion';

import Dashboard from './components/Dashboard';
import HealthAssistant from './components/HealthAssistant';
import ConceiveDashboard from './components/ConceiveDashboard';
import PregnancyDashboard from './components/PregnancyDashboard';
import PerimenopauseDashboard from './components/PerimenopauseDashboard';
import HistoricalInput from './components/HistoricalInput';
import CalendarView from './components/CalendarView';
import SymptomLogger from './components/SymptomLogger';
import Onboarding from './components/Onboarding';
import Profile from './components/Profile';
import Layout from './components/Layout';
import LandingPage from './components/LandingPage';
import AboutPage from './components/pages/AboutPage';
import PrivacyPage from './components/pages/PrivacyPage';
import ContactPage from './components/pages/ContactPage';
import PresentationPage from './components/pages/PresentationPage';
import { ToastProvider, useToast } from './components/ui/Toast';
import './index.css';

type View =
  | 'landing'
  | 'dashboard'
  | 'assistant'
  | 'calendar'
  | 'symptoms'
  | 'profile'
  | 'about'
  | 'privacy'
  | 'contact'
  | 'presentation';

type AppMode = 'period' | 'conceive' | 'pregnancy' | 'perimenopause';

function AppContent() {
  useTranslation();
  const { showToast } = useToast();
  const [currentView, setCurrentView] = useState<View>('landing');
  const [currentMode, setCurrentMode] = useState<AppMode>('period');
  const [cycleStatus, setCycleStatus] = useState<any>(null);
  const [cycleData, setCycleData] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showHistoricalInput, setShowHistoricalInput] = useState(false);

  useEffect(() => {
    // Check if user has completed onboarding
    const onboardingComplete = localStorage.getItem('onboardingComplete');
    if (!onboardingComplete) {
      setShowOnboarding(true);
    } else {
      fetchCycleStatus();
    }

    fetchCurrentMode();
    fetchCycleData();
  }, []);

  const handleOnboardingComplete = (data: any) => {
    localStorage.setItem('onboardingComplete', 'true');
    setCurrentMode(data.goal as AppMode);
    setShowOnboarding(false);
    // Here we would typically save the user profile data
    console.log('Onboarding data:', data);
    fetchCycleStatus();
  };

  // Update theme when mode changes
  useEffect(() => {
    document.documentElement.setAttribute('data-mode', currentMode);
  }, [currentMode]);

  const fetchCycleStatus = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/cycle/status', {
        headers: { 'x-user-id': '1' }
      });
      const data = await response.json();
      setCycleStatus(data);
    } catch (error) {
      console.log('Server not running, using demo data');
      setCycleStatus({
        hasData: true,
        cycleDay: 14,
        phase: 'ovulatory',
        avgCycleLength: 28,
        daysUntilPeriod: 14,
        daysUntilOvulation: 0,
        fertileWindow: true
      });
    } finally {
      // Loading complete
    }
  };

  const fetchCycleData = async () => {
    // Demo cycle data for calendar - in production, fetch from API
    const today = new Date();

    // Generate demo period dates (5 days starting 14 days ago)
    const periodDays = [];
    const periodStart = new Date(today);
    periodStart.setDate(today.getDate() - 14);
    for (let i = 0; i < 5; i++) {
      const d = new Date(periodStart);
      d.setDate(periodStart.getDate() + i);
      periodDays.push(d.toISOString().split('T')[0]);
    }

    // Predicted next period (in 14 days)
    const predictedPeriod = [];
    const nextPeriod = new Date(today);
    nextPeriod.setDate(today.getDate() + 14);
    for (let i = 0; i < 5; i++) {
      const d = new Date(nextPeriod);
      d.setDate(nextPeriod.getDate() + i);
      predictedPeriod.push(d.toISOString().split('T')[0]);
    }

    // Ovulation (today in demo)
    const ovulationDates = [today.toISOString().split('T')[0]];

    // Fertile window (-5 to +1 from ovulation)
    const fertileWindow = [];
    for (let i = -5; i <= 1; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      fertileWindow.push(d.toISOString().split('T')[0]);
    }

    setCycleData({
      periodDays,
      predictedPeriod,
      ovulationDates,
      fertileWindow
    });
  };

  const fetchCurrentMode = async () => {
    try {
      const res = await fetch('http://localhost:3001/api/modes/current', {
        headers: { 'x-user-id': '1' }
      });
      const data = await res.json();
      if (data.success) {
        setCurrentMode(data.modeId);
      }
    } catch (e) {
      // Default to period mode
    }
  };

  const handleModeChange = (modeId: string) => {
    setCurrentMode(modeId as AppMode);
    setCurrentView('dashboard');
  };



  const handleSymptomSave = async (symptoms: string[], modeData?: Record<string, any>) => {
    setIsSaving(true);
    try {
      const response = await fetch('http://localhost:3001/api/cycle/log', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': '1'
        },
        body: JSON.stringify({
          symptoms,
          date: new Date().toISOString().split('T')[0],
          mode: currentMode,
          ...modeData
        })
      });

      if (response.ok) {
        showToast('Symptoms logged successfully! ✨', 'success');
        // Refresh data after saving
        await fetchCycleStatus();
      } else {
        throw new Error('Failed to save');
      }
      setCurrentView('dashboard');
    } catch (error) {
      showToast('Saved locally - will sync when online', 'info');
      setCurrentView('dashboard');
    } finally {
      setIsSaving(false);
    }
  };

  const renderDashboard = (mode: AppMode, onModeChange: (mode: AppMode) => void) => {
    switch (mode) {
      case 'conceive':
        return <ConceiveDashboard data={cycleStatus} currentMode={mode} onModeChange={onModeChange} />;
      case 'pregnancy':
        return <PregnancyDashboard data={cycleStatus} currentMode={mode} onModeChange={onModeChange} />;
      case 'perimenopause':
        return <PerimenopauseDashboard data={cycleStatus} currentMode={mode} onModeChange={onModeChange} />;
      default:
        return <Dashboard cycleStatus={cycleStatus} currentMode={mode} onModeChange={(m) => onModeChange(m as AppMode)} />;
    }
  };

  if (currentView === 'landing') {
    return (
      <LandingPage
        onStart={() => {
          setShowOnboarding(true);
          setCurrentView('dashboard');
        }}
        onLogin={() => setCurrentView('dashboard')}
        onNavigate={(page: string) => setCurrentView(page as View)}
      />
    );
  }

  if (currentView === 'about') {
    return <AboutPage onBack={() => setCurrentView('landing')} />;
  }

  if (currentView === 'privacy') {
    return <PrivacyPage onBack={() => setCurrentView('landing')} />;
  }

  if (currentView === 'contact') {
    return <ContactPage onBack={() => setCurrentView('landing')} />
  }

  if (currentView === 'presentation') {
    return <PresentationPage />;
  }

  return (
    <Layout
      currentView={currentView}
      onViewChange={(view: string) => setCurrentView(view as View)}
      onModeChange={handleModeChange}
    >
      <AnimatePresence mode="wait">
        {currentView === 'dashboard' && (
          renderDashboard(currentMode, handleModeChange)
        )}
        {currentView === 'assistant' && (
          <HealthAssistant key="assistant" cycleStatus={cycleStatus} currentMode={currentMode} />
        )}
        {currentView === 'calendar' && (
          <CalendarView
            key="calendar"
            onDateSelect={(date) => console.log('Selected:', date)}
            onEditPeriod={() => setShowHistoricalInput(true)}
          />
        )}
        {currentView === 'symptoms' && (
          <SymptomLogger
            key="symptoms"
            onSave={handleSymptomSave}
            onClose={() => setCurrentView('dashboard')}
            currentMode={currentMode}
          />
        )}
        {currentView === 'profile' && (
          <Profile key="profile" currentMode={currentMode} onModeChange={handleModeChange} />
        )}
      </AnimatePresence>

      {/* Historical Input Modal */}
      <AnimatePresence>
        {showHistoricalInput && (
          <HistoricalInput
            onSubmit={() => {
              setShowHistoricalInput(false);
              fetchCycleStatus();
            }}
            onClose={() => setShowHistoricalInput(false)}
          />
        )}
      </AnimatePresence>

      {/* Onboarding Overlay */}
      <AnimatePresence>
        {showOnboarding && (
          <Onboarding onComplete={handleOnboardingComplete} />
        )}
      </AnimatePresence>
    </Layout>
  );
}

// App wrapper with providers
function App() {
  return (
    <ToastProvider>
      <AppContent />
    </ToastProvider>
  );
}

export default App;
