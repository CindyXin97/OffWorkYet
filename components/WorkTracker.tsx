import React from 'react';
import { UserProfile, WorkSession } from '../types';
import { CuteCharacter } from './CuteCharacter';
import { TARGET_WORK_HOURS } from '../constants';
import { calculateHourlyRate, calculateDailyPay, calculateStandardRate, getDisplayName, getDropPerMinute } from '../lib/utils';

interface WorkTrackerProps {
  profile: UserProfile;
  session: WorkSession;
  todayLoggedHours: number; // 今天已记录的累计小时数
  onToggle: () => void;
  onEndDay: () => void;
  onEditProfile: () => void;
  onGoToPlaza: () => void;
}

export const WorkTracker: React.FC<WorkTrackerProps> = ({ profile, session, todayLoggedHours, onToggle, onEndDay, onEditProfile, onGoToPlaza }) => {
  const sessionHours = session.totalElapsedMs / (1000 * 60 * 60);
  
  // 今天的总时间 = 已记录的 + 当前 session
  const totalHoursToday = todayLoggedHours + sessionHours;
  const totalMinutesToday = Math.floor((totalHoursToday * 60) % 60);
  const totalWholeHours = Math.floor(totalHoursToday);
  
  const dailyPay = calculateDailyPay(profile.monthlySalary, profile.workingDaysPerMonth);
  const standardRate = calculateStandardRate(dailyPay);
  // 用今天的总时间计算时薪
  const currentHourlyRate = calculateHourlyRate(dailyPay, totalHoursToday);
  const dropPerMinute = getDropPerMinute(dailyPay);
  
  const progressPercent = Math.min((totalHoursToday / (TARGET_WORK_HOURS + 2)) * 100, 100);
  const displayName = getDisplayName(profile);

  const getVibeStatus = () => {
    if (totalHoursToday === 0) return { title: `Ready to grind, ${displayName}?`, mood: 'happy' as const, accessory: 'none' as const };
    if (totalHoursToday < 4) return { title: "Sushi Vibe! (High Reward)", accessory: 'sushi' as const, mood: 'happy' as const };
    if (totalHoursToday < 8) return { title: "Salad Mode (Steady)", accessory: 'none' as const, mood: 'chill' as const };
    return { title: "Bread Level (Stop now!)", accessory: 'toast' as const, mood: 'sad' as const };
  };

  const vibe = getVibeStatus();

  return (
    <div className="flex flex-col h-full bg-[#f2fff8] p-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <button 
          onClick={onEditProfile}
          className="w-9 h-9 flex items-center justify-center bg-white border-2 border-black rounded-full cute-button text-base font-bold"
        >
          ⚙️
        </button>
        
        <div className="flex-1 flex flex-col items-center">
            <div className="bg-white px-3 py-1 rounded-xl border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] mb-1">
                <p className="text-[7px] font-bold text-gray-400 uppercase tracking-wider text-center">Standard Rate</p>
                <p className="text-sm font-black text-green-600 text-center">${Math.round(dailyPay / TARGET_WORK_HOURS)}/hr</p>
            </div>
            <div className="bg-white px-3 py-0.5 rounded-full border-2 border-black flex items-center gap-1.5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                <span className="text-yellow-500 text-base">☀️</span>
                <span className="font-black text-xs">{totalWholeHours.toString().padStart(2, '0')}h {totalMinutesToday.toString().padStart(2, '0')}m</span>
            </div>
        </div>

        <button 
          onClick={onGoToPlaza}
          className="w-9 h-9 flex items-center justify-center bg-white border-2 border-black rounded-full cute-button text-base font-bold"
        >
          🏢
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center text-center">
        <h2 className="text-lg font-black text-[#2d5a27] mb-4 px-4 leading-tight -mt-8">
          {vibe.title}
        </h2>
        
        <div className="relative mb-3">
          <CuteCharacter 
            mood={session.isActive ? 'work' : vibe.mood} 
            accessory={vibe.accessory} 
            size={120} 
          />
          {session.isActive && (
            <div className="absolute top-0 -right-10 bg-white border-2 border-black px-2.5 py-0.5 rounded-full font-black text-[9px] animate-pulse shadow-[2px_2px_0px_0px_#000] z-20">
              TRACKING...
            </div>
          )}
        </div>

        <div className="mb-3">
          <p className="text-gray-400 font-black text-[9px] uppercase tracking-widest mb-1">
            {totalHoursToday > 0 ? 'Current Hourly Rate' : 'Max Rate (Start to drop!)'}
          </p>
          <div className="bg-white border-2 border-black rounded-2xl px-6 py-2 inline-block shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
            <span className="text-2xl font-black">
              ${currentHourlyRate}
            </span>
            <span className="text-sm font-bold text-gray-500"> /hr</span>
          </div>
          {totalHoursToday > 0 && totalHoursToday <= TARGET_WORK_HOURS && (
            <p className="text-[9px] text-orange-500 font-bold mt-1 animate-pulse">
              ⚡ Dropping ~${dropPerMinute.toFixed(1)}/min
            </p>
          )}
          {totalHoursToday > TARGET_WORK_HOURS && (
            <p className="text-[9px] text-red-500 font-bold mt-1">
              ⚠️ Below standard rate! Go home!
            </p>
          )}
        </div>

        {/* Vibe Meter */}
        <div className="w-full max-w-[200px]">
           <div className="flex justify-between text-lg mb-1 px-2">
             <span>🍣</span>
             <span>🥗</span>
             <span>🥖</span>
           </div>
           <div className="h-2 bg-gray-200 rounded-full border-2 border-black overflow-hidden shadow-inner">
              <div 
                className={`h-full transition-all duration-700 ease-out ${totalHoursToday < 4 ? 'bg-green-400' : totalHoursToday < 8 ? 'bg-yellow-400' : 'bg-red-400'}`} 
                style={{ width: `${progressPercent}%` }}
              />
           </div>
        </div>
      </div>

      {/* Buttons - 更大更突出 */}
      <div className="flex flex-col gap-2">
        <button 
          onClick={onToggle}
          className={`w-full py-4 rounded-2xl font-black text-lg cute-button transition-all ${session.isActive ? 'bg-orange-400 text-white shadow-[0_3px_0_0_#c05621]' : 'bg-[#7be0ae] text-white shadow-[0_3px_0_0_#48bb78]'}`}
        >
          {session.isActive ? 'Pause' : 'Start Working'}
        </button>
        <button 
          onClick={onEndDay}
          className="w-full bg-[#ff7b9c] text-white py-4 rounded-2xl font-black text-lg cute-button shadow-[0_3px_0_0_#f56565]"
        >
          End the Grill & Chill
        </button>
      </div>
    </div>
  );
};
