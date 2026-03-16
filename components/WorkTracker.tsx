
import React from 'react';
import { UserProfile, WorkSession } from '../types';
import { CuteCharacter } from './CuteCharacter';
import { TARGET_WORK_HOURS } from '../constants';

interface WorkTrackerProps {
  profile: UserProfile;
  session: WorkSession;
  onToggle: () => void;
  onEndDay: () => void;
  onEditProfile: () => void;
  onGoToPlaza: () => void;
}

export const WorkTracker: React.FC<WorkTrackerProps> = ({ profile, session, onToggle, onEndDay, onEditProfile, onGoToPlaza }) => {
  const hours = session.totalElapsedMs / (1000 * 60 * 60);
  const minutes = (session.totalElapsedMs / (1000 * 60)) % 60;
  
  // Logic: Monthly Salary / Working Days / Hours Worked Today
  const dailyPay = profile.monthlySalary / (profile.workingDaysPerMonth || 22);
  
  // Requirement: starts at daily max and decreases.
  const rateDivisor = Math.max(hours, 1); 
  const currentHourlyRate = Math.round(dailyPay / rateDivisor);
  
  const progressPercent = Math.min((hours / (TARGET_WORK_HOURS + 2)) * 100, 100);

  const getVibeStatus = () => {
    if (hours === 0) return { title: `Ready to grind, ${profile.riceName || 'Rice Ball'}?`, mood: 'happy' as const, accessory: 'none' as const };
    if (hours < 4) return { title: "Sushi Vibe! (High Reward)", accessory: 'sushi' as const, mood: 'happy' as const };
    if (hours < 8) return { title: "Salad Mode (Steady)", accessory: 'none' as const, mood: 'chill' as const };
    return { title: "Bread Level (Stop now!)", accessory: 'toast' as const, mood: 'sad' as const };
  };

  const vibe = getVibeStatus();

  return (
    <div className="flex flex-col h-full bg-[#f2fff8] p-5 pb-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-3">
        <button 
          onClick={onEditProfile}
          className="w-9 h-9 flex items-center justify-center bg-white border-2 border-black rounded-full cute-button text-lg font-bold"
          title="Settings"
        >
          ⚙️
        </button>
        
        <div className="flex-1 flex flex-col items-center">
            <div className="bg-white px-2.5 py-0.5 rounded-full border border-black text-[9px] font-black text-green-600 mb-1">
                ${dailyPay.toFixed(0)} / Day
            </div>
            <div className="bg-white px-3 py-0.5 rounded-full border-2 border-black flex items-center gap-1.5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                <span className="text-yellow-500 text-base">☀️</span>
                <span className="font-black text-[11px]">{Math.floor(hours).toString().padStart(2, '0')}h {Math.floor(minutes).toString().padStart(2, '0')}m</span>
            </div>
        </div>

        <button 
          onClick={onGoToPlaza}
          className="w-9 h-9 flex items-center justify-center bg-white border-2 border-black rounded-full cute-button text-lg font-bold"
          title="Plaza"
        >
          🏢
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center text-center">
        <h2 className="text-lg font-black text-[#2d5a27] mb-5 px-4 leading-tight">
          {vibe.title}
        </h2>
        
        <div className="relative mb-3">
          <CuteCharacter 
            mood={session.isActive ? 'work' : vibe.mood} 
            accessory={vibe.accessory} 
            size={140} 
          />
          {session.isActive && (
            <div className="absolute top-1 -right-10 bg-white border-2 border-black px-2.5 py-0.5 rounded-full font-black text-[9px] animate-pulse shadow-[2px_2px_0px_0px_#000] z-20">
              TRACKING...
            </div>
          )}
        </div>

        <div className="mb-3">
          <p className="text-gray-400 font-black text-[9px] uppercase tracking-widest mb-1">Current Hourly Rate</p>
          <div className="bg-white border-2 border-black rounded-[16px] px-5 py-1.5 inline-block shadow-[2.5px_2.5px_0px_0px_rgba(0,0,0,1)]">
            <span className="text-lg font-black">
              ${currentHourlyRate} <span className="text-[10px]">/ hr</span>
            </span>
          </div>
        </div>

        {/* Vibe Meter */}
        <div className="w-full max-w-[180px]">
           <div className="flex justify-between text-base mb-1 px-1">
             <span>🍣</span>
             <span>🥗</span>
             <span>🥖</span>
           </div>
           <div className="h-2 bg-gray-200 rounded-full border-2 border-black overflow-hidden relative shadow-inner">
              <div 
                className={`h-full transition-all duration-700 ease-out border-r border-black/20 ${hours < 4 ? 'bg-green-400' : hours < 8 ? 'bg-yellow-400' : 'bg-red-400'}`} 
                style={{ width: `${progressPercent}%` }}
              />
           </div>
        </div>
      </div>

      <div className="mt-3 flex flex-col gap-2">
        <button 
          onClick={onToggle}
          className={`w-full py-3.5 rounded-xl font-black text-base cute-button transition-all ${session.isActive ? 'bg-orange-400 text-white shadow-[0_2.5px_0_0_#c05621]' : 'bg-[#7be0ae] text-white shadow-[0_2.5px_0_0_#48bb78]'}`}
        >
          {session.isActive ? 'Pause' : 'Start Working'}
        </button>
        <button 
          onClick={onEndDay}
          className="w-full bg-[#ff7b9c] text-white py-3.5 rounded-xl font-black text-base cute-button shadow-[0_2.5px_0_0_#f56565]"
        >
          End the Grill & Chill
        </button>
      </div>
    </div>
  );
};
