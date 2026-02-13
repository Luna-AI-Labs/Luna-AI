import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

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
import { AuthProvider, useAuth } from './context/AuthContext';
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
  const { authenticated, user, login, logout, ready, dbUser } = useAuth();
  const [currentView, setCurrentView] = useState<View>('landing');
  const [currentMode, setCurrentMode] = useState<AppMode>('period');
  const [cycleStatus, setCycleStatus] = useState<any>(null);

  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showHistoricalInput, setShowHistoricalInput] = useState(false);

  useEffect(() => {
    if (ready && authenticated) {
      setCurrentView('dashboard');
      fetchCurrentMode();
    } else if (ready && !authenticated) {
      setCurrentView('landing');
    }
  }, [ready, authenticated]);

  // Fetch cycle data
  const fetchCycleStatus = async () => {
    if (!dbUser) return;

    try {
      const response = await fetch('http://localhost:3001/api/cycle/status', {
        headers: {
          'x-user-id': dbUser.id.toString()
        }
      });
      const data = await response.json();
      if (data.success) {
        setCycleStatus(data);
        if (!data.hasData) {
          setShowOnboarding(true);
        }
      }
    } catch (error) {
      console.error('Failed to fetch status:', error);
    }
  };

  useEffect(() => {
    if (dbUser) {
      fetchCycleStatus();
    }
  }, [dbUser]);

  const handleOnboardingComplete = async (data: any) => {
    if (!dbUser) return;

    try {
      // 1. Save User Profile
      await fetch('http://localhost:3001/api/user/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': dbUser.id.toString()
        },
        body: JSON.stringify({
          birthYear: data.birthYear,
          avgCycleLength: data.avgCycleLength,
          avgPeriodLength: data.avgPeriodLength,
          cycleRegularity: data.cycleRegularity,
          onboardingData: data // Store full data blob for flexibility
        })
      });

      // 2. Save last period
      await fetch('http://localhost:3001/api/cycle/period', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': dbUser.id.toString()
        },
        body: JSON.stringify({
          startDate: data.lastPeriodStart,
          endDate: data.lastPeriodEnd
        })
      });

      // 2. Save historical data if any
      if (data.historicalPeriods?.length > 0) {
        await fetch('http://localhost:3001/api/cycle/periods/history', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-user-id': dbUser.id.toString()
          },
          body: JSON.stringify({ periods: data.historicalPeriods })
        });
      }

      setShowOnboarding(false);
      fetchCycleStatus();
      showToast('Profile set up successfully! 🎉', 'success');
    } catch (error) {
      console.error('Onboarding error:', error);
      showToast('Failed to save profile', 'error');
    }
  };

  // Update theme when mode changes
  useEffect(() => {
    document.documentElement.setAttribute('data-mode', currentMode);
  }, [currentMode]);

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



  const saveSymptomLog = async (symptoms: string[], modeData: any) => {
    if (!dbUser) return;

    try {
      const response = await fetch('http://localhost:3001/api/cycle/log', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': dbUser.id.toString()
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
        onStart={login}
        onLogin={login}
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
            onSave={saveSymptomLog}
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
    <AuthProvider>
      <ToastProvider>
        <AppContent />
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
