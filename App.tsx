
import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { Registration } from './components/Registration';
import { WorkTracker } from './components/WorkTracker';
import { DailyReport } from './components/DailyReport';
import { Plaza } from './components/Plaza';
import { UserProfile, WorkSession, DailyLog } from './types';

type AppState = 'REGISTRATION' | 'TRACKER' | 'REPORT' | 'PLAZA';

const App: React.FC = () => {
  // Initial state for profile. In a real app, this would load from localStorage.
  const [profile, setProfile] = useState<UserProfile>({
    name: 'User',
    riceName: '',
    city: '',
    jobTitle: 'Senior SWE',
    company: 'Meta',
    monthlySalary: 2200,
    workingDaysPerMonth: 22,
    isRegistered: false, // Set to false by default for the demo
  });

  // If already registered, start at Tracker
  const [view, setView] = useState<AppState>(profile.isRegistered ? 'TRACKER' : 'REGISTRATION');

  const [session, setSession] = useState<WorkSession>({
    startTime: null,
    dayStartTime: null,
    totalElapsedMs: 0,
    isActive: false,
    date: new Date().toLocaleDateString(),
  });

  const [history, setHistory] = useState<DailyLog[]>([]);

  // Timer logic
  useEffect(() => {
    let interval: number;
    if (session.isActive && session.startTime) {
      interval = window.setInterval(() => {
        const now = Date.now();
        const diff = now - session.startTime!;
        setSession(prev => ({
          ...prev,
          totalElapsedMs: prev.totalElapsedMs + diff,
          startTime: now,
        }));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [session.isActive, session.startTime]);

  const handleRegister = (newProfile: UserProfile) => {
    setProfile({ ...newProfile, isRegistered: true });
    setView('TRACKER');
  };

  const handleToggleWork = () => {
    setSession(prev => {
      const now = Date.now();
      const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
      return {
        ...prev,
        isActive: !prev.isActive,
        startTime: !prev.isActive ? now : null,
        dayStartTime: (!prev.isActive && !prev.dayStartTime) ? nowStr : prev.dayStartTime
      };
    });
  };

  const handleEndDay = () => {
    const hours = session.totalElapsedMs / (1000 * 60 * 60);
    const dailyPay = profile.monthlySalary / (profile.workingDaysPerMonth || 22);
    const endStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
    
    // Logic: starts at daily max and decreases.
    // If hours < 1, rate = dailyPay.
    const rateDivisor = Math.max(hours, 1);
    const actualRate = Math.round(dailyPay / rateDivisor);
    
    let vibe: 'Sushi' | 'Salad' | 'Bread' = 'Salad';
    if (hours < 4 && hours > 0) vibe = 'Sushi';
    if (hours >= 8) vibe = 'Bread';

    const newLog: DailyLog = {
      date: new Date().toLocaleDateString(),
      hoursWorked: hours,
      hourlyRate: actualRate,
      vibe,
      shifts: 1,
      startTimeStr: session.dayStartTime || "N/A",
      endTimeStr: endStr,
    };

    setHistory([newLog, ...history]);
    setSession({
      startTime: null,
      dayStartTime: null,
      totalElapsedMs: 0,
      isActive: false,
      date: new Date().toLocaleDateString(),
    });
    setView('REPORT');
  };

  return (
    <Layout>
      {view === 'REGISTRATION' && (
        <Registration 
          initialData={profile} 
          onComplete={handleRegister} 
          onCancel={profile.isRegistered ? () => setView('TRACKER') : undefined}
        />
      )}
      {view === 'TRACKER' && (
        <WorkTracker 
          profile={profile} 
          session={session} 
          onToggle={handleToggleWork} 
          onEndDay={handleEndDay} 
          onEditProfile={() => setView('REGISTRATION')}
          onGoToPlaza={() => setView('PLAZA')}
        />
      )}
      {view === 'REPORT' && (
        <DailyReport 
          profile={profile}
          log={history[0]}
          onShare={() => setView('PLAZA')}
          onRestart={() => setView('TRACKER')}
        />
      )}
      {view === 'PLAZA' && (
        <Plaza 
          profile={profile}
          history={history}
          onBack={() => setView('TRACKER')}
        />
      )}
    </Layout>
  );
};

export default App;
