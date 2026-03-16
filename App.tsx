import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Layout } from './components/Layout';
import { Registration } from './components/Registration';
import { WorkTracker } from './components/WorkTracker';
import { DailyReport } from './components/DailyReport';
import { Plaza } from './components/Plaza';
import { UserProfile, WorkSession, DailyLog } from './types';
import * as api from './lib/api';
import { calculateHourlyRate, calculateDailyPay, getVibe } from './lib/utils';
import { requestNotificationPermission, notify8Hours, notify10Hours } from './lib/notifications';

type AppState = 'REGISTRATION' | 'TRACKER' | 'REPORT' | 'PLAZA';

const defaultProfile: UserProfile = {
  name: 'User',
  riceName: '',
  city: '',
  jobTitle: 'Senior SWE',
  company: 'Meta',
  monthlySalary: 2200,
  workingDaysPerMonth: 22,
  isRegistered: false,
};

const emptySession = (): WorkSession => ({
  startTime: null,
  dayStartTime: null,
  totalElapsedMs: 0,
  isActive: false,
  date: new Date().toLocaleDateString(),
});

const App: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile>(defaultProfile);
  const [view, setView] = useState<AppState>('REGISTRATION');
  const [session, setSession] = useState<WorkSession>(emptySession());
  const [history, setHistory] = useState<DailyLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);

  const applyProfile = useCallback((p: api.UserProfileFromApi) => {
    setProfile({
      name: p.name,
      riceName: p.riceName,
      city: p.city,
      jobTitle: p.jobTitle,
      company: p.company,
      monthlySalary: p.monthlySalary,
      workingDaysPerMonth: p.workingDaysPerMonth,
      isRegistered: true,
    });
  }, []);

  const refreshUserData = useCallback(async () => {
    try {
      const [profileRes, logsRes, sessionRes] = await Promise.all([
        api.me.get(),
        api.dailyLogs.list(),
        api.sessions.getToday(),
      ]);
      applyProfile(profileRes);
      // 去重：每天只保留最新的一条记录，并估算缺失的开始时间
      const uniqueLogs = logsRes.reduce((acc, l) => {
        const existing = acc.find((x) => x.date === l.date);
        if (!existing) {
          // 如果 startTimeStr 缺失但有 endTimeStr 和 hoursWorked，估算开始时间
          let startTime = l.startTimeStr;
          if ((!startTime || startTime === 'N/A') && l.endTimeStr && l.hoursWorked > 0) {
            const [endH, endM] = l.endTimeStr.split(':').map(Number);
            const endTotalMinutes = endH * 60 + endM;
            const workedMinutes = Math.round(l.hoursWorked * 60);
            const startTotalMinutes = endTotalMinutes - workedMinutes;
            const startH = Math.floor(((startTotalMinutes % 1440) + 1440) % 1440 / 60);
            const startM = ((startTotalMinutes % 60) + 60) % 60;
            startTime = `${startH.toString().padStart(2, '0')}:${startM.toString().padStart(2, '0')}`;
          }
          acc.push({
            date: l.date,
            hoursWorked: l.hoursWorked,
            hourlyRate: l.hourlyRate,
            vibe: l.vibe,
            shifts: l.shifts,
            startTimeStr: startTime,
            endTimeStr: l.endTimeStr,
          });
        }
        return acc;
      }, [] as DailyLog[]);
      setHistory(uniqueLogs);
      setSession({
        startTime: sessionRes.startTime,
        dayStartTime: sessionRes.dayStartTime,
        totalElapsedMs: sessionRes.totalElapsedMs,
        isActive: sessionRes.isActive,
        date: sessionRes.date,
      });
      return true;
    } catch {
      return false;
    }
  }, [applyProfile]);

  const loadUserData = useCallback(async () => {
    const success = await refreshUserData();
    if (success) {
      setView('TRACKER');
    } else {
      setProfile(defaultProfile);
      setView('REGISTRATION');
    }
  }, [refreshUserData]);

  useEffect(() => {
    const init = async () => {
      const session = await api.auth.getSession();
      if (session) {
        await loadUserData();
      }
      setLoading(false);
    };
    init();

    const { data: { subscription } } = api.auth.onAuthStateChange(async (user) => {
      if (user) {
        // 只刷新数据，不改变当前页面
        await refreshUserData();
      } else {
        setProfile(defaultProfile);
        setView('REGISTRATION');
      }
    });

    return () => subscription.unsubscribe();
  }, [loadUserData, refreshUserData]);

  const handleLogin = useCallback(async (email: string, password: string) => {
    setApiError(null);
    try {
      const p = await api.auth.login(email, password);
      applyProfile(p);
      await loadUserData();
    } catch (e) {
      setApiError(e instanceof Error ? e.message : 'Login failed');
      throw e;
    }
  }, [applyProfile, loadUserData]);

  const handleRegister = useCallback(async (data: UserProfile & { password?: string; email?: string }) => {
    setApiError(null);
    try {
      if (!data.email) throw new Error('Email is required');
      const p = await api.auth.register({
        email: data.email,
        password: data.password || '',
        riceName: data.riceName,
        name: data.name,
        city: data.city,
        jobTitle: data.jobTitle,
        company: data.company,
        monthlySalary: data.monthlySalary,
        workingDaysPerMonth: data.workingDaysPerMonth,
      });
      applyProfile(p);
      setView('TRACKER');
    } catch (e) {
      setApiError(e instanceof Error ? e.message : 'Registration failed');
      throw e;
    }
  }, [applyProfile]);

  const handleUpdateProfile = useCallback(async (data: UserProfile) => {
    setApiError(null);
    try {
      const p = await api.me.patch({
        name: data.name,
        city: data.city,
        jobTitle: data.jobTitle,
        company: data.company,
        monthlySalary: data.monthlySalary,
        workingDaysPerMonth: data.workingDaysPerMonth,
      });
      applyProfile(p);
      setView('TRACKER');
    } catch (e) {
      setApiError(e instanceof Error ? e.message : 'Update failed');
      throw e;
    }
  }, [applyProfile]);

  const handleToggleWork = useCallback(async () => {
    const now = Date.now();
    const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
    
    // 开始工作时请求通知权限
    const isCurrentlyActive = session.isActive;
    if (!isCurrentlyActive) {
      requestNotificationPermission();
    }
    
    setSession((prev) => {
      const isStarting = !prev.isActive;
      const totalElapsedMs = isStarting
        ? prev.totalElapsedMs
        : prev.totalElapsedMs + (prev.startTime ? now - prev.startTime : 0);
      const next = {
        ...prev,
        isActive: isStarting,
        startTime: isStarting ? now : null,
        dayStartTime: isStarting && !prev.dayStartTime ? nowStr : prev.dayStartTime,
        totalElapsedMs,
      };
      api.sessions.putToday({
        startTime: next.startTime,
        dayStartTime: next.dayStartTime,
        totalElapsedMs: next.totalElapsedMs,
        isActive: next.isActive,
      }).catch(console.error);
      return next;
    });
  }, [session.isActive]);

  const handleEndDay = useCallback(async () => {
    const todayDate = new Date().toLocaleDateString();
    const currentHours = session.totalElapsedMs / (1000 * 60 * 60);
    const now = new Date();
    const endStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
    
    // 如果没有 dayStartTime，根据已工作时间估算
    let estimatedStartTime = session.dayStartTime;
    if (!estimatedStartTime && session.totalElapsedMs > 0) {
      const startDate = new Date(now.getTime() - session.totalElapsedMs);
      estimatedStartTime = startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
    }
    
    // 查找今天是否已有记录，累加时间
    const existingLog = history.find((log) => log.date === todayDate);
    const totalHours = existingLog ? existingLog.hoursWorked + currentHours : currentHours;
    const shifts = existingLog ? existingLog.shifts + 1 : 1;
    const firstStartTime = existingLog?.startTimeStr || estimatedStartTime || endStr;
    
    const dailyPay = calculateDailyPay(profile.monthlySalary, profile.workingDaysPerMonth);
    const actualRate = calculateHourlyRate(dailyPay, totalHours);
    const vibe = getVibe(totalHours);

    const newLog: DailyLog = {
      date: todayDate,
      hoursWorked: totalHours,
      hourlyRate: actualRate,
      vibe,
      shifts,
      startTimeStr: firstStartTime,
      endTimeStr: endStr,
    };

    try {
      await api.dailyLogs.create(newLog);
      await api.sessions.putToday({
        startTime: null,
        dayStartTime: null,
        totalElapsedMs: 0,
        isActive: false,
      });
    } catch (e) {
      console.error(e);
    }

    // 更新 history：同一天累加更新
    setHistory((h) => {
      const existingIndex = h.findIndex((log) => log.date === todayDate);
      if (existingIndex >= 0) {
        const updated = [...h];
        updated[existingIndex] = newLog;
        return updated;
      }
      return [newLog, ...h];
    });
    setSession(emptySession());
    setView('REPORT');
  }, [session, profile, history]);

  // 追踪是否已发送通知
  const notified8h = useRef(false);
  const notified10h = useRef(false);

  useEffect(() => {
    let interval: number;
    if (session.isActive && session.startTime) {
      interval = window.setInterval(() => {
        const now = Date.now();
        const diff = now - session.startTime!;
        setSession((prev) => {
          const newTotal = prev.totalElapsedMs + diff;
          const hours = newTotal / (1000 * 60 * 60);
          
          // 8 小时提醒
          if (hours >= 8 && !notified8h.current) {
            notified8h.current = true;
            notify8Hours();
          }
          // 10 小时提醒
          if (hours >= 10 && !notified10h.current) {
            notified10h.current = true;
            notify10Hours();
          }
          
          return {
            ...prev,
            totalElapsedMs: newTotal,
            startTime: now,
          };
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [session.isActive, session.startTime]);

  // 重置通知状态（新的一天）
  useEffect(() => {
    const today = new Date().toLocaleDateString();
    if (session.date !== today) {
      notified8h.current = false;
      notified10h.current = false;
    }
  }, [session.date]);

  const clearApiError = useCallback(() => setApiError(null), []);

  const handleDeleteLog = useCallback(async (date: string) => {
    try {
      await api.dailyLogs.delete(date);
      setHistory((h) => h.filter((log) => log.date !== date));
    } catch (e) {
      console.error('Failed to delete log:', e);
      setApiError('Failed to delete record');
    }
  }, []);

  if (loading) {
    return (
      <Layout>
        <div className="flex flex-col h-full items-center justify-center bg-[#f2fff8]">
          <p className="font-bold text-[#2d5a27]">Loading...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {apiError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-2 text-sm text-center">
          {apiError}
        </div>
      )}
      {view === 'REGISTRATION' && (
        <Registration
          initialData={profile}
          onLogin={handleLogin}
          onRegister={handleRegister}
          onUpdateProfile={handleUpdateProfile}
          onCancel={profile.isRegistered ? () => { clearApiError(); setView('TRACKER'); } : undefined}
        />
      )}
      {view === 'TRACKER' && (
        <WorkTracker
          profile={profile}
          session={session}
          todayLoggedHours={history.find(h => h.date === new Date().toLocaleDateString())?.hoursWorked || 0}
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
          onDeleteLog={handleDeleteLog}
        />
      )}
    </Layout>
  );
};

export default App;
